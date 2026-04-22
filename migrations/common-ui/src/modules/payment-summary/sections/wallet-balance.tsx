"use client";

import { useQuery } from "@tanstack/react-query";
import { usePaymentSummary } from "../context/payment-summary-context";
import { ShieldX } from "lucide-react";
import { useEffect } from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { orpc } from "@workspace/orpc/lib/orpc";

interface WalletBalanceProps {
  applicationId: string;
}

const WalletBalance = ({ applicationId }: WalletBalanceProps) => {
  const { selectedPaymentMethod, setIsDisabledProceed } = usePaymentSummary();

  const { data, isError, isPending, isFetching } = useQuery(
    orpc.visa.getWalletBalance.queryOptions({
      input: {
        application_id: applicationId!,
        payment_config_id: selectedPaymentMethod?.payment_config_id!,
        type: "visa",
      },
      enabled: Boolean(
        selectedPaymentMethod?.payment_config_id && applicationId,
      ),
    }),
  );

  const wallet = data?.data?.dataobj;
  const currency = wallet?.currency ?? "";
  const balanceAfter = wallet?.new_credit_balance ?? 0;
  const isNegativeBalance = Number(balanceAfter) < 0;

  useEffect(() => {
    const disabled = isPending || isFetching || isNegativeBalance;
    setIsDisabledProceed(disabled);
  }, [isNegativeBalance, isPending, isFetching]);

  const walletDetails = [
    {
      label: "Available Balance",
      amount: `${currency} ${wallet?.credit_balance}`,
    },
    {
      label: "Required Balance",
      amount: `${currency} ${wallet?.this_transaction}`,
    },
    {
      label: "Balance After Transaction",
      amount: `${currency} ${balanceAfter}`,
      isError: isNegativeBalance,
    },
  ];

  if (isPending || isFetching) {
    return <WalletBalanceSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800">Wallet Details</h2>
        <p className="pt-2 text-sm text-red-500">
          Failed to load wallet details.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-gray-800">Wallet Details</h2>
      <div className="space-y-2 pt-2">
        {walletDetails.map(({ label, amount, isError }, index) => (
          <div key={index} className="flex justify-between">
            <span className={`text-muted-foreground text-sm`}>{label}</span>
            <span
              className={`text-sm font-medium ${isError ? "text-red-500" : ""}`}
            >
              {amount}
            </span>
          </div>
        ))}

        {isNegativeBalance && (
          <div className="flex items-center gap-1 text-sm font-medium text-red-500">
            <ShieldX className="w-[18px]" />
            <p>Insufficient wallet balance.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletBalance;

export const WalletBalanceSkeleton = () => {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      {/* Title */}
      <Skeleton className="mb-3 h-6 w-32" />

      {/* Rows */}
      <div className="space-y-3 pt-1">
        {/* Row 1 */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Row 2 */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Row 3 */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
};
