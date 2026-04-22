import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import React from "react";

interface ReusableModalProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  open: boolean;
  isCTA?: boolean;
  submitDisabled?: boolean;
  isPending?: boolean
}

export const PromptModal = ({
  title = "Modal Title",
  description = "",
  children,
  open,
  onSubmit,
  onCancel,
  isCTA,
  submitText = "Submit",
  cancelText = "Cancel",
  submitDisabled = false,
  isPending = false
}: ReusableModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent
        className="mr-2 sm:max-w-[425px]"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="text-start">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-start">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="mt-4">{children}</div>
        {isCTA && (
          <div className="mt-6 flex justify-end gap-2">
            <Button
              className="min-w-[80px]"
              variant="outline"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
            <Button
              className="min-w-[80px]"
              onClick={onSubmit}
              isLoading={isPending}
              disabled={submitDisabled}
            >
              {submitText}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PromptModal;
