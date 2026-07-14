"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  getLanguageOptions,
  OnboardingAnswers,
  onboardingSteps,
} from "@/data/onboarding";
import { StepCard } from "@/components/onboarding/StepCard";
import { ProgressBar } from "@/components/onboarding/ProgressBar";

export default function OnboardingPage() {
  const router = useRouter();

  const data = onboardingSteps;

  const [step, setStep] = useState(0);

  const [answers, setAnswers] = useState<OnboardingAnswers>({
    goal: "",
    language: "",
    dailyTime: "",
    deadline: "",
  });

  function select(value: string) {
    const currentStep = data[step];
    const updatedAnswers = {
      ...answers,
      [currentStep.id]: value,
      ...(currentStep.id === "goal" ? { language: "" } : {}),
    };
    const nextStep = step + 1;

    setAnswers(updatedAnswers);

    try {
      localStorage.setItem(
        "codequest-onboarding",
        JSON.stringify({
          ...updatedAnswers,
          completed: nextStep >= data.length,
        })
      );
    } catch {
      // The app still works if a LAN browser blocks storage.
    }

    if (nextStep >= data.length) {
      router.replace("/dashboard");
      return;
    }

    setStep(nextStep);
  }

  if (step >= data.length) {
    return null;
  }

  const currentStep = data[step];
  const options = currentStep.id === "language"
    ? getLanguageOptions(answers.goal)
    : currentStep.options;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-white">
      <StepCard
        title={currentStep.title}
        description={currentStep.description}
      >
        <ProgressBar
          current={step}
          total={data.length}
        />

        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => select(option)}
              className="w-full rounded-xl bg-zinc-800 p-4 text-left transition hover:bg-blue-600"
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-blue-300 hover:text-blue-200"
          >
            Pular e abrir campanhas
          </Link>
        </div>
      </StepCard>
    </main>
  );
}
