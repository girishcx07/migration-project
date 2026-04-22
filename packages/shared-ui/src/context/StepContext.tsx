"use client";

import { createContext, useContext } from "react";

import type { UseStepReturn } from "../hooks/use-visa-col-step";

type StepContextValue = UseStepReturn & {
  totalSteps: number;
};

export const StepContext = createContext<StepContextValue | null>(null);

export function useStepContext(): StepContextValue {
  const ctx = useContext(StepContext);
  if (!ctx) {
    throw new Error("useStepContext must be used inside <StepProvider>");
  }
  return ctx;
}
