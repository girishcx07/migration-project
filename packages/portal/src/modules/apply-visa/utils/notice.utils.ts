import type { VisaOffer, VisaType } from "@repo/types/new-visa";

import type { NoticeResult } from "../types/apply-visa.types";
import { getClientCookie } from "./cookie.utils";

export function shouldShowPriceChangeAlert() {
  return (
    getClientCookie("host") === "resbird" &&
    getClientCookie("price_change_ack") !== "true"
  );
}

export function getVisaNoticeContent({
  selectedNationality,
  selectedTravellingTo,
  visaOffers = [],
  visaTypesData = [],
}: {
  selectedNationality: string;
  selectedTravellingTo: string;
  visaOffers: VisaOffer[];
  visaTypesData: VisaType[];
}): { navigateToNotification: boolean; obj: NoticeResult } {
  const destinationLabel = `For ${selectedNationality} to ${selectedTravellingTo},`;
  const visaTypeMap = visaTypesData.reduce<Record<string, VisaType>>(
    (result, item) => {
      if (item.type) {
        result[item.type.toLowerCase()] = item;
      }

      return result;
    },
    {},
  );

  const restricted =
    visaTypeMap.entry_restricted ?? visaTypeMap.visa_exempt ?? null;
  const visaOnArrival = visaTypeMap.visa_on_arrival ?? null;
  const eta = visaTypeMap.eta ?? null;
  const offerTypes = new Set(
    visaOffers
      .map((offer) => (offer.visa_type ? offer.visa_type.toLowerCase() : ""))
      .filter(Boolean),
  );
  const buildDescription = (description?: string, extra?: string) =>
    [destinationLabel, description, extra].filter(Boolean).join("\n");

  if (restricted) {
    return {
      navigateToNotification: true,
      obj: {
        cancel: true,
        description: buildDescription(restricted.description),
        proceed: false,
        subDescription: restricted.sub_description,
        title: restricted.title || "Important Notice",
      },
    };
  }

  if (visaOnArrival) {
    let extra = "";

    if (offerTypes.has("eta")) {
      extra =
        "However, you can apply for an Electronic Travel Authorization (ETA) for a longer stay.";
    } else if (offerTypes.has("evisa")) {
      extra =
        "However, you can apply for an electronic visa for a longer stay.";
    }

    return {
      navigateToNotification: true,
      obj: {
        cancel: true,
        description: buildDescription(visaOnArrival.description, extra),
        proceed: Boolean(extra),
        subDescription: visaOnArrival.sub_description,
        title: visaOnArrival.title || "Visa on Arrival",
      },
    };
  }

  if (eta) {
    return {
      navigateToNotification: true,
      obj: {
        cancel: false,
        description: buildDescription(eta.description),
        proceed: true,
        subDescription: eta.sub_description,
        title: eta.title || "Electronic Travel Authorization",
      },
    };
  }

  return {
    navigateToNotification: false,
    obj: {
      cancel: false,
      description: "",
      proceed: false,
      subDescription: "",
      title: "",
    },
  };
}
