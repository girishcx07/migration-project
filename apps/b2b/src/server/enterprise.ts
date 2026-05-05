import type { ModuleName } from "@/lib/module-registry";
import { cache } from "react";

import { createServerApi } from "@/server/api";
import { resolveEnterpriseDomainHost } from "@/server/domain-host";
import { getCookie, getRequestHost } from "@/server/request";

export const getEnterpriseDataForModule = cache(async (module: ModuleName) => {
  const api = createServerApi();
  const requestHost = getRequestHost();
  const cookieEnterpriseHost = getCookie("host");
  const enterpriseHost = module === "evm" ? cookieEnterpriseHost : undefined;

  const domainHost = resolveEnterpriseDomainHost(
    module,
    requestHost,
    enterpriseHost,
  );

  const response = await api.baseApi.getEnterpriseAccountHostDetails({
    domainHost,
  });

  return {
    data: response.status === "success" ? response.data : null,
    domainHost,
    status: response.status,
  };
});
