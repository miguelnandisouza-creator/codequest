import {
  readPlayerProgress,
  writePlayerProgress,
} from "@/infrastructure/supabase/playerProgressRepository";
import { Player } from "@/domain/entities/player";
import { isSessionUserRequest } from "@/infrastructure/auth/sessionToken";

export async function GET(request: Request) {
  const userId = getUserId(request);

  if (!userId) {
    return Response.json({ error: "Usuario nao informado." }, { status: 400 });
  }

  if (!isSessionUserRequest(request, userId)) {
    return Response.json({ error: "Sessao invalida." }, { status: 401 });
  }

  const player = await readPlayerProgress(userId);

  return Response.json({ player });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    userId?: string;
    player?: Player;
  } | null;

  if (!body?.userId || !body.player) {
    return Response.json({ error: "Dados de progresso invalidos." }, { status: 400 });
  }

  if (!isSessionUserRequest(request, body.userId)) {
    return Response.json({ error: "Sessao invalida." }, { status: 401 });
  }

  const player = await writePlayerProgress(body.userId, body.player);

  return Response.json({ ok: true, player });
}

function getUserId(request: Request) {
  return new URL(request.url).searchParams.get("userId")?.trim();
}
