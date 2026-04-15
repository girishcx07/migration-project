import { env } from "@/env";
import { getBaseUrl } from "@/lib/url";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import {
  createTRPCClient,
  httpBatchStreamLink,
  loggerLink,
} from "@trpc/client";
import SuperJSON from "superjson";

import type { AppRouter } from "@acme/api";
import {
  createBrowserTRPCClient,
  TRPCProvider,
  useTRPC,
} from "@acme/api/react";

export const makeTRPCClient = createIsomorphicFn()
  .server(() => {
    return createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (operation) =>
            env.NODE_ENV === "development" ||
            (operation.direction === "down" &&
              operation.result instanceof Error),
        }),
        httpBatchStreamLink({
          transformer: SuperJSON,
          url: getBaseUrl() + "/api/trpc",
          headers() {
            const headers = new Headers(getRequestHeaders() as HeadersInit);
            headers.set("x-trpc-source", "tanstack-start-server");
            return headers;
          },
        }),
      ],
    });
  })
  .client(() => {
    return createBrowserTRPCClient({
      enabledLogger: (operation) =>
        env.NODE_ENV === "development" ||
        (operation.direction === "down" && operation.result instanceof Error),
      source: "tanstack-start-client",
      url: getBaseUrl() + "/api/trpc",
    });
  });

export { TRPCProvider, useTRPC };
