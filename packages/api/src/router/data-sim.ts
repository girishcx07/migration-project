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
  PaginationDetails,
  TrackApplicationResponseData,
} from "@repo/types/track-application";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import * as z from "zod";

import {
  createApplicationSchema,
  getEsimOffersPayloadSchema,
} from "@acme/validators/data-sim";

import apiConfig from "../lib/axios";
import { SERVICES } from "../lib/services";
import { protectedProcedure } from "../trpc";

const toBaseResponse = <T>(response: BaseAPIResponse<T>, fallback: T) => {
  if (response.data === "success") {
    return {
      data: response.dataobj ?? fallback,
      status: "success" as const,
      msg: response.msg,
    };
  }

  return {
    data: fallback,
    status: "error" as const,
    msg: response.msg,
  };
};

const appendFormValue = (
  formData: FormData,
  key: string,
  value: unknown,
): void => {
  if (value === undefined || value === null) {
    return;
  }

  if (value instanceof File) {
    formData.append(key, value, value.name);
    return;
  }

  if (Array.isArray(value)) {
    const values: unknown[] = value;
    const firstFile = values[0];
    if (firstFile instanceof File) {
      formData.append(key, firstFile, firstFile.name);
      return;
    }
    formData.append(key, JSON.stringify(values));
    return;
  }

  if (typeof value === "object") {
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
};

const trackEndpointMap: Record<string, string> = {
  my_applications: SERVICES.GET_DATASIM_USER_APPLICATIONS,
  ready_to_process: SERVICES.GET_DATASIM_READY_TO_PROCESS_APPLICATION,
  completed: SERVICES.GET_DATASIM_COMPLETED_APPLICATIONS,
  search: SERVICES.SEARCH_DATASIM_APPLICATIONS,
};

export const dataSimRouter = {
  getEsimOffers: protectedProcedure
    .input(getEsimOffersPayloadSchema)
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user;

      const response = await apiConfig.post<
        BaseAPIResponse<DataSimOfferTypesList> & { is_kyc_required: boolean }
      >(SERVICES.GET_DATA_SIM_PLANS, {
        ...input,
        user_id: user.userId,
        host: user.host,
        currency: user.currency,
      });

      if (response.data.data === "success") {
        return {
          data: response.data.dataobj ?? [],
          is_kyc_required: response.data.is_kyc_required,
          status: "success" as DataStatusType,
        };
      }

      return {
        data: [],
        is_kyc_required: false,
        status: "error" as DataStatusType,
      };
    }),

  getDataSimApplicationDetails: protectedProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user;

      const response = await apiConfig.get<
        BaseAPIResponse<TrackDataEsimApplicationTypes>
      >(`${SERVICES.GET_DATASIM_APPLICATION_DETAILS}/${input.applicationId}`, {
        params: {
          host: user.host,
          user_id: user.userId,
          application_id: input.applicationId,
          currency: user.currency,
        },
      });

      if (response.data.data === "success") {
        return {
          data: response.data.dataobj,
          status: "success" as DataStatusType,
        };
      }

      return {
        data: null,
        status: "error" as DataStatusType,
      };
    }),

  getEsimRegionCountries: protectedProcedure.query(async ({ ctx }) => {
    const host = ctx.session.user.host;

    const response = await apiConfig.get<
      BaseAPIResponse<EsimRegionCountriesDataTypes>
    >(SERVICES.GET_DATA_SIM_REGION_COUNTRIES, {
      params: { host },
    });

    if (response.data.data === "success") {
      return {
        data: response.data.dataobj,
        status: "success" as DataStatusType,
      };
    }

    return {
      data: null,
      status: "error" as DataStatusType,
    };
  }),

  getEsimNationalities: protectedProcedure.query(async ({ ctx }) => {
    const host = ctx.session.user.host;

    const response = await apiConfig.get<
      BaseAPIResponse<EsimNationatlityDataTypes>
    >(SERVICES.GET_NATIONALITIES, {
      params: { host },
    });

    if (response.data.data === "success") {
      return {
        data: response.data.dataobj,
        status: "success" as DataStatusType,
      };
    }

    return {
      data: null,
      status: "error" as DataStatusType,
    };
  }),

  getCompatibleDevices: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;

    const response = await apiConfig.get<
      BaseAPIResponse<CompatibleDevicesListTypes>
    >(SERVICES.GET_DATASIM_COMPATIBLE_DEVICES, {
      params: { host: user.host, user_id: user.userId },
    });

    if (response.data.data === "success") {
      return {
        data: response.data.dataobj,
        status: "success" as DataStatusType,
      };
    }

    return {
      data: null,
      status: "error" as DataStatusType,
    };
  }),

  createDataSimApplication: protectedProcedure
    .input(createApplicationSchema)
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const formData = new FormData();

      for (const [key, value] of Object.entries(input)) {
        appendFormValue(formData, key, value);
      }

      appendFormValue(formData, "user_id", user.userId);
      appendFormValue(formData, "currency", user.currency);
      appendFormValue(formData, "host", user.host);

      const response = await apiConfig.post<
        BaseAPIResponse<CreateDataSimApplicationTypes>
      >(SERVICES.CREATE_DATA_SIM_APPLICATION, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.data === "success") {
        return {
          data: response.data.dataobj,
          status: "success" as DataStatusType,
          application_reference_code:
            response.data.dataobj?.application_reference_code ?? "",
          insertedId: response.data.dataobj?.insertedId ?? "",
        };
      }

      return {
        data: null,
        status: "error" as DataStatusType,
      };
    }),

  getDataSimPaymentSummary: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        currency: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user;

      const response = await apiConfig.get<
        BaseAPIResponse<DataSimPaymentSummaryTypes>
      >(SERVICES.GET_DATASIM_PAYMENT_SUMMARY, {
        params: {
          host: user.host,
          user_id: user.userId,
          application_id: input.applicationId,
          currency: input.currency,
        },
      });

      return toBaseResponse(
        response.data,
        null as DataSimPaymentSummaryTypes | null,
      );
    }),

  getEnterpriseAccountCredit: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        currency: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user;

      const response = await apiConfig.get<
        BaseAPIResponse<DataSimEnterpriseAccountCreditTypes>
      >(SERVICES.GET_DATASIM_ENTERPRISE_ACCOUNT_CREDIT_FOR_APPLICATION, {
        params: {
          host: user.host,
          user_id: user.userId,
          application_id: input.applicationId,
          currency: input.currency,
        },
      });

      return toBaseResponse(
        response.data,
        null as DataSimEnterpriseAccountCreditTypes | null,
      );
    }),

  getTrackVisaApplicationsData: protectedProcedure
    .input(
      z.object({
        from: z.string(),
        to: z.string(),
        tabType: z.string(),
        search_text: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { from, to, tabType, search_text } = input;
      const user = ctx.session.user;
      const apiEndpoint = trackEndpointMap[tabType];

      if (!apiEndpoint) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid track applications tab type",
        });
      }

      const response = await apiConfig.get<
        TrackApiResponse<TrackApplicationResponseData>
      >(apiEndpoint, {
        params: {
          host: user.host,
          user_id: user.userId,
          page_number: 1,
          page_size: 10,
          start_date: from,
          end_date: to,
          search_text: tabType === "search" ? search_text : undefined,
        },
      });

      if (response.data.data === "success") {
        return {
          data: response.data.dataobj,
          status: "success" as DataStatusType,
          pagination_details: response.data.pagination_details,
        };
      }

      return {
        data: {} as TrackApplicationResponseData,
        status: "error" as DataStatusType,
        pagination_details: {} as PaginationDetails,
      };
    }),

  getDataSimTrackApplications: protectedProcedure
    .input(
      z.object({
        from: z.string(),
        to: z.string(),
        tabType: z.string(),
        search_text: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { from, to, tabType, search_text } = input;
      const user = ctx.session.user;
      const apiEndpoint = {
        my_applications: SERVICES.GET_DATASIM_USER_APPLICATIONS,
        ready_to_process: SERVICES.GET_DATASIM_READY_TO_PROCESS_APPLICATION,
        completed: SERVICES.GET_DATASIM_COMPLETED_APPLICATIONS,
        search: SERVICES.SEARCH_DATASIM_APPLICATIONS,
      }[tabType];

      if (!apiEndpoint) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid data-sim tab type",
        });
      }

      const response = await apiConfig.get<
        BaseAPIResponse<TrackDataEsimApplicationTypes[]> & {
          pagination_details?: PaginationDetails;
        }
      >(apiEndpoint, {
        params: {
          host: user.host,
          user_id: user.userId,
          from,
          to,
          search_text: tabType === "search" ? search_text : undefined,
        },
      });

      if (response.data.data === "success") {
        return {
          data: response.data.dataobj,
          status: "success" as DataStatusType,
        };
      }

      return {
        data: null,
        status: "error" as DataStatusType,
      };
    }),

  getPaymentModes: protectedProcedure
    .input(
      z.object({
        currency: z.string(),
        type: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user;

      const response = await apiConfig.post<BaseAPIResponse<PaymentMode[]>>(
        SERVICES.GET_PAYMENT_MODES,
        {
          user_id: user.userId,
          currency: input.currency,
          type: input.type,
        },
      );

      return toBaseResponse(response.data, [] as PaymentMode[]);
    }),

  downloadDataSim: protectedProcedure
    .input(
      z.object({
        esims: z.string(),
        application_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;

      const response = await apiConfig.post<BaseAPIResponse<DownloadESIM>>(
        SERVICES.DOWNLOAD_DATA_SIM,
        {
          esims: [input.esims],
          user_id: user.userId,
          host: user.host,
        },
      );

      return toBaseResponse(response.data, null as DownloadESIM | null);
    }),
} satisfies TRPCRouterRecord;
interface TrackApiResponse<T> {
  data: DataStatusType;
  dataobj: T;
  msg?: string;
  pagination_details?: PaginationDetails;
}
