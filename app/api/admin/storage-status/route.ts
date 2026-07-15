import { isAdminEmail } from "@/data/admin";
import { isSupabaseConfigured } from "@/infrastructure/supabase/serverClient";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("adminEmail") ?? "";

  if (!isAdminEmail(email)) {
    return Response.json({ error: "Acesso negado." }, { status: 403 });
  }

  return Response.json({
    mode: isSupabaseConfigured() ? "supabase" : "local",
    supabaseConfigured: isSupabaseConfigured(),
  });
}
