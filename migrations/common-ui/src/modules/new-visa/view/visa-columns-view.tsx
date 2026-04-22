"use client";

import { Suspense, useEffect, useMemo, useState, useTransition } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cn,
  getCookie,
  getResponsiveWidthClass,
  getTravellingToIdentity,
  getVisaNoticeContent,
} from "@workspace/common-ui/lib/utils";
import { orpc } from "@workspace/orpc/lib/orpc";
import { CreateApplicationPayload } from "@workspace/types/new-visa";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { useAppNavigation } from "@workspace/common-ui/hooks/use-app-navigation";
import VisaColumnCard from "../components/visa-column-card";
import { useVisaColumn } from "../context/visa-columns-context";
import UploadedDocuments, {
  UploadDocumentsSkeleton,
} from "../sections/upload-documents";
import VisaApplication, {
  VisaApplicationSkeleton,
} from "../sections/visa-application";
import VisaType, { VisaTypeSkeleton } from "../sections/visa-type";
import PriceChangeAlertDialog from "../components/price_change_alert_dialog";
import { useIsMobile } from "@workspace/common-ui/hooks/use-is-mobile";
import { useVisaOffers } from "../hooks/use-visa-offers";
import { VisaOffer, VisaType as VisaTypeData } from "@workspace/types/new-visa";
import { NoticeDialog, VisaNoticeDialog } from "../components/notice-dialog";

