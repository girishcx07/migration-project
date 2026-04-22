"use client";

import React from "react";

type StepperStatus = {
  label: string;
  value: string;
  width: number; // Expected to be percentage (e.g., 20, 45, etc.)
};

interface ApplicantProgressStepperProps {
  currentValue: string;
  statuses: StepperStatus[];
  isRejected?: boolean;
}

export default function ApplicantProgressStepper({
  currentValue,
  statuses,
  isRejected,
}: ApplicantProgressStepperProps) {
  const currentStatus = React.useMemo(() => {
    return statuses.find((s) => s.value === currentValue) ?? statuses[0];
  }, [currentValue, statuses]);

  return (
    <div
      className="w-full"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={currentStatus?.width}
    >
      {/* Progress bar track */}
      <div className="relative h-1 w-full overflow-hidden rounded bg-gray-300">
        <div
          className={`absolute top-0 left-0 h-full transition-all duration-300 ${isRejected ? "bg-red-700" : "bg-green-600"}`}
          style={{ width: `${currentStatus?.width}%` }}
        />
      </div>

      {/* Step labels */}
      <div className="mt-2 flex justify-between text-xs md:text-[10px]">
        {statuses.map((step) => {
          const isCurrent = step.value === currentValue;
          return (
            <div
              key={step.value}
              className={`flex flex-col items-center ${
                isCurrent
                  ? `font-medium ${isRejected ? "text-red-700" : "text-green-600"}`
                  : "text-gray-500"
              }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className="text-center whitespace-nowrap">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
