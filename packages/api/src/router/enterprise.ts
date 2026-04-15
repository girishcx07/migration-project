import type { TRPCRouterRecord } from "@trpc/server";
import * as z from "zod";

import type { GetHostDetailsResponse, UserRolePermission } from "@acme/types";

import { api } from "../caller";
import { protectedProcedure, publicProcedure } from "../trpc";

export const enterpriseRouter = {
  /**
   * GET Enterprise Host Details
   * (Public → no auth required)
   */
  getEnterpriseAccountHostDetails: publicProcedure
    .input(
      z.object({
        domainHost: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const domainHost = input.domainHost;

      return await api.get<GetHostDetailsResponse>(
        "/enterprise-admin/getEnterpriseAccountsHostDetails",
        {
          query: {
            domain_host: domainHost,
          },
        },
      );
    }),

  /**
   * GET User Role Permissions
   * (Protected → requires session)
   */
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
