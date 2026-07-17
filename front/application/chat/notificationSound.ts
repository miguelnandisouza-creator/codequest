"use client";

import { MutableRefObject } from "react";

export const chatSoundPreferenceKey = "codequest-chat-sound-enabled";

export function getChatSoundPreference() {
  return typeof window !== "undefined" &&
    localStorage.getItem(chatSoundPreferenceKey) === "true";
}

export function setChatSoundPreference(enabled: boolean) {
  localStorage.setItem(chatSoundPreferenceKey, String(enabled));
  window.dispatchEvent(new CustomEvent("codequest-chat-sound-change", {
    detail: { enabled },
  }));
}

export async function ensureNotificationAudio(
  soundContextRef: MutableRefObject<AudioContext | null>
) {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextConstructor) {
    throw new Error("Seu navegador nao liberou audio para notificacoes.");
  }

  soundContextRef.current ??= new AudioContextConstructor();
  await soundContextRef.current.resume();

  return soundContextRef.current;
}

export function playNotificationSound(
  soundContextRef: MutableRefObject<AudioContext | null>
) {
  const context = soundContextRef.current;

  if (!context || context.state !== "running") {
    return;
  }

  const startAt = context.currentTime;
  const notes = [
    { frequency: 660, start: 0, duration: 0.08 },
    { frequency: 880, start: 0.1, duration: 0.12 },
  ];

  for (const note of notes) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(note.frequency, startAt + note.start);
    gain.gain.setValueAtTime(0.0001, startAt + note.start);
    gain.gain.exponentialRampToValueAtTime(0.08, startAt + note.start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + note.start + note.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt + note.start);
    oscillator.stop(startAt + note.start + note.duration + 0.02);
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
