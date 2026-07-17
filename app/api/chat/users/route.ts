import { readChatUsers } from "@/infrastructure/supabase/chatRepository";

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId") ?? "";

  if (!userId) {
    return Response.json({ error: "Usuario nao informado." }, { status: 400 });
  }

  const users = await readChatUsers(userId);

  return Response.json({ users });
}
