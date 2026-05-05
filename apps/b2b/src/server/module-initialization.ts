import type { ModuleName } from "@/lib/module-registry";

import { createServerApi } from "@/server/api";
import { resolveEnterpriseDomainHost } from "@/server/domain-host";
import { getRequestHost } from "@/server/request";

export interface ModuleInitializationInput {
  module: ModuleName;
  host?: string;
  userId?: string;
  sessionId?: string;
  evmRequestId?: string;
}

export interface ModuleInitializationResult {
  status: "success" | "error";
  redirect: string;
  cookies: Record<string, string | null>;
}

const SESSION_COOKIE_NAMES = [
  "accessToken",
  "currency",
  "evm_request_id",
  "external_user_id",
  "host",
  "price_change_ack",
  "refreshToken",
  "session_id",
  "user_id",
  "user_type",
] as const;

function getUnauthorizedRedirect(module: ModuleName) {
  return `/${module}/unauthorized`;
}

function createInitializationCookies(module: ModuleName) {
  const cookies: Record<string, string | null> = {
    module_type: module,
  };

  SESSION_COOKIE_NAMES.forEach((name) => {
    cookies[name] = null;
  });

  return cookies;
}

function withCookie(
  cookies: Record<string, string | null>,
  name: string,
  value: string | number | boolean | undefined,
) {
  if (typeof value !== "undefined") {
    cookies[name] = String(value);
  }
}

export async function initializeModuleSession(
  input: ModuleInitializationInput,
): Promise<ModuleInitializationResult> {
  const api = createServerApi();
  const cookies = createInitializationCookies(input.module);

  const moduleType = input.module;
  const requestHost = getRequestHost();
  const domainHost = resolveEnterpriseDomainHost(
    moduleType,
    requestHost,
    input.host,
  );

  try {
    const enterpriseHostDetails =
      await api.baseApi.getEnterpriseAccountHostDetails({ domainHost });

    if (
      enterpriseHostDetails.status !== "success" ||
      !enterpriseHostDetails.data
    ) {
      return {
        cookies,
        redirect: getUnauthorizedRedirect(moduleType),
        status: "error",
      };
    }

    if (moduleType === "qr-visa") {
      const anonymousUser = await api.qrVisa.registerAnonymousSession({
        host: enterpriseHostDetails.data.host,
      });
      const data = anonymousUser.data;

      if (anonymousUser.status !== "success") {
        return {
          cookies,
          redirect: getUnauthorizedRedirect(moduleType),
          status: "error",
        };
      }

      withCookie(cookies, "host", data.host);
      withCookie(cookies, "accessToken", data.accessToken);
      withCookie(cookies, "refreshToken", data.refreshToken);
      withCookie(cookies, "user_id", data.userId);
      withCookie(cookies, "currency", data.defaultCurrency);
      withCookie(cookies, "user_type", data.userType);
      withCookie(cookies, "session_id", data.sessionId);

      return {
        cookies,
        redirect: `/${moduleType}/apply-visa`,
        status: "success",
      };
    }

    const host = input.host?.trim();
    const userId = input.userId?.trim();
    const sessionId = input.sessionId?.trim();
    const evmRequestId = input.evmRequestId?.trim();

    if (!host || !userId || !sessionId) {
      return {
        cookies,
        redirect: getUnauthorizedRedirect(moduleType),
        status: "error",
      };
    }

    withCookie(cookies, "host", host);
    withCookie(cookies, "user_id", userId);
    withCookie(cookies, "session_id", sessionId);
    cookies.evm_request_id = evmRequestId ?? null;

    const verifyResponse = await api.evm.verifyExternalUserToken({
      host,
      sessionId,
      userId,
    });

    if (verifyResponse.status !== "success") {
      return {
        cookies,
        redirect: getUnauthorizedRedirect(moduleType),
        status: "error",
      };
    }

    const externalDetails = await api.evm.getExternalAgentSession({
      accessToken: verifyResponse.data.accessToken,
      host,
      userId,
    });
    const data = externalDetails.data;

    if (externalDetails.status !== "success") {
      return {
        cookies,
        redirect: getUnauthorizedRedirect(moduleType),
        status: "error",
      };
    }

    withCookie(cookies, "accessToken", data.accessToken);
    withCookie(cookies, "refreshToken", data.refreshToken);
    withCookie(cookies, "price_change_ack", data.priceChangeAck);
    withCookie(cookies, "external_user_id", data.externalUserId);
    withCookie(cookies, "user_id", data.userId);
    withCookie(cookies, "user_type", data.userType);
    withCookie(cookies, "currency", data.defaultCurrency);

    return {
      cookies,
      redirect: `/${moduleType}/apply-visa`,
      status: "success",
    };
  } catch (error) {
    console.warn(
      "Module initialization failed:",
      error instanceof Error ? error.message : error,
    );
    return {
      cookies,
      redirect: getUnauthorizedRedirect(moduleType),
      status: "error",
    };
  }
}
