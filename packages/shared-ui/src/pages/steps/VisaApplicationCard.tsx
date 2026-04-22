import { Button } from "@acme/ui/components/button";

import { useStepContext } from "../../context/StepContext";

/**
 * Step 1 — Visa Application
 * Pulls `next` from context. No props needed.
 */
export function VisaApplicationCard() {
  const { next } = useStepContext();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Fill in your visa details below to get started.
      </p>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="nationality"
          className="text-sm font-medium text-slate-700"
        >
          Nationality
        </label>
        <select
          id="nationality"
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
        >
          <option value="">Select country...</option>
          <option value="in">India</option>
          <option value="us">United States</option>
          <option value="gb">United Kingdom</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="visa-type"
          className="text-sm font-medium text-slate-700"
        >
          Visa Type
        </label>
        <select
          id="visa-type"
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
        >
          <option value="">Select type...</option>
          <option value="tourist">Tourist</option>
          <option value="business">Business</option>
          <option value="student">Student</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="duration"
          className="text-sm font-medium text-slate-700"
        >
          Duration
        </label>
        <select
          id="duration"
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
        >
          <option value="">Select duration...</option>
          <option value="30">30 days</option>
          <option value="90">90 days</option>
          <option value="180">180 days</option>
        </select>
      </div>

      <Button onClick={next} className="mt-2 bg-blue-600 hover:bg-blue-700">
        Validate &amp; Continue
      </Button>
    </div>
  );
}
