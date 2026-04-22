"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";

interface SummaryRowProps {
  label: string | React.ReactNode;
  caption?: string;
  value?: string | number | React.ReactNode;
  currency?: string;
  disabledBottomBorder?: boolean;
  currencySymbol?: string;
  isTotal?: boolean;
}

export const PaymentSummaryRow = ({
  label,
  caption,
  value,
  currency,
  currencySymbol,
  disabledBottomBorder = true,
  isTotal = false,
}: SummaryRowProps) => {
  return (
    <>
      <div className="flex justify-between space-y-2 text-sm text-gray-600">
        <div
          className={`flex flex-col ${isTotal ? "text-base font-bold text-gray-800" : ""}`}
          suppressHydrationWarning
        >
          {label}
          {caption && <small className="text-[10px]">{caption}</small>}
        </div>

        <div
          className={`font-medium text-black flex gap-1 items-center ${isTotal ? "text-base font-bold" : ""}`}
        >
          {currency} {value}
        </div>
      </div>
      {disabledBottomBorder && <hr className="mt-1 border-white" />}
    </>
  );
};

export const PaymentSummaryRowSkeleton = () => {
  return (
    <div className="flex justify-between p-2 text-sm">
      <div className="space-y-1">
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <Skeleton className="h-4 w-20 rounded" />
    </div>
  );
};
