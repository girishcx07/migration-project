import type { TRPCRouterRecord } from "@trpc/server";
import * as z from "zod";

import type {
  GetEVMRequestDataResponse,
  QRVisaRegisterAnonymousUserInput,
} from "@acme/types";

import { api } from "../caller";
import { SERVICES } from "../services";
import { protectedProcedure, publicProcedure } from "../trpc";

export const evmRouter = {
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

  getEVMRequestData: protectedProcedure
    .input(
      z.object({
        evm_request_id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { evm_request_id } = input;
      const { userId, host } = ctx.session;

      return await api.get<GetEVMRequestDataResponse>(
        "/external-visa/getEvmRequestData",
        {
          query: {
            user_id: userId,
            evm_request_id: evm_request_id,
            host: host,
          },
        },
      );
    }),
} satisfies TRPCRouterRecord;
