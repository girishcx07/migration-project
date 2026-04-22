import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import React from "react";
import { useApplicationState } from "../context/review-visa-context";

interface ErrorDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ isOpen, setIsOpen }) => {
  const { applicants: applicantState, setActiveApplicant } =
    useApplicationState();

  const handleApplicantClicked = async (appId: string) => {
    console.log("appId >> ", appId);
    setActiveApplicant(appId);
    setIsOpen(false);
  };

  const data = applicantState.filter((a) => a.status !== "completed");

  console.log("applcation state >>", applicantState);
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Error</DialogTitle>
            <DialogDescription>
              The following applicants are missing required information and/or
              documents:
            </DialogDescription>
          </DialogHeader>
          {data.length > 0 ? (
            <div className="max-h-[60vh] w-full space-y-2 overflow-y-auto rounded-md rounded-t-none">
              <ol className="list-decimal pl-8">
                {data.map((a) => (
                  <li className="" key={a.applicantId}>
                    <span className="text-sm">{a.name}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="w-full rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
              Validation failed, but no specific applicants were identified.
              Please refresh and try again. If the issue persists, re-check the
              Documents and Visa Form sections for all applicants.
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ErrorDialog;
