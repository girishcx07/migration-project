import React, { useState, useRef, useEffect } from "react";
import { Cropper, CropperRef } from "react-mobile-cropper";
import "react-mobile-cropper/dist/style.css";
import { Button } from "@workspace/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@workspace/ui/components/drawer";
import ErrorBoundary from "./error-boundary";
import { Loader2Icon, X } from "lucide-react";

interface MobileDocumentEditorProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  file: File | null;
  onSave: (file: File) => void;
  title?: string;
  description?: string;
}

export const MobileDocumentEditor: React.FC<MobileDocumentEditorProps> = ({
  isOpen,
  setIsOpen,
  file,
  onSave,
  title = "Edit Document",
  description = "Crop the image to fit the required dimensions",
}) => {
  const cropperRef = useRef<CropperRef>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (file && isOpen) {
      const objectUrl = URL.createObjectURL(file);
      setImgUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
        setImgUrl(null);
      };
    }
  }, [file, isOpen]);

  const handleSave = async () => {
    if (!cropperRef.current || !file) return;

    setIsProcessing(true);
    try {
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
      const croppedFile = new File([blob], file.name, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      onSave(croppedFile);
      setIsOpen(false);
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={setIsOpen}
      dismissible={false}
      direction="bottom"
      handleOnly={true}
    >
      <DrawerContent className="fixed! inset-0! m-0! mt-0! h-dvh! max-h-dvh! w-full! max-w-full! flex-col rounded-none! border-none! p-0! [&>div.bg-muted]:hidden">
        <DrawerHeader className="relative text-left">
          <DrawerTitle className="pr-6">{title}</DrawerTitle>
          <DrawerDescription className="pr-6">{description}</DrawerDescription>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DrawerHeader>

        <div className="flex flex-1 flex-col overflow-hidden p-4">
          <ErrorBoundary>
            {imgUrl && (
              <div className="relative h-full w-full flex-1">
                <Cropper
                  src={imgUrl}
                  ref={cropperRef}
                  className="h-full w-full"
                />
              </div>
            )}
            {!imgUrl && (
              <div className="bg-muted text-muted-foreground flex h-full w-full flex-1 items-center justify-center rounded-md text-sm">
                No image selected
              </div>
            )}
          </ErrorBoundary>
        </div>

        <DrawerFooter className="pb-8">
          <Button
            onClick={handleSave}
            disabled={isProcessing || !imgUrl}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
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
};
