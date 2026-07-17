import { readIncomingChatMessages } from "@/infrastructure/supabase/chatRepository";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? "";
  const after = url.searchParams.get("after") ?? undefined;

  if (!userId) {
    return Response.json({ error: "Usuario nao informado." }, { status: 400 });
  }

  const messages = await readIncomingChatMessages({
    userId,
    after,
  });

  return Response.json({ messages });
}