const VisaColumnsView = () => {
  const host = getCookie("host");
  const isPriceChangeAck = getCookie("price_change_ack");
  const { goToReview } = useAppNavigation();
  const {
    columnNumber,
    setColumnNumber,
    currency,
    setCurrency,
    data,
    isUploadingDocuments,
    raffApplicants,
    setVisaOffer,
    setVisaApplicationField,
    setVisaNotice,
    visaNotice,
    commonNotice,
    isNoticeHandled,
    setIsNoticeHandled,
    setCommonNotice,

    shouldTriggerNoticeRef
  } = useVisaColumn();

  const [isError, setIsError] = useState(false);
  const [isPendingNavigation, startTransition] = useTransition();
  const [isPriceAlert, setIsPriceAlert] = useState(
    isPriceChangeAck === "true" ? true : false,
  );
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { visaApplication, visaOffer } = data;

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
  }, [visaApplication, visaOffer, columnNumber]);

  const { mutate, isPending } = useMutation(
    orpc.visa.createApplicationWithDocuments.mutationOptions(),
  );

  const handleProceed = () => {
    const { visaApplication, visaOffer, uploadedDocuments } = data;

    let userType = "admin";
    let applicationType = "b2b";

    if (getCookie("module_type") === "qr-visa") {
      applicationType = "qr-visa";
      userType = "customer";
    }

    const payload: CreateApplicationPayload = {
      currency: currency,
      base_currency_symbol: currency,
      raff_applicants: raffApplicants,
      // visa_lancer_code: null,
      documentsArray: uploadedDocuments!,
      nationality: visaApplication.nationality?.value || "",
      origin: visaApplication.countryOfOrigin?.value || "",
      travelling_to: visaApplication.travellingTo?.cioc || "",
      travelling_to_country: visaApplication.travellingTo?.name || "",
      travelling_to_identity: visaOffer?.travelling_to_identity!,
      journey_start_date:
        (visaApplication.dateRange?.from as Date)?.toISOString() || "",
      journey_end_date:
        (visaApplication.dateRange?.to as Date)?.toISOString() || "",
      visa_category: visaOffer?.visa_category || "",
      visa_code: visaOffer?.visa_details?.visa_code || "",
      visa_entry_type: visaOffer?.entry_type || "",
      visa_type_display_name: visaOffer?.visa_type_display_name || "",
      visa_fees: visaOffer?.visa_details?.fees! || {},
      visa_id: visaOffer?.visa_details?.visa_id || "", // Visa ID
      duration_type: visaOffer?.visa_details?.duration_type || "",
      total_days: visaOffer?.visa_details?.duration_days || "",
      is_visaero_insurance_bundled: !!visaOffer?.is_visaero_insurance_bundled,
      insurance_details: visaOffer?.insurance_details! || {},
      is_with_insurance: String(visaOffer?.is_visaero_insurance_bundled),
      visa_processing_type: visaOffer?.processing_type || "",
      visa_type: visaOffer?.visa_type || "",
      // user_id: "6628f8308ffcfb28077bddb9",
      // evm_request_id: "673d9274f25baa01c1874cec4c",
      platform: "web",
      user_type: userType,
      application_type: applicationType,
      application_created_by_user: "",
    };

    console.log("proceed payload", payload);

    mutate(payload, {
      onSuccess: (response) => {
        console.log("application created >>", response);

        if (response.status == "success") {
          startTransition(() => {
            goToReview();
          });
        } else {
          toast("Error", {
            description: response?.msg || "Failed to create an application!",
          });
        }
      },
      onError: () => {
        toast("Error", {
          description: "Something went wrong",
        });
      },
    });
  };

  const uploadedDocuments = data?.uploadedDocuments;

  const handleProceedBtnClick = () => {
    const hasDocumentsError = uploadedDocuments?.some((doc) => !doc?.is_valid && doc?.file_type !== "application/pdf");
    if (
      uploadedDocuments &&
      uploadedDocuments?.length > 0 &&
      hasDocumentsError
    ) {
      setIsError(true);
      return;
    }
    handleProceed();
  };

  const { travellingTo, countryOfOrigin, nationality, dateRange } = visaApplication || {}

  const isQueryEnabled =
    !!currency &&
    !!nationality &&
    !!travellingTo &&
    !!countryOfOrigin

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



  const { data: VisaOfferData, isFetching, refetch } = useVisaOffers(payload, isQueryEnabled);
  const visaOffers = Array.isArray(VisaOfferData?.data) ? VisaOfferData?.data : [];



  const noticeContent = useMemo(() => {
    return getVisaNoticeContent({
      selectedNationality: nationality?.name as string,
      selectedTravellingTo: travellingTo?.name as string,
      visaOffers: visaOffers,
      visaTypesData: travellingTo?.visa_types as VisaTypeData[],
    });
  }, [visaOffers.length > 0, travellingTo?.name]); // ✅ FIXED


  const isNoticePromt = noticeContent?.navigateToNotification;

  const isCommonNoticeOpen = commonNotice?.isOpen;

  const isValidData =
    !!nationality &&
    !!travellingTo &&
    !!countryOfOrigin &&
    !!dateRange?.from &&
    !!dateRange?.to;


  useEffect(() => {

    if ((isNoticePromt || isCommonNoticeOpen) && columnNumber !== 1) {
      setColumnNumber(1)
    }
    // 1. Notice blocks flow
    if (isNoticePromt || isCommonNoticeOpen) return;
    // 2. Invalid data
    if (!isValidData) {
      setVisaOffer(null);

      if (!isMobile && columnNumber !== 1) {
        setColumnNumber(1);
      }
      return;
    }
    // 3. Valid data
    if (!isMobile && columnNumber !== 2) {
      setColumnNumber(2);
    }

  }, [
    isValidData,
    isNoticePromt,
    isMobile,
    isCommonNoticeOpen,
    commonNotice
  ]);

  useEffect(() => {
    // Desktop only
    if (isMobile) return;
    if (!shouldTriggerNoticeRef.current) return; // ❗ HARD GUARD
    if (!noticeContent) return;
    if (isNoticeHandled) return;

    setVisaNotice({
      data: noticeContent.obj,
      isPendingOpen: commonNotice.isOpen,
      isOpen: noticeContent.navigateToNotification,
    });

  }, [noticeContent, commonNotice.isOpen, isNoticeHandled]);

  const handleNoticeClose = () => {
    setColumnNumber(2)
    setCommonNotice({
      isOpen: false,
      title: "",
      html_content: "",
    });
  };




  const handleVisaNoticeClose = () => {
    setVisaNotice({
      isOpen: false,
      isPendingOpen: false,
      data: null,
    })
    setIsNoticeHandled(true);
    shouldTriggerNoticeRef.current = false; // ✅ reset trigger
    setColumnNumber(1);

    queryClient.invalidateQueries({
      queryKey: orpc.visa.getTravellingTo.key()
    })


    setVisaApplicationField("travellingTo", null);
  }


  const handleMobileNext = () => {
    if (columnNumber === 1) {
      shouldTriggerNoticeRef.current = true;

      // common notice should block forward movement
      if (commonNotice?.isOpen) {
        return;
      }

      // visa notice should open only after Next click on mobile
      if (
        noticeContent?.navigateToNotification &&
        noticeContent?.obj &&
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

  return (
    <div className="bg-secondary h-screen">
      <div className="flex h-full flex-col gap-2 overflow-hidden p-3 pb-0 md:overflow-y-auto">
        <div
          className={cn(
            "mb-3 hidden h-[calc(100vh-6rem)] flex-1 flex-col gap-2 transition-all duration-1000 ease-out md:block md:flex md:flex-row md:gap-5",
            getResponsiveWidthClass(columnNumber),
          )}
        >
          <VisaColumnCard
            title="Visa Application"
            number={1}
            inert={false} // always active
          >
            <Suspense fallback={<VisaApplicationSkeleton />}>
              <VisaApplication />
            </Suspense>
          </VisaColumnCard>
          <VisaColumnCard
            title="Visa Type"
            // className="p-0 px-0 pt-0 sm:p-0"
            cardBodyClassName="md:pt-0 md:p-0  px-0"
            number={2}
            inert={columnNumber < 2}
          >
            <VisaType setCurrency={setCurrency} />
          </VisaColumnCard>

          <VisaColumnCard
            title="Upload Documents"
            className="p-0 px-0 pt-0 sm:p-0"
            cardBodyClassName="md:pt-0 md:p-0  px-0"
            number={3}
            inert={columnNumber < 3}
          >
            <UploadedDocuments />
          </VisaColumnCard>
        </div>
        <div className="h-[calc(100vh-6rem)] flex-1 flex-col gap-2 transition-all duration-1000 ease-out md:hidden md:flex-row">
          {columnNumber == 1 && (
            <VisaColumnCard title="Visa Application" number={1}>
              <Suspense fallback={<VisaApplicationSkeleton />}>
                <VisaApplication />
              </Suspense>
            </VisaColumnCard>
          )}
          {columnNumber == 2 && (
            <VisaColumnCard
              title="Visa Type"
              // className="p-0 px-0 pt-0 sm:p-0"
              cardBodyClassName="md:pt-0 md:p-0  px-0"
              number={2}
            >
              <VisaType setCurrency={setCurrency} />
            </VisaColumnCard>
          )}

          {columnNumber == 3 && (
            <VisaColumnCard
              title="Upload Documents"
              className="p-0 px-0 pt-0 sm:p-0"
              cardBodyClassName="md:pt-0 md:p-0  px-0"
              number={3}
            >
              <UploadedDocuments />
            </VisaColumnCard>
          )}
        </div>
        <AlertDialog open={isError} onOpenChange={setIsError}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Caution</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="text-left">
                  {
                    uploadedDocuments?.filter((doc: any) => !doc?.is_valid && doc?.file_type !== "application/pdf")
                      .length
                  }{" "}
                  uploaded document/s are invalid out of total{" "}
                  {uploadedDocuments?.length} documents. Please re-upload the
                  documents with clear and valid copies.
                  <div>
                    <div>Possible reasons for invalid documents are:</div>
                    <ol className="mt-2 list-inside list-decimal space-y-1">
                      <li>File size is too low.</li>
                      <li>Resolution is too low.</li>
                      <li>The uploaded document is not clear.</li>
                      {/* <li> Low file size.</li>
                      <li> Uploaded image might be pixelated.</li> */}
                      {/* <li>
                        Uploaded file type is not among PNG, JPEG, JPG or PDF.
                      </li> */}
                    </ol>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>OK</AlertDialogCancel>
              <Button
                onClick={handleProceed}
                disabled={
                  columnNumber !== 3 ||
                  data.uploadedDocuments?.length === 0 ||
                  isUploadingDocuments ||
                  isPendingNavigation
                }
                isLoading={(isError && isPending) || isPendingNavigation}
              >
                Proceed Anyway
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!isPriceAlert && host === "resbird" && <PriceChangeAlertDialog />}
        <div
          // className={`flex w-full items-center justify-end rounded-t-xl rounded-b-none border bg-white p-3 shadow-sm hidden md:flex ${columnNumber === 3 ? 'flex' : ''}`}
          className={cn(
            "flex w-full items-center justify-between rounded-t-xl rounded-b-none border bg-white p-3 shadow-sm",
          )}
        >
          <div>
            {isMobile && columnNumber !== 1 && (
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
                disabled={columnNumber === 1 || isUploadingDocuments || isPendingNavigation}
              >
                Previous
              </Button>
            )
            }
          </div>
          {isMobile && columnNumber !== 3 ? <Button
            onClick={handleMobileNext}
            disabled={isNextDisabled}
          >
            Next
          </Button> :
            <Button
              onClick={handleProceedBtnClick}
              disabled={
                (raffApplicants.length == 0 &&
                  (columnNumber !== 3 ||
                    data.uploadedDocuments?.length === 0)) ||
                isUploadingDocuments ||
                isPendingNavigation
              }
              isLoading={(!isError && isPending) || isPendingNavigation}
            >
              Proceed
            </Button>
          }
        </div>
      </div>



      <NoticeDialog
        title={commonNotice?.title}
        htmlContent={commonNotice?.html_content}
        open={commonNotice.isOpen}
        onClose={handleNoticeClose}
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
          shouldTriggerNoticeRef.current = false; // ✅ reset trigger
          setColumnNumber(2)
          console.log("Confirmed");
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

    </div >
  );
};

export default VisaColumnsView;

export const VisaColumnsViewSkeleton = () => {
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
};
