import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeQuest",
  description: "Aprenda programacao em campanhas gamificadas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const maintenanceMode = process.env.CODEQUEST_MAINTENANCE === "1";

  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col bg-[#080d16]">
        <AppShell maintenanceMode={maintenanceMode}>{children}</AppShell>
      </body>
    </html>
  );
}
