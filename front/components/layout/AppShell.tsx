"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo, useSyncExternalStore } from "react";

import AuthStatus from "./AuthStatus";
import AchievementToastHub from "@/components/achievements/AchievementToastHub";
import ChatNotificationHub from "@/components/chat/ChatNotificationHub";
import GiftNotificationHub from "@/components/rewards/GiftNotificationHub";
import {
  getLocalSessionSnapshot,
  getServerLocalSessionSnapshot,
  LocalSession,
  subscribeToLocalAuth,
} from "@/application/auth/localAuth";
import PetCompanion from "@/components/rewards/PetCompanion";
import RewardStyleSync from "@/components/rewards/RewardStyleSync";
import SurpriseExamModal from "@/components/surprise/SurpriseExamModal";
import { isAdminEmail } from "@/data/admin";

type Props = {
  children: ReactNode;
  maintenanceMode?: boolean;
};

export default function AppShell({ children, maintenanceMode = false }: Props) {
  const pathname = usePathname();
  const sessionSnapshot = useSyncExternalStore(
    subscribeToLocalAuth,
    getLocalSessionSnapshot,
    getServerLocalSessionSnapshot
  );
  const session = useMemo(() => parseJson<LocalSession>(sessionSnapshot), [sessionSnapshot]);
  const isAdmin = isAdminEmail(session?.email);
  const canBypassMaintenance = isAdmin || pathname === "/login" || pathname === "/admin";

  if (pathname === "/") {
    if (maintenanceMode && !canBypassMaintenance) {
      return <MaintenanceScreen />;
    }

    return (
      <>
        <RewardStyleSync />
        {children}
      </>
    );
  }

  return (
    <>
      {maintenanceMode && !canBypassMaintenance ? (
        <MaintenanceScreen />
      ) : (
        <>
      <header className="sticky top-0 z-50 border-b border-[#22324a] bg-[#070c15]/92 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-white md:flex-row md:items-center md:justify-between md:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 font-mono text-sm font-black uppercase tracking-[0.12em] text-[#f3f7ff]"
          >
            <span className="cq-pixel-icon">CQ</span>
            CodeQuest
          </Link>

          <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 text-xs font-bold uppercase tracking-[0.08em] text-[#93a4bd] md:w-auto md:overflow-visible md:pb-0 md:gap-4">
            <Link href="/dashboard" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
              Campanhas
            </Link>
            <Link href="/profile" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
              Meus cursos
            </Link>
            <Link href="/journey" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
              Jornada
            </Link>
            <Link href="/review" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
              Revisao
            </Link>
            <Link href="/account" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
              Conta
            </Link>
            <Link href="/rewards" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
              Loja
            </Link>
            <Link href="/chat" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
              Chat
            </Link>
            <Link href="/ranking" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
              Ranking
            </Link>
            <Link href="/settings" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
              Config
            </Link>
            {isAdmin && (
              <Link href="/admin" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
                Admin
              </Link>
            )}

            <AuthStatus />
          </div>
        </nav>
      </header>

      {children}
      <RewardStyleSync />
      <ChatNotificationHub />
      <GiftNotificationHub />
      <AchievementToastHub />
      <SurpriseExamModal />
      <PetCompanion />
        </>
      )}
    </>
  );
}

function MaintenanceScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#050914] px-5 text-[#eef4ff]">
      <section className="w-full max-w-2xl rounded-md border border-[#24344d] bg-[#0a1220] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <p className="cq-kicker">CodeQuest</p>
        <h1 className="cq-title mt-4 text-4xl md:text-6xl">Em manutencao</h1>
        <p className="mx-auto mt-5 max-w-lg leading-7 text-[#93a4bd]">
          Estamos atualizando missoes, recompensas e progresso. Volte em alguns minutos.
        </p>
        <Link href="/login" className="cq-button cq-button-secondary mt-8">
          Entrar como admin
        </Link>
      </section>
    </main>
  );
}

function parseJson<T>(value: string) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
