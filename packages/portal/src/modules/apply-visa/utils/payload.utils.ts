import type { UploadedDocumentFiles, VisaOffer } from "@repo/types/new-visa";
import type { DateRangeTypes } from "@repo/ui/components/date-range-picker";

import type { ModuleBootstrap } from "../../../lib/module-registry";
import type {
  ApplyVisaCountry,
  ApplyVisaCreateApplicationInput,
  ApplyVisaTravellingToCountry,
} from "../types";
import { toIsoDate } from "./date.utils";

function getApplicationType(module: ModuleBootstrap["module"]) {
  return module === "qr-visa" ? "qr-visa" : "b2b";
}

export function getOfferType(module: ModuleBootstrap["module"]) {
  return module === "qr-visa" ? "qr_app" : "apply_new_visa";
}

export function createApplicationPayload({
  bootstrap,
  countryOfOrigin,
  currency,
  dateRange,
  nationality,
  raffApplicants,
  travellingTo,
  travellingToIdentity,
  uploadedDocuments,
  visaOffer,
}: {
  bootstrap: ModuleBootstrap;
  countryOfOrigin: ApplyVisaCountry | null;
  currency: string;
  dateRange: DateRangeTypes;
  nationality: ApplyVisaCountry | null;
  raffApplicants: string[];
  travellingTo: ApplyVisaTravellingToCountry | null;
  travellingToIdentity: string;
  uploadedDocuments: UploadedDocumentFiles;
  visaOffer: VisaOffer | null;
}): ApplyVisaCreateApplicationInput | null {
  if (
    !nationality ||
    !countryOfOrigin ||
    !travellingTo ||
    !visaOffer ||
    !dateRange
  ) {
    return null;
  }

  return {
    applicationCreatedByUser: "",
    applicationType: getApplicationType(bootstrap.module),
    baseCurrencySymbol: currency,
    currency,
    documents: uploadedDocuments,
    durationType: visaOffer.visa_details?.duration_type ?? "",
    insuranceDetails: visaOffer.insurance_details ?? {
      insurance_coverage: [],
      insurance_desc: [],
      insurance_title: "",
      insurance_type: "",
      insurance_type_id: "",
      visaero_insurance_fees: "",
      visaero_service_fees: "",
    },
    isVisaeroInsuranceBundled: Boolean(visaOffer.is_visaero_insurance_bundled),
    isWithInsurance: String(Boolean(visaOffer.is_visaero_insurance_bundled)),
    journeyEndDate: toIsoDate(dateRange.to),
    journeyStartDate: toIsoDate(dateRange.from),
    module: bootstrap.module,
    nationality: nationality.name,
    origin: countryOfOrigin.name,
    platform: "web",
    raffApplicants,
    totalDays: visaOffer.visa_details?.duration_days ?? "",
    travellingTo: travellingTo.cioc,
    travellingToCountry: travellingTo.name,
    travellingToIdentity:
      visaOffer.travelling_to_identity ?? travellingToIdentity,
    userType: bootstrap.module === "qr-visa" ? "customer" : "admin",
    visaCategory: visaOffer.visa_category ?? "",
    visaCode: visaOffer.visa_details?.visa_code ?? "",
    visaEntryType: visaOffer.entry_type ?? "",
    visaFees: visaOffer.visa_details?.fees ?? {
      adult_govt_fee: "",
      adult_service_fee: "",
      child_govt_fee: "",
      child_service_fee: "",
      currency,
      infant_govt_fee: "",
      infant_service_fee: "",
      total_cost: "",
      total_service_fee: "",
    },
    visaId: visaOffer.visa_details?.visa_id ?? "",
    visaProcessingType: visaOffer.processing_type ?? "",
    visaType: visaOffer.visa_type ?? "",
    visaTypeDisplayName: visaOffer.visa_type_display_name ?? "",
  };
}
