"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CropperRef } from "react-mobile-cropper";
import { Cropper } from "react-mobile-cropper";
import "react-mobile-cropper/dist/style.css";
import { LoaderCircle, X } from "lucide-react";

import { Button } from "@repo/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";

export function MobileDocumentEditor({
  description = "Crop the image to fit the required dimensions",
  file,
  isOpen,
  onSave,
  setIsOpen,
  title = "Edit Document",
}: Readonly<{
  description?: string;
  file: File | null;
  isOpen: boolean;
  onSave: (file: File) => void;
  setIsOpen: (open: boolean) => void;
  title?: string;
}>) {
  const cropperRef = useRef<CropperRef>(null);
  const imageUrl = useMemo(
    () => (file && isOpen ? URL.createObjectURL(file) : null),
    [file, isOpen],
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const handleSave = async () => {
    if (!cropperRef.current || !file) return;

    setIsProcessing(true);

    try {
      const canvas = cropperRef.current.getCanvas();
      if (!canvas) return;

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.95);
      });
      if (!blob) return;

      onSave(
        new File([blob], file.name, {
          lastModified: Date.now(),
          type: "image/jpeg",
        }),
      );
      setIsOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Drawer
      direction="bottom"
      dismissible={false}
      handleOnly
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <DrawerContent className="fixed! inset-0! m-0! mt-0! h-dvh! max-h-dvh! w-full! max-w-full! flex-col rounded-none! border-none! p-0! [&>div.bg-muted]:hidden">
        <DrawerHeader className="relative text-left">
          <DrawerTitle className="pr-6">{title}</DrawerTitle>
          <DrawerDescription className="pr-6">{description}</DrawerDescription>
          <Button
            className="bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4 h-8 w-8 rounded-full"
            onClick={() => setIsOpen(false)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DrawerHeader>

        <div className="flex flex-1 flex-col overflow-hidden p-4">
          {imageUrl ? (
            <div className="relative h-full w-full flex-1">
              <Cropper
                className="h-full w-full"
                ref={cropperRef}
                src={imageUrl}
              />
            </div>
          ) : (
            <div className="bg-muted text-muted-foreground flex h-full w-full flex-1 items-center justify-center rounded-md text-sm">
              No image selected
            </div>
          )}
        </div>

        <DrawerFooter className="pb-8">
          <Button
            className="w-full"
            disabled={isProcessing || !imageUrl}
            onClick={handleSave}
            type="button"
          >
            {isProcessing ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
