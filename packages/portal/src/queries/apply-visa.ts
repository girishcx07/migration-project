import type {
  GetEVMRequestDataResponse,
  GetNationalityResponse,
  GetSupportedCurrenciesResponse,
} from "@repo/types/new-visa";

import type { ModuleName } from "../lib/module-registry";

interface RouteResponse<T> {
  data: T | null;
  status: string;
  msg?: string;
}

interface ApplyVisaApi {
  evm: {
    getEVMRequestData(input: {
      evmRequestId: string;
      host: string;
      userId: string;
    }): Promise<RouteResponse<GetEVMRequestDataResponse>>;
  };
  newVisa: {
    getNationalities(input: {
      host: string;
      userId: string;
    }): Promise<RouteResponse<GetNationalityResponse>>;
    getSupportedCurrencies(input: {
      host: string;
    }): Promise<RouteResponse<GetSupportedCurrenciesResponse>>;
  };
}

export interface ApplyVisaSessionInput {
  module: ModuleName;
  host: string;
  userId: string;
  evmRequestId?: string;
}

export interface ApplyVisaInitialData {
  evmRequest: RouteResponse<GetEVMRequestDataResponse> | null;
  nationalities: RouteResponse<GetNationalityResponse>;
  supportedCurrencies: RouteResponse<GetSupportedCurrenciesResponse>;
}

async function loadInitialDataPart<T>(label: string, promise: Promise<T>) {
  try {
    return await promise;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);

    throw new Error(
      `Apply visa initial data request failed for ${label}: ${reason}`,
      { cause: error },
    );
  }
}

export async function getApplyVisaInitialData(
  api: ApplyVisaApi,
  input: ApplyVisaSessionInput,
) {
  const evmRequestPromise =
    input.module === "evm" && input.evmRequestId
      ? api.evm.getEVMRequestData({
          evmRequestId: input.evmRequestId,
          host: input.host,
          userId: input.userId,
        })
      : Promise.resolve(null);

  const [nationalities, evmRequest, supportedCurrencies] = await Promise.all([
    loadInitialDataPart(
      "nationalities",
      api.newVisa.getNationalities({
        host: input.host,
        userId: input.userId,
      }),
    ),
    loadInitialDataPart("evm request", evmRequestPromise),
    loadInitialDataPart(
      "supported currencies",
      api.newVisa.getSupportedCurrencies({
        host: input.host,
      }),
    ),
  ]);

  return {
    evmRequest,
    nationalities,
    supportedCurrencies,
  };
}
