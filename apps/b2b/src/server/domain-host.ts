import type { ModuleName } from "@/lib/module-registry";

import { moduleNames } from "@/lib/module-registry";

const DOMAIN_HOST_ENV_KEYS: Record<ModuleName, string> = {
  evm: "EVM_DOMAIN_HOST",
  "qr-visa": "QR_VISA_DOMAIN_HOST",
};

export function resolveEnterpriseDomainHost(
  module: ModuleName,
  requestHost: string | null,
  hostPrefix?: string,
) {
  const configuredDomainHost = process.env[DOMAIN_HOST_ENV_KEYS[module]];
  const baseDomainHost =
    requestHost && !requestHost.includes("localhost")
      ? requestHost
      : configuredDomainHost;

  if (!baseDomainHost) {
    throw new Error(
      `Missing ${DOMAIN_HOST_ENV_KEYS[module]} for ${module} domain host`,
    );
  }

  if (module === "evm" && hostPrefix) {
    return `${hostPrefix}-${baseDomainHost}`;
  }

  return baseDomainHost;
}

export function isSupportedModuleName(value: string): value is ModuleName {
  return (moduleNames as readonly string[]).includes(value);
}
