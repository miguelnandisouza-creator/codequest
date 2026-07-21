import {
  readAppSettings,
  writeAppSettings,
} from "@/infrastructure/settings/appSettingsRepository";
import {
  getSessionRequestPayload,
  isAdminSessionRequest,
} from "@/infrastructure/auth/sessionToken";
import { recordAdminAction } from "@/infrastructure/admin/adminAuditRepository";

export async function GET(request: Request) {
  if (!isAdminSessionRequest(request)) {
    return Response.json({ error: "Acesso negado." }, { status: 403 });
  }

  const settings = await readAppSettings();

  return Response.json(settings, {
    headers: {
      "cache-control": "no-store",
    },
  });
}

export async function PATCH(request: Request) {
  if (!isAdminSessionRequest(request)) {
    return Response.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as {
    maintenanceMode?: boolean;
  } | null;

  if (typeof body?.maintenanceMode !== "boolean") {
    return Response.json({ error: "Modo de manutencao invalido." }, { status: 400 });
  }

  const session = getSessionRequestPayload(request);
  const settings = await writeAppSettings(
    { maintenanceMode: body.maintenanceMode },
    session?.email ?? "admin"
  );
  await recordAdminAction({
    action: "maintenanceMode",
    label: settings.maintenanceMode ? "Ativou manutencao" : "Desativou manutencao",
    actorEmail: session?.email ?? "admin",
    details: settings.maintenanceMode
      ? "Alunos passam a ver a tela de manutencao."
      : "Site liberado para alunos.",
  });

  return Response.json(settings);
}
