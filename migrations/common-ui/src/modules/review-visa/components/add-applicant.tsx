"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Loader2Icon, PlusIcon } from "lucide-react";

interface AddApplicantProps {
  onAddApplicant?: () => void;
  isPending?: boolean;
  disabled?: boolean;
}

export const AddApplicant = ({
  onAddApplicant,
  isPending,
  disabled
}: AddApplicantProps) => {
  
  return (
    <div
      className={cn(
        "my-2 flex flex-shrink-0 cursor-pointer items-center space-x-4 rounded-md border border-slate-200 bg-gray-50 py-2 pl-2",
        isPending || disabled ? "opacity-50" : "hover:bg-gray-100",
      )}
      onClick={() => isPending || disabled || onAddApplicant?.()}
      role="button"
      aria-disabled={isPending || disabled}
    >
      <div className="flex flex-col items-center justify-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="m-0 rounded-full "
        >
          {isPending ? <Loader2Icon className="animate-spin" /> : <PlusIcon/>}
        </Button>
        <div className=" px-2 h-[12px] space-y-2 text-center text-xs md:text-sm">
          Add Applicant
        </div>
      </div>
    </div>
  );
};
