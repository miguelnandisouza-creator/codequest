import { readAppSettings } from "@/infrastructure/settings/appSettingsRepository";

export async function GET() {
  const settings = await readAppSettings();

  return Response.json(settings, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
