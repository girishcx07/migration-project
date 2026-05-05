import type { BaseAPIResponse, DataStatusType } from "@repo/types";
import type {
  CompatibleDevicesListTypes,
  CreateDataSimApplicationTypes,
  DataSimEnterpriseAccountCreditTypes,
  DataSimOfferTypesList,
  DataSimPaymentSummaryTypes,
  DownloadESIM,
  EsimNationatlityDataTypes,
  EsimRegionCountriesDataTypes,
  TrackDataEsimApplicationTypes,
} from "@repo/types/data-sim";
import type { PaymentMode } from "@repo/types/payment-summary";
import type {
  TrackAPIResponse,
  TrackApplicationResponseData,
} from "@repo/types/track-application";

import type { ApiClient } from "../fetcher";
import type {
  CurrencyPayload,
  FileLike,
  HostPayload,
  UserHostPayload,
} from "../route-utils";
import { appendFile, toRouteResponse } from "../route-utils";
import { SERVICES } from "../services";

export interface CountryRegionPayload {
  id?: number;
  name: string;
  iso2: string;
  iso3: string;
  image?: string;
  is_region?: boolean;
}

export type GetEsimOffersInput = UserHostPayload &
  CurrencyPayload & {
    selected_country_region: CountryRegionPayload;
    nationality: CountryRegionPayload;
  };

export type GetDataSimApplicationDetailsInput = UserHostPayload &
  CurrencyPayload & {
    applicationId: string;
  };

export type CreateDataSimApplicationInput = UserHostPayload &
  CurrencyPayload & {
    packages: unknown[];
    nationality: string;
    nationality_data: CountryRegionPayload;
    destination_data: CountryRegionPayload;
    nationality_name: string;
    destination_name: string;
    journey_start_date: string;
    journey_end_date: string;
    destination: string;
    is_destination_a_region: boolean;
    is_kyc_required?: boolean;
    passport: FileLike | FileLike[];
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    address: string;
  };

export type DataSimPaymentInput = UserHostPayload &
  CurrencyPayload & {
    applicationId: string;
  };

export type DataSimTrackApplicationsInput = UserHostPayload & {
  from: string;
  to: string;
  tabType: string;
  search_text?: string;
};

export type DataSimPaymentModesInput = UserHostPayload &
  CurrencyPayload & {
    type: string;
  };

export type DownloadDataSimInput = UserHostPayload & {
  esims: string;
  application_id: string;
};

const dataSimTrackEndpointMap: Record<string, string> = {
  my_applications: SERVICES.GET_DATASIM_USER_APPLICATIONS,
  ready_to_process: SERVICES.GET_DATASIM_READY_TO_PROCESS_APPLICATION,
  completed: SERVICES.GET_DATASIM_COMPLETED_APPLICATIONS,
  search: SERVICES.SEARCH_DATASIM_APPLICATIONS,
};

const visaTrackEndpointMap: Record<string, string> = {
  my_applications: SERVICES.GET_MY_APPLICATIONS,
  in_process: SERVICES.GET_IN_PROGRESS_APPLICATIONS,
  completed: SERVICES.GET_COMPLETED_APPLICATIONS,
  on_hold: SERVICES.GET_HOLD_APPLICATIONS,
  archive: SERVICES.GET_ARCHIVED_APPLICATIONS,
  ready_to_submit: SERVICES.GET_READY_FOR_SUBMIT_APPLICATIONS,
  review: SERVICES.GET_REVIEW_APPLICATIONS,
  confirm_payment: SERVICES.GET_CONFIRM_PAYMENT_APPLICATIONS,
  search: SERVICES.GET_SEARCH_APPLICATIONS,
};

function appendFormValue(formData: FormData, key: string, value: unknown) {
  if (typeof value === "undefined" || value === null) return;

  if (value instanceof Blob) {
    appendFile(formData, key, value);
    return;
  }

  if (typeof value === "object" || typeof value === "symbol") {
    formData.append(key, JSON.stringify(value));
    return;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    formData.append(key, String(value));
  }
}

function createDataSimApplicationForm(input: CreateDataSimApplicationInput) {
  const formData = new FormData();
  const passport = Array.isArray(input.passport)
    ? input.passport[0]
    : input.passport;

  const payload = {
    ...input,
    user_id: input.userId,
    currency: input.currency,
    host: input.host,
  };

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "userId") return;
    if (key === "passport") {
      if (passport) appendFile(formData, key, passport);
      return;
    }
    appendFormValue(formData, key, value);
  });

  return formData;
}

