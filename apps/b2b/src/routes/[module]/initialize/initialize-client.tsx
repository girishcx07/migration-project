"use client";

import type { ModuleName } from "@/lib/module-registry";
import { useEffect } from "react";
import InitializingLoader from "@/components/initializing-loader";
import { useNavigate, useSearchParams } from "react-router";

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    async function initialize() {
      const result = await initializeModuleSession({
        evmRequestId: searchParams.get("evm_request_id")?.trim(),
        host: searchParams.get("host")?.trim(),
        module,
        sessionId: searchParams.get("session_id")?.trim(),
        userId: searchParams.get("user_id")?.trim(),
      });

      Object.entries(result.cookies).forEach(([name, value]) => {
        setClientCookie(name, value);
      });

      void navigate(result.redirect, { replace: true });
    }

    void initialize();
  }, [searchParams]);

  return (
    <InitializingLoader
      message="Preparing your session..."
      subMessage={`Setting up ${module} application flow.`}
    />
  );
}
