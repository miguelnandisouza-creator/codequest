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
    focusGuardEnabled?: boolean;
  } | null;

  if (
    typeof body?.maintenanceMode !== "boolean" &&
    typeof body?.focusGuardEnabled !== "boolean"
  ) {
    return Response.json({ error: "Configuracao invalida." }, { status: 400 });
  }

  const session = getSessionRequestPayload(request);
  const patch = {
    ...(typeof body.maintenanceMode === "boolean" ? { maintenanceMode: body.maintenanceMode } : {}),
    ...(typeof body.focusGuardEnabled === "boolean" ? { focusGuardEnabled: body.focusGuardEnabled } : {}),
  };
  const settings = await writeAppSettings(
    patch,
    session?.email ?? "admin"
  );
  if (typeof body.maintenanceMode === "boolean") {
    await recordAdminAction({
      action: "maintenanceMode",
      label: settings.maintenanceMode ? "Ativou manutencao" : "Desativou manutencao",
      actorEmail: session?.email ?? "admin",
      details: settings.maintenanceMode
        ? "Alunos passam a ver a tela de manutencao."
        : "Site liberado para alunos.",
    });
  }
  if (typeof body.focusGuardEnabled === "boolean") {
    await recordAdminAction({
      action: "focusGuard",
      label: settings.focusGuardEnabled ? "Ativou modo foco" : "Desativou modo foco",
      actorEmail: session?.email ?? "admin",
      details: settings.focusGuardEnabled
        ? "Fases pausam quando o aluno sai da aba, perde foco ou cola texto."
        : "Fases nao pausam por troca de aba ou colagem.",
    });
  }

  return Response.json(settings);
}
