import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import HoldApplicationDetails from "../sections/hold-application-details";

type HoldApplicationConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  onConfirm: () => void;
  onCheckedChange: (value: boolean) => void;
  isChecked: boolean;
  holdComment: string;
  setHoldComment: (value: string) => void;
};

export const HoldApplicationConfirmationDialog = ({
  open,
  onOpenChange,
  isLoading = false,
  onConfirm,
  onCheckedChange,
  isChecked,
  holdComment,
  setHoldComment,
}: HoldApplicationConfirmationDialogProps) => {
  const handleClose = () => {
    setHoldComment("");
    onCheckedChange(false);
    onOpenChange(false);
  };

  const handleSubmit = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirmation Required</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col gap-2">
              <HoldApplicationDetails />
              <p>
                Please confirm if the required document/information issue is
                fixed.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Checkbox
                id="declaration"
                checked={isChecked}
                onCheckedChange={onCheckedChange}
                className="mt-1 h-[20px] w-[20px]"
              />
              <Label
                htmlFor="declaration"
                className="text-md leading-relaxed font-normal text-black"
              >
                Mark as Resolved
              </Label>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Label htmlFor="comments" className="text-md font-medium">
                Comments (optional)
              </Label>
              <Textarea
                id="comments"
                value={holdComment}
                onChange={(e) => setHoldComment(e.target.value)}
                placeholder="Enter additional comments here..."
              />
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} type="button">
            Close
          </Button>
          <Button
            isLoading={isLoading}
            onClick={handleSubmit}
            type="button"
            disabled={!isChecked}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
