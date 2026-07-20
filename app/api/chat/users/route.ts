import { readChatUsers } from "@/infrastructure/supabase/chatRepository";
import { isSessionUserRequest } from "@/infrastructure/auth/sessionToken";

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId") ?? "";

  if (!userId) {
    return Response.json({ error: "Usuario nao informado." }, { status: 400 });
  }

  if (!isSessionUserRequest(request, userId)) {
    return Response.json({ error: "Sessao invalida." }, { status: 401 });
  }

  const users = await readChatUsers(userId);

  return Response.json({ users });
}
