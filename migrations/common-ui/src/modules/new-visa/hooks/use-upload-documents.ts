import { useMutation } from "@tanstack/react-query";
import { client } from "@workspace/orpc/lib/orpc";
import { UploadedDocumentFiles } from "@workspace/types/new-visa";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export function useUploadDocuments({
  onSuccess,
  onFailure,
  onCancel,
}: {
  onSuccess: (docs: UploadedDocumentFiles) => void;
  onFailure?: (file?: File) => void;
  onCancel?: (file?: File) => void;
}) {
  // Track per-file abort controllers
  const abortControllers = useRef<Record<string, AbortController>>({});
  const [activeUploadCount, setActiveUploadCount] = useState(0);

  // Single reusable mutationFn
  const uploadMutation = useMutation({
    mutationKey: ["uploadAndExtractDocuments"],
    mutationFn: async ({
      file,
      nationality_code,
      visaId,
    }: {
      file: File;
      nationality_code: string;
      visaId: string;
    }) => {
      const controller = new AbortController();
      const signal = controller.signal;
      abortControllers.current[file?.name || ""] = controller;

      try {
        const result = await client.visa.uploadAndExtractDocuments(
          {
            document: file,
            nationality_code: nationality_code,
            visa_id: visaId,
          },
          { signal },
        );

        delete abortControllers.current[file?.name || ""];
        return result;
      } catch (error: any) {
        delete abortControllers.current[file?.name || ""];
        if (error.name === "AbortError") {
          throw new DOMException("Upload aborted", "AbortError");
        }
        throw error;
      }
    },
    onError: (error, { file }) => {
      if (error.name === "AbortError") {
        console.log(`${file?.name || ""} upload canceled`);
        onCancel?.(file);
        return;
      }
      toast("Upload Error", {
        description: `Error uploading ${file.name}`,
      });
      onFailure?.(file);
    },
  });

  /**
   * Upload multiple files concurrently
   */
  const handleUploadFile = useCallback(
    async (files: File[], nationality_code: string, visaId: string) => {
      if (!files.length) return;

      // Fire all uploads in parallel
      const uploadPromises = files.map(async (file) => {
        setActiveUploadCount((prev) => prev + 1);
        try {
          const data = await uploadMutation.mutateAsync({
            file,
            nationality_code,
            visaId,
          });
          if (data?.status === "success" && Array.isArray(data.data)) {
            onSuccess(data.data);
          } else {
            toast.error(`Failed to upload ${file.name}`, {
              description: data?.msg || "Something went wrong!",
            });
            onFailure?.(file);
          }
        } catch (err: any) {
          if (err.name === "AbortError") {
            console.log(`${file.name} upload aborted`);
            onCancel?.(file);
          } else {
            toast.error(`Failed to upload ${file.name}`, {
              description: err?.msg ?? "",
            });
            onFailure?.(file);
          }
        } finally {
          setActiveUploadCount((prev) => prev - 1);
        }
      });

      await Promise.allSettled(uploadPromises); // ✅ all run concurrently
    },
    [uploadMutation, onSuccess, onFailure, onCancel],
  );

  /**
   * Cancel one specific file upload
   */
  const cancelUpload = useCallback((fileName: string) => {
    const controller = abortControllers.current[fileName];
    if (controller) {
      controller.abort("Canceled by user");
      delete abortControllers.current[fileName];
    }
  }, []);

  /**
   * Cancel all ongoing uploads
   */
  const cancelAllUploads = useCallback(() => {
    Object.values(abortControllers.current).forEach((c) =>
      c.abort("Canceled by user"),
    );
    abortControllers.current = {};
  }, []);
  return {
    handleUploadFile,
    cancelUpload,
    cancelAllUploads,
    isPending: activeUploadCount > 0 || uploadMutation.isPending,
  };
}
