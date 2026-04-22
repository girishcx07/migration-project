const DOMAIN_HOST_EVM = "evm-uat.visaero.com";
const DOMAIN_HOST_QR = "qr-app-uat.visaero.com";

export type ModuleType = "evm" | "qr-visa";

function normalizeHostValue(value?: string | null): string | undefined {
  if (!value) return undefined;

  const candidate = value.split(",")[0]?.trim();
  if (!candidate) return undefined;

  try {
    return new URL(candidate).hostname;
  } catch {
    const withoutPath = candidate.split("/")[0]?.trim();
    if (!withoutPath) return undefined;

    return withoutPath.split(":")[0]?.trim() || undefined;
  }
}

export function getGeneratedDomainHost(
  domain: string,
  host?: string,
  moduleType: ModuleType = "qr-visa",
): string {
  const normalizedDomain = normalizeHostValue(domain);
  if (!normalizedDomain) return "";

  let domainHost = normalizedDomain;

  if (domainHost.includes("localhost")) {
    domainHost = moduleType === "evm" ? DOMAIN_HOST_EVM : DOMAIN_HOST_QR;
  }

  const normalizedHost = normalizeHostValue(host);
  if (moduleType === "evm" && normalizedHost) {
    domainHost = `${normalizedHost}-${domainHost}`;
  }

  return domainHost;
}

export function getDomainHost(
  domainHost: string,
  host?: string,
  moduleType: ModuleType = "qr-visa",
): string {
  return getGeneratedDomainHost(domainHost, host, moduleType);
}
