import type { BaseAPIResponse, DataStatusType } from "@repo/types";
import type {
  GenerateOTPForAnonymousUserResponse,
  GetApplicableChildAgeForDestinationResponse,
  GetPaymentModesResponse,
  GetTokenResponse,
  GetVisaeroStripePaymentTokenResponse,
  GetVisaPaymentSumaryResponse,
  GetWalletBalanceResponse,
  submitApplicationResponse,
  updateGroupMembershipResponse,
  UpdatePaymentProcessingStatusResponse,
  UpdateUserDetailsResponse,
  VerifyOtpForAnonymousUserResponse,
} from "@acme/types/payment-summary";
import type { TRPCRouterRecord } from "@trpc/server";
import * as z from "zod";

import { updateGroupMembershipSchema } from "@acme/validators/visa-payment-summary";

import apiConfig from "../lib/axios";
import {
  createErrorResponse,
  createSuccessResponse,
  parseBaseApiResponseWithFallback,
} from "../lib/response";
import { SERVICES } from "../lib/services";
import { protectedProcedure } from "../trpc";

export const DEFAULT_COUNTRY_DATA = {
  country: "INDIA",
  countryName: "India",
  countryCode: "IN",
  city: "PUNE",
  cityName: "Pune",
  state: "MAHARASHTRA",
  stateCode: "MH",
  currency: "INR",
  currencyCode: "INR",
  currencySymbol: "₹",
  countryFlag: "🇮🇳",
  countryFlagEmoji: "🇮🇳",
};

