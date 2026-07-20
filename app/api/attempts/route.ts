import {
  readRecentAttempts,
  recordAttempt,
} from "@/infrastructure/supabase/attemptRepository";
import { isSessionUserRequest } from "@/infrastructure/auth/sessionToken";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId")?.trim();
  const limit = Number(url.searchParams.get("limit") ?? 80);

  if (!userId) {
    return Response.json({ error: "Usuario nao informado." }, { status: 400 });
  }

  if (!isSessionUserRequest(request, userId)) {
    return Response.json({ error: "Sessao invalida." }, { status: 401 });
  }

  const attempts = await readRecentAttempts(userId, Number.isFinite(limit) ? limit : 80);

  return Response.json({ attempts });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    userId?: string;
    stageId?: string;
    stepTitle?: string;
    answer?: string;
    success?: boolean;
    feedback?: string;
  } | null;

  if (!body?.userId || !body.stageId || typeof body.success !== "boolean") {
    return Response.json({ error: "Tentativa invalida." }, { status: 400 });
  }

  if (!isSessionUserRequest(request, body.userId)) {
    return Response.json({ error: "Sessao invalida." }, { status: 401 });
  }

  const attempt = await recordAttempt({
    userId: body.userId,
    stageId: body.stageId,
    stepTitle: body.stepTitle ?? "",
    answer: body.answer ?? "",
    success: body.success,
    feedback: body.feedback ?? "",
  });

  return Response.json({ attempt });
}
