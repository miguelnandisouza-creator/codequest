import { isAdminSessionRequest } from "@/infrastructure/auth/sessionToken";
import { readAdminAuditLog } from "@/infrastructure/admin/adminAuditRepository";

export async function GET(request: Request) {
  if (!isAdminSessionRequest(request)) {
    return Response.json({ error: "Acesso negado." }, { status: 403 });
  }

  const auditLog = await readAdminAuditLog(60);

  return Response.json({ auditLog }, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
