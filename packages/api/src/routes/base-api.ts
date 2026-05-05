import type {
  BaseAPIResponse,
  GetHostDetailsResponse,
  UserRolePermission,
} from "@repo/types";

import type { ApiClient } from "../fetcher";
import { SERVICES } from "../services";

export interface GetEnterpriseAccountHostDetailsInput {
  domainHost: string;
}

export interface GetUserRolePermissionsInput {
  userId: string;
  host: string;
}

interface RolePermissionResponse<T> {
  data: "success" | "error";
  dataObj: T | null;
}

export async function getEnterpriseAccountHostDetails(
  api: ApiClient,
  input: GetEnterpriseAccountHostDetailsInput,
) {
  const response = await api.get<BaseAPIResponse<GetHostDetailsResponse>>(
    SERVICES.GET_ENTERPRISE_ACCOUNT_HOST_DETAILS,
    {
      query: {
        domain_host: input.domainHost,
      },
      raw: true,
    },
  );

  return {
    data: response.dataobj,
    status: response.data,
    msg: response.msg,
  };
}

export async function getUserRolePermissions(
  api: ApiClient,
  input: GetUserRolePermissionsInput,
) {
  const response = await api.get<RolePermissionResponse<UserRolePermission>>(
    SERVICES.GET_ROLE_PERMISSIONS,
    {
      query: {
        user_id: input.userId,
        host: input.host,
      },
      raw: true,
    },
  );

  return {
    data: response.dataObj,
    status: response.data,
  };
}

export function createBaseApiRoutes(api: ApiClient) {
  return {
    getEnterpriseAccountHostDetails: (
      input: GetEnterpriseAccountHostDetailsInput,
    ) => getEnterpriseAccountHostDetails(api, input),
    getUserRolePermissions: (input: GetUserRolePermissionsInput) =>
      getUserRolePermissions(api, input),
  };
}
