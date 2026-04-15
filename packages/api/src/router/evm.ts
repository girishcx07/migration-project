import type { TRPCRouterRecord } from "@trpc/server";
import * as z from "zod";

import { GetEVMRequestDataResponse } from "@acme/types";

import { api } from "../caller";
import { protectedProcedure } from "../trpc";

interface EvmRequestDataResponse {
  status: boolean;
  msg: string;
  dataobj: GetEVMRequestDataResponse;
}

export const evmRouter = {
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
