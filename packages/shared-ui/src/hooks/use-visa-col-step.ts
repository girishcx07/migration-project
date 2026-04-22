"use client";

import { useState } from "react";

export type UseStepReturn = {
  step: number;
  /** Move forward by 1 — sequential only */
  next: () => void;
  /** Jump back to any previous step (or 1 step back if no target) */
  back: (targetStep?: number) => void;
  /** Whether forward progress is allowed from current step */
  canGoNext: boolean;
  /** Whether backward navigation is possible */
  canGoBack: boolean;
  /** The highest step the user has reached (used for jump-back UI) */
  maxReachedStep: number;
};

export function useStep(totalSteps: number, initialStep = 1): UseStepReturn {
  const [step, setStep] = useState(initialStep);
  const [maxReachedStep, setMaxReachedStep] = useState(initialStep);

  const next = () => {
    setStep((prev) => {
      const nextStep = Math.min(prev + 1, totalSteps);
      setMaxReachedStep((max) => Math.max(max, nextStep));
      return nextStep;
    });
  };

  /**
   * Jump back to any already-visited step.
   * If targetStep is omitted, goes 1 step back.
   * You can only jump back to steps <= maxReachedStep.
   */
  const back = (targetStep?: number) => {
    setStep((prev) => {
      const destination =
        targetStep !== undefined
          ? Math.max(1, Math.min(targetStep, prev - 1)) // can't jump forward via back()
          : Math.max(1, prev - 1);
      return destination;
    });
  };

  return {
    step,
    next,
    back,
    canGoNext: step < totalSteps,
    canGoBack: step > 1,
    maxReachedStep,
  };
}
