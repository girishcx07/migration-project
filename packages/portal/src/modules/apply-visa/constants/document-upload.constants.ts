export const ACCEPTED_DOCUMENT_MIME_TYPES = {
  "application/pdf": ["pdf"],
  "image/jpeg": ["jpg", "jpeg", "jfif"],
  "image/png": ["png"],
} as const;

export const ACCEPTED_DOCUMENT_EXTENSIONS = Object.values(
  ACCEPTED_DOCUMENT_MIME_TYPES,
).flat();

export const DOCUMENT_DROPZONE_ACCEPT = Object.fromEntries(
  Object.entries(ACCEPTED_DOCUMENT_MIME_TYPES).map(([mimeType, extensions]) => [
    mimeType,
    extensions.map((extension) => `.${extension}`),
  ]),
);

export const MAX_DOCUMENT_UPLOAD_SIZE = 20 * 1024 * 1024;

export const DOCUMENT_UPLOAD_REQUIREMENTS = `JPG, JPEG, JFIF, PNG, or PDF only. Max ${(
  MAX_DOCUMENT_UPLOAD_SIZE /
  (1024 * 1024)
).toFixed()} MB per file.`;
