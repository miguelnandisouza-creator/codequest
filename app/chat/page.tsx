"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import {
  getLocalSessionSnapshot,
  getServerLocalSessionSnapshot,
  LocalSession,
  subscribeToLocalAuth,
} from "@/application/auth/localAuth";
import {
  ensureNotificationAudio,
  getChatSoundPreference,
  playNotificationSound,
  setChatSoundPreference,
} from "@/application/chat/notificationSound";
import { isAdminEmail } from "@/data/admin";

type ChatRoomType = "global" | "private";

type ChatUser = {
  id: string;
  name: string;
  email: string;
};

type ChatMessage = {
  id: string;
  roomType: ChatRoomType;
  senderId: string;
  receiverId?: string;
  senderName: string;
  body: string;
  attachmentType?: "video";
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
};

export default function ChatPage() {
  const initialChatRoute = getInitialChatRoute();
  const sessionSnapshot = useSyncExternalStore(
    subscribeToLocalAuth,
    getLocalSessionSnapshot,
    getServerLocalSessionSnapshot
  );
  const session = useMemo(() => parseJson<LocalSession>(sessionSnapshot), [sessionSnapshot]);
  const [roomType, setRoomType] = useState<ChatRoomType>(initialChatRoute.roomType);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [peerId, setPeerId] = useState(initialChatRoute.peerId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(getChatSoundPreference);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestUnreadMessage, setLatestUnreadMessage] = useState<ChatMessage | null>(null);
  const [storageMode, setStorageMode] = useState<"supabase" | "local" | "">("");
  const knownMessageIdsRef = useRef<Set<string>>(new Set());
  const lastNotificationAtRef = useRef<string>("");
  const notificationsReadyRef = useRef(false);
  const soundContextRef = useRef<AudioContext | null>(null);
  const selectedPeer = users.find((user) => user.id === peerId);
  const canUsePrivate = roomType === "global" || Boolean(peerId);
  const isAdmin = isAdminEmail(session?.email);

  const loadUsers = useCallback(async () => {
    if (!session) {
      return;
    }

    const response = await fetch(`/api/chat/users?userId=${encodeURIComponent(session.userId)}`, {
      cache: "no-store",
    });
    const data = await response.json() as { users?: ChatUser[] };
    const nextUsers = data.users ?? [];

    setUsers(nextUsers);
    setPeerId((currentPeerId) => currentPeerId || nextUsers[0]?.id || "");
  }, [session]);

  const loadMessages = useCallback(async () => {
    if (!session || !canUsePrivate) {
      return;
    }

    const params = new URLSearchParams({
      userId: session.userId,
      roomType,
    });

    if (roomType === "private") {
      params.set("peerId", peerId);
    }

    const response = await fetch(`/api/chat?${params.toString()}`, {
      cache: "no-store",
    });
    const data = await response.json() as { messages?: ChatMessage[]; error?: string };

    if (!response.ok) {
      setMessage(data.error ?? "Nao foi possivel carregar o chat.");
      return;
    }

    const nextMessages = data.messages ?? [];
    const knownMessageIds = knownMessageIdsRef.current;
    nextMessages.forEach((chatMessage) => knownMessageIds.add(chatMessage.id));

    setMessages(nextMessages);
  }, [canUsePrivate, peerId, roomType, session]);

  const loadStorageStatus = useCallback(async () => {
    const response = await fetch("/api/chat/status", {
      cache: "no-store",
    });
    const data = await response.json() as { mode?: "supabase" | "local"; ready?: boolean };

    setStorageMode(data.mode ?? "");
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!session) {
      return;
    }

    const params = new URLSearchParams({
      userId: session.userId,
    });

    if (lastNotificationAtRef.current) {
      params.set("after", lastNotificationAtRef.current);
    }

    const response = await fetch(`/api/chat/notifications?${params.toString()}`, {
      cache: "no-store",
    });
    const data = await response.json() as { messages?: ChatMessage[] };
    const incomingMessages = data.messages ?? [];
    const lastMessage = incomingMessages.at(-1);

    if (lastMessage) {
      lastNotificationAtRef.current = lastMessage.createdAt;
    } else if (!lastNotificationAtRef.current) {
      lastNotificationAtRef.current = new Date().toISOString();
    }

    if (!notificationsReadyRef.current) {
      notificationsReadyRef.current = true;
      return;
    }

    if (incomingMessages.length > 0) {
      setUnreadCount((current) => current + incomingMessages.length);
      setLatestUnreadMessage(lastMessage ?? incomingMessages[0]);

      if (soundEnabled) {
        playNotificationSound(soundContextRef);
      }
    }
  }, [session, soundEnabled]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadUsers();
      void loadStorageStatus();
    });
  }, [loadStorageStatus, loadUsers]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadMessages();
    });

    const intervalId = window.setInterval(() => {
      void loadMessages();
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [loadMessages]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadNotifications();
    });

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [loadNotifications]);

  useEffect(() => {
    if (!soundEnabled) {
      return;
    }

    function unlockAudio() {
      void ensureNotificationAudio(soundContextRef).catch(() => {
        // O navegador pode exigir outra interacao antes de liberar audio.
      });
    }

    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, [soundEnabled]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session || (!body.trim() && !videoFile)) {
      return;
    }

    if (roomType === "private" && !peerId) {
      setMessage("Escolha um usuario para conversar.");
      return;
    }

    const response = videoFile
      ? await sendVideoMessage(session.userId, roomType, peerId, body, videoFile)
      : await fetch("/api/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          userId: session.userId,
          roomType,
          peerId: roomType === "private" ? peerId : undefined,
          body,
        }),
      });
    const data = await response.json() as { error?: string };

    if (!response.ok) {
      setMessage(data.error ?? "Nao foi possivel enviar.");
      return;
    }

    setBody("");
    setVideoFile(null);
    setMessage("");
    await loadMessages();
  }

  async function enableSound() {
    try {
      await ensureNotificationAudio(soundContextRef);
      setSoundEnabled(true);
      setChatSoundPreference(true);
      playNotificationSound(soundContextRef);
    } catch (error) {
      setMessage(error instanceof Error
        ? error.message
        : "Seu navegador nao liberou audio para notificacoes.");
    }
  }

  function disableSound() {
    setSoundEnabled(false);
    setChatSoundPreference(false);
  }

  function openUnreadConversation() {
    if (latestUnreadMessage?.roomType === "private") {
      setRoomType("private");
      setPeerId(latestUnreadMessage.senderId);
    } else {
      setRoomType("global");
    }

    setUnreadCount(0);
    setLatestUnreadMessage(null);
  }

  async function deleteMessage(messageId: string) {
    if (!session) {
      return;
    }

    await fetch("/api/chat", {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: session.userId,
        email: session.email,
        messageId,
      }),
    });
    await loadMessages();
  }

  if (!session) {
    return (
      <main className="cq-page">
        <section className="cq-shell">
          <div className="cq-panel max-w-2xl p-6">
            <p className="cq-kicker">Chat</p>
            <h1 className="cq-title mt-3 text-4xl">Entre para conversar</h1>
            <p className="mt-4 text-[#93a4bd]">
              Faca login para abrir os recados e conversas privadas.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="cq-page">
      <section className="cq-shell">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="cq-kicker">Mensagens</p>
            <h1 className="cq-title mt-3 text-4xl md:text-6xl">
              Chat
            </h1>
            <p className="mt-4 max-w-2xl text-[#93a4bd]">
              Recados gerais para todos e conversas privadas entre usuarios.
            </p>
          </div>

          <button type="button" onClick={loadMessages} className="cq-button cq-button-secondary">
            Atualizar
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (soundEnabled) {
                disableSound();
                return;
              }

              void enableSound();
            }}
            className={`cq-button ${soundEnabled ? "" : "cq-button-secondary"}`}
          >
            {soundEnabled ? "Som ligado" : "Ativar som"}
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={openUnreadConversation}
              className="cq-button cq-button-secondary border-yellow-300/50 text-yellow-100"
            >
              {unreadCount} nova{unreadCount > 1 ? "s" : ""}
            </button>
          )}
        </div>

        {message && (
          <div className="cq-panel mt-6 p-4 text-sm text-[#dbe8ff]">
            {message}
          </div>
        )}

        {storageMode === "local" && (
          <div className="cq-panel mt-6 border-yellow-300/40 p-4 text-sm text-yellow-100">
            Chat em modo local. Rode o schema atualizado no Supabase para salvar mensagens no banco.
          </div>
        )}

        <div className="mt-8 grid gap-5 lg:grid-cols-[18rem_1fr]">
          <aside className="cq-panel p-4">
            <p className="cq-kicker">Canal</p>
            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={() => setRoomType("global")}
                className={`cq-button ${roomType === "global" ? "" : "cq-button-secondary"}`}
              >
                Recados gerais
              </button>
              <button
                type="button"
                onClick={() => setRoomType("private")}
                className={`cq-button ${roomType === "private" ? "" : "cq-button-secondary"}`}
              >
                Privado
              </button>
            </div>

            {roomType === "private" && (
              <div className="mt-6">
                <p className="cq-kicker">Usuario</p>
                <div className="mt-3 grid gap-2">
                  {users.length === 0 ? (
                    <p className="text-sm text-[#93a4bd]">Nenhum usuario encontrado.</p>
                  ) : users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setPeerId(user.id)}
                      className={[
                        "rounded border px-3 py-3 text-left text-sm transition",
                        peerId === user.id
                          ? "border-[#8f5bff] bg-[#8f24db]/25 text-white"
                          : "border-[#26384f] bg-[#07101d] text-[#93a4bd] hover:border-[#6f91d8] hover:text-white",
                      ].join(" ")}
                    >
                      <span className="block font-mono font-black">{user.name}</span>
                      <span className="mt-1 block truncate text-xs opacity-75">{user.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <section className="cq-panel flex min-h-[34rem] flex-col p-0">
            <div className="border-b border-[#26384f] p-5">
              <p className="cq-kicker">
                {roomType === "global" ? "Recados gerais" : "Privado"}
              </p>
              <h2 className="cq-title mt-2 text-2xl">
                {roomType === "global" ? "Mural da guilda" : selectedPeer?.name ?? "Escolha alguem"}
              </h2>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {messages.length === 0 ? (
                <div className="grid h-full place-items-center text-center text-[#93a4bd]">
                  Nenhuma mensagem ainda.
                </div>
              ) : messages.map((chatMessage) => {
                const mine = chatMessage.senderId === session.userId;

                return (
                  <article
                    key={chatMessage.id}
                    className={[
                      "max-w-[82%] rounded-md border p-3",
                      mine
                        ? "ml-auto border-[#8f5bff]/60 bg-[#8f24db]/20"
                        : "border-[#26384f] bg-[#07101d]",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-xs font-black uppercase tracking-[0.08em] text-[#dbe8ff]">
                        {mine ? "Voce" : chatMessage.senderName}
                      </p>
                      {(mine || isAdmin) && (
                        <button
                          type="button"
                          onClick={() => void deleteMessage(chatMessage.id)}
                          className="text-xs text-[#93a4bd] hover:text-red-100"
                        >
                          Apagar
                        </button>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#f3f7ff]">
                      {chatMessage.body}
                    </p>
                    {chatMessage.attachmentType === "video" && chatMessage.attachmentUrl && (
                      <div className="mt-3 overflow-hidden rounded border border-[#26384f] bg-black/40">
                        <video
                          src={chatMessage.attachmentUrl}
                          controls
                          preload="metadata"
                          className="max-h-80 w-full bg-black"
                        />
                        {chatMessage.attachmentName && (
                          <p className="border-t border-[#26384f] px-3 py-2 text-xs text-[#93a4bd]">
                            {chatMessage.attachmentName}
                          </p>
                        )}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-[#6f86a8]">
                      {formatDate(chatMessage.createdAt)}
                    </p>
                  </article>
                );
              })}
            </div>

            <form onSubmit={sendMessage} className="border-t border-[#26384f] p-4">
              {videoFile && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded border border-[#8f5bff]/50 bg-[#8f24db]/15 px-3 py-2 text-sm text-[#f3f7ff]">
                  <span className="min-w-0 truncate">
                    Video: {videoFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVideoFile(null)}
                    className="text-xs text-[#93a4bd] hover:text-red-100"
                  >
                    Remover
                  </button>
                </div>
              )}
              <div className="flex flex-col gap-3 md:flex-row">
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  disabled={!canUsePrivate}
                  maxLength={500}
                  className="min-h-20 flex-1 resize-none border border-[#26384f] bg-[#07101d] px-4 py-3 text-sm text-white outline-none focus:border-[#8f5bff] disabled:opacity-45"
                  placeholder={roomType === "global" ? "Escreva um recado geral..." : "Escreva uma mensagem privada..."}
                />
                <label className="cq-button cq-button-secondary min-w-28 cursor-pointer text-center">
                  Video
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    className="hidden"
                    onChange={(event) => {
                      setVideoFile(event.target.files?.[0] ?? null);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                <button type="submit" disabled={!canUsePrivate} className="cq-button min-w-32 disabled:opacity-45">
                  Enviar
                </button>
              </div>
              <p className="mt-2 text-xs text-[#6f86a8]">{body.length}/500</p>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getInitialChatRoute() {
  if (typeof window === "undefined") {
    return {
      roomType: "global" as ChatRoomType,
      peerId: "",
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    roomType: params.get("room") === "private" ? "private" as ChatRoomType : "global" as ChatRoomType,
    peerId: params.get("peerId") ?? "",
  };
}

function sendVideoMessage(
  userId: string,
  roomType: ChatRoomType,
  peerId: string,
  body: string,
  video: File
) {
  const formData = new FormData();

  formData.set("userId", userId);
  formData.set("roomType", roomType);
  formData.set("body", body);
  formData.set("video", video);

  if (roomType === "private") {
    formData.set("peerId", peerId);
  }

  return fetch("/api/chat", {
    method: "POST",
    body: formData,
  });
}

function parseJson<T>(value: string) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
