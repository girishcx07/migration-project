import type { TRPCRouterRecord } from "@trpc/server";
import * as z from "zod";

import type { GetHostDetailsResponse, UserRolePermission } from "@acme/types";

import { api } from "../caller";
import { protectedProcedure, publicProcedure } from "../trpc";

export const enterpriseRouter = {
  getEnterpriseAccountHostDetails: publicProcedure
    .input(
      z.object({
        domainHost: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await api.get<GetHostDetailsResponse>(
        "/enterprise-admin/getEnterpriseAccountsHostDetails",
        {
          query: {
            domain_host: input.domainHost,
          },
        },
      );
    }),

  getUserRolePermissions: protectedProcedure
    .input(z.object({ userId: z.string(), host: z.string() }))
    .query(async ({ input }) => {
      const { userId: user_id, host } = input;

      return await api.get<UserRolePermission>("/user-admin/getUserRole", {
        query: {
          user_id,
          host,
        },
      });
    }),
} satisfies TRPCRouterRecord;
