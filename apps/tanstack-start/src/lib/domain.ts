export const DOMAIN_HOST_EVM = "evm-uat.visaero.com";
export const DOMAIN_HOST_QR = "qr-app-uat.visaero.com";

interface GetDomainHostParams {
  domainHost: string;
  host?: string;
  moduleType?: "qr-visa" | "evm" | "console" | "b2b" | "enterprise";
}

const normalizeHost = ({
  domainHost,
  host,
  moduleType,
}: GetDomainHostParams): string => {
  if (!domainHost) return "";

  console.log("Original Domain Host:", domainHost);

  const candidate = domainHost?.split(":")[0]?.trim() ?? "";
  if (!candidate) return "";

  if (candidate.includes("localhost")) {
    return moduleType === "evm" ? `${host}-${DOMAIN_HOST_EVM}` : DOMAIN_HOST_QR;
  }

  return domainHost;
};

export const getDomainHost = ({
  domainHost,
  host,
  moduleType = "qr-visa",
}: GetDomainHostParams): string => {
  return normalizeHost({ domainHost, host, moduleType });
};
