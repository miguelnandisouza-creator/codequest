import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { getSupabaseServerClient } from "./serverClient";

const dataDir = path.join(process.cwd(), ".data");
const notesFile = path.join(dataDir, "student-notes.json");

export type StudentNote = {
  userId: string;
  stageId: string;
  content: string;
  updatedAt: string;
};

type StudentNoteRow = {
  user_id: string;
  stage_id: string;
  content: string;
  updated_at: string;
};

export async function readStudentNote(userId: string, stageId: string) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("student_notes")
      .select("user_id, stage_id, content, updated_at")
      .eq("user_id", userId)
      .eq("stage_id", stageId)
      .maybeSingle<StudentNoteRow>();

    if (!error && data) {
      return mapNoteRow(data);
    }

    if (error) {
      console.warn("Supabase read student_notes failed:", error.message);
    }
  }

  const notes = await readLocalNotes();
  return notes.find((note) => note.userId === userId && note.stageId === stageId) ?? null;
}

export async function writeStudentNote(userId: string, stageId: string, content: string) {
  const note: StudentNote = {
    userId,
    stageId,
    content: content.slice(0, 20000),
    updatedAt: new Date().toISOString(),
  };
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase
      .from("student_notes")
      .upsert({
        user_id: note.userId,
        stage_id: note.stageId,
        content: note.content,
        updated_at: note.updatedAt,
      }, { onConflict: "user_id,stage_id" });

    if (!error) {
      return note;
    }

    console.warn("Supabase write student_notes failed:", error.message);
  }

  const notes = await readLocalNotes();
  const filteredNotes = notes.filter((item) => !(item.userId === userId && item.stageId === stageId));

  await mkdir(dataDir, { recursive: true });
  await writeFile(notesFile, JSON.stringify([...filteredNotes, note], null, 2), "utf8");

  return note;
}

async function readLocalNotes() {
  try {
    const raw = await readFile(notesFile, "utf8");
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed as StudentNote[] : [];
  } catch {
    return [];
  }
}

function mapNoteRow(row: StudentNoteRow): StudentNote {
  return {
    userId: row.user_id,
    stageId: row.stage_id,
    content: row.content,
    updatedAt: row.updated_at,
  };
}