export const visaPaymentSummaryRouter = {
  getVisaeroStripeToken: protectedProcedure
    .input(
      z.object({
        application_id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const response =
        await apiConfig.post<GetVisaeroStripePaymentTokenResponse>(
          SERVICES.GET_VISAERO_STRIPE_PAYMENT_TOKEN_EVM,
          {
            application_id: input.application_id,
            country: DEFAULT_COUNTRY_DATA.countryName,
            city: DEFAULT_COUNTRY_DATA.cityName,
            success_url: "/payment-success",
            cancel_url: "/payment-cancel",
            type: "visa",
          },
        );

      return createSuccessResponse(response.data);
    }),

  getVisaeroPaymentSummary: protectedProcedure
    .input(
      z.object({
        currency: z.string(),
        applicationId: z.string(),
        childApplicantIds: z.array(z.string()).optional(),
        moduleType: z.enum(["evm", "qr-visa"]).default("evm"),
      }),
    )
    .query(async ({ input }) => {
      const payload = {
        applicationId: input.applicationId,
        paymentMethod: "online",
        orderCurrency: input.currency,
        type: input.moduleType === "qr-visa" ? "qr_app" : "apply_new_visa",
        selectedCurrency: input.currency,
        source: input.moduleType === "qr-visa" ? "qr_app" : "evm",
        child_applicants_ids: input.childApplicantIds ?? [],
      };

      const apiPath =
        input.moduleType === "qr-visa"
          ? SERVICES.GET_VISA_PAYMENT_SUMMARY_FOR_B2C
          : SERVICES.GET_VISA_PAYMENT_SUMMARY_NEW;

      const response = await apiConfig.get<
        BaseAPIResponse<GetVisaPaymentSumaryResponse>
      >(apiPath, { params: payload });

      return parseBaseApiResponseWithFallback(
        response.data,
        null as GetVisaPaymentSumaryResponse | null,
      );
    }),

  updateGroupMembershipForApplication: protectedProcedure
    .input(updateGroupMembershipSchema)
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const apiPath =
        input.workflow === "qr-visa"
          ? SERVICES.UPDATE_GROUP_MEMBERSHIP_FOR_APPLICATION_B2C
          : SERVICES.UPDATE_GROUP_MEMBERSHIP_FOR_APPLICATION;

      const response = await apiConfig.post<updateGroupMembershipResponse>(
        apiPath,
        {
          ...input,
          user_id: user.userId,
          host: user.host,
        },
      );

      if (response.data.data === "success") {
        return createSuccessResponse(
          response.data.msg,
          "Group membership updated successfully",
        );
      }

      return createErrorResponse(response.data.data, response.data.msg);
    }),

  generateOtpForAnonymousUser: protectedProcedure
    .input(
      z.object({
        email: z.string(),
        host: z.string().optional(),
        moduleType: z.enum(["evm", "qr-visa"]).default("qr-visa"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const apiPath =
        input.moduleType === "qr-visa"
          ? SERVICES.GENERATE_QR_VISA_OTP_FOR_ANONYMOUS_USER
          : SERVICES.GENERATE_OTP_FOR_ANONYMOUS_USER;

      const response =
        await apiConfig.post<GenerateOTPForAnonymousUserResponse>(apiPath, {
          email: input.email,
          host: input.host ?? user.host,
          user_id: user.userId,
        });

      return {
        msg: response.data.msg,
        status: response.data.data,
      };
    }),

  updateUserDetails: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        contactDetails: z.object({
          first_name: z.string(),
          last_name: z.string(),
          mobile_no: z.string(),
          email: z.string(),
          country_code: z.string(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const response = await apiConfig.post<UpdateUserDetailsResponse>(
        SERVICES.UPDATE_USER_DETAILS,
        {
          application_id: input.applicationId,
          contact_details: input.contactDetails,
          user_id: ctx.session.user.userId,
        },
      );

      return {
        data: response.data.msg,
        status: response.data.data,
      };
    }),

  verifyOtpForAnonymousUser: protectedProcedure
    .input(
      z.object({
        application_id: z.string(),
        otp: z.string(),
        email: z.string(),
        host: z.string().optional(),
        moduleType: z.enum(["evm", "qr-visa"]).default("qr-visa"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const apiPath =
        input.moduleType === "qr-visa"
          ? SERVICES.VERIFY_QR_VISA_OTP_FOR_ANONYMOUS_USER
          : SERVICES.VERIFY_OTP_FOR_ANONYMOUS_USER;

      const response = await apiConfig.post<VerifyOtpForAnonymousUserResponse>(
        apiPath,
        {
          ...input,
          host: input.host ?? user.host,
          user_id: user.userId,
        },
      );

      if (response.data.data === "success") {
        return createSuccessResponse(response.data.dataobj, response.data.msg);
      }

      return createErrorResponse({}, response.data.msg);
    }),

  updatePaymentProcessingStatus: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        payment_gateway: z.string(),
        txStatus: z.string(),
        qr_track_url: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const response =
        await apiConfig.post<UpdatePaymentProcessingStatusResponse>(
          SERVICES.UPDATE_PAYMENT_PROCESSING_STATUS,
          {
            ...input,
            user_id: ctx.session.user.userId,
          },
        );

      return createSuccessResponse(response.data);
    }),

  getPaymentModes: protectedProcedure
    .input(
      z.object({
        currency: z.string(),
        type: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const response = await apiConfig.post<GetPaymentModesResponse>(
        SERVICES.GET_PAYMENT_MODES,
        {
          ...input,
          user_id: ctx.session.user.userId,
        },
      );

      return createSuccessResponse(response.data);
    }),

  getPaymentModeToken: protectedProcedure
    .input(
      z.object({
        application_id: z.string(),
        type: z.string(),
        payment_config_id: z.string(),
        ui_mode: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const response = await apiConfig.post<GetTokenResponse>(
        SERVICES.GET_TOKEN,
        {
          ...input,
          user_id: ctx.session.user.userId,
        },
      );

      return createSuccessResponse(response.data);
    }),

  getWalletBalance: protectedProcedure
    .input(
      z.object({
        application_id: z.string(),
        type: z.string(),
        payment_config_id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post<GetWalletBalanceResponse>(
        SERVICES.GET_WALLET_BALANCE,
        {
          ...input,
          host: user.host,
          user_id: user.userId,
        },
      );

      return createSuccessResponse(response.data);
    }),

  postSubmitApplication: protectedProcedure
    .input(
      z.object({
        application_id: z.string(),
        type: z.string(),
        payment_config_id: z.string(),
        payment_reference_id: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post<submitApplicationResponse>(
        SERVICES.POST_SUBMIT_APPLICATION,
        {
          ...input,
          host: user.host,
          user_id: user.userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "session-user-id": user.userId,
          },
        },
      );

      return createSuccessResponse(response.data);
    }),

  getApplicableChildAgeForDestination: protectedProcedure
    .input(
      z.object({
        destination_cioc: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.get<{
        data: DataStatusType;
        dataobj: GetApplicableChildAgeForDestinationResponse;
      }>(SERVICES.GET_APPLICABLE_CHILD_AGE_FOR_DESTINATION, {
        params: {
          ...input,
          host: user.host,
          user_id: user.userId,
        },
      });

      if (response.data.data === "success") {
        return createSuccessResponse(
          response.data.dataobj,
          "Applicable child age fetched successfully",
        );
      }

      throw new Error("Failed to fetch applicable child age");
    }),
} satisfies TRPCRouterRecord;
