import type { TRPCRouterRecord } from "@trpc/server";
import * as z from "zod";

import type {
  BaseAPIResponse,
  QRVisaRegisterAnonymousUserInput,
  QRVisaUser,
} from "@repo/types";
import type { Application } from "@repo/types/review";

import apiConfig from "../lib/axios";
import { SERVICES } from "../lib/services";
import { parseApiResponse } from "../lib/utils";
import { publicProcedure } from "../trpc";

type QrVisaUserApplication = Application & { user: QRVisaUser };

export const qrVisaRouter = {
  /**
   * Register Anonymous User
   */
  registerAnonymousUser: publicProcedure
    .input(
      z.object({
        host: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const response = await apiConfig.get<
        BaseAPIResponse<QRVisaRegisterAnonymousUserInput>
      >(SERVICES.REGISTER_ANONYMOUS_USER, {
        params: {
          host: input.host,
        },
      });

      return parseApiResponse(response.data);
    }),

  /**
   * Send OTP
   */
  sendOtpForVisa: publicProcedure
    .input(
      z.object({
        application_reference_code: z.string(),
        host: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await apiConfig.post<BaseAPIResponse<Application>>(
        SERVICES.SEND_OTP_FOR_VISA,
        {
          application_reference_code: input.application_reference_code,
          host: input.host,
        },
      );

      return parseApiResponse(response.data);
    }),

  /**
   * Verify OTP
   */
  verifyOtpForVisa: publicProcedure
    .input(
      z.object({
        application_id: z.string(),
        otp: z.string(),
        host: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await apiConfig.post<
        BaseAPIResponse<QrVisaUserApplication>
      >(SERVICES.VERIFY_OTP_FOR_VISA, {
        application_id: input.application_id,
        otp: input.otp,
        host: input.host,
      });

      return parseApiResponse(response.data);
    }),
} satisfies TRPCRouterRecord;
