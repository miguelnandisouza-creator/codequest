"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import {
  getLocalSessionSnapshot,
  getServerLocalSessionSnapshot,
  LocalSession,
  logoutLocalUser,
  subscribeToLocalAuth,
} from "@/application/auth/localAuth";
import { usePlayer } from "@/application/hooks/usePlayer";
import ProfileAvatar from "@/components/rewards/ProfileAvatar";

export default function AuthStatus() {
  const { player } = usePlayer();
  const sessionSnapshot = useSyncExternalStore(
    subscribeToLocalAuth,
    getLocalSessionSnapshot,
    getServerLocalSessionSnapshot
  );
  const session = useMemo(() => {
    if (!sessionSnapshot) {
      return null;
    }

    try {
      return JSON.parse(sessionSnapshot) as LocalSession;
    } catch {
      return null;
    }
  }, [sessionSnapshot]);

  if (!session) {
    return (
      <Link href="/login" className="rounded px-2 py-1 hover:bg-white/5 hover:text-white">
        Entrar
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/account"
        className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white/5"
        aria-label={`Abrir conta de ${session.name}`}
      >
        <ProfileAvatar />
        <span className="hidden min-w-0 text-left normal-case tracking-normal lg:block">
          <span className="block max-w-28 truncate font-mono text-xs font-black uppercase tracking-[0.08em] text-[#f3f7ff]">
            {session.name}
          </span>
          <span className="mt-0.5 block font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#93a4bd]">
            Level {player.level}
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={logoutLocalUser}
        className="rounded px-2 py-1 hover:bg-white/5 hover:text-white"
      >
        Sair
      </button>
    </>
  );
}
