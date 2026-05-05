import type { BaseAPIResponse } from "@repo/types";
import type {
  CreateApplicationPayload,
  CreateApplicationResponse,
  GetNationalityResponse,
  GetSupportedCurrenciesResponse,
  GetTravellingToPayload,
  GetTravellingToResponse,
  GetVisaDocumentsResponse,
  GetVisaOfferResponse,
  SearchRaffApplicantsResponse,
  UploadedDocumentFiles,
} from "@repo/types/new-visa";

import type { ApiClient } from "../fetcher";
import type { HostPayload, UserHostPayload } from "../route-utils";
import { toRouteResponse } from "../route-utils";
import { SERVICES } from "../services";

export type GetVisaDocumentsInput = HostPayload & {
  travellingToIdentity: string;
  visaId: string;
};

export type UploadAndExtractDocumentsInput = UserHostPayload & {
  document: File;
  nationalityCode: string;
  signal?: AbortSignal;
  visaId: string;
};

export type GetVisaOffersInput = UserHostPayload & {
  currency: string;
  managedBy: string;
  travellingTo: string;
  travellingToIdentity: string;
  type: string;
};

export interface CreateApplicationWithDocumentsInput {
  host: string;
  userId: string;
  evmRequestId?: string;
  documents: CreateApplicationPayload["documentsArray"];
  nationality: string;
  origin: string;
  travellingTo: string;
  travellingToCountry: string;
  travellingToIdentity: string;
  journeyStartDate: string;
  journeyEndDate: string;
  userType: string;
  applicationCreatedByUser: string | null;
  visaId: string;
  visaCode: string;
  durationType: string;
  visaCategory: string;
  visaFees: CreateApplicationPayload["visa_fees"];
  visaEntryType: string;
  visaProcessingType: string;
  visaTypeDisplayName: string;
  isVisaeroInsuranceBundled: boolean;
  insuranceDetails: CreateApplicationPayload["insurance_details"];
  baseCurrencySymbol: string;
  isWithInsurance: string;
  totalDays: string;
  visaType: string;
  currency: string;
  platform: string;
  applicationType?: string;
  raffApplicants?: string[];
}

export type SearchRaffApplicationInput = UserHostPayload & {
  searchText: string;
};

export function createNewVisaRoutes(api: ApiClient) {
  return {
    async getNationalities(input: UserHostPayload) {
      return await api
        .get<BaseAPIResponse<GetNationalityResponse>>(
          SERVICES.GET_NATIONALITIES,
          {
            query: {
              user_id: input.userId,
              host: input.host,
            },
            raw: true,
          },
        )
        .then((response) => toRouteResponse(response));
    },

    async getTravellingTo(input: GetTravellingToPayload & UserHostPayload) {
      const response = await api.post<BaseAPIResponse<GetTravellingToResponse>>(
        SERVICES.GET_TRAVELLING_TO,
        {
          host: input.host,
          origin: input.origin,
          nationality: input.nationality,
          user_id: input.userId,
          filtered: true,
        },
        { raw: true },
      );

      return toRouteResponse(response);
    },

    async getVisaOffers(input: GetVisaOffersInput) {
      const response = await api.post<BaseAPIResponse<GetVisaOfferResponse>>(
        SERVICES.GET_VISA_OFFERS,
        {
          currency: input.currency,
          managed_by: input.managedBy,
          travelling_to: input.travellingTo,
          travelling_to_identity: input.travellingToIdentity,
          type: input.type,
          host: input.host,
          user_id: input.userId,
          source: "evm",
        },
        { raw: true },
      );

      return toRouteResponse(response);
    },

    async getSupportedCurrencies(input: HostPayload) {
      const response = await api.get<
        BaseAPIResponse<GetSupportedCurrenciesResponse>
      >(SERVICES.GET_SUPPORTED_CURRENCIES, {
        query: {
          host: input.host,
        },
        raw: true,
      });

      return toRouteResponse(response);
    },

    async getVisaDocuments(input: GetVisaDocumentsInput) {
      const response = await api.post<
        BaseAPIResponse<GetVisaDocumentsResponse>
      >(
        SERVICES.GET_VISA_DOCUMENTS,
        {
          travelling_to_identity: input.travellingToIdentity,
          visa_id: input.visaId,
          host: input.host,
        },
        { raw: true },
      );

      return toRouteResponse(response);
    },

    async uploadAndExtractDocuments(input: UploadAndExtractDocumentsInput) {
      const body = new FormData();
      body.append("document", input.document);
      body.append("host", input.host);
      body.append("nationality_code", input.nationalityCode);
      body.append("user_id", input.userId);
      body.append("visa_id", input.visaId);

      const response = await api.post<BaseAPIResponse<UploadedDocumentFiles>>(
        SERVICES.UPLOAD_AND_EXTRACT_DOCUMENTS,
        body,
        { raw: true, signal: input.signal },
      );

      return toRouteResponse(response);
    },

    async createApplicationWithDocuments(
      input: CreateApplicationWithDocumentsInput,
    ) {
      const response = await api.post<
        BaseAPIResponse<CreateApplicationResponse>
      >(
        SERVICES.CREATE_APPLICATION_WITH_DOCUMENTS,
        {
          application_created_by_user: input.applicationCreatedByUser,
          application_type: input.applicationType,
          base_currency_symbol: input.baseCurrencySymbol,
          currency: input.currency,
          documentsArray: input.documents,
          duration_type: input.durationType,
          evm_request_id: input.evmRequestId,
          host: input.host,
          insurance_details: input.insuranceDetails,
          is_visaero_insurance_bundled: input.isVisaeroInsuranceBundled,
          is_with_insurance: input.isWithInsurance,
          journey_end_date: input.journeyEndDate,
          journey_start_date: input.journeyStartDate,
          nationality: input.nationality,
          origin: input.origin,
          platform: input.platform,
          raff_applicants: input.raffApplicants,
          total_days: input.totalDays,
          travelling_to: input.travellingTo,
          travelling_to_country: input.travellingToCountry,
          travelling_to_identity: input.travellingToIdentity,
          user_id: input.userId,
          user_type: input.userType,
          visa_category: input.visaCategory,
          visa_code: input.visaCode,
          visa_entry_type: input.visaEntryType,
          visa_fees: input.visaFees,
          visa_id: input.visaId,
          visa_processing_type: input.visaProcessingType,
          visa_type: input.visaType,
          visa_type_display_name: input.visaTypeDisplayName,
        },
        { raw: true },
      );

      return {
        ...toRouteResponse(response),
        msg:
          response.data === "success"
            ? "Application created successfully!"
            : (response.msg ?? "Failed to create an application!"),
      };
    },

    async updatePriceChangeAck(input: UserHostPayload) {
      const response = await api.post<BaseAPIResponse<string>>(
        SERVICES.UPDATE_PRICE_CHANGE_ACK,
        {
          host: input.host,
          user_id: input.userId,
        },
        { raw: true },
      );

      return {
        ...toRouteResponse(response),
        msg: response.data,
        status: response.data,
      };
    },

    async searchRaffApplication(input: SearchRaffApplicationInput) {
      const response = await api.post<
        BaseAPIResponse<SearchRaffApplicantsResponse[]>
      >(
        SERVICES.SEARCH_RAFF_APPLICANTS,
        {
          search_text: input.searchText,
          host: input.host,
          user_id: input.userId,
        },
        { raw: true },
      );

      return toRouteResponse(response);
    },
  };
}
