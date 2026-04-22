import type {
  CreateApplicationResponse,
  GetNationalityResponse,
  GetSupportedCurrenciesResponse,
  GetTravellingToResponse,
  GetVisaDocumentsResponse,
  GetVisaOfferResponse,
  SearchRaffApplicantsResponse,
  UploadedDocumentFiles,
} from "@acme/types/new-visa";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import * as z from "zod";

import {
  createApplicationPayloadSchema,
  searchRaffApplicationPayloadSchema,
} from "@acme/validators/new-visa";

import { api } from "../caller";
import { SERVICES } from "../services";
import { protectedProcedure, publicProcedure } from "../trpc";

const getCookieFromHeader = (headers: Headers, key: string) => {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) {
    return undefined;
  }

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${key}=`))
    ?.split("=")[1];
};

const fileSchema = z.custom<File>(
  (value): value is File =>
    typeof File !== "undefined" && value instanceof File,
  {
    message: "Please upload a valid file",
  },
);

export const newVisaRouter = {
  getNationalities: protectedProcedure.query(async ({ ctx }) => {
    const { userId, host } = ctx.session;

    return await api.get<GetNationalityResponse>(SERVICES.GET_NATIONALITIES, {
      query: { user_id: userId, host },
      headers: ctx.headers,
    });
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

      return await api.post<GetTravellingToResponse>(SERVICES.GET_TRAVELLING_TO, {
        body: {
          ...input,
          user_id: userId,
          host,
          filtered: true,
        },
        headers: ctx.headers,
      });
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

      return await api.post<GetVisaOfferResponse>(SERVICES.GET_VISA_OFFERS, {
        body: {
          ...input,
          user_id: userId,
          host,
          source: "evm",
        },
        headers: ctx.headers,
      });
    }),

  getSupportedCurrencies: publicProcedure.query(async ({ ctx }) => {
    const host = ctx.session?.host ?? getCookieFromHeader(ctx.headers, "host");

    if (!host) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Missing host for supported currencies lookup",
      });
    }

    return await api.get<GetSupportedCurrenciesResponse>(
      SERVICES.GET_SUPPORTED_CURRENCIES,
      {
        query: { host },
        headers: ctx.headers,
      },
    );
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

      return await api.post<GetVisaDocumentsResponse>(SERVICES.GET_VISA_DOCUMENTS, {
        body: {
          ...input,
          host,
        },
        headers: ctx.headers,
      });
    }),

  uploadAndExtractDocuments: protectedProcedure
    .input(
      z.object({
        document: fileSchema,
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

      return await api.post<UploadedDocumentFiles>(
        SERVICES.UPLOAD_AND_EXTRACT_DOCUMENTS,
        {
          body: formData,
          headers: ctx.headers,
          signal,
        },
      );
    }),

  createApplicationWithDocuments: protectedProcedure
    .input(createApplicationPayloadSchema)
    .mutation(async ({ ctx, input }) => {
      const { host, userId } = ctx.session;

      return await api.post<CreateApplicationResponse>(
        SERVICES.CREATE_APPLICATION_WITH_DOCUMENTS,
        {
          body: {
            ...input,
            host,
            user_id: userId,
          },
          headers: ctx.headers,
        },
      );
    }),

  updatePriceChangeAck: protectedProcedure.mutation(async ({ ctx }) => {
    const { host, userId } = ctx.session;

    await api.post(
      SERVICES.UPDATE_PRICE_CHANGE_ACK,
      {
        body: {
          host,
          user_id: userId,
        },
        headers: ctx.headers,
      },
    );

    return {
      status: "success" as const,
    };
  }),

  searchRaffApplication: protectedProcedure
    .input(searchRaffApplicationPayloadSchema)
    .mutation(async ({ ctx, input }) => {
      const { host, userId } = ctx.session;

      return await api.post<SearchRaffApplicantsResponse[]>(
        SERVICES.SEARCH_RAFF_APPLICANTS,
        {
          body: {
            ...input,
            host,
            user_id: userId,
          },
          headers: ctx.headers,
        },
      );
    }),
} satisfies TRPCRouterRecord;
