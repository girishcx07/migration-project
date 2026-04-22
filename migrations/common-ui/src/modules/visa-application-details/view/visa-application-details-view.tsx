"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import ErrorBoundary from "@workspace/common-ui/components/error-boundary";
import { getBookingStatusNew } from "@workspace/common-ui/lib/utils";
import { orpc } from "@workspace/orpc/lib/orpc";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ChevronLeft } from "lucide-react";
import { useAppRouter } from "../../../platform/navigation";
import ApplicantOverview from "../sections/applicant-overview";
import ApplicationInformation from "../sections/application-information";
import DeletedApplicantsOverview from "../sections/deleted-applicants-overview";
import PaymentDetails from "../sections/payment-details";
import Support from "../sections/Support";
import { useRouteContext } from "@workspace/common-ui/context/route-context";

const VisaApplicationDetailsView = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const router = useAppRouter();
  const { workflow } = useRouteContext();

  const { data } = useSuspenseQuery(
    orpc.visa.getApplicationApplicantsDetails.queryOptions({
      input: {
        applicationId: applicationId,
      },
    }),
  );

  const applicationDetails = data?.data || {};
  const application = applicationDetails?.application || {};
  const deletedApplicants = applicationDetails?.deleted_applicants || [];

  const { label } = getBookingStatusNew(
    application?.application_state!,
    application,
  );

  console.log("payment_summary===>", {
    email: application?.operations_head_email,
  });

  const isDraftApplication = label !== "Draft" && label !== "Archived";

  return (
    <div className="flex flex-col gap-4 md:p-4">
      {/* Header Section */}
      <div className="px-4 py-2">
        <div className="flex w-full items-center gap-2 rounded-lg bg-white p-4 shadow-md">
          {
            // workflow !== "qr-visa" &&
            (
              <div className="shadow-md p-1 border border-gray-200 rounded-lg">
                <ChevronLeft
                  width={24}
                  className="cursor-pointer"
                  onClick={() => {
                    workflow == "qr-visa" ? router.push(`/${workflow}/track-application/search`) :
                      router.back()
                  }}
                />
              </div>
            )}
          <h1 className="text-2xl font-bold tracking-tight whitespace-nowrap">
            Visa Details
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-2 md:flex-row">
        <div className="w-full md:w-1/2">
          <ErrorBoundary>
            <ApplicationInformation application={application} />
          </ErrorBoundary>
        </div>
        <div className="w-full md:w-1/2">
          <ErrorBoundary>
            {/* <ProductDetails application={application} /> */}
            <ApplicantOverview application={applicationDetails} />
          </ErrorBoundary>
        </div>
      </div>
      {/* <div className="px-4 py-2">
        <ApplicantOverview application={applicationDetails} />
      </div> */}
      {deletedApplicants && deletedApplicants?.length > 0 && (
        <div className="px-4 py-2">
          <DeletedApplicantsOverview application={applicationDetails} />
        </div>
      )}

      <div className="flex flex-col gap-3 px-4 py-2 md:flex-row">
        {isDraftApplication && (
          <div className="w-full md:w-1/2">
            <ErrorBoundary>
              <PaymentDetails application={application} />
            </ErrorBoundary>
          </div>
        )}
        <div
          className={`flex w-full items-center ${isDraftApplication ? "md:w-1/2" : ""}`}
        >
          <ErrorBoundary>
            <Support email={application?.operations_head_email!} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default VisaApplicationDetailsView;

export function VisaApplicationDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:p-4">
      {/* Header */}
      <div className="flex items-center gap-1">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-7 w-32" />
      </div>

      <div className="flex flex-col gap-3 px-4 py-2 md:flex-row">
        {/* Left Column - Application Information */}
        <div className="w-full space-y-3 rounded-xl bg-white p-4 shadow-sm md:w-1/2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {/* Right Column - Applicant Overview */}
        <div className="w-full space-y-3 rounded-xl bg-white p-4 shadow-sm md:w-1/2">
          <Skeleton className="h-5 w-1/3" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-2 md:flex-row">
        {/* Payment Details */}
        <div className="w-full space-y-3 rounded-xl bg-white p-4 shadow-sm md:w-1/2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        {/* Support */}
        <div className="flex w-full items-center rounded-xl bg-white p-4 shadow-sm md:w-1/2">
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}
