"use client";

import { useEffect } from "react";
import { useLocation } from "react-router";

const embedStorageKey = "visaero.embed.context";

interface EmbedContext {
  parentOrigin: string;
}

function isEmbedded() {
  return window.parent !== window;
}

function parseEmbedContext(): EmbedContext | null {
  try {
    const raw = window.sessionStorage.getItem(embedStorageKey);

    return raw ? (JSON.parse(raw) as EmbedContext) : null;
  } catch {
    return null;
  }
}

function persistEmbedContext(search: string) {
  const searchParams = new URLSearchParams(search);
  const isVisaeroEmbed = searchParams.get("visaero_embed") === "1";
  const parentOrigin = searchParams.get("parent_origin");

  if (!isVisaeroEmbed && !parentOrigin) return;

  window.sessionStorage.setItem(
    embedStorageKey,
    JSON.stringify({
      parentOrigin: parentOrigin ?? "*",
    } satisfies EmbedContext),
  );
}

function normalizeTargetOrigin(parentOrigin: string) {
  if (!parentOrigin || parentOrigin === "*") return "*";

  try {
    return new URL(parentOrigin).origin;
  } catch {
    return "*";
  }
}

function getRoutePayload(pathname: string) {
  const [module = "", flow = ""] = pathname.split("/").filter(Boolean);

  return {
    flow,
    module,
    path: pathname,
    timestamp: new Date().toISOString(),
  };
}

function getLifecycleEvent(flow: string) {
  if (flow === "initialize") return "initialize";
  if (flow === "payment-success") return "success";
  if (flow === "unauthorized") return "failed";

  return "routeChange";
}

export function EmbedLifecycleBridge() {
  const location = useLocation();

  useEffect(() => {
    if (!isEmbedded()) return;

    persistEmbedContext(location.search);

    const context = parseEmbedContext();

    if (!context) return;

    const payload = getRoutePayload(location.pathname);
    const event = getLifecycleEvent(payload.flow);
    const targetOrigin = normalizeTargetOrigin(context.parentOrigin);

    window.parent.postMessage(
      {
        event,
        payload,
        source: "visaero-portal",
        type: `visaero.portal.${event}`,
      },
      targetOrigin,
    );
  }, [location.pathname, location.search]);

  return null;
}
