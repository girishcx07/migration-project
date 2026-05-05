"use client";

import type { ModuleName } from "@/lib/module-registry";

import type { GetHostDetailsResponse } from "@repo/types";

import { EnterpriseProvider } from "@/components/enterprise-provider";
import { QueryProvider } from "@/components/query-provider";

export function ModuleProviders({
  children,
  domainHost,
  enterprise,
  module,
}: Readonly<{
  children: React.ReactNode;
  domainHost: string;
  enterprise: GetHostDetailsResponse | null;
  module: ModuleName;
}>) {
  return (
    <QueryProvider>
      <EnterpriseProvider
        domainHost={domainHost}
        enterprise={enterprise}
        module={module}
      >
        {children}
      </EnterpriseProvider>
    </QueryProvider>
  );
}
