import { useMutation } from "@tanstack/react-query";
import { orpc } from "@workspace/orpc/lib/orpc";
import { DataAndMsg } from "@workspace/types";
import { useCallback } from "react";

interface Payload {
  applicantId: string;
  applicationId: string;
  docType: string;
  file: File;
}

export function useLinkDocument({
  docType,
  applicantId,
  applicationId,
  onSuccess,
  onFailure,
}: {
  docType: string;
  applicantId: string;
  applicationId: string;
  onSuccess: (data: DataAndMsg, payload: Payload) => void;
  onFailure?: (payload: Payload) => void;
}) {
  const { mutateAsync, isPending } = useMutation(
    orpc.visa.uploadAndLinkDocument.mutationOptions({}),
  );
  const handleUploadFile = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) {
        console.warn("No file selected");
        return;
      }

      const payload = {
        applicantId: applicantId,
        applicationId: applicationId,
        docType,
        file: file,
      };

      console.log("payload before sending >>", payload);
      mutateAsync(payload, {
        onSuccess: (data) => onSuccess(data! as DataAndMsg, payload),
        onError: () => onFailure?.(payload),
      });
    },
    [mutateAsync],
  );

  return {
    handleUploadFile,
    isPending,
  };
}
