"use client";

import { orpc } from "@workspace/orpc/lib/orpc";
import StripePaymentCheckout from "@workspace/common-ui/components/stripe-payment-checkout";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft } from "lucide-react";
import { useApplicationDetails } from "@workspace/common-ui/hooks/global-queries";
import { useAppNavigation } from "@workspace/common-ui/hooks/use-app-navigation";
import { useAppRouter, useAppSearchParams } from "../../../platform/navigation";

const PaymentCheckoutView = () => {
  const router = useAppRouter();
  const { goToPaymentSuccess } = useAppNavigation();

  const searchParams = useAppSearchParams();
  const user_id = searchParams.get("user_id");
  const application_id = searchParams.get("application_id");
  const type = searchParams.get("type");
  const payment_config_id = searchParams.get("payment_config_id");

  const { data: globalData } = useQuery({
    ...orpc.visa.getPaymentModeToken.queryOptions({
      input: {
        application_id: application_id!,
        type: type!,
        payment_config_id: payment_config_id!,
        ui_mode: "embedded",
      },
    }),
    enabled: Boolean(application_id && user_id && type && payment_config_id),
  });

  const stripeData = globalData?.data;

  const { data } = useApplicationDetails();

  console.log("response from stripeData in PaymentCheckout >> ", {
    stripeData,
    payload: { application_id, user_id, type, payment_config_id },
  });

  const clientSecret = stripeData?.dataobj?.clientSecret!;
  const stripe_published_key = stripeData?.dataobj?.stripe_published_key!;

  const { mutate: updatePaymentStatus } = useMutation(
    orpc.visa.updatePaymentProcessingStatus.mutationOptions({
      onSuccess: (response) => {
        console.log("update payment status", response);
        if (response?.data?.data === "success") {
          goToPaymentSuccess();
        }
      },
      onError: (error) => {
        console.log("update payment status error", error);
      },
    }),
  );

  const { mutate: SubmitApplication } = useMutation(
    orpc.visa.postSubmitApplication.mutationOptions({
      onSuccess: (response) => {
        console.log("api call success data", {
          response,
        });

        if (response?.data?.data === "success") {
          goToPaymentSuccess()
          // updatePaymentStatus({
          //   applicationId: data?.data?.application?._id || "",
          //   payment_gateway: "online",
          //   txStatus: "SUCCESS",
          // });
        }
      },
      onError: (error) => {
        console.log("api call error data", {
          error,
        });
      },
    }),
  );

  const handleOnComplete = () => {
    SubmitApplication({
      application_id: application_id!,
      payment_config_id: payment_config_id!,
      type: "visa",
      payment_reference_id: globalData?.data?.dataobj?.payment_reference_id || ""
    });
  };

  return (
    <>
      <div className="min-h-screen bg-white p-3">
        <h1 className="flex gap-2 text-2xl leading-none font-extrabold tracking-tight">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => router.back()}
          >
            <ChevronLeft />
          </Button>
          Payment Details
        </h1>
        {stripe_published_key && (
          <StripePaymentCheckout
            onComplete={handleOnComplete}
            stripeObj={{
              clientSecret: clientSecret,
              stripe_published_key: stripe_published_key,
            }}
          />
        )}
      </div>
    </>
  );
};

export default PaymentCheckoutView;

export const PaymentCheckoutViewSkeleton = () => {
  return <div>Loading payment form...</div>;
};
