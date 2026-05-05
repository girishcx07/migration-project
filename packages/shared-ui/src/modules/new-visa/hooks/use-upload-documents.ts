"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useTRPC } from "@repo/api/react";
import type { UploadedDocumentFiles } from "@repo/types/new-visa";

export function useUploadDocuments({
  onSuccess,
  onFailure,
  onCancel,
}: {
  onSuccess: (docs: UploadedDocumentFiles) => void;
  onFailure?: (file?: File) => void;
  onCancel?: (file?: File) => void;
}) {
  const trpc = useTRPC();
  const [activeUploadCount, setActiveUploadCount] = useState(0);

  const uploadMutation = useMutation(
    trpc.newVisa.uploadAndExtractDocuments.mutationOptions(),
  );

  const handleUploadFile = useCallback(
    async (files: File[], nationalityCode: string, visaId: string) => {
      if (!files.length) {
        return;
      }

      const uploadPromises = files.map(async (file) => {
        setActiveUploadCount((prev) => prev + 1);

        try {
          const data = await uploadMutation.mutateAsync({
            document: file,
            nationality_code: nationalityCode,
            visa_id: visaId,
          });
          onSuccess(data);
        } catch (error) {
          toast.error(`Failed to upload ${file.name}`);
          onFailure?.(file);
        } finally {
          setActiveUploadCount((prev) => prev - 1);
        }
      });

      await Promise.allSettled(uploadPromises);
    },
    [onCancel, onFailure, onSuccess, uploadMutation],
  );

  const cancelAllUploads = useCallback(() => {
    onCancel?.();
  }, []);

  return {
    handleUploadFile,
    cancelAllUploads,
    isPending: activeUploadCount > 0 || uploadMutation.isPending,
  };
}
