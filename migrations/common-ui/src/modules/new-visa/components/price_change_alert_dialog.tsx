import { useMutation, useQuery } from "@tanstack/react-query";
import { setClientCookie } from "@workspace/common-ui/lib/utils";
import { orpc } from "@workspace/orpc/lib/orpc";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
} from "@workspace/ui/components/alert-dialog";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import { useState } from "react";

const PriceChangeAlertDialog = () => {
    const [open, setOpen] = useState(true);
    const [dontShow, setDontShow] = useState(false);


    // const { refetch: UpdatePriceChangeAck } = useQuery(orpc.visa.updatePriceChangeAck.queryOptions())

    const { mutate: updatePriceChangeAck } = useMutation(
        orpc.visa.updatePriceChangeAck.mutationOptions({
            onSuccess: (res) => {
                console.log("updatePriceChangeAck", res);
                setClientCookie("price_change_ack", "true")
                // you can trigger toast, update UI, refetch, etc.
            },
        })

    );

    const handleOk = () => {
        if (dontShow) {
            updatePriceChangeAck(undefined);
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

                {/* Checkbox */}
                <div className="flex items-center gap-2 mt-4">
                    <Checkbox
                        id="dont-show"
                        checked={dontShow}
                        onCheckedChange={(val) => setDontShow(Boolean(val))}
                    />
                    <Label htmlFor="dont-show">Do not show this message again.</Label>
                </div>

                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={handleOk}
                    >
                        OK
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default PriceChangeAlertDialog;
