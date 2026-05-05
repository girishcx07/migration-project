"use client";

import type { ModuleName } from "@/lib/module-registry";
import { createContext, useContext, useMemo } from "react";

import type { GetHostDetailsResponse } from "@repo/types";

interface EnterpriseContextValue {
  domainHost: string;
  enterprise: GetHostDetailsResponse | null;
  module: ModuleName;
}

const EnterpriseContext = createContext<EnterpriseContextValue | null>(null);

export function EnterpriseProvider({
  children,
  domainHost,
  enterprise,
  module,
}: Readonly<EnterpriseContextValue & { children: React.ReactNode }>) {
  const value = useMemo(
    () => ({ domainHost, enterprise, module }),
    [domainHost, enterprise, module],
  );

  return (
    <EnterpriseContext.Provider value={value}>
      {children}
    </EnterpriseContext.Provider>
  );
}

export function useEnterprise() {
  const context = useContext(EnterpriseContext);

  if (!context) {
    throw new Error("useEnterprise must be used within EnterpriseProvider");
  }

  return context;
}
