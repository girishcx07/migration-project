"use client";

import {
  useMutation,
  useQuery,
  UseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { orpc } from "@workspace/orpc/lib/orpc";
import { noConfig } from "@workspace/orpc/lib/axios";
import { getCookie } from "@workspace/common-ui/lib/utils";
import { SERVICES } from "@workspace/common/constants/services";

// ------------------------------
// useIpData
// ------------------------------
export const useIpData = () => {
  return useQuery({
    queryKey: ["ipData"],
    queryFn: async () => {
      const response = await noConfig.get(SERVICES.IP_API);
      return response.data;
    },
  });
};

export const useSaveApplicanForm = () => {
  return useMutation(orpc.visa.saveVisaForm.mutationOptions());
};

type EnterpriseGlobalData = Awaited<
  ReturnType<typeof orpc.baseApi.getEnterpriseAccountHostDetails.call>
>;

export const useEnterpriseData = () => {
  return useSuspenseQuery(
    orpc.baseApi.getEnterpriseAccountHostDetails.queryOptions(),
  );
};

export const useEnterpriseGlobalData =
  (): UseQueryResult<EnterpriseGlobalData> => {
    return useQuery(
      orpc.baseApi.getEnterpriseAccountHostDetails.queryOptions(),
    );
  };

type UserGlobalRolePermissions = Awaited<
  ReturnType<typeof orpc.baseApi.getUserRolePermissions.call>
>;
export const useUserGlobalRolePermissions =
  (): UseQueryResult<UserGlobalRolePermissions> => {
    return useQuery(orpc.baseApi.getUserRolePermissions.queryOptions());
  };

export const useApplicationDetails = () => {
  const applicationId = getCookie("application_id");
  return useQuery({
    ...orpc.visa.getApplicationApplicantsDetails.queryOptions({
      input: { applicationId: applicationId! },
    }),
    enabled: !!applicationId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
};

type EVMGlobalRequestData = Awaited<
  ReturnType<typeof orpc.evm.getEVMRequestData.call>
>;
export const useEVMGlobalRequestData =
  (): UseQueryResult<EVMGlobalRequestData> => {
    return useQuery(orpc.evm.getEVMRequestData.queryOptions());
  };
