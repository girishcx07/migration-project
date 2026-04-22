import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@workspace/common-ui/lib/react-query";
import { orpc } from "@workspace/orpc/lib/orpc";
import { UploadAndExtractDocumentObj } from "@workspace/types/review";
import { useCallback } from "react";
import { toast } from "sonner";
import { useApplicationState } from "../context/review-visa-context";

export function useUploadAndExtractDocumentsForApplication({
  onSuccess,
  onFailure,
}: {
  onSuccess: (docs: UploadAndExtractDocumentObj[]) => void;
  onFailure?: () => void;
}) {
  const { applicationId } = useApplicationState();
  const { mutateAsync, isPending } = useMutation(
    orpc.visa.uploadAndExtractDocumentForApplication.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["applicationDetails"],
        });
      },
      onError: () => {
        toast("Error uploading files", {
          description: "An error occurred while uploading your files.",
        });
      },
    }),
  );

  const handleUploadFile = useCallback(
    async (acceptedFiles: File[]) => {
      const results = await Promise.all(
        acceptedFiles.map(async (file) => {
          try {
            const response = await mutateAsync(
              { file, applicationId },
              {
                onSuccess: (data) => {
                  if (data?.status === "error") {
                    toast.error(`Failed to upload ${file.name}`, {
                      description: data?.msg || "Something went wrong!",
                    });
                  }
                },
                onError: () => {
                  toast.error(`Failed to upload ${file.name}`, {
                    description:
                      "An error occurred while uploading your files.",
                  });
                },
              },
            );
            const uploadedFile = response.data;

            if (Array.isArray(uploadedFile)) {
              return { data: "success", dataobj: uploadedFile };
            }
            return { data: "error", dataobj: [] };
          } catch (error) {
            console.warn(error);
          }
          return { data: "error", dataobj: [] };
        }),
      );

      const uploadedDocs = results.reduce(
        (acc: UploadAndExtractDocumentObj[], result) => {
          if (result && result.data === "success") {
            return [...acc, ...result.dataobj];
          }
          return acc;
        },
        [],
      );

      if (uploadedDocs.length > 0) {
        onSuccess(uploadedDocs);
        // toast("Files uploaded successfully!", {
        //   description: "Your files have been uploaded successfully.",
        // });
      } else {
        // toast("Upload Failed", {
        //   description: "No files were uploaded successfully.",
        // });
        onFailure?.();
      }
    },
    [mutateAsync, onSuccess, onFailure],
  );

  return {
    handleUploadFile,
    isPending,
  };
}
