import { useState } from "react";

import { Button } from "@acme/ui/components/button";
import { cn } from "@acme/ui/lib/utils";

// ─── Single source of truth for all step metadata ───────────────────────────
type StepConfig = {
  title: string;
  content: (props: {
    step: number;
    idx: number;
    next: () => void;
    back: () => void;
  }) => React.ReactNode;
};

const STEPS: StepConfig[] = [
  {
    title: "Visa Application",
    content: ({ step, idx, next, back }) => (
      <VisaApplicationCard next={next} back={step > 1 ? back : undefined} />
    ),
  },
  {
    title: "Visa Offers",
    content: ({ step, next, back }) => (
      <VisaOffersList next={next} back={step > 2 ? back : undefined} />
    ),
  },
  {
    title: "Upload Documents",
    content: ({ back }) => <VisaDocumentsUpload back={back} />,
  },
];

const TOTAL_STEPS = STEPS.length;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Width class for a desktop column given current step and which step it is. */
function desktopColWidth(currentStep: number, colIdx: number): string {
  if (currentStep === 1) return "w-full";
  if (currentStep === 2)
    return colIdx === 0 ? "w-[calc(50%-0.375rem)]" : "w-[calc(50%-0.375rem)]";
  return "w-[calc(33.333%-0.5rem)]";
}

// ─── Card ─────────────────────────────────────────────────────────────────────

type CardProps = {
  title: string;
  children: React.ReactNode;
  idx: number;
};

function Card({ title, children, idx }: CardProps) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex shrink-0 items-center gap-3 p-4">
        <span className="flex size-6 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
          {idx}
        </span>
        <h2 className="text-md m-0 font-semibold text-slate-900 md:text-xl">
          {title}
        </h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="h-full shrink-0 overflow-y-auto bg-slate-50">
          <MaxWidthWrapper className="my-2">{children}</MaxWidthWrapper>
        </div>
      </div>
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export function VisaStepLayout({
  onReviewRoute: _onReviewRoute,
}: {
  onReviewRoute: string;
}) {
  const [step, setStep] = useState(1);

  const handleNext = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="bg-background h-screen p-4 pb-0">
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="min-h-0 flex-1 overflow-hidden">
          {/* ── Mobile: single-card slide view ── */}
          <div className="relative h-full min-h-0 md:hidden">
            {STEPS.map((stepConfig, i) => {
              const idx = i + 1;
              const isCurrent = step === idx;
              const isPast = step > idx;

              return (
                <div
                  key={stepConfig.title}
                  className={cn(
                    "absolute inset-0 transition-all duration-300 ease-in-out",
                    isCurrent
                      ? "pointer-events-auto translate-x-0 opacity-100"
                      : isPast
                        ? "pointer-events-none -translate-x-4 opacity-0"
                        : "pointer-events-none translate-x-4 opacity-0",
                  )}
                >
                  <Card title={stepConfig.title} idx={idx}>
                    {stepConfig.content({
                      step,
                      idx,
                      next: handleNext,
                      back: handleBack,
                    })}
                  </Card>
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
            {STEPS.map((stepConfig, i) => {
              const idx = i + 1;
              const isVisible = step >= idx;

              return (
                <div
                  key={stepConfig.title}
                  className={cn(
                    "h-full min-h-0 min-w-0 shrink-0 overflow-hidden transition-all duration-500 ease-in-out",
                    isVisible
                      ? `${desktopColWidth(step, i)} translate-x-0 opacity-100`
                      : "w-0 translate-x-8 opacity-0",
                  )}
                >
                  {isVisible && (
                    <Card title={stepConfig.title} idx={idx}>
                      {stepConfig.content({
                        step,
                        idx,
                        next: handleNext,
                        back: handleBack,
                      })}
                    </Card>
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
              onClick={handleBack}
              disabled={step === 1}
            >
              Previous
            </Button>
            <Button onClick={handleNext} disabled={step === TOTAL_STEPS}>
              Continue
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}

const MaxWidthWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn("mx-auto w-full max-w-md px-4", className)}>
      {children}
    </div>
  );
};

interface VisaStepLayoutProps {
  next?: () => void;
  back?: () => void;
}

const VisaApplicationCard = ({ next, back }: VisaStepLayoutProps) => {
  return (
    <div>
      Visa Application Card
      <div>auto select</div>
      <div>auto select</div>
      <div>auto select</div>
      <Button onClick={next}>Submit</Button>
      <Button onClick={back} disabled={!back}>
        Back
      </Button>
    </div>
  );
};

const VisaOffersList = ({ next, back }: VisaStepLayoutProps) => {
  return (
    <div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="checkbox" id={`offer-${i}`} name={`offer-${i}`} />
          <label htmlFor={`offer-${i}`}>Offer {i + 1}</label>
        </div>
      ))}
      <Button onClick={next}>Continue</Button>
      <Button onClick={back} disabled={!back}>
        Back
      </Button>
    </div>
  );
};

const VisaDocumentsUpload = ({}: VisaStepLayoutProps) => {
  return (
    <div>
      Upload Documents
      <label htmlFor="passport">Passport:</label>
      <input type="file" id="passport" name="passport" />
      <label htmlFor="photo">Photo:</label>
      <input type="file" id="photo" name="photo" />
    </div>
  );
};
