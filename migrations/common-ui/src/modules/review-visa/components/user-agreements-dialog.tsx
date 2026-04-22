import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import React, { useState } from "react";

type UserAgreementDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
  onConfirm: () => void;
  setIsChecked: (value: boolean) => void;
  isChecked: boolean;
  applicants: number;
};

export const UserAgreementDialog = ({
  open,
  onOpenChange,
  variant = "default",
  isLoading = false,
  onConfirm,
  setIsChecked,
  applicants,
  isChecked,
}: UserAgreementDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>User Agreement(s)</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex gap-3">
              <Checkbox
                id="declaration"
                checked={isChecked}
                className="mt-1 h-[20px] w-[20px]"
                onCheckedChange={(value: boolean) => {
                  setIsChecked(value);
                }}
              />
              <Label htmlFor="declaration" className="text-md font-normal">
                I hereby declare that the details furnished for{" "}
                {applicants > 1
                  ? applicants + " APPLICANTS "
                  : applicants + " APPLICANT "}{" "}
                are true and correct to the best of my knowledge and belief.
              </Label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            isLoading={isLoading}
            onClick={onConfirm}
            type="button"
            disabled={!isChecked}
          >
            Confirm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
