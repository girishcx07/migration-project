import type { TRPCRouterRecord } from "@trpc/server";
import * as z from "zod";

import type { QRVisaRegisterAnonymousUserInput, QRVisaUser } from "@acme/types";
import type { Application } from "@acme/types/review";

import { api } from "../caller";
import { SERVICES } from "../services";
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
    .query(async ({ input, ctx }) => {
      return await api.get<QRVisaRegisterAnonymousUserInput>(
        SERVICES.REGISTER_ANONYMOUS_USER,
        {
          query: {
            host: input.host,
          },
          headers: ctx.headers,
        },
      );
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
    .mutation(async ({ input, ctx }) => {
      return await api.post<Application>(
        SERVICES.SEND_OTP_FOR_VISA,
        {
          body: {
            application_reference_code: input.application_reference_code,
            host: input.host,
          },
          headers: ctx.headers,
        },
      );
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
    .mutation(async ({ input, ctx }) => {
      return await api.post<QrVisaUserApplication>(SERVICES.VERIFY_OTP_FOR_VISA, {
        body: {
          application_id: input.application_id,
          otp: input.otp,
          host: input.host,
        },
        headers: ctx.headers,
      });
    }),
} satisfies TRPCRouterRecord;
