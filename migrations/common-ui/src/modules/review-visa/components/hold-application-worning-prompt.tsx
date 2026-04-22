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

type HoldApplicationWorningPromptProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const HoldApplicationWorningPrompt = ({
    open,
    onOpenChange,
}: HoldApplicationWorningPromptProps) => {
    const handleClose = () => {
        onOpenChange(false);
    };
    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>On Hold Comment</DialogTitle>
                    <DialogDescription>
                        <div className="flex flex-col gap-2">
                            <HoldApplicationDetails />

                        </div>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleClose} type="button">
                        Close
                    </Button>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
