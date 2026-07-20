import { isAdminEmail } from "@/data/admin";
import { isSessionUserRequest } from "@/infrastructure/auth/sessionToken";
import {
  ChatRoomType,
  createChatMessage,
  deleteChatMessage,
  readChatMessages,
} from "@/infrastructure/supabase/chatRepository";
import { getSupabaseServerClient } from "@/infrastructure/supabase/serverClient";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const chatVideoBucket = "chat-videos";
const canWriteLocalFiles = process.env.VERCEL !== "1";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? "";
  const roomType = normalizeRoomType(url.searchParams.get("roomType"));
  const peerId = url.searchParams.get("peerId") ?? undefined;

  if (!userId) {
    return Response.json({ error: "Usuario nao informado." }, { status: 400 });
  }

  if (!isSessionUserRequest(request, userId)) {
    return Response.json({ error: "Sessao invalida." }, { status: 401 });
  }

  const messages = await readChatMessages({
    userId,
    roomType,
    peerId,
  });

  return Response.json({ messages });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return createMultipartMessage(request);
  }

  const body = await request.json().catch(() => null) as {
    userId?: string;
    roomType?: ChatRoomType;
    peerId?: string;
    body?: string;
  } | null;

  if (!body?.userId || !body.body) {
    return Response.json({ error: "Mensagem invalida." }, { status: 400 });
  }

  if (!isSessionUserRequest(request, body.userId)) {
    return Response.json({ error: "Sessao invalida." }, { status: 401 });
  }

  try {
    const message = await createChatMessage({
      senderId: body.userId,
      roomType: normalizeRoomType(body.roomType),
      receiverId: body.peerId,
      body: body.body,
    });

    return Response.json({ message });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Nao foi possivel enviar mensagem.",
    }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null) as {
    userId?: string;
    email?: string;
    messageId?: string;
  } | null;

  if (!body?.userId || !body.messageId) {
    return Response.json({ error: "Mensagem nao informada." }, { status: 400 });
  }

  if (!isSessionUserRequest(request, body.userId)) {
    return Response.json({ error: "Sessao invalida." }, { status: 401 });
  }

  await deleteChatMessage({
    messageId: body.messageId,
    userId: body.userId,
    isAdmin: isAdminEmail(body.email),
  });

  return Response.json({ ok: true });
}

function normalizeRoomType(value?: string | null): ChatRoomType {
  return value === "private" ? "private" : "global";
}

async function createMultipartMessage(request: Request) {
  const formData = await request.formData();
  const userId = String(formData.get("userId") ?? "");
  const roomType = normalizeRoomType(String(formData.get("roomType") ?? ""));
  const peerId = String(formData.get("peerId") ?? "") || undefined;
  const body = String(formData.get("body") ?? "");
  const video = formData.get("video");

  if (!userId || !(video instanceof File)) {
    return Response.json({ error: "Video invalido." }, { status: 400 });
  }

  if (!isSessionUserRequest(request, userId)) {
    return Response.json({ error: "Sessao invalida." }, { status: 401 });
  }

  if (!video.type.startsWith("video/")) {
    return Response.json({ error: "Envie um arquivo de video." }, { status: 400 });
  }

  if (video.size > 50 * 1024 * 1024) {
    return Response.json({ error: "Video muito grande. Limite: 50 MB." }, { status: 400 });
  }

  try {
    const upload = await saveChatVideo(video);
    const message = await createChatMessage({
      senderId: userId,
      roomType,
      receiverId: peerId,
      body,
      attachmentType: "video",
      attachmentUrl: upload.url,
      attachmentName: upload.name,
    });

    return Response.json({ message });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Nao foi possivel enviar video.",
    }, { status: 400 });
  }
}

async function saveChatVideo(video: File) {
  const supabaseUpload = await saveChatVideoToSupabase(video);

  if (supabaseUpload) {
    return supabaseUpload;
  }

  if (!canWriteLocalFiles) {
    throw new Error("Configure o Supabase Storage para enviar videos em producao.");
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "chat");
  const extension = getVideoExtension(video);
  const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const filePath = path.join(uploadsDir, fileName);
  const buffer = Buffer.from(await video.arrayBuffer());

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(filePath, buffer);

  return {
    name: video.name,
    url: `/uploads/chat/${fileName}`,
  };
}

async function saveChatVideoToSupabase(video: File) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const extension = getVideoExtension(video);
  const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const objectPath = `chat/${fileName}`;
  const buffer = Buffer.from(await video.arrayBuffer());

  await ensureChatVideoBucket();

  const { error } = await supabase.storage
    .from(chatVideoBucket)
    .upload(objectPath, buffer, {
      contentType: video.type || "video/mp4",
      upsert: false,
    });

  if (error) {
    throw new Error(`Nao foi possivel salvar video no Supabase Storage: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(chatVideoBucket)
    .getPublicUrl(objectPath);

  return {
    name: video.name,
    url: data.publicUrl,
  };
}

async function ensureChatVideoBucket() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const { data } = await supabase.storage.getBucket(chatVideoBucket);

  if (data) {
    return;
  }

  const { error } = await supabase.storage.createBucket(chatVideoBucket, {
    public: true,
    fileSizeLimit: "50MB",
    allowedMimeTypes: [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-m4v",
    ],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(`Nao foi possivel criar bucket de videos: ${error.message}`);
  }
}

function getVideoExtension(video: File) {
  const cleanName = video.name.toLowerCase();
  const extension = path.extname(cleanName);

  if ([".mp4", ".webm", ".mov", ".m4v"].includes(extension)) {
    return extension;
  }

  if (video.type === "video/webm") {
    return ".webm";
  }

  if (video.type === "video/quicktime") {
    return ".mov";
  }

  return ".mp4";
}
