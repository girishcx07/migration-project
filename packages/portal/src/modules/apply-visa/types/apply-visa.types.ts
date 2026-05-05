import type { Demand, RequiredDocument } from "@repo/types/new-visa";

export type VisaDocument = RequiredDocument | Demand;

export interface CommonNotice {
  htmlContent: string;
  isOpen: boolean;
  title: string;
}

export interface NoticeResult {
  cancel: boolean;
  description: string;
  proceed: boolean;
  subDescription?: string;
  title: string;
}

export interface LatestActionContext {
  isCurrent: () => boolean;
  runAction: <T>(callback: () => Promise<T>) => Promise<T>;
  signal: AbortSignal;
}

export type LatestActionTask = (context: LatestActionContext) => Promise<void>;
