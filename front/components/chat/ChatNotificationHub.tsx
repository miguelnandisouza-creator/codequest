"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import {
  getLocalSessionSnapshot,
  getServerLocalSessionSnapshot,
  getSessionRequestHeaders,
  LocalSession,
  subscribeToLocalAuth,
} from "@/application/auth/localAuth";
import {
  ensureNotificationAudio,
  getChatSoundPreference,
  playNotificationSound,
} from "@/application/chat/notificationSound";

type ChatMessage = {
  id: string;
  roomType: "global" | "private";
  senderId: string;
  senderName: string;
  createdAt: string;
};

export default function ChatNotificationHub() {
  const pathname = usePathname();
  const sessionSnapshot = useSyncExternalStore(
    subscribeToLocalAuth,
    getLocalSessionSnapshot,
    getServerLocalSessionSnapshot
  );
  const session = useMemo(() => parseJson<LocalSession>(sessionSnapshot), [sessionSnapshot]);
  const [soundEnabled, setSoundEnabled] = useState(getChatSoundPreference);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState<ChatMessage | null>(null);
  const soundContextRef = useRef<AudioContext | null>(null);
  const lastNotificationAtRef = useRef("");
  const readyRef = useRef(false);

  const loadNotifications = useCallback(async () => {
    if (!session || pathname === "/chat") {
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
      headers: getSessionRequestHeaders(),
    });
    const data = await response.json() as { messages?: ChatMessage[] };
    const incomingMessages = data.messages ?? [];
    const lastMessage = incomingMessages.at(-1);

    if (lastMessage) {
      lastNotificationAtRef.current = lastMessage.createdAt;
    } else if (!lastNotificationAtRef.current) {
      lastNotificationAtRef.current = new Date().toISOString();
    }

    if (!readyRef.current) {
      readyRef.current = true;
      return;
    }

    if (incomingMessages.length > 0) {
      setUnreadCount((current) => current + incomingMessages.length);
      setLatestMessage(lastMessage ?? incomingMessages[0]);

      if (getChatSoundPreference()) {
        await ensureAudioAfterGesture(soundContextRef);
        playNotificationSound(soundContextRef);
      }
    }
  }, [pathname, session]);

  useEffect(() => {
    function syncPreference(event: Event) {
      const enabled = event instanceof CustomEvent
        ? Boolean(event.detail?.enabled)
        : getChatSoundPreference();

      setSoundEnabled(enabled);
    }

    window.addEventListener("storage", syncPreference);
    window.addEventListener("codequest-chat-sound-change", syncPreference);

    return () => {
      window.removeEventListener("storage", syncPreference);
      window.removeEventListener("codequest-chat-sound-change", syncPreference);
    };
  }, []);

  useEffect(() => {
    if (!soundEnabled) {
      return;
    }

    function unlock() {
      void ensureAudioAfterGesture(soundContextRef);
    }

    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [soundEnabled]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadNotifications();
    });

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [loadNotifications]);

  if (!session || pathname === "/chat" || unreadCount === 0 || !latestMessage) {
    return null;
  }

  return (
    <Link
      href={getChatHref(latestMessage)}
      onClick={() => setUnreadCount(0)}
      className="fixed bottom-5 left-5 z-[80] max-w-72 rounded-md border border-[#8f5bff]/60 bg-[#0b1020]/95 p-4 text-sm text-[#f3f7ff] shadow-[0_0_24px_rgba(143,91,255,0.28)] backdrop-blur"
    >
      <span className="cq-kicker">Nova mensagem</span>
      <span className="mt-2 block font-mono font-black">
        {unreadCount} nova{unreadCount > 1 ? "s" : ""}
      </span>
      <span className="mt-1 block text-[#93a4bd]">
        {latestMessage.roomType === "global"
          ? `Recado de ${latestMessage.senderName}`
          : `Privado de ${latestMessage.senderName}`}
      </span>
    </Link>
  );
}

async function ensureAudioAfterGesture(
  soundContextRef: MutableRefObject<AudioContext | null>
) {
  try {
    await ensureNotificationAudio(soundContextRef);
  } catch {
    // O navegador pode exigir outra interacao do usuario.
  }
}

function getChatHref(message: ChatMessage) {
  if (message.roomType === "private") {
    return `/chat?room=private&peerId=${encodeURIComponent(message.senderId)}`;
  }

  return "/chat?room=global";
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
