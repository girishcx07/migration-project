"use client";

import * as React from "react";
import { Image as UnpicImage } from "@unpic/react";
import { cn } from "@workspace/ui/lib/utils";
import type { ImageSource } from "../types/image";

export type AppImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src"
> & {
  src: ImageSource;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
};

const resolveSrc = (src: ImageSource): string =>
  typeof src === "string" ? src : src.src;
const Unpic = UnpicImage as unknown as React.ComponentType<
  Record<string, unknown>
>;

export const AppImage = ({
  src,
  alt,
  fill,
  priority: _priority,
  sizes,
  quality: _quality,
  placeholder,
  blurDataURL: _blurDataURL,
  width: rawWidth,
  height: rawHeight,
  className,
  style: _style,
  onLoad,
  ...imgProps
}: AppImageProps) => {
  const source = typeof src === "string" ? { src } : src;
  const width =
    typeof rawWidth === "number"
      ? rawWidth
      : typeof source.width === "number"
        ? source.width
        : undefined;
  const height =
    typeof rawHeight === "number"
      ? rawHeight
      : typeof source.height === "number"
        ? source.height
        : undefined;
  const [isLoading, setIsLoading] = React.useState(placeholder === "blur");
  const loadingClassName =
    placeholder === "blur"
      ? isLoading
        ? "blur-lg"
        : "blur-0"
      : "";

  const mergedClassName = cn(
    "transition-all duration-500 ease-out",
    loadingClassName,
    className,
  );

  if (fill || !width || !height) {
    return (
      <Unpic
        {...imgProps}
        src={resolveSrc(src)}
        alt={alt || ""}
        sizes={sizes}
        layout="fullWidth"
        className={mergedClassName}
        onLoad={(event: React.SyntheticEvent<HTMLImageElement, Event>) => {
          setIsLoading(false);
          onLoad?.(event);
        }}
      />
    );
  }

  return (
    <Unpic
      {...imgProps}
      src={resolveSrc(src)}
      alt={alt || ""}
      sizes={sizes}
      layout="constrained"
      width={width}
      height={height}
      className={mergedClassName}
      onLoad={(event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setIsLoading(false);
        onLoad?.(event);
      }}
    />
  );
};
