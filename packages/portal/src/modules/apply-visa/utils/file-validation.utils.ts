import {
  ACCEPTED_DOCUMENT_EXTENSIONS,
  ACCEPTED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_UPLOAD_SIZE,
} from "../constants/document-upload.constants";

export function isAcceptedDocumentFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const acceptedExtensions = ACCEPTED_DOCUMENT_EXTENSIONS as readonly string[];

  return (
    file.type in ACCEPTED_DOCUMENT_MIME_TYPES ||
    acceptedExtensions.includes(extension)
  );
}

export function isWithinDocumentUploadSize(file: File) {
  return file.size <= MAX_DOCUMENT_UPLOAD_SIZE;
}
