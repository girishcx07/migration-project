"use client";
import { createContext, useContext, useMemo, ReactNode } from "react";
import { useAppPathname } from "../platform/navigation";

// Define supported workflows
export type WorkflowType = "evm" | "qr-visa" | "data-sim" | "console";

// Route configuration for each workflow
const WORKFLOW_ROUTES: Record<
  WorkflowType,
  { basePath: string; entryRoute: string }
> = {
  evm: { basePath: "/evm", entryRoute: "/evm/evm-application" },
  "qr-visa": { basePath: "/qr-visa", entryRoute: "/qr-visa/qr-application" },
  "data-sim": {
    basePath: "/data-sim",
    entryRoute: "/data-sim/initialize-application",
  },
  console: { basePath: "/console", entryRoute: "/console" },
};

// Common routes relative to base path
export const ROUTES = {
  NEW_VISA: "/new-visa",
  REVIEW: "/review",
  PAYMENT_SUMMARY: "/payment-summary",
  PAYMENT_CHECKOUT: "/payment-checkout",
  PAYMENT_SUCCESS: "/payment-success",
  TRACK_APPLICATIONS: "/track-applications",
  TRACK_APPLICATION_DETAILS: "/track-applications/visa-application-details",
  SEARCH_APPLICATIONS: "/track-applications/search",
  NOT_FOUND: "/not-found",
  TRACK_SINGLE_APPLICATION: "/track-application/visa-application-details",
  UNAUTHORIZED: "/unauthorized",
} as const;

interface RouteContextValue {
  workflow: WorkflowType;
  basePath: string;
  getRoute: (route: keyof typeof ROUTES) => string;
  buildPath: (relativePath: string) => string;
}

const RouteContext = createContext<RouteContextValue | null>(null);

// Detect workflow from current pathname
function detectWorkflow(pathname: string): WorkflowType {
  if (pathname.startsWith("/qr-visa")) return "qr-visa";
  if (pathname.startsWith("/data-sim")) return "data-sim";
  if (pathname.startsWith("/console")) return "console";
  return "evm"; // default
}

export function RouteContextProvider({
  children,
  workflow: explicitWorkflow,
}: {
  children: ReactNode;
  workflow?: WorkflowType;
}) {
  const pathname = useAppPathname();

  const value = useMemo(() => {
    const workflow = explicitWorkflow || detectWorkflow(pathname);
    const config = WORKFLOW_ROUTES[workflow];

    return {
      workflow,
      basePath: config.basePath,
      getRoute: (route: keyof typeof ROUTES) =>
        `${config.basePath}${ROUTES[route]}`,
      buildPath: (relativePath: string) => `${config.basePath}${relativePath}`,
    };
  }, [pathname, explicitWorkflow]);

  return (
    <RouteContext.Provider value={value}>{children}</RouteContext.Provider>
  );
}

export function useRouteContext() {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error("useRouteContext must be used within RouteContextProvider");
  }
  return context;
}
