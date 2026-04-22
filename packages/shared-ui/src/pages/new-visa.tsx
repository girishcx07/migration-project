"use client";

import { Button } from "@acme/ui/components/button";
import { cn } from "@acme/ui/lib/utils";

import { VisaColCard } from "../components/visa-col-card";
import { StepContext } from "../context/StepContext";
import { useStep } from "../hooks/use-visa-col-step";
import { desktopColWidth, mobileSlideClass } from "../utils/step";
import { VisaApplicationCard } from "./steps/VisaApplicationCard";
import { VisaDocumentsUpload } from "./steps/VisaDocumentsUpload";
import { VisaOffersList } from "./steps/VisaOffersList";

// ─── Single source of truth ───────────────────────────────────────────────────
// Adding a step = add one entry here. Title changes here only, once.

type StepConfig = {
  title: string;
  /** Render the step's inner content. next/back come from context, no need to pass. */
  content: React.ReactNode;
};

// Note: content receives no props — each step pulls next/back from useStepContext()
const STEPS: StepConfig[] = [
  { title: "Visa Application", content: <VisaApplicationCard /> },
  { title: "Visa Offers", content: <VisaOffersList /> },
  { title: "Upload Documents", content: <VisaDocumentsUpload /> },
];

const TOTAL_STEPS = STEPS.length;

// ─── Layout ───────────────────────────────────────────────────────────────────

export function VisaStepLayout({
  onReviewRoute: _onReviewRoute,
}: {
  onReviewRoute: string;
}) {
  const stepApi = useStep(TOTAL_STEPS);
  const { step, next, back, canGoNext, canGoBack, maxReachedStep } = stepApi;

  // Number of columns currently visible on desktop
  const visibleCount = step;

  function cardState(idx: number): "active" | "completed" | "future" {
    if (idx === step) return "active";
    if (idx < step) return "completed";
    return "future";
  }

  return (
    <StepContext.Provider value={{ ...stepApi, totalSteps: TOTAL_STEPS }}>
      <div className="bg-background h-screen p-4 pb-0">
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div className="min-h-0 flex-1 overflow-hidden">
            {/* ── Mobile: single-card slide view ── */}
            <div className="relative h-full min-h-0 md:hidden">
              {STEPS.map((s, i) => {
                const idx = i + 1;
                const slide = mobileSlideClass(idx, step);
                return (
                  <div
                    key={s.title}
                    className={cn(
                      "absolute inset-0 transition-all duration-300 ease-in-out",
                      slide === "current" &&
                        "pointer-events-auto translate-x-0 opacity-100",
                      slide === "past" &&
                        "pointer-events-none -translate-x-4 opacity-0",
                      slide === "future" &&
                        "pointer-events-none translate-x-4 opacity-0",
                    )}
                  >
                    <VisaColCard
                      title={s.title}
                      idx={idx}
                      state={cardState(idx)}
                    >
                      {s.content}
                    </VisaColCard>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop: expanding multi-column view ── */}
            <div
              className={cn(
                "hidden h-full min-h-0 overflow-hidden transition-all duration-500 ease-in-out md:flex",
                step > 1 ? "gap-3" : "gap-0",
              )}
            >
              {STEPS.map((s, i) => {
                const idx = i + 1;
                const isVisible = step >= idx;
                return (
                  <div
                    key={s.title}
                    className={cn(
                      "h-full min-h-0 min-w-0 shrink-0 overflow-hidden transition-all duration-500 ease-in-out",
                      isVisible
                        ? `${desktopColWidth(visibleCount)} translate-x-0 opacity-100`
                        : "w-0 translate-x-8 opacity-0",
                    )}
                  >
                    {isVisible && (
                      <VisaColCard
                        title={s.title}
                        idx={idx}
                        state={cardState(idx)}
                      >
                        {s.content}
                      </VisaColCard>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Footer ── */}
          <footer className="flex shrink-0 items-center justify-end gap-3 rounded-t-md border border-slate-200 bg-white shadow-sm">
            <div className="hidden items-center gap-3 p-4 md:flex">
              <Button>Continue</Button>
            </div>

            <div className="flex items-center gap-3 p-4 md:hidden">
              <Button
                variant="outline"
                onClick={() => back()}
                disabled={!canGoBack}
              >
                Previous
              </Button>
              <Button onClick={next} disabled={!canGoNext}>
                Continue
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </StepContext.Provider>
  );
}
