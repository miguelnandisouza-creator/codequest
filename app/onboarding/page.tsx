"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { StepCard } from "@/components/onboarding/StepCard";
import {
  getLanguageOptions,
  OnboardingAnswers,
  onboardingSteps,
} from "@/data/onboarding";

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
    <main className="cq-page flex items-center justify-center p-5 md:p-6">
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
              className="cq-menu-option"
            >
              <span className="mr-3 text-[#72e6a8]">{">"}</span>
              {option}
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/dashboard"
            className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#9ec0ff] hover:text-white"
          >
            Pular e abrir campanhas
          </Link>
        </div>
      </StepCard>
    </main>
  );
}
