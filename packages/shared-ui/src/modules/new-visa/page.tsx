"use client";

import { Suspense } from "react";

import { VisaColumnProvider } from "./context/visa-columns-context";
import { VisaColumnsViewSkeleton } from "./view/visa-columns-view";
import { VisaStepLayout } from "./view/visa-step-layout";

type NewVisaPageProps = {
  reviewRoute?: string;
};

export default function NewVisaPage({
  reviewRoute = "/qr-visa/review",
}: NewVisaPageProps) {
  return (
    <div className="bg-secondary h-screen">
      <VisaColumnProvider>
        <Suspense fallback={<VisaColumnsViewSkeleton />}>
          <VisaStepLayout onReviewRoute={reviewRoute} />
        </Suspense>
      </VisaColumnProvider>
    </div>
  );
}
