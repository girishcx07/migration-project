"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@workspace/orpc/lib/orpc";
import { useState } from "react";
import { toast } from "sonner";
import { usePaymentSummary } from "../modules/payment-summary/context/payment-summary-context";
import { useAppNavigation } from "./use-app-navigation";
import { EcommPayFail, EcommPaySuccess } from "@workspace/types";

type EcommPayParams = Record<string, unknown>;

declare global {
  interface Window {
    EPayWidget: {
      unregisterWidget: (guid: string) => void;
      run: (params: EcommPayParams) => {
        guid: string;
        closePopup: () => void;
      };
      bind: (elementId: string, params: EcommPayParams, method: string) => void;
    };
  }
}

export function useEcommPayWidget() {
  const { goToPaymentSuccess } = useAppNavigation();

  const { mutate: updatePaymentStatus } = useMutation(
    orpc.visa.updatePaymentProcessingStatus.mutationOptions(),
  );

  const { metaData, selectedPaymentMethod } = usePaymentSummary();

  const [isInitializing, setIsInitializing] = useState(false);

  const { data: paymentToken, refetch } = useQuery({
    ...orpc.visa.getPaymentModeToken.queryOptions({
      input: {
        application_id: metaData.application_id!,
        type: "visa",
        payment_config_id: selectedPaymentMethod?.payment_config_id!,
        ui_mode: "embedded",
      },
      enabled: false,
    }),
  });


  console.log("paymentToken", paymentToken?.data?.dataobj?.payment_reference_id)

  const { mutate: SubmitApplication } = useMutation(
    orpc.visa.postSubmitApplication.mutationOptions({
      onError: (error) => {
        console.log("api call error data", {
          error,
        });
      },
    }),
  );

  const runWidget = async () => {
    if (typeof window === "undefined") return;
    if (!window.EPayWidget || isInitializing) return;

    setIsInitializing(true);

    try {
      // const resp = await apiConfig.post<EcommPaymentModeTokenResponse>(
      //   "/ecommpay/get-token",
      //   {},
      // );

      // const paymentData = resp?.data?.data?.params;
      // const signature = resp?.data?.signature;

      // const ecommpayUrl = new URL(resp?.data?.redirect_url || "");

      // const signature = ecommpayUrl.searchParams.get("signature");

      const { data: resp } = await refetch();

      console.log("response >>", resp);

      const data = resp?.data?.dataobj as any;

      const result = data?.result as any;

      console.log("result >> ", result);

      const paymentData = result?.data?.params;
      const signature = result?.signature;

      console.log("response => ", resp);

      const config = {
        project_id: Number(paymentData?.project_id),
        payment_id: String(paymentData?.payment_id),
        payment_amount: Number(paymentData?.payment_amount),
        payment_currency: String(paymentData?.payment_currency),
        customer_id: String(paymentData?.customer_id),
        payment_description: String(paymentData?.payment_description),
        payment_customer_email: String(paymentData?.payment_customer_email),
        payment_customer_phone: String(paymentData?.payment_customer_phone),
        interface_type:
          typeof paymentData?.interface_type === "object"
            ? JSON.stringify(paymentData?.interface_type)
            : paymentData?.interface_type,
        signature: signature || "",
      };

      console.log("config >>", config);

      // Add a small delay to ensure any previous UI (like Radix dialog) is fully closed
      await new Promise((resolve) => setTimeout(resolve, 300));





      const widget = window.EPayWidget.run({
        ...config,
        onPaymentSuccess: async (data: EcommPaySuccess) => {
          console.log("Payment successful", data);
          console.log("widget >> ", widget);
          // if (widget?.guid) {
          //   window.EPayWidget.unregisterWidget(widget.guid);
          // }

          await SubmitApplication({
            application_id: metaData.application_id!,
            payment_config_id: selectedPaymentMethod?.payment_config_id!,
            type: "visa",
            payment_reference_id: resp?.data?.dataobj?.payment_reference_id
          }, {
            onSuccess: (response) => {

              if (response?.data?.data === "success") {
                widget?.closePopup();
                goToPaymentSuccess();
              } else {
                toast.error("Payment processing failed. Please contact support.");
              }

            }
          })

          // updatePaymentStatus(
          //   {
          //     applicationId: metaData.application_id!,
          //     payment_gateway: "online",
          //     txStatus: "success",
          //   },
          //   {
          //     onSuccess: () => {
          //       goToPaymentSuccess();
          //       widget?.closePopup();
          //     },
          //   },
          // );

          toast.success("Payment successful");
        },

        onPaymentFail: (data: EcommPayFail) => {
          console.log("Payment failed", data);

          if (widget?.guid) {
            window.EPayWidget.unregisterWidget(widget.guid);
          }

          // updatePaymentStatus({
          //   applicationId: metaData.application_id!,
          //   payment_gateway: "online",
          //   txStatus: "failed",
          // });

          toast.error("Payment failed");
        },

        onDestroy: (data: any) => {
          console.log("Payment widget destroyed", data);

          // if (widget?.guid) {
          //   window.EPayWidget.unregisterWidget(widget.guid);
          // }

          // updatePaymentStatus({
          //   applicationId: metaData.application_id!,
          //   payment_gateway: "online",
          //   txStatus: "cancelled",
          // });

          // toast.error("Payment Cancelled");
        },
      });

      console.log("widget >> ", widget);
    } catch (error) {
      console.error("EPay widget execution failed", error);
      toast.error("Failed to initialize payment widget");
    } finally {
      setIsInitializing(false);
    }
  };

  return {
    runWidget,
    isInitializing,
  };
}
