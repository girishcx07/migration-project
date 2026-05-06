"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";

interface VisaeroPortalController {
  destroy: () => void;
  getUrl: (config?: VisaeroPortalConfig) => string;
  open: (config?: VisaeroPortalConfig) => VisaeroPortalController;
}

interface VisaeroPortalConfig {
  container?: HTMLElement | null;
  evmRequestId?: string;
  flow?: string;
  host?: string;
  module?: string;
  onFailed?: (payload: VisaeroEventPayload) => void;
  onInitialize?: (payload: VisaeroEventPayload) => void;
  onRouteChange?: (payload: VisaeroEventPayload) => void;
  onSuccess?: (payload: VisaeroEventPayload) => void;
  portalUrl?: string;
  sessionId?: string;
  userId?: string;
}

interface VisaeroEventPayload {
  flow?: string;
  module?: string;
  path?: string;
  status?: string;
  timestamp?: string;
  url?: string;
}

declare global {
  interface Window {
    VisaeroPortal?: {
      initialize: (config: VisaeroPortalConfig) => VisaeroPortalController;
      version: string;
    };
  }
}

const sdkPath = "/visaero-embed.js";

export function SandboxClient() {
  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<VisaeroPortalController | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [portalUrl, setPortalUrl] = useState("");
  const [moduleName, setModuleName] = useState("qr-visa");
  const [sessionId, setSessionId] = useState("sandbox-session");
  const [userId, setUserId] = useState("sandbox-user");
  const [evmRequestId, setEvmRequestId] = useState("sandbox-request");
  const [host, setHost] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    setPortalUrl(window.location.origin);
    setHost(window.location.host);

    if (window.VisaeroPortal) {
      setSdkReady(true);
      return;
    }

    const script = document.createElement("script");

    script.async = true;
    script.src = sdkPath;
    script.onload = () => setSdkReady(true);
    document.head.appendChild(script);

    return () => {
      controllerRef.current?.destroy();
    };
  }, []);

  const addLog = (event: string, payload: VisaeroEventPayload) => {
    setLogs((currentLogs) => [
      `${new Date().toLocaleTimeString()} ${event}: ${JSON.stringify(payload)}`,
      ...currentLogs,
    ]);
  };

  const baseConfig = useMemo(
    () => ({
      evmRequestId,
      host,
      module: moduleName,
      portalUrl,
      sessionId,
      userId,
    }),
    [evmRequestId, host, moduleName, portalUrl, sessionId, userId],
  );

  const codeSample = useMemo(
    () => `<script src="${portalUrl}${sdkPath}" defer></script>
<div id="visaero-portal"></div>
<script>
  window.addEventListener("load", function () {
    window.VisaeroPortal.initialize({
      container: "#visaero-portal",
      portalUrl: "${portalUrl}",
      module: "${moduleName}",
      sessionId: "${sessionId}",
      userId: "${userId}",
      evmRequestId: "${evmRequestId}",
      host: "${host}",
      onInitialize: function (event) {
        console.log("Visaero initialized", event);
      },
      onSuccess: function (event) {
        console.log("Visaero success", event);
      },
      onFailed: function (event) {
        console.error("Visaero failed", event);
      }
    });
  });
</script>`,
    [evmRequestId, host, moduleName, portalUrl, sessionId, userId],
  );

  const initializePortal = (event?: FormEvent) => {
    event?.preventDefault();

    if (!window.VisaeroPortal || !mountRef.current) return;

    controllerRef.current?.destroy();
    controllerRef.current = window.VisaeroPortal.initialize({
      ...baseConfig,
      container: mountRef.current,
      onFailed: (payload) => addLog("onFailed", payload),
      onInitialize: (payload) => addLog("onInitialize", payload),
      onRouteChange: (payload) => addLog("onRouteChange", payload),
      onSuccess: (payload) => addLog("onSuccess", payload),
    });
  };

  const openFlow = (flow: string) => {
    if (!controllerRef.current) {
      initializePortal();
      return;
    }

    controllerRef.current.open({
      ...baseConfig,
      flow,
    });
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section className="space-y-4">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-zinc-500 uppercase">
              Integration sandbox
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Visaero embed SDK</h1>
          </div>

          <form
            className="space-y-3 rounded border border-zinc-200 bg-white p-4 shadow-sm"
            onSubmit={initializePortal}
          >
            <Field label="Portal URL">
              <Input
                onChange={(event) => setPortalUrl(event.target.value)}
                value={portalUrl}
              />
            </Field>
            <Field label="Module">
              <Input
                onChange={(event) => setModuleName(event.target.value)}
                value={moduleName}
              />
            </Field>
            <Field label="Session ID">
              <Input
                onChange={(event) => setSessionId(event.target.value)}
                value={sessionId}
              />
            </Field>
            <Field label="User ID">
              <Input
                onChange={(event) => setUserId(event.target.value)}
                value={userId}
              />
            </Field>
            <Field label="EVM request ID">
              <Input
                onChange={(event) => setEvmRequestId(event.target.value)}
                value={evmRequestId}
              />
            </Field>
            <Field label="Host">
              <Input
                onChange={(event) => setHost(event.target.value)}
                value={host}
              />
            </Field>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button disabled={!sdkReady} type="submit">
                Initialize
              </Button>
              <Button
                disabled={!sdkReady}
                onClick={() => openFlow("payment-success")}
                type="button"
                variant="outline"
              >
                Success
              </Button>
              <Button
                disabled={!sdkReady}
                onClick={() => openFlow("unauthorized")}
                type="button"
                variant="outline"
              >
                Failed
              </Button>
            </div>
          </form>

          <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium">Callback log</p>
            <div className="mt-3 max-h-48 space-y-2 overflow-auto text-xs text-zinc-600">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <pre className="whitespace-pre-wrap" key={log}>
                    {log}
                  </pre>
                ))
              ) : (
                <p>No callbacks received yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div
            className="min-h-[520px] overflow-hidden rounded border border-zinc-200 bg-white shadow-sm"
            ref={mountRef}
          />

          <div className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-medium">Client snippet</p>
            <Textarea
              className="min-h-72 font-mono text-xs"
              readOnly
              value={codeSample}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Label className="grid gap-1.5 text-sm font-medium text-zinc-700">
      {label}
      {children}
    </Label>
  );
}
