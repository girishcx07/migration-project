import type { ModuleName } from "@/lib/module-registry";

import { getApplyVisaInitialData } from "@repo/portal/queries/apply-visa";

import { createServerApi } from "@/server/api";
import { getCookie } from "@/server/request";

export function getApplyVisaSession(module: ModuleName) {
  const accessToken = getCookie("accessToken");
  const host = getCookie("host");
  const userId = getCookie("user_id");
  const evmRequestId = getCookie("evm_request_id");

  if (!accessToken || !host || !userId || (module === "evm" && !evmRequestId)) {
    return null;
  }

  return {
    accessToken,
    evmRequestId,
    host,
    userId,
  };
}

export async function getApplyVisaData(module: ModuleName) {
  const session = getApplyVisaSession(module);

  if (!session) {
    return {
      data: null,
      status: "error" as const,
    };
  }

  const api = createServerApi(session.accessToken);
  try {
    const data = await getApplyVisaInitialData(api, {
      evmRequestId: session.evmRequestId,
      host: session.host,
      module,
      userId: session.userId,
    });

    return {
      data,
      status: "success" as const,
    };
  } catch (error) {
    console.warn(
      "Apply visa initial data failed:",
      error instanceof Error ? error.message : error,
    );

    return {
      data: null,
      status: "error" as const,
    };
  }
}
