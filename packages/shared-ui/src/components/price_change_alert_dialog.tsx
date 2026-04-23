"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@acme/api/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@acme/ui/components/alert-dialog";
import { Checkbox } from "@acme/ui/components/checkbox";
import { Label } from "@acme/ui/components/label";
import { setClientCookie } from "@acme/shared-ui/lib/cookies";

export default function PriceChangeAlertDialog() {
  const trpc = useTRPC();
  const [open, setOpen] = useState(true);
  const [dontShow, setDontShow] = useState(false);
  const { mutate: updatePriceChangeAck } = useMutation(
    trpc.newVisa.updatePriceChangeAck.mutationOptions({
      onSuccess: () => {
        setClientCookie("price_change_ack", "true");
      },
    }),
  );

  const handleOk = () => {
    if (dontShow) {
      updatePriceChangeAck();
    }

    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Important Update</AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription>
          <b>Revised eVisa Prices</b>
          <br />
          <br />
          Please note that effective 24th November, eVisa prices have been revised.
          Kindly review the updated pricing before submitting new applications.
        </AlertDialogDescription>

        <div className="mt-4 flex items-center gap-2">
          <Checkbox
            id="dont-show"
            checked={dontShow}
            onCheckedChange={(value) => setDontShow(Boolean(value))}
          />
          <Label htmlFor="dont-show">Do not show this message again.</Label>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction onClick={handleOk}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
