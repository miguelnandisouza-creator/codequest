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
import ProfileAvatar from "@/components/rewards/ProfileAvatar";

export default function AuthStatus() {
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
        className="rounded p-1 hover:bg-white/5"
        aria-label={`Abrir conta de ${session.name}`}
      >
        <ProfileAvatar />
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
