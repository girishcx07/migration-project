


"use client";

import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@workspace/common-ui/lib/react-query";
import { orpc } from "@workspace/orpc/lib/orpc";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import React, { useEffect, useRef, useState } from "react";
import { Cropper, CropperRef } from "react-mobile-cropper";
import "react-mobile-cropper/dist/style.css";
import ErrorBoundary from "../../../components/error-boundary";
import { useApplicationState } from "../context/review-visa-context";
import { toast } from "sonner";

interface DocumentEditorProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const { applicants, selectedDocument, activeApplicantId, applicationId } =
    useApplicationState();
  const [image, setImage] = useState("");


  const docName = selectedDocument?.doc_display_name || "";
  const imgUrl = selectedDocument?.doc_snap[0]?.doc_url || "";
  const docId = selectedDocument?.doc_id || "";
  const docType = selectedDocument?.doc_type || "";


  const applicantName = applicants.find(
    (a) => a.applicantId === activeApplicantId,
  )?.name;

  const cropperRef = useRef<CropperRef>(null);

  const { mutate, isPending } = useMutation(
    orpc.visa.uploadEditedImage.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (data) => {
        if (data?.status === "success") {
          setIsOpen(false);
          queryClient.invalidateQueries({
            queryKey: orpc.visa.getApplicantDocData.key(),
          });
        } else {
          toast.error(data.msg);
        }
      },
    }),
  );

  const handleSave = async () => {
    if (!cropperRef.current) return;

    const canvas = cropperRef.current.getCanvas();
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

    const byteString = atob(dataUrl.split(",")[1] || "");
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([uintArray], { type: "image/jpeg" });
    const file = new File([blob], `${docName}.jpeg`, {
      type: "image/jpeg",
    });

    mutate({
      applicantId: activeApplicantId!,
      applicationId,
      docId,
      docType,
      file,
      docName,
    });
  };

  const loadImage = async (signedUrl: string) => {
    try {
      const res = await fetch(signedUrl, {
        method: "GET",
        cache: "no-store" // important
      });

      if (!res.ok) {
        throw new Error("Failed to load image");
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      return blobUrl;
    } catch (err) {
      console.error("Image load failed:", err);
      return null;
    }
  };



  useEffect(() => {
    const init = async () => {
      const blobUrl = await loadImage(imgUrl || "");
      if (blobUrl) setImage(blobUrl);
    };

    init();

    return () => {
      if (image) URL.revokeObjectURL(image); // cleanup
      setImage("")
    };
  }, [imgUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="h-[90vh] w-[95vw] max-w-lg p-4 sm:p-6">
        {/* 🔴 IMPORTANT: fixed height + overflow control */}
        <div className="flex h-full flex-col overflow-hidden">

          {/* Header */}
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-base font-semibold sm:text-lg">
              {docName && (
                <div className="text-primary text-sm sm:text-base">
                  {applicantName}
                  <span className="tracking-wide text-black">
                    {" "}
                    - {docName}
                  </span>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              Crop the image to fit the required dimensions
            </DialogDescription>
          </DialogHeader>

          {/* 🔴 Cropper Area (controlled scroll) */}
          <div className="flex-1 overflow-hidden py-3">
            <div className="h-full overflow-auto">
              <ErrorBoundary>
                {image && <Cropper
                  src={image}
                  ref={cropperRef}
                  backgroundWrapperClassName="bg-white"
                  backgroundClassName="bg-white"
                  className="w-full h-[300px] sm:h-full rounded"
                  crossOrigin="anonymous"
                />}
              </ErrorBoundary>
            </div>
          </div>

          {/* Footer (always visible) */}
          <DialogFooter className="shrink-0 pt-2">
            <Button
              onClick={handleSave}
              isLoading={isPending}
              className="w-full sm:w-auto"
            >
              Save
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};