"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getCookie } from "@workspace/common-ui/lib/utils";
import { orpc } from "@workspace/orpc/lib/orpc";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useEffect, useState } from "react";
import LeftSectionHeader from "../components/left-section-header";
import ProductDetails from "../components/product-details";
import { usePaymentSummary } from "../context/payment-summary-context";
import RelationGrouping from "../sections/relation-grouping";
import { ContactDetails } from "./contact-details";
import { useRouteContext } from "@workspace/common-ui/context/route-context";

interface LeftSectionProps {
  applicationId: string;
}
const LeftSection = ({ applicationId }: LeftSectionProps) => {
  const { workflow } = useRouteContext();

  const { selectedCurrency } = usePaymentSummary()
  
  const { data, isLoading, isPending } = useSuspenseQuery(
    orpc.visa.getApplicationApplicantsDetails.queryOptions({
      input: {
        applicationId: applicationId,
      },
      enabled: !!selectedCurrency,
    }),
  );

  const user_id = getCookie("user_id");
  const host = getCookie("host");

  const {
    selectedPaymentMethod,
    setMetaData,
    setIsDisabledProceed,
    setApplicationDetails,
    acceptedTnc,
    setAcceptedTnc
  } = usePaymentSummary();
  const applicationData = data?.data;
  const { application, applicants } = applicationData || {};

  useEffect(() => {
    if (application?._id) {
      setMetaData({
        user_id: user_id!,
        host: host!,
        application_id: application._id,
      });
      setApplicationDetails(applicationData);
    }
  }, [applicationData, user_id, host, setMetaData, setApplicationDetails]);

  useEffect(() => {
    if (selectedPaymentMethod?.display_name !== "Wallet") {
      setIsDisabledProceed(false);
    }
  }, [selectedPaymentMethod]);

  console.log("isLoadingisLoadingisLoading", { isLoading, isPending })

  if (isLoading || isPending) {
    return <LeftColumnSkeleton />
  }

  return (
    <div className="relative flex h-full w-full flex-col space-y-6 pb-4 md:w-7/12">
      {/* Main Header */}
      <LeftSectionHeader application={application} />
      {/* Application Details */}
      <ProductDetails application={application} />
      {/* Applicant Overview */}
      <RelationGrouping applicants={applicants || []} />
      {/* Contact Details form */}
      {["console", "qr-visa"].includes(workflow) && <ContactDetails />}


    </div>
  );
};

export default LeftSection;

export function LeftColumnSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:w-7/12">
      {/* Header Skeleton */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="h-[20px] w-[40px]" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="mt-3 h-7 w-48" />
      </div>

      {/* ProductDetails Skeleton */}
      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* RelationGrouping Skeleton */}
      <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>

      {/* Ref Code Section Skeleton */}
      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-6 w-60" />
      </div>
    </div>
  );
}
