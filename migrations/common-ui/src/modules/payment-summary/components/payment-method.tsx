"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import ErrorBoundary from "@workspace/common-ui/components/error-boundary";
import { orpc } from "@workspace/orpc/lib/orpc";
import { Label } from "@workspace/ui/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense, useEffect, useState } from "react";
import {
  PaymentMode,
  PaymentModeConfigurations,
  usePaymentSummary,
} from "../context/payment-summary-context";

interface PaymentMethodProps {
  className?: string;
}

const PaymentMethod = (props: PaymentMethodProps) => {
  return (
    <Suspense fallback={<PaymentModeSkeleton />}>
      <ErrorBoundary>
        <PaymentMethodSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

const PaymentMethodSuspense: React.FC<PaymentMethodProps> = ({ className }) => {
  const { selectedPaymentMethod, setSelectedPaymentMethod, selectedCurrency } =
    usePaymentSummary();

  const [paymentMode, setPaymentMode] = useState<PaymentMode | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);

  const { data } = useSuspenseQuery(
    orpc.visa.getPaymentModes.queryOptions({
      input: {
        type: "visa",
        currency: selectedCurrency!,
      },
    }),
  );

  const allConfigs: PaymentMode[] = data?.data?.dataobj || [];

const paymentModes = allConfigs?.map((mode) => {
  if (mode.type === "online") {
    const configs = mode.configurations;

    // Guard: skip if no configurations
    if (!configs || configs.length === 0) return mode;

const groupedByProvider = Object.values(
  configs.reduce<Record<string, PaymentModeConfigurations[]>>((acc, config) => {
    if (!config) return acc;

    const provider = config.provider;  // ← cached, TS narrows this const to string
    if (!provider) return acc;

    if (!acc[provider]) acc[provider] = [];
    acc[provider].push(config);
    return acc;
  }, {})
);

    const resolvedConfigs = groupedByProvider
      // Guard: skip null/undefined provider groups
      .filter((providerConfigs): providerConfigs is PaymentModeConfigurations[] =>
        Array.isArray(providerConfigs) && providerConfigs.length > 0
      )
      .map((providerConfigs) => {
        const lengthOne  = providerConfigs.filter((c) => c.currency?.length === 1);
        const lengthMany = providerConfigs.filter((c) => c.currency?.length > 1);
        const catchAll   = providerConfigs.filter((c) => !c.currency?.length);

        if (lengthOne.length > 0)  return lengthOne;
        if (lengthMany.length > 0) return lengthMany;
        return catchAll;
      });

    return {
      ...mode,
      configurations: resolvedConfigs.flat(),
    };
  }

  return mode;
});
  // auto-select first mode (initial load)
  useEffect(() => {
    if (!paymentModes.length) {
      setPaymentMode(null);
      setPaymentConfig(null);
      setSelectedPaymentMethod({});
      return;
    }

    const currentModeStillAvailable = paymentMode
      ? paymentModes.some(
          (mode) => mode.display_name === paymentMode.display_name,
        )
      : false;

    if (currentModeStillAvailable) {
      return;
    }

    const first = paymentModes[0];
    console.log("paymentModes --->", first);
    setPaymentMode(first || null);

    if (!first?.configurations || first.configurations.length === 0) {
      setPaymentConfig(null);
      setSelectedPaymentMethod(first!);
      return;
    }

    const selected = first.configurations[0];
    setPaymentConfig(selected);
    setSelectedPaymentMethod(selected!);
  }, [paymentModes, paymentMode, setSelectedPaymentMethod]);

  const handleValueChange = (value: string) => {
    const selected = paymentModes.find((mode) => mode.display_name === value);
    if (!selected) return;

    setPaymentMode(selected);
    setPaymentConfig(null);
    setSelectedPaymentMethod({});

    // no configurations → finalize selection
    if (!selected.configurations || selected.configurations.length === 0) {
      setSelectedPaymentMethod(selected);
    }
  };

  const hasConfigurations =
    Array.isArray(paymentMode?.configurations) &&
    paymentMode.configurations.length > 0;

  console.log("paymentMode", {
    paymentConfig,
    paymentMode,
    selectedPaymentMethod,
  });

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm ${className}`}
    >
      <h6 className="text-lg font-bold">Payment Modes</h6>

      {/* Parent Payment Modes */}
      <RadioGroup
        value={paymentMode?.display_name ?? ""}
        onValueChange={handleValueChange}
        className="flex flex-col gap-3"
      >
        {paymentModes.map((mode) => {
          const id = mode.payment_config_id || mode.type;

          const configurations = mode?.configurations || [];

          const isSelectedMode =
            paymentMode?.display_name === mode.display_name;
          return (
            <div className="rounded-md border p-3" key={id}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value={mode.display_name ?? ""} id={id} />
                <div>
                  <Label htmlFor={id}>{mode.display_name}</Label>
                  {mode.description && (
                    <p className="text-muted-foreground text-xs">
                      {mode.description}
                    </p>
                  )}
                </div>
              </div>
              {isSelectedMode && configurations?.length > 0 && (
                <div>
                  <RadioGroup
                    value={paymentConfig?.display_name ?? ""}
                    onValueChange={(value: string) => {
                      const selected = paymentMode?.configurations?.find(
                        (config: any) => config.display_name === value,
                      );
                      if (!selected) return;

                      setPaymentConfig(selected);
                      setSelectedPaymentMethod(selected); // final commit
                    }}
                    className="mt-3 flex flex-col gap-3 rounded-md bg-green-50 p-3 pl-6"
                  >
                    {configurations?.map((config: any) => {
                      const id = config.payment_config_id || config.type;
                      return (
                        <div className="flex items-start space-x-2" key={id}>
                          <RadioGroupItem
                            value={config.display_name ?? ""}
                            id={id}
                          />
                          <div>
                            <Label htmlFor={id}>{config.display_name}</Label>
                            {config.description && (
                              <p className="text-muted-foreground text-xs">
                                {config.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              )}
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

interface PaymentModeSkeletonProps {
  className?: string;
}

export const PaymentModeSkeleton: React.FC<PaymentModeSkeletonProps> = ({
  className,
}) => (
  <div
    className={`flex w-full flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm ${className}`}
  >
    <Skeleton className="h-6 w-[150px]" />
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="flex items-start space-x-2" key={index}>
          <Skeleton className="h-5 w-5" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PaymentMethod;
