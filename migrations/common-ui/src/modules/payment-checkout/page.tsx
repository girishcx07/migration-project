
import { Suspense } from "react";
import PaymentCheckoutView, {
  PaymentCheckoutViewSkeleton,
} from "./view/payment-checkout-view";

const PaymentCheckout = async () => {
  return (
    <Suspense fallback={<PaymentCheckoutViewSkeleton />}>
      <PaymentCheckoutView />
    </Suspense>
  );
};

export default PaymentCheckout;
