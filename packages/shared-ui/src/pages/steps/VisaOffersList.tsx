import { useState } from "react";

import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

import { useStepContext } from "../../context/StepContext";

const OFFERS = [
  {
    id: "standard",
    label: "Standard Visa",
    description: "Processed in 10–15 business days",
    price: "$60",
  },
  {
    id: "express",
    label: "Express Visa",
    description: "Processed in 3–5 business days",
    price: "$120",
  },
  {
    id: "priority",
    label: "Priority Visa",
    description: "Processed within 24 hours",
    price: "$200",
  },
];

/**
 * Step 2 — Visa Offers
 * Pulls `next` from context. No props needed.
 */
export function VisaOffersList() {
  const { next } = useStepContext();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Choose the visa processing option that works best for you.
      </p>

      <div className="flex flex-col gap-2">
        {OFFERS.map((offer) => (
          <label
            key={offer.id}
            htmlFor={offer.id}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors",
              selected === offer.id
                ? "border-black bg-slate-50"
                : "border-slate-200 hover:bg-slate-50",
            )}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id={offer.id}
                name="visa-offer"
                value={offer.id}
                checked={selected === offer.id}
                onChange={() => setSelected(offer.id)}
                className="accent-black"
              />
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {offer.label}
                </p>
                <p className="text-xs text-slate-500">{offer.description}</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-800">
              {offer.price}
            </span>
          </label>
        ))}
      </div>

      <Button
        onClick={next}
        disabled={!selected}
        className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        Confirm Selection
      </Button>
    </div>
  );
}
