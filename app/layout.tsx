import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import { readAppSettings } from "@/infrastructure/settings/appSettingsRepository";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeQuest",
  description: "Aprenda programacao em campanhas gamificadas.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appSettings = await readAppSettings();

  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col bg-[#080d16]">
        <AppShell maintenanceMode={appSettings.maintenanceMode}>{children}</AppShell>
      </body>
    </html>
  );
}
