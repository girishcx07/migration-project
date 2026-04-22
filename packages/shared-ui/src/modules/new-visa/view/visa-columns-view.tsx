"use client";

import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import type {
  CreateApplicationPayload,
  VisaFees,
  VisaType as VisaTypeData,
} from "@acme/types/new-visa";
import { useTRPC } from "@acme/api/react";
import { useIsMobile } from "@acme/shared-ui/hooks/use-is-mobile";
import { getCookie } from "@acme/shared-ui/lib/cookies";
import {
  cn,
  getResponsiveWidthClass,
  getTravellingToIdentity,
  getVisaNoticeContent,
} from "@acme/shared-ui/lib/new-visa-utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@acme/ui/components/alert-dialog";
import { Button } from "@acme/ui/components/button";

import { NoticeDialog, VisaNoticeDialog } from "../components/notice-dialog";
import PriceChangeAlertDialog from "../components/price_change_alert_dialog";
import VisaColumnCard from "../components/visa-column-card";
import { useVisaColumn } from "../context/visa-columns-context";
import { useVisaOffers } from "../hooks/use-visa-offers";
import UploadDocuments, {
  UploadDocumentsSkeleton,
} from "../sections/upload-documents";
import VisaApplication, {
  VisaApplicationSkeleton,
} from "../sections/visa-application";
import VisaType, { VisaTypeSkeleton } from "../sections/visa-type";

