"use client";

import type { ModuleName } from "@/lib/module-registry";
import { useEffect } from "react";
import InitializingLoader from "@/components/initializing-loader";
import { useSearchParams } from "react-router";

import { initializeModuleSession } from "./actions";

function setClientCookie(name: string, value: string | null) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  if (value === null) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${secure}`;
    return;
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secure}`;
}

export function ModuleInitializeClient({ module }: { module: ModuleName }) {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let cancelled = false;
    const getParam = (...names: string[]) => {
      for (const name of names) {
        const value = searchParams.get(name)?.trim();

        if (value) return value;
      }

      return undefined;
    };

    async function initialize() {
      try {
        const result = await initializeModuleSession({
          evmRequestId: getParam("evm_request_id", "evmRequestId"),
          host: getParam("host"),
          module,
          sessionId: getParam("session_id", "sessionId"),
          userId: getParam("user_id", "userId"),
        });

        if (cancelled) return;

        Object.entries(result.cookies).forEach(([name, value]) => {
          setClientCookie(name, value);
        });

        window.location.replace(result.redirect);
      } catch (error) {
        console.warn("Module initialization action failed:", error);

        if (!cancelled) {
          window.location.replace(`/${module}/unauthorized`);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [module, searchParams]);

  return (
    <InitializingLoader
      message="Preparing your session..."
      subMessage={`Setting up ${module} application flow.`}
    />
  );
}
