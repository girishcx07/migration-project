import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@workspace/ui/components/drawer";
import { Button } from "@workspace/ui/components/button";
import { X } from "lucide-react";
import DocumentImage from "../modules/review-visa/components/document-image";

interface MobileDocumentPreviewProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  imageUrl: string;
  title?: React.ReactNode;
}

export const MobileDocumentPreview: React.FC<MobileDocumentPreviewProps> = ({
  isOpen,
  setIsOpen,
  imageUrl,
  title = "Document Preview",
}) => {
  return (
    <Drawer
      open={isOpen}
      onOpenChange={setIsOpen}
      dismissible={false}
      handleOnly={true}
    >
      <DrawerContent className="fixed! inset-0! m-0! mt-0! h-dvh! max-h-dvh! w-full! max-w-full! flex-col rounded-none! border-none! p-0! [&>div.bg-muted]:hidden">
        <DrawerHeader className="relative text-left">
          <DrawerTitle className="pr-6">{title}</DrawerTitle>
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

        <div className="flex flex-1 items-center justify-center overflow-auto p-4 pb-8">
          {imageUrl ? (
            <DocumentImage
              alt="document preview"
              src={imageUrl}
              className="h-full max-h-full w-full rounded-md object-contain drop-shadow-md"
            />
          ) : (
            <div className="flex h-[400px] w-full items-center justify-center rounded-md bg-gray-100 text-sm text-gray-500">
              No preview available
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
