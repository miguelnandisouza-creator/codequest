import { getChatStorageStatus } from "@/infrastructure/supabase/chatRepository";

export async function GET() {
  return Response.json(await getChatStorageStatus());
}
