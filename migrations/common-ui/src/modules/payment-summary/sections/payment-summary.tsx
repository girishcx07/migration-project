"use client";

import { Suspense, useEffect, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { queryClient } from "@workspace/common-ui/lib/react-query";
import { orpc } from "@workspace/orpc/lib/orpc";
import { GetVisaPaymentSumaryResponse } from "@workspace/types/payment-summary";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import CurrencySelect from "../../new-visa/components/currency-select";
import { PaymentSummaryRow } from "../components/payment-summary-row";
import { usePaymentSummary } from "../context/payment-summary-context";
import ErrorBoundary from "@workspace/common-ui/components/error-boundary";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Button } from "@workspace/ui/components/button";
import { InfoCircledIcon } from "@radix-ui/react-icons";

interface PaymentSummaryCardProps {
  applicationId: string;
}

const PaymentSummaryCard = (props: PaymentSummaryCardProps) => {
  return (
    <Suspense fallback={<PaymentSummaryCardSkeleton />}>
      <ErrorBoundary>
        <PaymentSummaryCardSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

const PaymentSummaryCardSuspense = ({
  applicationId,
}: PaymentSummaryCardProps) => {
  const { metaData, selectedCurrency, setSelectedCurrency, childApplicantIds } =
    usePaymentSummary();

  const { data } = useSuspenseQuery(
    orpc.visa.getVisaeroPaymentSummary.queryOptions({
      input: {
        currency: selectedCurrency!,
        applicationId: applicationId!,
        childApplicantIds: childApplicantIds,
      },
      gcTime: 0,
      staleTime: 0,
    }),
  );
  const paymentDetails = data.data as GetVisaPaymentSumaryResponse;

  const host = metaData?.host;

  console.log("paymentDetails", paymentDetails);

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: orpc.visa.getWalletBalance.key(),
    });
  }, [data]);


  const handleCurrencyChange = (value: any) => {
    setSelectedCurrency(value)
  }


  useEffect(() => {
    if (!selectedCurrency) return;

    const queryKey =
      orpc.visa.getApplicationApplicantsDetails.queryOptions({
        input: { applicationId },
      }).queryKey;

    queryClient.invalidateQueries({
      queryKey,
      refetchType: "active",
    });

  }, [selectedCurrency, applicationId]);



  return (
    <>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Payment Details</h2>

          <CurrencySelect
            currency={selectedCurrency}
            onSelect={handleCurrencyChange}
            className="min-w-[100px]"
          />
        </div>

        <div className="text-white">
          <PaymentSummaryRow
            label={paymentDetails?.visa_type_display_name}
            value={
              <div className="flex items-center gap-2">
                {paymentDetails?.visa_embassy_fees}
                {paymentDetails?.is_child_fees_applicable && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoCircledIcon className="text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent
                      arrowClassName="fill-white bg-white"
                      className="border-2 border-gray-200 bg-white text-black shadow"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black">
                            Adult Visa Fee (
                            {paymentDetails?.no_of_adult_applicants})
                          </span>
                          <span>
                            {paymentDetails?.currency}{" "}
                            {paymentDetails?.adult_embassy_fees}
                          </span>
                        </div>
                        <hr />
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black">
                            Child Visa Fee (
                            {paymentDetails?.no_of_child_applicants})
                          </span>
                          <span>
                            {paymentDetails?.currency}{" "}
                            {paymentDetails?.child_embassy_fees}
                          </span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            }
            caption={
              paymentDetails?.is_visaero_insurance_bundled
                ? "(With Complimentary Insurance)"
                : ""
            }
            currency={paymentDetails?.currency}
            currencySymbol={paymentDetails?.currency_symbol}
          />
          <PaymentSummaryRow
            label={host === "resbird" ? "Service Fee" : "Service Fee & Taxes"}
            value={paymentDetails?.service_fees}
            currency={paymentDetails?.currency}
            currencySymbol={paymentDetails?.currency_symbol}
          />
          {paymentDetails?.convenience_fee &&
            Number(paymentDetails?.convenience_fee) > 0 && (
              <PaymentSummaryRow
                label={"Convenience Fee"}
                value={paymentDetails?.convenience_fee}
                currency={paymentDetails?.currency}
                currencySymbol={paymentDetails?.currency_symbol}
              />
            )}
          {host === "resbird" && (
            <PaymentSummaryRow
              label={paymentDetails?.tax_label}
              value={paymentDetails?.tax}
              currency={paymentDetails?.currency}
              currencySymbol={paymentDetails?.currency_symbol}
            />
          )}
          {/* <PaymentSummaryRow
            label="Discount"
            value={paymentDetails?.promocode_discount}
            currency={paymentDetails?.currency}
            currencySymbol={paymentDetails?.currency_symbol}
         
          /> */}
          <Separator className="my-3" />
          <PaymentSummaryRow
            label="Total"
            value={paymentDetails?.total_payment}
            currency={paymentDetails?.currency}
            currencySymbol={paymentDetails?.currency_symbol}
            disabledBottomBorder={false}
            isTotal={true}
          />
        </div>
      </div>
    </>
  );
};

export default PaymentSummaryCard;

export const PaymentSummaryCardSkeleton = () => {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-[100px]" />
      </div>

      {/* Row 1 */}
      <div className="flex items-center justify-between py-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Row 2 */}
      <div className="flex items-center justify-between py-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Row 3 */}
      <div className="flex items-center justify-between py-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Row 4 */}
      <div className="flex items-center justify-between py-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Separator */}
      <div className="my-3 w-full">
        <Skeleton className="h-[1px] w-full" />
      </div>

      {/* Total Row */}
      <div className="flex items-center justify-between py-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-28" />
      </div>
    </div>
  );
};
