import { Dark, GetHostDetailsResponse, Root } from "@workspace/types";
import {
  Evaluate,
  GetEVMRequestDataResponse,
  RequiredDocument,
  VisaOffer,
  VisaType,
} from "@workspace/types/new-visa";
import { Applicant, Application } from "@workspace/types/review";
import { TrackApplication } from "@workspace/types/track-application";
import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import { DEFAULT_RELATION } from "../constants";
import {
  NationalityCountry,
  TravellingToCountry,
} from "../modules/new-visa/types";
import { GroupedApplicant } from "../modules/payment-summary/context/payment-summary-context";
import type { ImageSource } from "../types/image";
import { LockConfig } from "../types/utils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toCssVariables(theme: Record<string, string>) {
  return Object.entries(theme)
    .map(([key, value]) => `--${key}: ${value};`)
    .join(" ");
}

export const getResponsiveWidthClass = (colLayout: number): string => {
  const widthClasses: Record<number, string> = {
    1: "w-full md:w-[calc(300%+1rem)]",
    2: "w-full md:w-[calc(150%+0.75rem)]",
    3: "w-full md:w-full translate-x-0",
  };

  return widthClasses[colLayout] || "w-full"; // default case: "w-full"
};

export const generateAltTextForImage = (altText: string): string =>
  altText || String(Math.random());

export const getGlobalTimezone = (timezone: Date) => {
  if (!(timezone instanceof Date) || isNaN(timezone.getTime())) {
    return "Invalid Date"; // Safety check for invalid dates
  }
  const tzOffset = timezone.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
  const localTime = new Date(timezone.getTime() - tzOffset); // Adjust to retain local time

  return localTime.toISOString().slice(0, -1); // Remove the 'Z' to avoid UTC indication
};

export const generateVisaType = (application: any): string => {
  if (!application) return "";
  const {
    total_days = "",
    duration_type = "",
    visa_category = "",
    visa_processing_type = "",
    visa_entry_type = "",
    visa = "",
    visa_type_display_name = "",
  } = application;

  console.log("application  =>", application);

  return `${capitalize(total_days)} ${capitalize(duration_type)} | ${capitalize(
    visa_category,
  )} | ${capitalize(visa_processing_type)} | ${capitalize(
    visa_entry_type,
  )} Entry | ${visa_type_display_name}`;
};

export const getDurationDays = (application: Application | null): string => {
  if (!application) return "";
  return `${application.total_days || ""} ${application.duration_type || ""}`.trim();
};
export const travelDates = (from: string, to: string): string => {
  try {
    // Parse dates
    const startDate = new Date(from);
    const endDate = new Date(to);

    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return "Invalid date range";
    }

    // Format dates safely
    const start = format(startDate, "dd MMM yyyy");
    const end = format(endDate, "dd MMM yyyy");

    return `${start} - ${end}`;
  } catch (error) {
    console.error("Error formatting travel dates:", error);
    return "Invalid date range";
  }
};

export const capitalize = (str: string) =>
  str?.charAt(0)?.toUpperCase() + str?.slice(1)?.toLowerCase();

// Debounce utility function
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
) {
  let timeout: NodeJS.Timeout | null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
  };

  return debounced;
}

export const getTravellingToIdentity = (
  selectedCountryOfOrigin?: NationalityCountry | null,
  selectedNationality?: NationalityCountry | null,
  selectedTravellingTo?: TravellingToCountry | null,
): string =>
  [
    selectedCountryOfOrigin?.cioc,
    selectedNationality?.cioc,
    selectedTravellingTo?.cioc,
  ]
    .filter(Boolean)
    .join("_");

