import type { Demand } from "@repo/types/new-visa";

import type { ApplyVisaCountry, ApplyVisaTravellingToCountry } from "../types";

export function getTravellingToIdentity({
  countryOfOrigin,
  nationality,
  travellingTo,
}: {
  countryOfOrigin: ApplyVisaCountry | null;
  nationality: ApplyVisaCountry | null;
  travellingTo: ApplyVisaTravellingToCountry | null;
}) {
  return [countryOfOrigin?.cioc, nationality?.cioc, travellingTo?.cioc]
    .filter(Boolean)
    .join("_");
}

export function getAdditionalDocuments(
  evaluate: { demand: Demand[] }[] | undefined,
) {
  return (evaluate ?? [])
    .map((item) => item.demand[0])
    .filter((document): document is Demand => Boolean(document));
}
