import { useQuery } from "@tanstack/react-query";
import { orpc } from "@workspace/orpc/lib/orpc";

// useVisaOffers.ts
export const useVisaOffers = (payload: any, enabled: boolean) => {
    return useQuery({
        ...orpc.visa.getVisaOffers.queryOptions({
            input: payload,
        }),
        enabled,
    });
};