"use client";

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@workspace/common-ui/lib/stripe";

interface PaymentCheckoutProps {
  stripeObj: {
    stripe_published_key: string;
    clientSecret: string;
  };
  onComplete: () => void;
}

const StripePaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  stripeObj,
  onComplete,
}) => {
  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise(stripeObj.stripe_published_key)}
      options={{
        clientSecret: stripeObj.clientSecret,
        onComplete: onComplete,
      }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
};

export default StripePaymentCheckout;
