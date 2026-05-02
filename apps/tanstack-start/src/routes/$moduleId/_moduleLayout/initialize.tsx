import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod/v4";

import { InitializingLoader } from "@acme/shared-ui/components/initializing-loader";

const allowedModules = [
  "qr-visa",
  "evm",
  "console",
  "b2b",
  "enterprise",
] as const;

type ModuleId = (typeof allowedModules)[number];

function isValidModuleId(moduleId: string): moduleId is ModuleId {
  return allowedModules.includes(moduleId as ModuleId);
}

const cookieOptions = {
  path: "/",
  sameSite: "none" as const,
  secure: true,
  partitioned: true,
  maxAge: 60 * 60 * 24 * 7,
};

const userSchema = z.object({
  host: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  _id: z.string(),
  user_type: z.string(),
  session_id: z.string(),
  user_preference: z
    .object({
      default_currency: z.string().optional(),
    })
    .optional(),
});

export const initializeQrVisaSession = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      moduleId: z.enum(allowedModules),
      user: userSchema,
    }),
  )
  .handler(async ({ data }) => {
    const { moduleId, user } = data;

    setCookie("module_type", moduleId, cookieOptions);
    setCookie("host", user.host, cookieOptions);
    setCookie("accessToken", user.accessToken, cookieOptions);
    setCookie("refreshToken", user.refreshToken, cookieOptions);
    setCookie("user_id", user._id, cookieOptions);
    setCookie("user_type", user.user_type, cookieOptions);
    setCookie("session_id", user.session_id, cookieOptions);
    setCookie(
      "currency",
      user.user_preference?.default_currency ?? "USD",
      cookieOptions,
    );

    return { status: "success" as const };
  });

export const initializeEvmSession = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      host: z.string(),
      user_id: z.string(),
      session_id: z.string(),
      evm_request_id: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const {} = context;
    const host = data.host.trim();
    const user_id = data.user_id.trim();
    const session_id = data.session_id.trim();
    const evm_request_id = data.evm_request_id?.trim();

    if (!host || !user_id || !session_id) {
      return { status: "unauthorized" as const };
    }

    setCookie("module_type", "evm", cookieOptions);
    setCookie("host", host, cookieOptions);
    setCookie("user_id", user_id, cookieOptions);
    setCookie("session_id", session_id, cookieOptions);

    if (evm_request_id) {
      setCookie("evm_request_id", evm_request_id, cookieOptions);
    } else {
      deleteCookie("evm_request_id", {
        path: "/",
      });
    }

    try {
      const verifyRes = await apiConfig.post(SERVICES.VERIFY_USER_TOKEN, {
        host,
        session_id,
        user_id,
      });

      if (
        verifyRes.data.status !== 1 ||
        verifyRes.data.message !== "success" ||
        !verifyRes.data.data?.accessToken
      ) {
        return { status: "unauthorized" as const };
      }
    } catch (error) {
      console.warn("Error verifying EVM user token:", error);
      return { status: "unauthorized" as const };
    }

    try {
      const externalDetails = await apiConfig.get(
        SERVICES.GET_EXTERNAL_AGENT_DETAILS,
        {
          params: {
            user_id,
            host,
          },
        },
      );

      const { data: externalUser, status } = externalDetails.data;

      const accessToken = externalUser?.accessToken ?? "";
      const refreshToken = externalUser?.refreshToken ?? "";
      const external_user_id = externalUser?.external_user_id ?? "";
      const _id = externalUser?._id ?? "";
      const user_type = externalUser?.user_type ?? "";

      const isValidPayload =
        status === 1 && accessToken && refreshToken && _id && user_type;

      if (!isValidPayload) {
        return { status: "unauthorized" as const };
      }

      setCookie("accessToken", accessToken, cookieOptions);
      setCookie("refreshToken", refreshToken, cookieOptions);
      setCookie(
        "price_change_ack",
        String(externalUser?.price_change_ack ?? false),
        cookieOptions,
      );
      setCookie("external_user_id", external_user_id, cookieOptions);
      setCookie("user_id", _id, cookieOptions);
      setCookie("user_type", user_type, cookieOptions);
      setCookie(
        "currency",
        externalUser?.user_preference?.default_currency ?? "USD",
        cookieOptions,
      );

      return { status: "success" as const };
    } catch (error) {
      console.warn("Error during EVM session initiation:", error);
      return { status: "unauthorized" as const };
    }
  });

export const Route = createFileRoute("/$moduleId/_moduleLayout/initialize")({
  component: RouteComponent,

  loader: async ({ params, context, location }) => {
    const { moduleId } = params;
    const { enterpriseData, queryClient, trpc } = context;

    if (!isValidModuleId(moduleId)) {
      throw notFound();
    }

    if (moduleId === "qr-visa") {
      const host = enterpriseData?.host;

      if (!host) {
        throw notFound();
      }

      let userData;

      try {
        userData = await queryClient.ensureQueryData(
          trpc.qrVisa.registerAnonymousUser.queryOptions({
            host,
          }),
        );
      } catch (err) {
        console.error("Error registering QR Visa anonymous user:", err);

        throw redirect({
          to: "/$moduleId/unauthorized",
          params: { moduleId },
        });
      }

      if (userData?.status !== "success" || !userData) {
        throw redirect({
          to: "/$moduleId/unauthorized",
          params: { moduleId },
        });
      }

      const user = userData;

      const hasValidUserPayload =
        user.host &&
        user.accessToken &&
        user.refreshToken &&
        user._id &&
        user.user_type &&
        user.session_id;

      if (!hasValidUserPayload) {
        throw redirect({
          to: "/$moduleId/unauthorized",
          params: { moduleId },
        });
      }

      await initializeQrVisaSession({
        data: {
          moduleId,
          user,
        },
      });

      throw redirect({
        to: "/$moduleId/new-visa",
        params: { moduleId },
      });
    }

    if (moduleId === "evm") {
      const search = new URLSearchParams(location.searchStr);

      const result = await initializeEvmSession({
        data: {
          host: search.get("host") ?? "",
          user_id: search.get("user_id") ?? "",
          session_id: search.get("session_id") ?? "",
          evm_request_id: search.get("evm_request_id") ?? undefined,
        },
      });

      if (result.status !== "success") {
        throw redirect({
          to: "/$moduleId/unauthorized",
          params: { moduleId },
        });
      }

      throw redirect({
        to: "/$moduleId/new-visa",
        params: { moduleId },
      });
    }

    throw redirect({
      to: "/$moduleId/unauthorized",
      params: { moduleId },
    });
  },
});

function RouteComponent() {
  return <InitializingLoader />;
}
