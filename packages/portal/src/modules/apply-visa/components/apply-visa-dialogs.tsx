import type { VisaOffer } from "@repo/types/new-visa";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Separator } from "@repo/ui/components/separator";

import type { CommonNotice, NoticeResult } from "../types/apply-visa.types";

export function DestinationNoticeDialog({
  notice,
  onClose,
}: Readonly<{
  notice: CommonNotice;
  onClose: () => void;
}>) {
  return (
    <Dialog open={notice.isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-primary">IMPORTANT NOTICE</DialogTitle>
          <h6>{notice.title}</h6>
        </DialogHeader>
        {notice.htmlContent ? (
          <div
            className="mb-3 max-h-[60vh] overflow-y-auto px-6"
            dangerouslySetInnerHTML={{ __html: notice.htmlContent }}
          />
        ) : (
          <div className="px-6">No Content Found!</div>
        )}
        <DialogFooter className="px-6 pb-6">
          <Button onClick={onClose} type="button">
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function VisaNoticeDialog({
  data,
  onBack,
  onClose,
  onProceed,
  open,
}: Readonly<{
  data: NoticeResult | null;
  onBack: () => void;
  onClose: () => void;
  onProceed: () => void;
  open: boolean;
}>) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="p-0">
        <AlertDialogHeader className="px-6 pt-6">
          <AlertDialogTitle className="text-primary">
            {data?.title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        {data?.description ? (
          <div className="mb-3 max-h-[60vh] overflow-y-auto px-6 whitespace-pre-line">
            {data.description}
          </div>
        ) : (
          <div className="px-6">No Content Found!</div>
        )}
        {data?.subDescription ? (
          <AlertDialogDescription className="px-6 italic">
            {data.subDescription}
          </AlertDialogDescription>
        ) : null}
        <AlertDialogFooter className="px-6 pb-6">
          {data?.cancel ? (
            <Button
              className={data.proceed ? "bg-black hover:bg-black" : ""}
              onClick={onBack}
              type="button"
            >
              {data.proceed ? "Back" : "OK"}
            </Button>
          ) : null}
          {data?.proceed ? (
            <Button onClick={onProceed} type="button">
              Proceed
            </Button>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function PriceChangeAlertDialog({
  onAcknowledge,
  open,
}: Readonly<{
  onAcknowledge: () => void;
  open: boolean;
}>) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Pricing Update</AlertDialogTitle>
          <AlertDialogDescription>
            Visa pricing has been updated. Please review the latest fees before
            continuing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onAcknowledge}>
            I Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function OfferDetailsDialog({
  offer,
  open,
  onOpenChange,
}: Readonly<{
  offer: VisaOffer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-5rem)] w-[calc(100vw-2rem)] overflow-hidden sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl">
            {offer?.visa_details?.duration_display}{" "}
            {offer?.visa_type_display_name}
            {offer?.is_visaero_insurance_bundled ? " + Insurance" : ""}
          </DialogTitle>
          <DialogDescription>
            {offer?.visa_category} | {offer?.processing_type} |{" "}
            {offer?.entry_type} Entry
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mx-6 max-h-[calc(100vh-15rem)] px-6">
          <h3 className="mb-2 text-lg font-bold">Fee Breakup</h3>
          <div className="bg-card mb-2 space-y-3 rounded-lg border px-3 py-4 text-sm shadow-sm">
            <div className="flex justify-between gap-4">
              <div className="flex flex-col">
                <span>{offer?.visa_type_display_name}</span>
                {offer?.is_visaero_insurance_bundled ? (
                  <span className="text-xs">
                    (With Complimentary Insurance)
                  </span>
                ) : null}
              </div>
              <div>
                {offer?.visa_details?.fees.currency}{" "}
                {offer?.visa_details?.fees.adult_govt_fee}
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <div>Service Fee & Taxes</div>
              <div>
                {offer?.visa_details?.fees.currency}{" "}
                {offer?.visa_details?.fees.adult_service_fee}
              </div>
            </div>
            {offer?.visa_details?.fees.convenience_fee ? (
              <div className="flex justify-between gap-4">
                <div>Convenience Fee</div>
                <div>
                  {offer.visa_details.fees.currency}{" "}
                  {offer.visa_details.fees.convenience_fee}
                </div>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 font-bold">
              <div className="text-primary">Total</div>
              <div>
                {offer?.visa_details?.fees.currency}{" "}
                {offer?.visa_details?.fees.total_cost}
              </div>
            </div>
          </div>

          <Separator className="my-3" />
          <div className="bg-card rounded-lg border p-3 font-semibold shadow-sm">
            {offer?.visa_type_display_name}
          </div>
          <div className="my-3 grid grid-cols-3 items-center text-sm font-bold text-gray-800 capitalize">
            <div>{offer?.visa_category}</div>
            <div className="border-x text-center">{offer?.processing_type}</div>
            <div className="text-right">{offer?.entry_type} Entry</div>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              Visa Validity:{" "}
              <span className="text-gray-500">
                {offer?.visa_details?.visa_validity}
              </span>
            </p>
            <p>
              Stay Validity:{" "}
              <span className="text-gray-500">
                {offer?.visa_details?.stay_validity}
              </span>
            </p>
            <p>
              Processing Time:{" "}
              <span className="text-gray-500">
                {offer?.visa_details?.processing_time}
              </span>
            </p>
          </div>

          {offer?.visa_details?.description ? (
            <p className="text-muted-foreground my-2 text-[0.8rem]">
              {offer.visa_details.description}
            </p>
          ) : null}

          {offer?.is_visaero_insurance_bundled ? (
            <>
              <Separator className="my-3" />
              <div className="bg-card rounded-lg border p-3 font-semibold shadow-sm">
                Travel Insurance
              </div>
              <table className="my-2 border-separate border-spacing-y-1 text-sm">
                <tbody>
                  {offer.insurance_details?.insurance_desc.map((item) => (
                    <tr key={`${item.name}-${item.value}`} className="text-xs">
                      <td className="w-1/2 font-normal">{item.name}:</td>
                      <td className="w-1/2 text-gray-500">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function InvalidDocumentDialog({
  onOpenChange,
  onProceed,
  open,
}: Readonly<{
  onOpenChange: (open: boolean) => void;
  onProceed: () => void;
  open: boolean;
}>) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Caution</AlertDialogTitle>
          <AlertDialogDescription>
            Some uploaded documents need review. Re-upload clear copies or
            proceed anyway.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>OK</AlertDialogCancel>
          <AlertDialogAction onClick={onProceed}>
            Proceed Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ResetColumnDialog({
  onConfirm,
  onOpenChange,
  open,
}: Readonly<{
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}>) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Alert</AlertDialogTitle>
          <AlertDialogDescription>
            This action will discard the current application progress. Are you
            sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
