"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { ConfirmationDialog } from "../../review-visa/components/confirmation-dialog";
import { usePaymentSummary } from "../context/payment-summary-context";
import { useHandleSubmit } from "../hooks/use-handle-submit";
import { ChildApplicantError } from "./child-applicant-error";
import { useRouteContext } from "@workspace/common-ui/context/route-context";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import { useState } from "react";
import { TermsPolicyModal } from "./terms-policy-modal";
import { getCookie } from "@workspace/common-ui/lib/utils";

export const SubmitApplicationBtn = () => {
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const {
    handleSubmit,
    isSubmitting,
    isConfirming,
    handleConfirm,
    setOpenConfirm,
    openConfirm,
    isOpenErrorModal,
    setIsOpenErrorModal,
    error,
  } = useHandleSubmit();

  const { isDisabledProceed, isSingleApplicantChild, acceptedTnc, setAcceptedTnc } = usePaymentSummary();
  const host = getCookie("host")
  const { workflow } = useRouteContext()

  return (
    <>
      <AlertDialog open={isOpenErrorModal} onOpenChange={setIsOpenErrorModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {
        ["console", "qr-visa"].includes(workflow) && host === "arcube" && (
          <div className="mb-5">
            <label className="flex items-start gap-2 text-sm ">
              <Checkbox id="terms-checkbox" name="terms-checkbox" checked={acceptedTnc} onClick={() => setAcceptedTnc(!acceptedTnc)} />
              <Label htmlFor="terms-checkbox">
                <div>
                  I agree to{" "}
                  <a
                    // href="https://s3.ap-southeast-1.amazonaws.com/visaero.assets/agreements/arcube/arcube_tnc.html"
                    // target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                    onClick={() => setOpenTerms(true)}
                  >
                    Terms of Use
                  </a>{' '}
                  and
                  {" "}  <a
                    // href="https://s3.ap-southeast-1.amazonaws.com/visaero.assets/agreements/arcube/arcube_tnc.html"
                    // href="https://www.arcube.com/privacy-policy"
                    // target="_blank"
                    onClick={() => setOpenPrivacy(true)}
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Privacy Policy</a>
                </div>

              </Label>
            </label>
          </div>
        )
      }

      <Button
        disabled={isDisabledProceed}
        className="w-full"
        isLoading={isConfirming}
        onClick={handleConfirm}
      >
        Proceed
      </Button>
      <ConfirmationDialog
        onConfirm={handleSubmit}
        onOpenChange={setOpenConfirm}
        open={openConfirm}
        isLoading={isSubmitting}
        title="Confirmation"
        description={
          <div>
            <div className="mb-3">
              Confirm your payment to complete the transaction.
            </div>
            {isSingleApplicantChild && <ChildApplicantError />}
          </div>
        }
        confirmText={isSingleApplicantChild ? "Submit Anyway" : "Submit"}
      />

      <TermsPolicyModal
        open={openTerms}
        onOpenChange={setOpenTerms}
        title="Terms of Use"
        url="https://s3.ap-southeast-1.amazonaws.com/visaero.assets/agreements/arcube/arcube_tnc.html"
      />

      <TermsPolicyModal
        open={openPrivacy}
        onOpenChange={setOpenPrivacy}
        title="Privacy Policy"
        url="https://www.arcube.com/privacy-policy"
      />
    </>
  );
};
