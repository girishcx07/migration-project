"use client";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@repo/api/react";

export function useVisaOffers(payload: {
  currency: string;
  managed_by: string;
  travelling_to: string;
  travelling_to_identity: string;
  type: string;
}, enabled: boolean) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.newVisa.getVisaOffers.queryOptions(payload),
    enabled,
  });
}