export default function VisaColumnsView({
  onReviewRoute,
}: {
  onReviewRoute: string;
}) {
  const trpc = useTRPC();
  const host = getCookie("host");
  const isPriceChangeAck = getCookie("price_change_ack");
  const isMobile = useIsMobile();
  const {
    columnNumber,
    setColumnNumber,
    currency,
    setCurrency,
    data,
    isUploadingDocuments,
    setVisaOffer,
    setVisaApplicationField,
    setVisaNotice,
    visaNotice,
    commonNotice,
    isNoticeHandled,
    setIsNoticeHandled,
    setCommonNotice,
    shouldTriggerNoticeRef,
  } = useVisaColumn();

  const [isError, setIsError] = useState(false);
  const [isPendingNavigation, startTransition] = useTransition();
  const [isPriceAlert] = useState(isPriceChangeAck === "true");
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  const { visaApplication, visaOffer, uploadedDocuments } = data;
  const emptyVisaFees: VisaFees = {
    adult_govt_fee: "",
    adult_service_fee: "",
    child_govt_fee: "",
    child_service_fee: "",
    currency: "",
    infant_govt_fee: "",
    infant_service_fee: "",
    total_cost: "",
    total_service_fee: "",
  };

  useEffect(() => {
    if (
      columnNumber === 1 &&
      visaApplication.nationality &&
      visaApplication.countryOfOrigin &&
      visaApplication.dateRange &&
      visaApplication.travellingTo
    ) {
      setIsNextDisabled(false);
    } else if (columnNumber === 2 && visaOffer) {
      setIsNextDisabled(false);
    } else {
      setIsNextDisabled(true);
    }
  }, [columnNumber, setIsNextDisabled, visaApplication, visaOffer]);

  const createApplication = useMutation(
    trpc.newVisa.createApplicationWithDocuments.mutationOptions({
      onSuccess: () => {
        startTransition(() => {
          window.location.assign(onReviewRoute);
        });
      },
      onError: () => {
        toast("Error", {
          description: "Failed to create an application",
        });
      },
    }),
  );

  const handleProceed = () => {
    const payload: CreateApplicationPayload = {
      application_created_by_user: "",
      application_type: "qr-visa",
      base_currency_symbol: currency,
      currency,
      documentsArray: uploadedDocuments ?? [],
      duration_type: visaOffer?.visa_details?.duration_type || "",
      insurance_details: visaOffer?.insurance_details,
      is_visaero_insurance_bundled: !!visaOffer?.is_visaero_insurance_bundled,
      is_with_insurance: String(visaOffer?.is_visaero_insurance_bundled),
      journey_end_date: visaApplication.dateRange?.to.toISOString() || "",
      journey_start_date: visaApplication.dateRange?.from.toISOString() || "",
      nationality: visaApplication.nationality?.value || "",
      origin: visaApplication.countryOfOrigin?.value || "",
      platform: "web",
      total_days: visaOffer?.visa_details?.duration_days || "",
      travelling_to: visaApplication.travellingTo?.cioc || "",
      travelling_to_country: visaApplication.travellingTo?.name || "",
      travelling_to_identity: visaOffer?.travelling_to_identity || "",
      user_type: "customer",
      visa_category: visaOffer?.visa_category || "",
      visa_code: visaOffer?.visa_details?.visa_code || "",
      visa_entry_type: visaOffer?.entry_type || "",
      visa_fees: visaOffer?.visa_details?.fees ?? emptyVisaFees,
      visa_id: visaOffer?.visa_details?.visa_id || "",
      visa_processing_type: visaOffer?.processing_type || "",
      visa_type: visaOffer?.visa_type || "",
      visa_type_display_name: visaOffer?.visa_type_display_name || "",
    };

    createApplication.mutate(payload);
  };

  const handleProceedBtnClick = () => {
    const hasDocumentsError = uploadedDocuments?.some(
      (doc) => !doc.is_valid && doc.file_type !== "application/pdf",
    );

    if (uploadedDocuments?.length && hasDocumentsError) {
      setIsError(true);
      return;
    }

    handleProceed();
  };

  const { travellingTo, countryOfOrigin, nationality, dateRange } =
    visaApplication;
  const visaOffersQuery = useVisaOffers(
    {
      currency,
      managed_by: travellingTo?.managed_by as string,
      travelling_to: travellingTo?.value as string,
      travelling_to_identity: getTravellingToIdentity(
        countryOfOrigin,
        nationality,
        travellingTo,
      ),
      type: "qr_app",
    },
    !!currency && !!nationality && !!travellingTo && !!countryOfOrigin,
  );

  const visaOffers = visaOffersQuery.data ?? [];
  const noticeContent = useMemo(
    () =>
      getVisaNoticeContent({
        selectedNationality: nationality?.name as string,
        selectedTravellingTo: travellingTo?.name as string,
        visaOffers,
        visaTypesData: travellingTo?.visa_types as VisaTypeData[],
      }),
    [
      nationality?.name,
      travellingTo?.name,
      travellingTo?.visa_types,
      visaOffers,
    ],
  );

  const isNoticePrompt = noticeContent.navigateToNotification;
  const isCommonNoticeOpen = commonNotice.isOpen;
  const isValidData =
    !!nationality &&
    !!travellingTo &&
    !!countryOfOrigin &&
    !!dateRange?.from &&
    !!dateRange?.to;

  useEffect(() => {
    if ((isNoticePrompt || isCommonNoticeOpen) && columnNumber !== 1) {
      setColumnNumber(1);
    }

    if (isNoticePrompt || isCommonNoticeOpen) {
      return;
    }

    if (!isValidData) {
      setVisaOffer(null);
      if (!isMobile && columnNumber !== 1) {
        setColumnNumber(1);
      }
      return;
    }

    if (!isMobile && columnNumber !== 2) {
      setColumnNumber(2);
    }
  }, [
    columnNumber,
    isCommonNoticeOpen,
    isMobile,
    isNoticePrompt,
    isValidData,
    setColumnNumber,
    setVisaOffer,
  ]);

  useEffect(() => {
    if (
      isMobile ||
      !shouldTriggerNoticeRef.current ||
      !noticeContent ||
      isNoticeHandled
    ) {
      return;
    }

    setVisaNotice({
      data: noticeContent.obj,
      isPendingOpen: commonNotice.isOpen,
      isOpen: noticeContent.navigateToNotification,
    });
  }, [
    commonNotice.isOpen,
    isMobile,
    isNoticeHandled,
    noticeContent,
    setVisaNotice,
    shouldTriggerNoticeRef,
  ]);

  const handleVisaNoticeClose = () => {
    setVisaNotice({
      isOpen: false,
      isPendingOpen: false,
      data: null,
    });
    setIsNoticeHandled(true);
    shouldTriggerNoticeRef.current = false;
    setColumnNumber(1);
    setVisaApplicationField("travellingTo", null);
  };

  const handleMobileNext = () => {
    if (columnNumber === 1) {
      shouldTriggerNoticeRef.current = true;

      if (commonNotice.isOpen) {
        return;
      }

      if (
        noticeContent.navigateToNotification &&
        noticeContent.obj &&
        !isNoticeHandled
      ) {
        setVisaNotice({
          data: noticeContent.obj,
          isPendingOpen: false,
          isOpen: true,
        });
        return;
      }

      setColumnNumber(2);
      return;
    }

    if (columnNumber === 2) {
      setColumnNumber(3);
    }
  };

  const isProceedDisabled =
    columnNumber !== 3 ||
    !uploadedDocuments?.length ||
    isUploadingDocuments ||
    isPendingNavigation;

  return (
    <div className="bg-secondary h-screen">
      <div className="grid h-full grid-rows-[minmax(0,1fr)_auto] gap-2 overflow-hidden p-3 pb-0 md:pb-3">
        <div
          className={cn(
            "hidden min-h-0 overflow-hidden transition-all duration-500 ease-out md:flex md:flex-row md:gap-5",
            getResponsiveWidthClass(columnNumber),
          )}
        >
          <VisaColumnCard title="Visa Application" number={1}>
            <Suspense fallback={<VisaApplicationSkeleton />}>
              <VisaApplication />
            </Suspense>
          </VisaColumnCard>
          <VisaColumnCard
            title="Visa Type"
            cardBodyClassName="px-0 md:p-0 md:pt-0"
            number={2}
          >
            <VisaType setCurrency={setCurrency} />
          </VisaColumnCard>
          <VisaColumnCard
            title="Upload Documents"
            className="p-0 px-0 pt-0 sm:p-0"
            cardBodyClassName="px-0 md:p-0 md:pt-0"
            number={3}
          >
            <UploadDocuments />
          </VisaColumnCard>
        </div>

        <div className="min-h-0 overflow-hidden md:hidden">
          {columnNumber === 1 ? (
            <VisaColumnCard title="Visa Application" number={1}>
              <Suspense fallback={<VisaApplicationSkeleton />}>
                <VisaApplication />
              </Suspense>
            </VisaColumnCard>
          ) : null}
          {columnNumber === 2 ? (
            <VisaColumnCard
              title="Visa Type"
              cardBodyClassName="px-0 md:p-0 md:pt-0"
              number={2}
            >
              <VisaType setCurrency={setCurrency} />
            </VisaColumnCard>
          ) : null}
          {columnNumber === 3 ? (
            <VisaColumnCard
              title="Upload Documents"
              className="p-0 px-0 pt-0 sm:p-0"
              cardBodyClassName="px-0 md:p-0 md:pt-0"
              number={3}
            >
              <UploadDocuments />
            </VisaColumnCard>
          ) : null}
        </div>

        <AlertDialog open={isError} onOpenChange={setIsError}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Caution</AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                {
                  uploadedDocuments?.filter(
                    (doc) =>
                      !doc.is_valid && doc.file_type !== "application/pdf",
                  ).length
                }{" "}
                uploaded document/s are invalid out of total{" "}
                {uploadedDocuments?.length} documents. Please re-upload the
                documents with clear and valid copies.
              </AlertDialogDescription>
              <div className="text-foreground text-sm">
                <div>Possible reasons for invalid documents are:</div>
                <ol className="mt-2 list-inside list-decimal space-y-1">
                  <li>File size is too low.</li>
                  <li>Resolution is too low.</li>
                  <li>The uploaded document is not clear.</li>
                </ol>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>OK</AlertDialogCancel>
              <Button onClick={handleProceed} disabled={isProceedDisabled}>
                {createApplication.isPending || isPendingNavigation ? (
                  <>
                    <LoaderCircle className="mr-2 animate-spin" />
                    Proceed Anyway
                  </>
                ) : (
                  "Proceed Anyway"
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!isPriceAlert && host === "resbird" ? (
          <PriceChangeAlertDialog />
        ) : null}

        <div className="grid w-full grid-cols-[1fr_auto] items-center rounded-t-xl rounded-b-none border bg-white p-3 shadow-sm">
          <div>
            {isMobile && columnNumber !== 1 ? (
              <Button
                variant="outline"
                onClick={() => {
                  if (columnNumber > 1) {
                    if (columnNumber === 3) setVisaOffer(null);
                    setColumnNumber(columnNumber - 1);

                    if (columnNumber === 2) {
                      setVisaApplicationField("travellingTo", null);
                    }
                  }
                }}
                disabled={
                  columnNumber === 1 ||
                  isUploadingDocuments ||
                  isPendingNavigation
                }
              >
                Previous
              </Button>
            ) : null}
          </div>

          {isMobile && columnNumber !== 3 ? (
            <Button onClick={handleMobileNext} disabled={isNextDisabled}>
              Next
            </Button>
          ) : (
            <Button
              onClick={handleProceedBtnClick}
              disabled={isProceedDisabled}
            >
              {createApplication.isPending || isPendingNavigation ? (
                <>
                  <LoaderCircle className="mr-2 animate-spin" />
                  Proceed
                </>
              ) : (
                "Proceed"
              )}
            </Button>
          )}
        </div>
      </div>

      <NoticeDialog
        title={commonNotice.title}
        htmlContent={commonNotice.html_content}
        open={commonNotice.isOpen}
        onClose={() => {
          setColumnNumber(2);
          setCommonNotice({
            isOpen: false,
            title: "",
            html_content: "",
          });
        }}
      />

      <VisaNoticeDialog
        data={visaNotice.data}
        open={visaNotice.isOpen && !visaNotice.isPendingOpen}
        onConfirm={() => {
          setVisaNotice({
            isOpen: false,
            isPendingOpen: false,
            data: null,
          });
          setIsNoticeHandled(true);
          shouldTriggerNoticeRef.current = false;
          setColumnNumber(2);
        }}
        onCancel={handleVisaNoticeClose}
        onClose={() =>
          setVisaNotice({
            isOpen: false,
            isPendingOpen: false,
            data: null,
          })
        }
      />
    </div>
  );
}

export function VisaColumnsViewSkeleton() {
  return (
    <div className="bg-secondary h-screen">
      <div className="flex h-full flex-col overflow-hidden p-3 pb-0">
        <div className="mb-3 flex h-[calc(100vh-6rem)] flex-1 flex-col gap-2 transition-all duration-1000 ease-out md:flex-row md:gap-5">
          <VisaColumnCard title="Visa Application" number={1}>
            <VisaApplicationSkeleton />
          </VisaColumnCard>
          <VisaColumnCard title="Visa Type" number={2}>
            <VisaTypeSkeleton />
          </VisaColumnCard>
          <VisaColumnCard title="Upload Documents" number={3}>
            <UploadDocumentsSkeleton />
          </VisaColumnCard>
        </div>
        <div className="flex w-full items-center justify-end rounded-t-xl rounded-b-none border bg-white p-3 shadow-sm">
          <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
