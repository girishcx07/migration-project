"use client";

import type { QueryClient } from "@tanstack/react-query";
import type { TRPCClient } from "@trpc/client";
import type { LoggerLinkOptions } from "@trpc/client/links/loggerLink";
import type {
  DefaultFeatureFlags,
  TRPCOptionsProxy,
} from "@trpc/tanstack-react-query";
import type * as React from "react";
import {
  createTRPCClient,
  httpBatchStreamLink,
  loggerLink,
} from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import SuperJSON from "superjson";

import type { AppRouter } from "./root";

type LoggerEnabledFn = NonNullable<LoggerLinkOptions<AppRouter>["enabled"]>;

export interface BrowserTRPCClientOptions {
  enabledLogger?: LoggerEnabledFn;
  headers?: () => Headers | Promise<Headers>;
  source: string;
  url: string;
}

const trpcReact = createTRPCContext<AppRouter>();

export interface TRPCProviderProps {
  children: React.ReactNode;
  queryClient: QueryClient;
  trpcClient: TRPCClient<AppRouter>;
}

export function TRPCProvider(props: TRPCProviderProps) {
  return <trpcReact.TRPCProvider {...props} />;
}

export function useTRPC(): TRPCOptionsProxy<AppRouter, DefaultFeatureFlags> {
  return trpcReact.useTRPC();
}

export function createBrowserTRPCClient(options: BrowserTRPCClientOptions) {
  return createTRPCClient<AppRouter>({
    links: [
      loggerLink({
        enabled: options.enabledLogger,
      }),
      httpBatchStreamLink({
        transformer: SuperJSON,
        url: options.url,
        async headers() {
          const headers = (await options.headers?.()) ?? new Headers();
          headers.set("x-trpc-source", options.source);
          return headers;
        },
      }),
    ],
  });
}
