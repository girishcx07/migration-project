import { format } from "date-fns";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type {
  Evaluate,
  RequiredDocument,
  VisaOffer,
  VisaType,
} from "@repo/types/new-visa";

type CountryLike = {
  cioc?: string;
};

export type NoticeResult = {
  proceed: boolean;
  cancel: boolean;
  title: string;
  description: string;
  sub_description?: string;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getResponsiveWidthClass = (colLayout: number): string => {
  const widthClasses: Record<number, string> = {
    1: "w-full",
    2: "w-full",
    3: "w-full",
  };

  return widthClasses[colLayout] || "w-full";
};

export const getTravellingToIdentity = (
  selectedCountryOfOrigin?: CountryLike | null,
  selectedNationality?: CountryLike | null,
  selectedTravellingTo?: CountryLike | null,
): string =>
  [
    selectedCountryOfOrigin?.cioc,
    selectedNationality?.cioc,
    selectedTravellingTo?.cioc,
  ]
    .filter(Boolean)
    .join("_");

const extractDocDetails = (
  doc: RequiredDocument | Evaluate,
  isDemand: boolean,
) => {
  if (isDemand && "demand" in doc && Array.isArray(doc.demand)) {
    const demand = doc.demand[0];
    return {
      displayName: demand?.doc_display_name ?? "",
      shortDescription: demand?.doc_short_description ?? "",
      description: demand?.doc_description ?? "",
    };
  }

  const requiredDoc = doc as RequiredDocument;
  return {
    displayName: requiredDoc.doc_display_name ?? "",
    shortDescription: requiredDoc.doc_short_description ?? "",
    description: requiredDoc.doc_description ?? "",
  };
};

export const createDocString = (
  docs: (RequiredDocument | Evaluate)[],
  isDemand: boolean,
): string => {
  if (docs.length === 0) return "";

  const title = !isDemand
    ? "=== Required Documents ===\r\n"
    : "\r\n\r\n=== Additional Documents ===\r\n";

  return (
    title +
    docs
      .map((doc) => {
        const { displayName, shortDescription, description } = extractDocDetails(
          doc,
          isDemand,
        );
        return [
          `Document Name: ${displayName}`,
          `Short Description: ${shortDescription}`,
          `Document Description: ${description}`,
        ].join("\n");
      })
      .join("\r\n\r\n")
  );
};

export const convertToJpeg = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      let { width, height } = img;
      const maxSize = 2000;
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to convert image to JPEG"));
            return;
          }

          resolve(
            new File([blob], file.name.replace(/\.[^/.]+$/, ".jpeg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            }),
          );
        },
        "image/jpeg",
        0.95,
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
  });

export const formatNumber = (
  value: number,
  locale: string = typeof window !== "undefined" ? navigator.language : "en-US",
): string =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));

export const getVisaNoticeContent = ({
  visaOffers = [],
  visaTypesData = [],
  selectedNationality,
  selectedTravellingTo,
}: {
  visaOffers: VisaOffer[];
  visaTypesData: VisaType[];
  selectedNationality: string;
  selectedTravellingTo: string;
}): { navigateToNotification: boolean; obj: NoticeResult } => {
  const destinationLabel = `For ${selectedNationality} to ${selectedTravellingTo},`;

  const visaTypeMap = visaTypesData.reduce<Record<string, VisaType>>((acc, item) => {
    if (!item?.type) return acc;
    acc[item.type.toLowerCase()] = item;
    return acc;
  }, {});

  const restricted =
    visaTypeMap.entry_restricted || visaTypeMap.visa_exempt;
  const visaOnArrival = visaTypeMap.visa_on_arrival;
  const eta = visaTypeMap.eta;

  const offerTypes = new Set(
    visaOffers.map((offer) => offer?.visa_type?.toLowerCase()).filter(Boolean),
  );

  const hasETAOffer = offerTypes.has("eta");
  const hasEvisaOffer = offerTypes.has("evisa");

  const buildDescription = (description?: string, extra?: string) =>
    [destinationLabel, description, extra].filter(Boolean).join("\n");

  if (restricted) {
    return {
      navigateToNotification: true,
      obj: {
        proceed: false,
        cancel: true,
        title: restricted.title || "Important Notice",
        description: buildDescription(restricted.description),
        sub_description: restricted.sub_description,
      },
    };
  }

  if (visaOnArrival) {
    let extra = "";

    if (hasETAOffer) {
      extra =
        "However, you can apply for an Electronic Travel Authorization (ETA) for a longer stay.";
    } else if (hasEvisaOffer) {
      extra =
        "However, you can apply for an electronic visa for a longer stay.";
    }

    return {
      navigateToNotification: true,
      obj: {
        proceed: Boolean(extra),
        cancel: true,
        title: visaOnArrival.title || "Visa on Arrival",
        description: buildDescription(visaOnArrival.description, extra),
        sub_description: visaOnArrival.sub_description,
      },
    };
  }

  if (eta) {
    return {
      navigateToNotification: true,
      obj: {
        proceed: true,
        cancel: false,
        title: eta.title || "Electronic Travel Authorization",
        description: buildDescription(eta.description),
        sub_description: eta.sub_description,
      },
    };
  }

  return {
    navigateToNotification: false,
    obj: {
      proceed: false,
      cancel: false,
      title: "",
      description: "",
      sub_description: "",
    },
  };
};

export const formatTravelDate = (date: Date) => format(date, "dd MMM yyyy");
