import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { readStoredUsers } from "@/infrastructure/auth/userStore";
import { getSupabaseServerClient } from "./serverClient";

export type ChatRoomType = "global" | "private";

export type ChatMessage = {
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
  deletedAt?: string;
};

const dataDir = path.join(process.cwd(), ".data");
const chatFile = path.join(dataDir, "chat-messages.jsonl");
const canWriteLocalFiles = process.env.VERCEL !== "1";

export async function readChatUsers(currentUserId: string) {
  const users = await readStoredUsers();

  return users
    .filter((user) => user.id !== currentUserId)
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
}

export async function readChatMessages({
  userId,
  roomType,
  peerId,
  limit = 60,
}: {
  userId: string;
  roomType: ChatRoomType;
  peerId?: string;
  limit?: number;
}) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const supabase = getSupabaseServerClient();

  if (supabase) {
    let query = supabase
      .from("chat_messages")
      .select("id, room_type, sender_id, receiver_id, sender_name, body, attachment_type, attachment_url, attachment_name, created_at, deleted_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(safeLimit);

    if (roomType === "global") {
      query = query.eq("room_type", "global");
    } else if (peerId) {
      query = query
        .eq("room_type", "private")
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${userId})`);
    } else {
      return [];
    }

    const { data, error } = await query;

    if (!error && data) {
      return data.map(mapChatRow).reverse();
    }

    console.warn("Supabase read chat_messages failed:", error?.message);
  }

  const messages = await readLocalChatMessages();

  return messages
    .filter((message) => {
      if (message.deletedAt) {
        return false;
      }

      if (roomType === "global") {
        return message.roomType === "global";
      }

      return Boolean(peerId)
        && message.roomType === "private"
        && (
          (message.senderId === userId && message.receiverId === peerId) ||
          (message.senderId === peerId && message.receiverId === userId)
        );
    })
    .slice(-safeLimit);
}

export async function readIncomingChatMessages({
  userId,
  after,
  limit = 20,
}: {
  userId: string;
  after?: string;
  limit?: number;
}) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const supabase = getSupabaseServerClient();

  if (supabase) {
    let query = supabase
      .from("chat_messages")
      .select("id, room_type, sender_id, receiver_id, sender_name, body, attachment_type, attachment_url, attachment_name, created_at, deleted_at")
      .is("deleted_at", null)
      .neq("sender_id", userId)
      .or(`room_type.eq.global,receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(safeLimit);

    if (after) {
      query = query.gt("created_at", after);
    }

    const { data, error } = await query;

    if (!error && data) {
      return data.map(mapChatRow).reverse();
    }

    console.warn("Supabase read incoming chat_messages failed:", error?.message);
  }

  const messages = await readLocalChatMessages();

  return messages
    .filter((message) => {
      if (message.deletedAt || message.senderId === userId) {
        return false;
      }

      if (after && message.createdAt <= after) {
        return false;
      }

      return message.roomType === "global" || message.receiverId === userId;
    })
    .slice(-safeLimit);
}

export async function getChatStorageStatus() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      mode: "local" as const,
      ready: true,
    };
  }

  const { error } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true });

  return {
    mode: error ? "local" as const : "supabase" as const,
    ready: !error,
    error: error?.message,
  };
}

export async function createChatMessage({
  senderId,
  roomType,
  body,
  receiverId,
  attachmentType,
  attachmentUrl,
  attachmentName,
}: {
  senderId: string;
  roomType: ChatRoomType;
  body: string;
  receiverId?: string;
  attachmentType?: "video";
  attachmentUrl?: string;
  attachmentName?: string;
}) {
  const users = await readStoredUsers();
  const sender = users.find((user) => user.id === senderId);
  const receiver = receiverId
    ? users.find((user) => user.id === receiverId)
    : null;

  if (!sender) {
    throw new Error("Usuario nao encontrado.");
  }

  if (roomType === "private" && !receiver) {
    throw new Error("Destinatario nao encontrado.");
  }

  const message: ChatMessage = {
    id: crypto.randomUUID(),
    roomType,
    senderId,
    receiverId: roomType === "private" ? receiverId : undefined,
    senderName: sender.name,
    body: normalizeBody(body, Boolean(attachmentUrl)),
    attachmentType,
    attachmentUrl,
    attachmentName,
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        id: message.id,
        room_type: message.roomType,
        sender_id: message.senderId,
        receiver_id: message.receiverId ?? null,
        sender_name: message.senderName,
        body: message.body,
        attachment_type: message.attachmentType ?? null,
        attachment_url: message.attachmentUrl ?? null,
        attachment_name: message.attachmentName ?? null,
        created_at: message.createdAt,
      })
      .select("id, room_type, sender_id, receiver_id, sender_name, body, attachment_type, attachment_url, attachment_name, created_at, deleted_at")
      .single();

    if (!error && data) {
      return mapChatRow(data);
    }

    console.warn("Supabase insert chat_messages failed:", error?.message);
  }

  if (!canWriteLocalFiles) {
    throw new Error("Banco do chat indisponivel em producao.");
  }

  await mkdir(dataDir, { recursive: true });
  await appendFile(chatFile, `${JSON.stringify(message)}\n`, "utf8");
  return message;
}

export async function deleteChatMessage({
  messageId,
  userId,
  isAdmin,
}: {
  messageId: string;
  userId: string;
  isAdmin: boolean;
}) {
  const supabase = getSupabaseServerClient();
  const deletedAt = new Date().toISOString();

  if (supabase) {
    let query = supabase
      .from("chat_messages")
      .update({ deleted_at: deletedAt })
      .eq("id", messageId);

    if (!isAdmin) {
      query = query.eq("sender_id", userId);
    }

    const { error } = await query;

    if (!error) {
      return;
    }

    console.warn("Supabase delete chat_messages failed:", error.message);
  }

  if (!canWriteLocalFiles) {
    throw new Error("Banco do chat indisponivel em producao.");
  }

  const messages = await readLocalChatMessages();
  const nextMessages = messages.map((message) => (
    message.id === messageId && (isAdmin || message.senderId === userId)
      ? { ...message, deletedAt }
      : message
  ));

  await mkdir(dataDir, { recursive: true });
  await writeFile(chatFile, `${nextMessages.map((message) => JSON.stringify(message)).join("\n")}\n`, "utf8");
}

async function readLocalChatMessages() {
  try {
    const raw = await readFile(chatFile, "utf8");

    return raw
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as ChatMessage);
  } catch {
    return [];
  }
}

function normalizeBody(body: string, hasAttachment = false) {
  const normalizedBody = body.trim().replace(/\s+\n/g, "\n");

  if (normalizedBody.length < 1 && !hasAttachment) {
    throw new Error("Digite uma mensagem.");
  }

  if (normalizedBody.length > 500) {
    throw new Error("Mensagem muito grande. Use no maximo 500 caracteres.");
  }

  return normalizedBody;
}

function mapChatRow(row: {
  id: string;
  room_type: string;
  sender_id: string;
  receiver_id: string | null;
  sender_name: string;
  body: string;
  attachment_type: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string;
  deleted_at: string | null;
}): ChatMessage {
  return {
    id: row.id,
    roomType: row.room_type === "private" ? "private" : "global",
    senderId: row.sender_id,
    receiverId: row.receiver_id ?? undefined,
    senderName: row.sender_name,
    body: row.body,
    attachmentType: row.attachment_type === "video" ? "video" : undefined,
    attachmentUrl: row.attachment_url ?? undefined,
    attachmentName: row.attachment_name ?? undefined,
    createdAt: row.created_at,
    deletedAt: row.deleted_at ?? undefined,
  };
}
