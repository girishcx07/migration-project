export const moduleNames = ["evm", "qr-visa"] as const;
export const moduleFlows = [
  "initialize",
  "apply-visa",
  "review",
  "payment-summary",
  "payment-success",
  "application-details",
  "track-applications",
] as const;

export type ModuleName = (typeof moduleNames)[number];
export type ModuleFlow = (typeof moduleFlows)[number];

export const defaultModuleName: ModuleName = "qr-visa";

interface ModuleDefinition {
  title: string;
  description: string;
  initializationPath: "initialize";
  defaultFlow: Exclude<ModuleFlow, "initialize">;
}

export interface ModuleBootstrap {
  module: ModuleName;
  flow: ModuleFlow;
  host: string | null;
  pathname: string;
  moduleTypeHeader: string | null;
}

export const moduleDefinitions: Record<ModuleName, ModuleDefinition> = {
  evm: {
    title: "EVM",
    description: "Primary EVM flow surface",
    initializationPath: "initialize",
    defaultFlow: "apply-visa",
  },
  "qr-visa": {
    title: "QR Visa",
    description: "QR visa flow surface",
    initializationPath: "initialize",
    defaultFlow: "apply-visa",
  },
};

export function isModuleName(value: string): value is ModuleName {
  return (moduleNames as readonly string[]).includes(value);
}

export function getModuleDefinition(moduleName: ModuleName) {
  return moduleDefinitions[moduleName];
}

export function getDisplayLabel(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
