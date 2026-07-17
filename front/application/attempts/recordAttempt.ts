"use client";

import { getLocalSession } from "@/application/auth/localAuth";

type AttemptInput = {
  stageId: string;
  stepTitle: string;
  answer: string;
  success: boolean;
  feedback: string;
};

export function recordAttempt(input: AttemptInput) {
  const session = getLocalSession();

  if (!session) {
    return;
  }

  void fetch("/api/attempts", {
    method: "POST",
    keepalive: true,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      userId: session.userId,
      ...input,
    }),
  }).catch(() => {
    // A tentativa nao deve travar a aula se a rede falhar.
  });
}
