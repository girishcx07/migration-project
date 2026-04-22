import { loadStripe } from "@stripe/stripe-js";

export const stripePromise = (stripe_published_key: string) => {
  if (!stripe_published_key)
    throw new Error("Publishable key is required to initialize Stripe.");
  return loadStripe(stripe_published_key);
};
