import { useContext } from "react";

import type { ApplyVisaContextValue } from "../providers/apply-visa-provider";
import { ApplyVisaContext } from "../providers/apply-visa-provider";

export function useApplyVisaContext(): ApplyVisaContextValue {
  const context = useContext(ApplyVisaContext);

  if (!context) {
    throw new Error(
      "useApplyVisaContext must be used within ApplyVisaProvider.",
    );
  }

  return context;
}
