"use client";

import type { ToasterProps } from "sonner";
import { Toaster as Sonner } from "sonner";

export function Toaster(props: ToasterProps) {
  return <Sonner theme="system" className="toaster group" {...props} />;
}
