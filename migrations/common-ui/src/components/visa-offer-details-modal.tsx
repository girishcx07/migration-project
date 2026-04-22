import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { getCookie } from "@workspace/common-ui/lib/utils";
import { Separator } from "@workspace/ui/components/separator";
import { Application } from "@workspace/types/review";

type VisaOfferDetailsModalProps = {
  application: Record<string, any> | null | Application;
  isOpenModal: boolean;
  setIsOpenModal: (open: boolean) => void;
};

export const VisaOfferDetailsModal = ({
  application,
  isOpenModal,
  setIsOpenModal,
}: VisaOfferDetailsModalProps) => {
  const host = getCookie("host");
  const modalData = application?.visa_offer;

  return (
    <Dialog open={isOpenModal} modal onOpenChange={setIsOpenModal}>
      <DialogContent className="overflow max-h-[calc(100vh-5rem)] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl">
            {modalData?.visa_details?.duration_display}{" "}
            {modalData?.visa_type_display_name}{" "}
            {modalData?.is_visaero_insurance_bundled ? " + Insurance" : ""}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="-mx-6 max-h-[calc(100vh-20rem)] px-6">
          <h3 className="mb-2 text-lg font-bold">Fee Breakup</h3>
          <div className="mb-2 space-y-3 rounded-sm border border-slate-300 bg-slate-100 px-3 py-4 text-sm shadow-sm">
            <div className="flex justify-between">
              <div className="flex flex-col">
                <span>{modalData?.visa_type_display_name}</span>
                {application?.is_visaero_insurance_bundled && (
                  <span className="text-xs">(With Complimentary Insurance)</span>
                )}
              </div>

              <div>
                {application?.payment_summary?.currency}{" "}
                {application?.payment_summary?.adult_govt_fee}
              </div>
            </div>
            <div className="flex justify-between">
              <div>{host === "resbird" ? "Service Fee" : "Service Fee & Taxes"}</div>
              <div>
                {application?.payment_summary?.currency}{" "}
                {application?.payment_summary?.adult_service_fee}
              </div>
            </div>
            {application?.payment_summary?.convenience_fee && (
              <div className="flex justify-between">
                <div>Convenience Fee</div>
                <div>
                  {application?.payment_summary?.currency}{" "}
                  {application?.payment_summary?.convenience_fee}
                </div>
              </div>
            )}
            {host === "resbird" && application?.payment_summary?.tax_label && (
              <div className="flex justify-between">
                <div>{application?.payment_summary?.tax_label}</div>
                <div>
                  {modalData?.visa_details?.base_fees_structure.currency}{" "}
                  {application?.payment_summary?.tax}
                </div>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <div className="text-primary">Total</div>
              <div>
                {application?.payment_summary?.currency}{" "}
                {application?.payment_summary?.total_payment}
              </div>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="rounded-md border border-slate-300 bg-slate-100 p-3 font-semibold shadow-sm">
            {modalData?.visa_type_display_name}
          </div>
          <div className="my-3 flex h-5 w-full items-center space-x-4 text-sm font-bold text-gray-800 capitalize">
            <div className="flex-1">{modalData?.visa_category}</div>
            <Separator orientation="vertical" />
            <div className="flex-1 text-center">{modalData?.processing_type}</div>
            <Separator orientation="vertical" />
            <div className="flex-1 text-end">{modalData?.entry_type} Entry</div>
          </div>
          <div className="space-y-2 text-sm font-normal">
            <div className="flex">
              <div>Visa Validity: &nbsp;</div>
              <div className="text-gray-500">
                {modalData?.visa_details?.visa_validity}
              </div>
            </div>
            <div className="flex">
              <div>Stay Validity: &nbsp;</div>
              <div className="text-gray-500">
                {modalData?.visa_details?.stay_validity}
              </div>
            </div>
            <div className="flex">
              <div>Processing Time: &nbsp;</div>
              <div className="text-gray-500">
                {modalData?.visa_details?.processing_time}
              </div>
            </div>
          </div>
          {modalData?.visa_details?.description && (
            <p className="text-muted-foreground my-2 text-[0.8rem]">
              {modalData?.visa_details?.description}
            </p>
          )}
          {application?.is_visaero_insurance_bundled && (
            <>
              <Separator className="my-3" />
              <div className="rounded border border-slate-300 bg-slate-100 p-3 font-semibold shadow-sm">
                Travel Insurance
              </div>
              <table className="my-2 border-separate border-spacing-y-1 text-sm">
                <tbody>
                  {application?.insurance_details?.insurance_desc?.map(
                    (a: { name: string; value: string }, i: number) => (
                      <tr key={i} className="text-[0.8rem]">
                        <td className="w-[50%] font-normal">{a.name}:</td>
                        <td className="w-[50%] text-gray-500">{a.value}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
