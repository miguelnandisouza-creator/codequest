import {
  readStudentNote,
  writeStudentNote,
} from "@/infrastructure/supabase/notebookRepository";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId")?.trim();
  const stageId = url.searchParams.get("stageId")?.trim();

  if (!userId || !stageId) {
    return Response.json({ error: "Usuario e fase sao obrigatorios." }, { status: 400 });
  }

  const note = await readStudentNote(userId, stageId);

  return Response.json({ note });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    userId?: string;
    stageId?: string;
    content?: string;
  } | null;

  if (!body?.userId || !body.stageId || body.content === undefined) {
    return Response.json({ error: "Dados da anotacao invalidos." }, { status: 400 });
  }

  const note = await writeStudentNote(body.userId, body.stageId, body.content);

  return Response.json({ ok: true, note });
}
