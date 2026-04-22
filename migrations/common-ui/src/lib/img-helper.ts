import type { ImageSource } from "../types/image";

export const getStaticImageFromPath = (
  path: ImageSource
): string => (typeof path === "string" ? path : path.src) || "";

export const generateAltTextForImage = (altText: string): string =>
  altText || String(Math.random());
