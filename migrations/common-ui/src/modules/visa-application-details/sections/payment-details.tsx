"use client";

import { Application } from "@workspace/types/review";
import { getCookie } from "@workspace/common-ui/lib/utils";
const PaymentDetails = ({ application }: { application?: Application }) => {
  const host = getCookie("host");

  const payment_summary = application?.payment_summary;
  const currency = payment_summary?.currency!;

  console.log("payment_summary", payment_summary);
  const totalAmount = payment_summary?.total_payment;

  const visa_embassy_fees = payment_summary?.visa_embassy_fees;
  return (
    <div className="w-full rounded-lg bg-white p-4 shadow-md">
      <div className="content-center text-lg font-bold">Payment Details </div>

      <PaymentDetailsRow
        label={payment_summary?.visa_type_display_name}
        caption={
          payment_summary?.is_visaero_insurance_bundled &&
          "(With Complimentary Insurance)"
        }
        currency={payment_summary?.currency}
        value={visa_embassy_fees}
      />
      <PaymentDetailsRow
        label={host === "resbird" ? "Service Fees" : "Service Fee & Taxes"}
        currency={payment_summary?.currency}
        value={payment_summary?.service_fees}
      />
      {payment_summary?.convenience_fee && (
        <PaymentDetailsRow
          label={"Convenience Fee"}
          currency={payment_summary?.currency}
          value={payment_summary?.convenience_fee}
        />
      )}

      {host === "resbird" && (
        <PaymentDetailsRow
          label={payment_summary?.tax_label}
          currency={payment_summary?.currency}
          value={payment_summary?.tax}
        />
      )}
      <hr />
      <PaymentDetailsRow
        label={"Total Amount"}
        currency={payment_summary?.currency}
        value={totalAmount}
        className="!font-bold !text-black"
      />
      {/* <Button
        size="xs"
        variant="outline"
        className="hover:border-primary hover:text-primary bg-green-600"
        //onClick={handleDownloadInsurance}
      >
        <Receipt className="bg-white" />
        <span className="text-white"> Download Invoice</span>
      </Button> */}
    </div>
  );
};

interface PaymentDetailsRowProps {
  label: React.ReactNode;
  currency: React.ReactNode;
  value: React.ReactNode;
  className?: string;
  caption?: string;
}

const PaymentDetailsRow = ({
  label,
  currency,
  value,
  caption,
  className,
}: PaymentDetailsRowProps) => (
  <div className={`flex justify-between p-2 text-sm ${className}`}>
    <div className="flex flex-col">
      <span
        className={`text-sm ${label === "Total Amount" ? "font-extrabold text-black" : "font-semi text-muted-foreground"}`}
      >
        {label}
      </span>
      {caption && (
        <span className="text-muted-foreground text-xs">{caption}</span>
      )}
    </div>
    <div
      className={`flex gap-1 ${label === "Total Amount" ? "font-extrabold text-black" : "text-sm font-medium"}`}
    >
      <span> {currency}</span>
      <span>{value}</span>
    </div>
  </div>
);

export default PaymentDetails;
