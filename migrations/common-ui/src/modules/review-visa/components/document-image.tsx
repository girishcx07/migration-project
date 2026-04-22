import React, { useState } from "react";
import { AppImageProps } from "../../../platform/image";
import { cn } from "@workspace/ui/lib/utils";
import { File } from "lucide-react";

interface ImageProps extends AppImageProps {
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  fallbackRender?: React.ReactNode;
}

const DocumentImage = ({
  src,
  onError,
  alt = "document",
  width,
  height,
  className,
  fallbackRender,
  ...rest
}: ImageProps) => {
  const [error, setError] = useState(false);

  if (error && !fallbackRender) {
    return (
      <div
        className={cn(
          "flex h-full min-h-[230px] w-full flex-col items-center justify-center gap-3 border border-t-white bg-gray-100 text-2xl font-bold text-slate-400 sm:text-sm",
          className,
        )}
      >
        <File height={42} width={42} />
        <span>Document not found</span>
      </div>
    );
  }

  if (error && fallbackRender) {
    return fallbackRender;
  }

  return (
    <img
      {...rest}
      suppressHydrationWarning
      src={typeof src === "string" ? src : src?.src || ""}
      alt={alt}
      width={typeof width === "number" ? width : undefined}
      height={typeof height === "number" ? height : undefined}
      loading="lazy"
      className={cn("h-full w-full object-contain object-center duration-700 ease-in-out", className)}
      onError={(e) => {
        setError(true);
        onError?.(e as React.SyntheticEvent<HTMLImageElement, Event>);
      }}
    />
  );
};

export default DocumentImage;


