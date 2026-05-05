import type {
  CreateApplicationResponse,
  Currency,
  Evaluate,
  GetVisaDocumentsResponse,
  RequiredDocument,
  SearchRaffApplicantsResponse,
  UploadedDocumentFiles,
  VisaFees,
  VisaOffer,
} from "@repo/types/new-visa";

export interface ApplyVisaActionResult<T> {
  data: T | null;
  status: "success" | "error";
  msg?: string;
}

export interface ApplyVisaTravellingToInput {
  module: string;
  origin: string;
  nationality: string;
}

export interface ApplyVisaOffersInput {
  module: string;
  currency: string;
  managedBy: string;
  travellingTo: string;
  travellingToIdentity: string;
  type: string;
}

export interface ApplyVisaDocumentsInput {
  module: string;
  travellingToIdentity: string;
  visaId: string;
}

export interface ApplyVisaRaffSearchInput {
  module: string;
  searchText: string;
}

export interface ApplyVisaCreateApplicationInput {
  module: string;
  documents: UploadedDocumentFiles;
  nationality: string;
  origin: string;
  travellingTo: string;
  travellingToCountry: string;
  travellingToIdentity: string;
  journeyStartDate: string;
  journeyEndDate: string;
  visaCategory: string;
  visaCode: string;
  visaEntryType: string;
  visaTypeDisplayName: string;
  visaFees: VisaFees;
  visaId: string;
  durationType: string;
  totalDays: string;
  isVisaeroInsuranceBundled: boolean;
  insuranceDetails: NonNullable<VisaOffer["insurance_details"]>;
  isWithInsurance: string;
  visaProcessingType: string;
  visaType: string;
  currency: string;
  platform: "web";
  userType: "admin" | "customer";
  applicationType: "b2b" | "qr-visa";
  applicationCreatedByUser: string;
  baseCurrencySymbol: string;
  raffApplicants: string[];
}

export interface ApplyVisaActions {
  getTravellingTo(
    input: ApplyVisaTravellingToInput,
  ): Promise<ApplyVisaActionResult<{ data?: ApplyVisaTravellingToCountry[] }>>;
  getVisaOffers(
    input: ApplyVisaOffersInput,
  ): Promise<ApplyVisaActionResult<VisaOffer[]>>;
  getVisaDocuments(
    input: ApplyVisaDocumentsInput,
  ): Promise<ApplyVisaActionResult<GetVisaDocumentsResponse>>;
  uploadDocument?(
    formData: FormData,
  ): Promise<ApplyVisaActionResult<UploadedDocumentFiles>>;
  createApplication(
    input: ApplyVisaCreateApplicationInput,
  ): Promise<ApplyVisaActionResult<CreateApplicationResponse>>;
  searchRaffApplication(
    input: ApplyVisaRaffSearchInput,
  ): Promise<ApplyVisaActionResult<SearchRaffApplicantsResponse[]>>;
  acknowledgePriceChange(input: {
    module: string;
  }): Promise<ApplyVisaActionResult<string>>;
}

export type ApplyVisaUploadDocumentRequest = (
  formData: FormData,
  signal: AbortSignal,
) => Promise<ApplyVisaActionResult<UploadedDocumentFiles>>;

export interface ApplyVisaCountry {
  name: string;
  cioc: string;
  callingCodes?: string;
  flag?: string;
  synonyms?: string[];
  alpha2Code?: string;
}

export interface ApplyVisaTravellingToCountry {
  identity?: string;
  name: string;
  cioc: string;
  flag?: string;
  max_travel_days?: string;
  allowed_visa_applications?: string;
  visa_types?: {
    type: string;
    title: string;
    description?: string;
    sub_description?: string;
  }[];
  visa_type?: string[];
  managed_by?: string;
  is_visa_free?: boolean;
  is_e_visa?: boolean;
  destination_info?: {
    title: string;
    html_content: string;
  };
  cor_required?: boolean;
  is_sticker_visa?: boolean;
  is_visa_on_arrival?: boolean;
}

export type ApplyVisaCurrency = Currency;
export type ApplyVisaDocument = RequiredDocument | Evaluate;
