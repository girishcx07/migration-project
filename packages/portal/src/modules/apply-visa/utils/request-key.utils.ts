export function createRequestKey(
  parts: readonly (number | string | null | undefined)[],
) {
  return parts.map((part) => String(part ?? "")).join("|");
}

export function createUniqueRequestKey(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}:${crypto.randomUUID()}`;
  }

  return `${prefix}:${performance.now()}`;
}
