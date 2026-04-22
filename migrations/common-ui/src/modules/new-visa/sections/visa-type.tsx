"use client";
import { useQuery } from "@tanstack/react-query";

import {
  formatNumber,
  getCookie,
  getTravellingToIdentity,
  getVisaNoticeContent,
} from "@workspace/common-ui/lib/utils";
import { VisaOffer, VisaType as VisaTypeData } from "@workspace/types/new-visa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import CurrencySelect from "../components/currency-select";
import { MaxWidthContainer } from "../components/max-width-container";
import VisaOfferCard, {
  VisaOfferCardSkeleton,
} from "../components/visa-offer-card";
import { useVisaColumn } from "../context/visa-columns-context";
import { orpc } from "@workspace/orpc/lib/orpc";
import { useIsMobile } from "@workspace/common-ui/hooks/use-is-mobile";
import { useVisaOffers } from "../hooks/use-visa-offers";

interface VisaTypeProps {
  defaultCurrency?: string;
  setCurrency: (currency: string) => void;
}

const VisaType: React.FC<VisaTypeProps> = ({ setCurrency }) => {
  const [selectedVisaOffer, setSelectedVisaOffer] = useState<number | null>(
    null,
  );
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modalData, setModalData] = useState<VisaOffer | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null); // Ref for ScrollArea
  const isMobile = useIsMobile();

  const host = getCookie("host");

  const {
    currency,
    columnNumber,
    data: mainData,
    setVisaOffer,
    setColumnNumber,
    commonNotice,
    setVisaNotice,
  } = useVisaColumn();
  const {
    visaApplication: { nationality, travellingTo, countryOfOrigin },
    visaOffer,
  } = mainData;

  const isQueryEnabled =
    !!currency &&
    !!nationality &&
    !!travellingTo &&
    !!countryOfOrigin &&
    columnNumber > 1;

  const moduleType =
    getCookie("module_type") === "qr-visa" ? "qr_app" : "apply_new_visa";

  const payload = {
    currency: currency as string,
    managed_by: travellingTo?.managed_by as string,
    travelling_to: travellingTo?.value as string,
    travelling_to_identity: getTravellingToIdentity(
      countryOfOrigin,
      nationality,
      travellingTo,
    ),
    type: moduleType,
  };

  const { data, isFetching, isPending } = useVisaOffers(payload, isQueryEnabled);


  const visaOffers = Array.isArray(data?.data) ? data?.data : [];

  useEffect(() => {
    if (columnNumber !== 3) {
      setSelectedVisaOffer(null);
    }
  }, [columnNumber]);

  // useEffect(() => {
  //   if (columnNumber === 2) {
  //     const noticeContent = getVisaNoticeContent({
  //       selectedNationality: nationality?.name as string,
  //       selectedTravellingTo: travellingTo?.name as string,
  //       visaOffers: visaOffers,
  //       visaTypesData: travellingTo?.visa_types as VisaTypeData[],
  //     });
  //     setVisaNotice({
  //       data: noticeContent.obj,
  //       isPendingOpen: commonNotice.isOpen,
  //       isOpen: noticeContent.navigateToNotification,
  //     });
  //   }
  // }, [visaOffers, columnNumber, commonNotice.isOpen]);

  useEffect(() => {
    const index = visaOffers.findIndex((offer) => {
      const targetInsurance = Boolean(visaOffer?.is_visaero_insurance_bundled);
      const currentInsurance = Boolean(offer?.is_visaero_insurance_bundled);

      return (
        offer._id === visaOffer?._id && currentInsurance === targetInsurance
      );
    });
    setSelectedVisaOffer(index);
  }, [visaOffers, visaOffer]);

  // Handle visa card selection
  const handleVisaCardClicked = (visa: VisaOffer, index: number | null) => {
    setSelectedVisaOffer(index);
    setVisaOffer(visa);
    !isMobile && setColumnNumber(3);
  };

  // Reset modal ScrollArea and parent page scroll position when isOpenModal changes
  useEffect(() => {
    // Reset modal ScrollArea
    if (isOpenModal && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-slot="card-content"]',
      ) as HTMLDivElement | null;
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }

    // Reset parent page scroll position
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [isOpenModal]);

  return (
    <div className="m-0 h-full w-full overflow-x-hidden">
      <MaxWidthContainer className="h-full w-full">
        {/* Sticky Currency Select */}
        <div
          className={`sticky top-0 z-50 flex w-full items-center justify-end border-b bg-white px-3 py-2`}
        >
          <CurrencySelect
            currency={currency}
            className="min-w-4"
            onSelect={setCurrency}
          />
        </div>

        <div className="relative mt-3 flex w-full flex-col gap-2 px-2">
          {isFetching || isPending ? (
            <VisaTypeSkeleton />
          ) : !visaOffers || visaOffers?.length === 0 ? (
            <MaxWidthContainer className="text-muted-foreground flex h-full items-center justify-center">
              No visa offers available
            </MaxWidthContainer>
          ) : (
            visaOffers?.map((offer, i: number) => (
              <VisaOfferCard
                key={i}
                visaOffer={offer}
                index={i}
                selectedVisa={selectedVisaOffer}
                handleVisaClicked={handleVisaCardClicked}
                setIsOpenModal={setIsOpenModal}
                setModalData={setModalData}
              />
            ))
          )}
        </div>
      </MaxWidthContainer>

      <Dialog open={isOpenModal} modal onOpenChange={setIsOpenModal}>
        <DialogContent className="overflow max-h-[calc(100vh-5rem)] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-primary text-xl">
              {modalData?.visa_details?.duration_display}{" "}
              {modalData?.visa_type_display_name}{" "}
              {modalData?.is_visaero_insurance_bundled ? " + Insurance" : ""}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea
            ref={scrollAreaRef}
            className="-mx-6 max-h-[calc(100vh-20rem)] px-6"
          >
            <h3 className="mb-2 text-lg font-bold">Fee Breakup</h3>
            <div className="mb-2 space-y-3 rounded-sm border border-slate-300 bg-slate-100 px-3 py-4 text-sm shadow-sm">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span>
                    {modalData?.visa_type_display_name}
                    {/* &nbsp; */}
                    {/* {modalData?.is_visaero_insurance_bundled
                    ? " + Insurance Fee"
                    : ""} */}
                  </span>
                  {modalData?.is_visaero_insurance_bundled && (
                    <span className="text-xs">
                      (With Complimentary Insurance)
                    </span>
                  )}
                </div>

                <div>
                  {modalData?.visa_details?.fees.currency}{" "}
                  {modalData?.visa_details?.fees.adult_govt_fee}
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  {host === "resbird" ? "Service Fee" : "Service Fee & Taxes"}
                </div>
                <div>
                  {modalData?.visa_details?.fees.currency}{" "}
                  {modalData?.visa_details?.fees.adult_service_fee}
                </div>
              </div>
              {modalData?.visa_details?.fees?.convenience_fee && (
                <div className="flex justify-between">
                  <div>Convenience Fee</div>
                  <div>
                    {modalData?.visa_details.fees.currency}{" "}
                    {modalData?.visa_details.fees?.convenience_fee}
                  </div>
                </div>
              )}
              {host === "resbird" &&
                modalData?.visa_details?.fees?.tax_label && (
                  <div className="flex justify-between">
                    <div>{modalData?.visa_details?.fees?.tax_label}</div>
                    <div>
                      {modalData?.visa_details?.fees.currency}{" "}
                      {modalData?.visa_details?.fees?.tax}
                    </div>
                  </div>
                )}
              <div className="flex justify-between font-bold">
                <div className="text-primary">Total</div>
                <div>
                  {modalData?.visa_details?.fees.currency}{" "}
                  {modalData?.visa_details?.fees.total_cost}
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
              <div className="flex-1 text-center">
                {modalData?.processing_type}
              </div>
              <Separator orientation="vertical" />
              <div className="flex-1 text-end">
                {modalData?.entry_type} Entry
              </div>
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
                {modalData?.visa_details.description}
              </p>
            )}
            {modalData?.is_visaero_insurance_bundled && (
              <>
                <Separator className="my-3" />
                <div className="rounded border border-slate-300 bg-slate-100 p-3 font-semibold shadow-sm">
                  Travel Insurance
                </div>
                <table className="my-2 border-separate border-spacing-y-1 text-sm">
                  <tbody>
                    {modalData?.insurance_details?.insurance_desc?.map(
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
    </div>
  );
};

export default VisaType;

export const VisaTypeSkeleton = () => {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <VisaOfferCardSkeleton key={i} />
      ))}
    </>
  );
};
