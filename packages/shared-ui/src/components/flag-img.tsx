"use client";

import * as React from "react";

import { cn } from "@acme/ui/lib/utils";

type FlagProps = React.ImgHTMLAttributes<HTMLImageElement>;

export function Flag({ className, alt, ...props }: FlagProps) {
  return (
    <img
      alt={alt ?? ""}
      className={cn(
        "h-3.5 w-5 overflow-hidden rounded-[2px] border border-gray-300 bg-white object-contain shadow-sm",
        className,
      )}
      height={14}
      width={24}
      {...props}
    />
  );
}