export const getDocumentTitle = (isDemand: boolean): string => {
  return !isDemand
    ? "=== Required Documents ===\r\n"
    : "\r\n\r\n=== Additional Documents ===\r\n";
};
// Type-safe helper for extracting document details from either type
const extractDocDetails = (
  doc: RequiredDocument | Evaluate,
  isDemand: boolean,
) => {
  if (isDemand && "demand" in doc && Array.isArray(doc.demand)) {
    const demand = doc.demand[0]; // First demanded document
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

// Generate a string for all docs
export const createDocString = (
  docs: (RequiredDocument | Evaluate)[],
  isDemand: boolean,
): string => {
  if (docs.length === 0) return "";

  return (
    getDocumentTitle(isDemand) +
    docs
      .map((doc) => {
        const { displayName, shortDescription, description } =
          extractDocDetails(doc, isDemand);
        return [
          `Document Name: ${displayName}`,
          `Short Description: ${shortDescription}`,
          `Document Description: ${description}`,
        ].join("\n");
      })
      .join("\r\n\r\n")
  );
};

export const serializeTheme = <T extends Root | Dark>(theme: T): string => {
  return Object?.entries(theme)
    ?.map(([key, value]) => `  --${key}: ${value};`)
    ?.join("\n");
};

type FileExtension = string;
type MimeType = string;
type FileTypeMap = Record<MimeType, FileExtension[]>;

const MIME_TYPE_MAPPINGS: FileTypeMap = {
  // Images
  "image/jpeg": [".jpg", ".jpeg", ".jfif"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  // "image/heic": [".heic"],
  "image/tiff": [".tiff", ".tif"],
  // Documents
  "application/pdf": [".pdf"],
} as const;

// export function setClientCookie(name: string, value: string, days = 7) {
//   const expires = new Date(Date.now() + days * 864e5).toUTCString();
//   document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
// }

export function setClientCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();

  // ✅ Required for cookies to work inside iframes (cross-site)
  const cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=None; Secure; Partitioned`;

  document.cookie = cookieString;
}

type SessionCookiePayload = {
  accessToken?: string;
  refreshToken?: string;
  session_id?: string;
  user_id?: string;
  user_type?: string;
  host?: string;
  currency?: string;
  application_id?: string;
  applicant_id?: string;
};

export function setClientSessionCookies(
  payload: SessionCookiePayload,
  days = 7,
) {
  const entries = Object.entries(payload) as Array<
    [string, string | undefined]
  >;

  entries.forEach(([key, value]) => {
    if (!value) return;
    setClientCookie(key, value, days);
  });
}

const EXTENSION_TO_MIME = Object.entries(MIME_TYPE_MAPPINGS).reduce(
  (acc, [mime, exts]) => {
    exts.forEach((ext) => {
      acc[ext.toLowerCase().replace(".", "")] = mime;
    });
    return acc;
  },
  {} as Record<string, string>,
);

export const generateFileTypeMap = (extensions: string[]): FileTypeMap => {
  const result: FileTypeMap = {};

  extensions.forEach((ext) => {
    // Normalize extension (remove dot if present and convert to lowercase)
    const normalizedExt = ext.toLowerCase().replace(/^\./, "");
    const mimeType = EXTENSION_TO_MIME[normalizedExt];

    if (mimeType) {
      if (!result[mimeType]) {
        result[mimeType] =
          MIME_TYPE_MAPPINGS[mimeType as keyof typeof MIME_TYPE_MAPPINGS] || [];
      }
    }
  });

  return result;
};

export const getStaticImageFromPath = (path: ImageSource): string =>
  (typeof path === "string" ? path : path.src) || "";

export const calculateNoOfApplicants = (
  grouping: GroupedApplicant[],
): GroupedApplicant[] => {
  const mainPersonCounts: Record<string, number> = {};
  grouping.forEach((applicant) => {
    if (applicant.relation === "Main/Only Person in a Group") {
      mainPersonCounts[applicant.applicant_id] = grouping.filter(
        (g) =>
          g.HOF_id === applicant.applicant_id ||
          g.applicant_id === applicant.applicant_id,
      ).length;
    }
  });

  return grouping.map((applicant) => {
    if (applicant.relation === "Main/Only Person in a Group") {
      return {
        ...applicant,
        no_of_applicants: mainPersonCounts[applicant.applicant_id] || 1,
      };
    }

    const mainPerson = grouping.find(
      (g) => g.applicant_id === applicant.HOF_id,
    );

    return {
      ...applicant,
      no_of_applicants: mainPerson
        ? mainPersonCounts[mainPerson.applicant_id] || 1
        : 1,
    };
  });
};

// Create grouped applicant
export const createGroupedApplicant = (
  applicant: Applicant,
): GroupedApplicant => {
  const name = `${applicant.applicant_first_name} ${applicant.applicant_last_name}`;
  const age = parseInt(applicant?.age ?? "18");

  return {
    applicant_id: applicant?._id,
    name: name,
    relation: DEFAULT_RELATION.label,
    relationValue: DEFAULT_RELATION.value,
    head_of_family: name,
    HOF_id: applicant?._id,
    no_of_applicants: 1,
    age: age,
  };
};

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getCountryFlagBy3Code = (countryCode: string = ""): string => {
  if (!countryCode) return "";
  const flagUrl = `https://s3.ap-southeast-1.amazonaws.com/visaero.assets/flags/${countryCode?.toLowerCase()}.png`;
  return flagUrl;
};

export interface FlagItem {
  code: string;
  label: string;
  name: string;
}

export function buildFlagData({
  originCode,
  nationalityCode,
  travellingToCode,
  origin,
  nationality,
  travelling_to,
}: {
  originCode: string;
  nationalityCode: string;
  travellingToCode: string;
  origin: string;
  nationality: string;
  travelling_to: string;
}): FlagItem[] {
  return [
    { code: originCode, label: `${originCode} ->`, name: origin },
    {
      code: nationalityCode,
      label: `${nationalityCode} ->`,
      name: nationality,
    },
    { code: travellingToCode, label: travellingToCode, name: travelling_to },
  ];
}

export const getPassportNumber = (applicant: Applicant): string => {
  return applicant.visa_form?.["identity_details-passport_number"];
};

export const formatUserType = (userType: string | undefined): string => {
  if (!userType) return "";

  if (userType === "central_processing_admin_evisa") {
    return "CP Admin";
  }

  return userType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const showIssueInsurance = (
  applicationObj: Application,
  applicantObj: Applicant,
) => {
  // const processingType = applicationObj.processing_type;
  const isVisaeroInsuranceBundled = applicationObj.is_visaero_insurance_bundled;
  const bundledInsuranceStatus = applicantObj.insurance_status;
  const visaIssuedDate = applicantObj?.evisa?.visa_issued_date;

  const isWithinTwoMonths = (() => {
    if (!visaIssuedDate) return true;

    const issuedDate = new Date(visaIssuedDate);
    if (isNaN(issuedDate.getTime())) return false;

    const now = new Date();
    const twoMonthsLater = new Date(issuedDate);
    twoMonthsLater.setMonth(issuedDate.getMonth() + 2); // 60 days

    return now >= issuedDate && now <= twoMonthsLater;
  })();

  const isValidApplicationStatus = [
    "application_submitted",
    "application_submitted_for_fulfillment",
    "decision_taken",
    "visa_in_process",
  ].includes(applicationObj.application_status);

  console.log("applicantObj >>", applicantObj);

  console.log("can issue insurance", {
    isValidApplicationStatus,
    bundledInsuranceStatus,
    isVisaeroInsuranceBundled,
    isWithinTwoMonths,
  });

  return (
    isValidApplicationStatus &&
    bundledInsuranceStatus === "pending" &&
    Boolean(isVisaeroInsuranceBundled) &&
    isWithinTwoMonths
  );
};
export const getBookingStatusNew = (
  bookingStatus: string,
  application?: TrackApplication,
): { color: string; label: string } => {
  const { application_status, payment_mode, payment_status, hold_type } =
    application || {};

  const statusConfig: Record<string, { label: string; color: string }> = {
    upload_documents: { color: "#AAAAAA", label: "Draft" },
    payment: { color: "#AAAAAA", label: "Draft" },
    payment_pending: { color: "#FFAA00", label: "Draft" },
    pending_bank_tranfer: { color: "#FFAA00", label: "Draft" },
    review_visa_form: { color: "#AAAAAA", label: "Information Required" },
    booking_submitted: { color: "#26AF48", label: "Submitted" },
    payment_failed: { color: "#FB4A36", label: "Payment Failed" },
    additional_information: { color: "#AAAAAA", label: "Information Required" },
    application_submitted: { color: "#26AF48", label: "In Process" },
    pending_admin_verification: {
      color: "#FFAA00",
      label: "Application Under Review",
    },
    on_hold: { color: "#FB4A36", label: "On Hold" },
    visa_in_process: { color: "#26AF48", label: "In Process" },
    in_queue: { color: "#FFAA00", label: "In Queue" },
    application_posted: { color: "#FFAA00", label: "Application Posted" },
    additional_documents_required: {
      color: "#FFAA00",
      label: "Additional Documents Required",
    },
    application_approved: { color: "#26AF48", label: "Approved" },
    application_rejected: { color: "#FB4A36", label: "Not Approved" },
    decision_taken: { color: "#26AF48", label: "Decision Taken" },
    application_cancelled: { color: "#FFAA00", label: "Application Cancelled" },
    hold_awaiting_update: {
      color: "#FB4A36",
      label: "On Hold - Awaiting Update",
    },
    pending_hold_review: {
      color: "#FFAA00",
      label: "On Hold - Pending Review",
    },
  };

  if (application_status === "archived") {
    return { color: "#FB4A36", label: "Archived" };
  } else if (application_status === "on_hold") {
    return { color: "#FB4A36", label: "On Hold - Action Required" };
  } else if (application_status === "hold_awaiting_update") {
    return { color: "#FB4A36", label: "On Hold - Awaiting Update" };
  }

  if (["payment_pending", "review_visa_form"].includes(bookingStatus)) {
    return { color: "#FB4A36", label: "Draft" };
  }

  if (bookingStatus === "on_hold") {
    if (hold_type === "documents_invalid") {
      return { color: "#FB4A36", label: "Document Required" };
    }
    if (hold_type === "visa_information_invalid") {
      return { color: "#FB4A36", label: "Information Required" };
    }
    return { color: "#FB4A36", label: "On Hold" };
  }

  if (bookingStatus === "pending_finance_approval") {
    const user_type = localStorage.getItem("user_type");
    if (user_type === "agency_agent" && payment_mode === "agency_credit") {
      return { color: "#FFAA00", label: "Application Under Review" };
    }
    if (payment_mode === "pay_at_center" && payment_status === "PENDING") {
      return { color: "#FFAA00", label: "Payment Pending" };
    }
    if (payment_mode === "bank_transfer" && payment_status === "PAID") {
      return { color: "#FFAA00", label: "Payment Confirmation Pending" };
    }
    return { color: "#FFAA00", label: "Payment Confirmation Pending" };
  }

  return (
    statusConfig[bookingStatus] || {
      color: "#FFAA00",
      label: bookingStatus
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    }
  );
};

export function formatDate(date: Date | string | number): string {
  if (!date) return "-";
  return format(new Date(date || ""), "dd MMM yyyy");
}

const statementCase = (stringArr: string) => {
  let stringLbl = stringArr
    ?.split("_")
    ?.map((str) => str.charAt(0).toUpperCase() + str.slice(1))
    .join(" ");
  return stringLbl;
};

interface ApplicantWithVisa {
  visa_rpa?: {
    visa_application_id?: string;
  };
  visa_consumption_status?: string;
}

const getFileNumber = (applicant: ApplicantWithVisa) => {
  const visaApplicationId = applicant?.visa_rpa?.visa_application_id;

  // Return empty string if visaApplicationId is missing or "null"
  if (!visaApplicationId || visaApplicationId === "null") {
    return "";
  }

  // Append visa_consumption_status if it exists
  const visaConsumptionStatus = applicant?.visa_consumption_status;
  return visaConsumptionStatus
    ? `${visaApplicationId} (${visaConsumptionStatus})`
    : visaApplicationId;
};

const draftStatesSet = new Set(["uploading", "upload_documents"]);
const submittedStatesSet = new Set([
  "booking_submitted",
  "employee_submitted",
  "pending_admin_verification",
  "pending_finance_approval",
]);
const immigrationStatesSet = new Set([
  "in_queue",
  "visa_in_process",
  "application_submitted_for_fulfillment",
  "application_submitted",
  "application_posted",
  "additional_documents_required",
]);
const decisionStatesSet = new Set([
  "application_rejected",
  "decision_taken",
  "application_approved",
]);
const cancelledStatesSet = new Set([
  "application_cancelled",
  "application_deleted_in_portal",
  "deleted",
]);
const holdStates = new Set([
  "pending_hold_review",
  "hold_awaiting_update",
  "on_hold",
]);

export const getApplicantState = (
  state: string,
  applicant: object,
  application_obj: Application,
) => {
  // Dynamically determine extended state group
  const isHoldState = holdStates.has(state);
  const isProcessingType = !!application_obj?.processing_type;

  if (isHoldState) {
    if (isProcessingType) {
      immigrationStatesSet.add(state);
    } else {
      submittedStatesSet.add(state);
    }
  }

  if (draftStatesSet.has(state)) {
    return { statePercent: "8%", StateLabel: "Draft", title: "draft" };
  }

  if (submittedStatesSet.has(state)) {
    return { statePercent: "28%", StateLabel: "Submitted", title: "submitted" };
  }

  if (immigrationStatesSet.has(state)) {
    const file_no = getFileNumber(applicant) ?? "";
    if (!file_no) {
      return { StateLabel: "In Queue", statePercent: "55%", title: "in_queue" };
    }
    return {
      StateLabel: "Immigration",
      statePercent: "75%",
      title: "immigration",
    };
  }

  if (decisionStatesSet.has(state)) {
    return {
      StateLabel: "Decision Taken",
      statePercent: "100%",
      title: "decision_taken",
    };
  }

  if (cancelledStatesSet.has(state)) {
    return {
      statePercent: "0%",
      StateLabel: statementCase(state),
      title: "decision_taken", // Consider updating this title if needed
    };
  }

  if (state === "archived") {
    return {
      statePercent: "0%",
      StateLabel: statementCase(state),
      title: "status_hidden",
    };
  }

  return { StateLabel: "", statePercent: "" };
};

// export function maskEmail(email: string): string {
//   const [local, domain] = email?.split("@");
//   if (!local || !domain) return email;

//   const visible = local?.slice(0, 2);
//   const masked = "*".repeat(Math?.max(local.length - 2, 1));
//   return `${visible}${masked}@${domain}`;
// }

// export function maskEmail(email: string): string {
//   const [local, domain] = email.split("@");
//   if (!local || !domain) return email;

//   if (local.length <= 2) {
//     return `${local[0]}*@${domain}`;
//   }

//   const start = 1;
//   const maxMaskLength = local.length - 1;

//   const maskLength =
//     Math.floor(Math.random() * (maxMaskLength - 1)) + 1;

//   const maskedPart = "*".repeat(maskLength);
//   const visibleEnd = local.slice(start + maskLength);

//   return `${local[0]}${maskedPart}${visibleEnd}@${domain}`;
// }

export function maskEmail(email: string): string {
  if (!email) return "";

  const [local, domain] = email.split("@");

  if (!local || !domain) return email;

  const maskRandom = (str: string, keepStart = 2) => {
    return str
      .split("")
      .map((ch, i) => {
        if (i < keepStart) return ch;
        if (ch === "." || ch === "-") return ch;
        return Math.random() < 0.5 ? "*" : ch;
      })
      .join("");
  };

  const maskDomain = (domain: string) => {
    const parts = domain.split(".");
    const name = parts[0];
    const tld = parts.slice(1).join(".");

    return (
      maskRandom(name as string, 1) +
      "." +
      tld
        .split("")
        .map((c, i) => (i === 0 ? c : Math.random() < 0.6 ? "*" : c))
        .join("")
    );
  };

  return `${maskRandom(local as string)}@${maskDomain(domain as string)}`;
}

export function maskMobileNumber(number: string): string {
  if (!number) return number;

  // Remove spaces, dashes, and parentheses for consistency
  const cleanNumber = number.replace(/[\s\-()]/g, "");

  // Keep '+' if present (for global numbers)
  const hasPlus = cleanNumber.startsWith("+");
  const digits = hasPlus ? cleanNumber.slice(1) : cleanNumber;

  if (digits.length <= 4) return number; // too short to mask

  // Show first 2 and last 2 digits, mask the rest
  const visibleStart = digits.slice(0, 2);
  const visibleEnd = digits.slice(-2);
  const masked = "*".repeat(Math.max(digits.length - 4, 1));

  // Rebuild masked number
  return `${hasPlus ? "+" : ""}${visibleStart}${masked}${visibleEnd}`;
}

export const setCookieCallback =
  (name: string, value: string, days = 7) =>
  () => {
    console.log(value);
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=None; Secure; Partitioned`;
  };

export const getApplicantName = (applicant: Applicant): string => {
  const {
    applicant_first_name,
    applicant_last_name,
    default_fname,
    default_lname,
  } = applicant;

  console.log("getApplicantNamename    utils  ===>", {
    applicant_first_name,
    applicant_last_name,
    default_fname,
    default_lname,
  });

  if (applicant_first_name !== "" || applicant_last_name !== "") {
    return applicant_first_name + " " + applicant_last_name;
  } else {
    return "New Applicant";
    default_fname + " " + default_lname;
  }

  return applicant?.applicant_first_name || applicant?.applicant_last_name
    ? `${applicant?.applicant_first_name || ""} ${applicant?.applicant_last_name || ""}`.trim()
    : applicant?.default_fname || applicant?.default_lname
      ? `${applicant?.default_fname || ""} ${applicant?.default_lname || ""}`.trim()
      : "NEW APPLICANT";
};

export const getLockConfig = (
  evmRequestData: GetEVMRequestDataResponse,
  enterpriseData: GetHostDetailsResponse,
): LockConfig => {
  if (enterpriseData?.lockData) {
    // Lock all
    return {
      nationality: true,
      travellingTo: true,
      dateRange: true,
      applicantLimit: 9,
      visaOffer: true,
      cor: true,
      currency: true,
    };
  }

  if (enterpriseData?.lockIfDataAvailable) {
    return {
      nationality: !!evmRequestData.nationality,
      travellingTo: !!evmRequestData.destination,
      cor: !!evmRequestData.origin,
      dateRange: !!(evmRequestData.start_date && evmRequestData.end_date),
      applicantLimit: evmRequestData.no_of_applicants,
      visaOffer: !!evmRequestData.selectedVisaOffer, // adjust based on your data
      currency: !!evmRequestData.currency,
    };
  }

  // default: no lock
  return {
    nationality: false,
    travellingTo: false,
    cor: false,
    dateRange: false,
    applicantLimit: 9,
    visaOffer: false,
    currency: false,
  };
};

export function getCookie(name: string) {
  // Check if running in a browser environment
  if (typeof document === "undefined") {
    return null; // Return null or handle server-side case as needed
  }
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [key, val] = cookie.split("=");
    if (key === name) return val;
  }
  return null;
}

export const FormatToISOString = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString();
};

export function formatNumber(
  value: number,
  currency?: string,
  locale: string = typeof window !== "undefined" ? navigator.language : "en-US",
): string {
  console.log("value", value);
  // if (isNaN(value)) return "";

  return new Intl.NumberFormat(locale, {
    // style: "currency",
    // currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

/**
 * Convert any image file to JPEG format (with max size constraint).
 * - Resizes large images to max 2000px
 * - Ensures final file is under 500KB
 */

export const convertToJpeg = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      let { width, height } = img;

      // Resize image if it's too large
      const maxSize = 2000;
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = width * ratio;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob)
            return reject(new Error("Failed to convert image to JPEG"));

          let newFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, ".jpeg"),
            {
              type: "image/jpeg",
              lastModified: Date.now(),
            },
          );

          // If file size > 500KB → resize recursively
          if (newFile.size > 500 * 1024) {
            resizeToTargetSize(newFile, file, resolve, reject);
          } else {
            resolve(newFile);
          }
        },
        "image/jpeg",
        1, // start with high quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
  });
};

/**
 * Helper: Resize recursively until file size < 500KB
 */
const resizeToTargetSize = (
  file: File,
  originalFile: File,
  resolve: (value: File) => void,
  reject: (reason?: any) => void,
) => {
  const reader = new FileReader();

  reader.onload = () => {
    const img = document.createElement("img");
    img.src = reader.result as string;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      let { width, height } = img;
      const targetSize = 500 * 1024; // 500 KB
      let currentFile = file;
      const step = 0.9; // scale factor for each resize pass

      const resizeAndCheckSize = () => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Failed to resize image"));

            currentFile = new File(
              [blob],
              originalFile.name.replace(/\.[^/.]+$/, ".jpeg"),
              {
                type: "image/jpeg",
                lastModified: Date.now(),
              },
            );

            if (currentFile.size > targetSize) {
              width *= step;
              height *= step;
              resizeAndCheckSize(); // continue resizing
            } else {
              resolve(currentFile);
            }
          },
          "image/jpeg",
          0.9, // reduce quality slightly if needed
        );
      };

      resizeAndCheckSize();
    };

    img.onerror = () => reject(new Error("Failed to load image for resizing"));
  };

  reader.readAsDataURL(file);
};

export type NoticeResult = {
  proceed: boolean;
  cancel: boolean;
  title: string;
  description: string;
  sub_description?: string;
};

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

  // 🔹 Normalize + index visa types (single pass)
  const visaTypeMap = visaTypesData.reduce<Record<string, VisaType>>(
    (acc, item) => {
      if (!item?.type) return acc;
      acc[item.type.toLowerCase()] = item;
      return acc;
    },
    {},
  );

  const restricted =
    visaTypeMap["entry_restricted"] || visaTypeMap["visa_exempt"];

  const visaOnArrival = visaTypeMap["visa_on_arrival"];
  const eta = visaTypeMap["eta"];

  // 🔹 Normalize offers once
  const offerTypes = new Set(
    visaOffers.map((o) => o?.visa_type?.toLowerCase()).filter(Boolean),
  );

  const hasETAOffer = offerTypes.has("eta");
  const hasEvisaOffer = offerTypes.has("evisa");

  const buildDescription = (desc?: string, extra?: string) =>
    [destinationLabel, desc, extra].filter(Boolean).join("\n");

  // 🔹 1. Restricted
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

  // 🔹 2. Visa on Arrival
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

  // 🔹 3. ETA
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

  // 🔹 Default fallback
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
