import { readIncomingChatMessages } from "@/infrastructure/supabase/chatRepository";
import { isSessionUserRequest } from "@/infrastructure/auth/sessionToken";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? "";
  const after = url.searchParams.get("after") ?? undefined;

  if (!userId) {
    return Response.json({ error: "Usuario nao informado." }, { status: 400 });
  }

  if (!isSessionUserRequest(request, userId)) {
    return Response.json({ error: "Sessao invalida." }, { status: 401 });
  }

  const messages = await readIncomingChatMessages({
    userId,
    after,
  });

  return Response.json({ messages });
}