export function createDataSimRoutes(api: ApiClient) {
  return {
    async getEsimOffers(input: GetEsimOffersInput) {
      const response = await api.post<
        BaseAPIResponse<DataSimOfferTypesList> & { is_kyc_required?: boolean }
      >(
        SERVICES.GET_DATA_SIM_PLANS,
        {
          selected_country_region: input.selected_country_region,
          nationality: input.nationality,
          user_id: input.userId,
          host: input.host,
          currency: input.currency,
        },
        { raw: true },
      );

      return {
        data: response.dataobj,
        is_kyc_required: response.is_kyc_required ?? false,
        status: response.data,
      };
    },

    async getDataSimApplicationDetails(
      input: GetDataSimApplicationDetailsInput,
    ) {
      const response = await api.get<
        BaseAPIResponse<TrackDataEsimApplicationTypes>
      >(`${SERVICES.GET_DATASIM_APPLICATION_DETAILS}/${input.applicationId}`, {
        query: {
          host: input.host,
          user_id: input.userId,
          application_id: input.applicationId,
          currency: input.currency,
        },
        raw: true,
      });

      return toRouteResponse(response);
    },

    async getEsimRegionCountries(input: HostPayload) {
      const response = await api.get<
        BaseAPIResponse<EsimRegionCountriesDataTypes>
      >(SERVICES.GET_DATA_SIM_REGION_COUNTRIES, {
        query: { host: input.host },
        raw: true,
      });

      return toRouteResponse(response);
    },

    async getEsimNationalities(input: HostPayload) {
      const response = await api.get<
        BaseAPIResponse<EsimNationatlityDataTypes>
      >(SERVICES.GET_NATIONALITIES, {
        query: { host: input.host },
        raw: true,
      });

      return toRouteResponse(response);
    },

    async getCompatibleDevices(input: UserHostPayload) {
      const response = await api.get<
        BaseAPIResponse<CompatibleDevicesListTypes>
      >(SERVICES.GET_DATASIM_COMPATIBLE_DEVICES, {
        query: { host: input.host, user_id: input.userId },
        raw: true,
      });

      return toRouteResponse(response);
    },

    async createDataSimApplication(input: CreateDataSimApplicationInput) {
      const response = await api.post<
        BaseAPIResponse<CreateDataSimApplicationTypes>
      >(
        SERVICES.CREATE_DATA_SIM_APPLICATION,
        createDataSimApplicationForm(input),
        { raw: true },
      );

      return toRouteResponse(response);
    },

    async getDataSimPaymentSummary(input: DataSimPaymentInput) {
      const response = await api.get<
        BaseAPIResponse<DataSimPaymentSummaryTypes>
      >(SERVICES.GET_DATASIM_PAYMENT_SUMMARY, {
        query: {
          host: input.host,
          user_id: input.userId,
          application_id: input.applicationId,
          currency: input.currency,
        },
        raw: true,
      });

      return toRouteResponse(response);
    },

    async getEnterpriseAccountCredit(input: DataSimPaymentInput) {
      const response = await api.get<
        BaseAPIResponse<DataSimEnterpriseAccountCreditTypes>
      >(SERVICES.GET_DATASIM_ENTERPRISE_ACCOUNT_CREDIT_FOR_APPLICATION, {
        query: {
          host: input.host,
          user_id: input.userId,
          application_id: input.applicationId,
          currency: input.currency,
        },
        raw: true,
      });

      return toRouteResponse(response);
    },

    async getTrackVisaApplicationsData(input: DataSimTrackApplicationsInput) {
      const apiEndpoint = visaTrackEndpointMap[input.tabType];
      if (!apiEndpoint) {
        return {
          data: null,
          status: "error" as DataStatusType,
          pagination_details: null,
        };
      }

      const response = await api.get<
        TrackAPIResponse<TrackApplicationResponseData>
      >(apiEndpoint, {
        query: {
          host: input.host,
          user_id: input.userId,
          page_number: 1,
          page_size: 10,
          start_date: input.from,
          end_date: input.to,
          search_text:
            input.tabType === "search" ? input.search_text : undefined,
        },
        raw: true,
      });

      return {
        data: response.dataobj,
        status: response.data,
        pagination_details: response.pagination_details ?? null,
      };
    },

    async getDataSimTrackApplications(input: DataSimTrackApplicationsInput) {
      const apiEndpoint = dataSimTrackEndpointMap[input.tabType];
      if (!apiEndpoint) {
        return {
          data: null,
          status: "error" as DataStatusType,
        };
      }

      const response = await api.get<
        BaseAPIResponse<TrackDataEsimApplicationTypes[]>
      >(apiEndpoint, {
        query: {
          host: input.host,
          user_id: input.userId,
          from: input.from,
          to: input.to,
          search_text:
            input.tabType === "search" ? input.search_text : undefined,
        },
        raw: true,
      });

      return {
        data: response.dataobj,
        status: response.data,
      };
    },

    async getPaymentModes(input: DataSimPaymentModesInput) {
      const response = await api.post<BaseAPIResponse<PaymentMode[]>>(
        SERVICES.GET_PAYMENT_MODES,
        {
          user_id: input.userId,
          currency: input.currency,
          type: input.type,
        },
        { raw: true },
      );

      return toRouteResponse(response);
    },

    async downloadDataSim(input: DownloadDataSimInput) {
      const response = await api.post<BaseAPIResponse<DownloadESIM>>(
        SERVICES.DOWNLOAD_DATA_SIM,
        {
          esims: [input.esims],
          user_id: input.userId,
          host: input.host,
        },
        { raw: true },
      );

      return toRouteResponse(response);
    },
  };
}
