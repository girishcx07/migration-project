import type {
  GetExternalAgentDetails,
  VerifyUserTokenResponse,
} from "@repo/types";
import type { GetEVMRequestDataResponse } from "@repo/types/new-visa";

import type { ApiClient } from "../fetcher";
import type { UserHostPayload } from "../route-utils";
import { SERVICES } from "../services";

interface GetEVMRequestDataApiResponse {
  status: number;
  message: "success" | "error";
  data: GetEVMRequestDataResponse;
}

interface ExternalVisaApiResponse<T> {
  data: T;
  message: "success" | "error";
  status: 1 | 0;
}

interface ExternalAgentDetailsApiResponse {
  data: GetExternalAgentDetails | null;
  message: "success" | "error";
  status: 1 | 0;
}

export type GetEVMRequestDataInput = UserHostPayload & {
  evmRequestId: string;
};

export type VerifyExternalUserTokenInput = UserHostPayload & {
  sessionId: string;
};

export type GetExternalAgentSessionInput = UserHostPayload & {
  accessToken?: string;
};

export interface VerifiedExternalUserToken {
  accessToken: string;
}

export interface ExternalAgentSession {
  accessToken: string;
  refreshToken: string;
  userId: string;
  userType: string;
  defaultCurrency: string;
  externalUserId: string;
  priceChangeAck: boolean;
}

function toVerifiedExternalUserToken(
  response: ExternalVisaApiResponse<VerifyUserTokenResponse>,
) {
  return {
    data: {
      accessToken: response.data.accessToken,
    },
    status:
      response.status === 1 &&
      response.message === "success" &&
      Boolean(response.data.accessToken)
        ? ("success" as const)
        : ("error" as const),
  };
}

function toExternalAgentSession(response: ExternalAgentDetailsApiResponse) {
  const data = response.data;
  const isValid =
    response.status === 1 &&
    response.message === "success" &&
    Boolean(data?.accessToken) &&
    Boolean(data?.refreshToken) &&
    Boolean(data?._id) &&
    Boolean(data?.user_type);

  return {
    data: {
      accessToken: data?.accessToken ?? "",
      refreshToken: data?.refreshToken ?? "",
      userId: data?._id ?? "",
      userType: data?.user_type ?? "",
      defaultCurrency: data?.user_preference.default_currency ?? "",
      externalUserId: data?.external_user_id ?? "",
      priceChangeAck: data?.price_change_ack ?? false,
    },
    status: isValid ? ("success" as const) : ("error" as const),
  };
}

export function createEvmRoutes(api: ApiClient) {
  return {
    async verifyExternalUserToken(input: VerifyExternalUserTokenInput) {
      const response = await api.post<
        ExternalVisaApiResponse<VerifyUserTokenResponse>
      >(
        SERVICES.VERIFY_USER_TOKEN,
        {
          host: input.host,
          session_id: input.sessionId,
          user_id: input.userId,
        },
        { raw: true },
      );

      return toVerifiedExternalUserToken(response);
    },

    async getExternalAgentSession(input: GetExternalAgentSessionInput) {
      const response = await api.get<ExternalAgentDetailsApiResponse>(
        SERVICES.GET_EXTERNAL_AGENT_DETAILS,
        {
          headers: input.accessToken
            ? { Authorization: `Bearer ${input.accessToken}` }
            : undefined,
          query: {
            user_id: input.userId,
            host: input.host,
          },
          raw: true,
        },
      );

      return toExternalAgentSession(response);
    },

    async getEVMRequestData(input: GetEVMRequestDataInput) {
      const response = await api.get<GetEVMRequestDataApiResponse>(
        SERVICES.GET_EVM_REQUEST_DATA,
        {
          query: {
            user_id: input.userId,
            evm_request_id: input.evmRequestId,
            host: input.host,
          },
          raw: true,
        },
      );

      return {
        data: response.data,
        status: response.status === 1 ? "success" : "error",
      };
    },
  };
}
