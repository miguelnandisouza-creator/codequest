import { isAdminSessionRequest } from "@/infrastructure/auth/sessionToken";
import { isSupabaseConfigured } from "@/infrastructure/supabase/serverClient";

export async function GET(request: Request) {
  if (!isAdminSessionRequest(request)) {
    return Response.json({ error: "Acesso negado." }, { status: 403 });
  }

  return Response.json({
    mode: isSupabaseConfigured() ? "supabase" : "local",
    supabaseConfigured: isSupabaseConfigured(),
  });
}
