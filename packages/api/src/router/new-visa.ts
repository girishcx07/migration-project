import type { BaseAPIResponse, DataStatusType } from "@repo/types";
import type {
  CreateApplicationResponse,
  GetNationalityResponse,
  GetSupportedCurrenciesResponse,
  GetTravellingToResponse,
  GetVisaDocumentsResponse,
  GetVisaOfferResponse,
  SearchRaffApplicantsResponse,
  UploadedDocumentFiles,
} from "@repo/types/new-visa";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import * as z from "zod";

import {
  createApplicationPayloadSchema,
  searchRaffApplicationPayloadSchema,
} from "@acme/validators/new-visa";

import apiConfig from "../lib/axios";
import { parseBaseApiResponseStrict } from "../lib/response";
import { SERVICES } from "../lib/services";
import { getCookieFromHeader } from "../lib/session";
import { protectedProcedure, publicProcedure } from "../trpc";

export const newVisaRouter = {
  getNationalities: protectedProcedure.query(async ({ ctx }) => {
    const { userId, host } = ctx.session;

    const response = await apiConfig.get<
      BaseAPIResponse<GetNationalityResponse>
    >(SERVICES.GET_NATIONALITIES, {
      params: { user_id: userId, host },
    });

    return parseBaseApiResponseStrict(response.data);
  }),

  getTravellingTo: protectedProcedure
    .input(
      z.object({
        origin: z.string(),
        nationality: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, host } = ctx.session;

      const response = await apiConfig.post<
        BaseAPIResponse<GetTravellingToResponse>
      >(SERVICES.GET_TRAVELLING_TO, {
        ...input,
        user_id: userId,
        host,
        filtered: true,
      });

      return parseBaseApiResponseStrict(response.data);
    }),

  getVisaOffers: protectedProcedure
    .input(
      z.object({
        currency: z.string(),
        managed_by: z.string(),
        travelling_to: z.string(),
        travelling_to_identity: z.string(),
        type: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { userId, host } = ctx.session;

      const response = await apiConfig.post<
        BaseAPIResponse<GetVisaOfferResponse>
      >(SERVICES.GET_VISA_OFFERS, {
        ...input,
        user_id: userId,
        host,
        source: "evm",
      });

      return parseBaseApiResponseStrict(response.data);
    }),

  getSupportedCurrencies: publicProcedure.query(async ({ ctx }) => {
    const host = ctx.session?.host ?? getCookieFromHeader(ctx.headers, "host");

    if (!host) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Missing host for supported currencies lookup",
      });
    }

    const response = await apiConfig.get<
      BaseAPIResponse<GetSupportedCurrenciesResponse>
    >(SERVICES.GET_SUPPORTED_CURRENCIES, {
      params: { host },
    });

    return parseBaseApiResponseStrict(response.data);
  }),

  getVisaDocuments: protectedProcedure
    .input(
      z.object({
        travelling_to_identity: z.string(),
        visa_id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { host } = ctx.session;

      const response = await apiConfig.post<
        BaseAPIResponse<GetVisaDocumentsResponse>
      >(SERVICES.GET_VISA_DOCUMENTS, {
        ...input,
        host,
      });

      return parseBaseApiResponseStrict(response.data);
    }),

  uploadAndExtractDocuments: protectedProcedure
    .input(
      z.object({
        document: z.file(),
        nationality_code: z.string(),
        visa_id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input, signal }) => {
      const { host, userId } = ctx.session;

      const formData = new FormData();
      formData.append("document", input.document);
      formData.append("host", host);
      formData.append("nationality_code", input.nationality_code);
      formData.append("user_id", userId);
      formData.append("visa_id", input.visa_id);

      const response = await apiConfig.post<
        BaseAPIResponse<UploadedDocumentFiles>
      >(SERVICES.UPLOAD_AND_EXTRACT_DOCUMENTS, formData, { signal });

      return parseBaseApiResponseStrict(response.data);
    }),

  createApplicationWithDocuments: protectedProcedure
    .input(createApplicationPayloadSchema)
    .mutation(async ({ ctx, input }) => {
      const { host, userId } = ctx.session;

      const response = await apiConfig.post<
        BaseAPIResponse<CreateApplicationResponse>
      >(SERVICES.CREATE_APPLICATION_WITH_DOCUMENTS, {
        ...input,
        host,
        user_id: userId,
      });

      const parsed = parseBaseApiResponseStrict(response.data);

      return {
        ...parsed,
        msg: parsed.msg ?? "Application created successfully",
      };
    }),

  updatePriceChangeAck: protectedProcedure.mutation(async ({ ctx }) => {
    const { host, userId } = ctx.session;

    const response = await apiConfig.post<BaseAPIResponse<{ status: string }>>(
      SERVICES.UPDATE_PRICE_CHANGE_ACK,
      {
        host,
        user_id: userId,
      },
    );

    const res = response.data;

    if (res.data !== "success") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: res.msg,
      });
    }

    return {
      status: res.data as DataStatusType,
      msg: res.msg,
    };
  }),

  searchRaffApplication: protectedProcedure
    .input(searchRaffApplicationPayloadSchema)
    .mutation(async ({ ctx, input }) => {
      const { host, userId } = ctx.session;

      const response = await apiConfig.post<
        BaseAPIResponse<SearchRaffApplicantsResponse[]>
      >(SERVICES.SEARCH_RAFF_APPLICANTS, {
        ...input,
        host,
        user_id: userId,
      });

      return parseBaseApiResponseStrict(response.data);
    }),
} satisfies TRPCRouterRecord;
