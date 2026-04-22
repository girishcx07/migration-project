"use client";

import { cn } from "@workspace/common-ui/lib/utils";

import { useSaveApplicanForm } from "@workspace/common-ui/hooks/global-queries";
import { useAppNavigation } from "@workspace/common-ui/hooks/use-app-navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  ActiveTabs,
  useApplicationState,
} from "../context/review-visa-context";
import { useReadyStatus } from "../hooks/use-ready-status";

import { Button } from "@workspace/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import ErrorDialog from "../components/error-dialog";

import ApplicationApplicantsDetails, {
  ApplicationApplicantsDetailsSkeleton,
} from "../sections/application-applicants-details";

import ApplicationDetails, {
  ApplicationDetailsSkeleton,
} from "../sections/application-details";

import DocumentsList, {
  DocumentsListSkeleton,
} from "../sections/documents-list";

import { useMutation } from "@tanstack/react-query";
import ErrorBoundary from "@workspace/common-ui/components/error-boundary";
import { useRouteContext } from "@workspace/common-ui/context/route-context";
import { useIsMobile } from "@workspace/common-ui/hooks/use-is-mobile";
import { orpc } from "@workspace/orpc/lib/orpc";
import { ApplicantReadyStatusResponse } from "@workspace/types/review";
import { Card } from "@workspace/ui/components/card";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog } from "../components/confirmation-dialog";
import { HoldApplicationConfirmationDialog } from "../components/hold-application-confirmation-dialog";
import { HoldApplicationWorningPrompt } from "../components/hold-application-worning-prompt";
import { UserAgreementDialog } from "../components/user-agreements-dialog";
import VisaForm, { VisaFormSkeleton } from "../sections/visa-form";
import { areMandatoryDocumentsComplete as areApplicantDocumentsComplete } from "../lib/ready-status";
import { Typography } from "@tiptap/extension-typography";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";

interface isDuplicatePassportType {
  isOpen: boolean;
  passports: any[] | null;
}

const ReviewVisaView: React.FC = () => {
  const { workflow } = useRouteContext();
  const [isPending, startTransition] = useTransition();
  const [isAgreements, setIsAgreements] = useState(false);
  const [isDuplicatePassport, setIsDuplicatePassport] =
    useState<isDuplicatePassportType>({
      isOpen: false,
      passports: [],
    });
  const [isError, setIsError] = useState(false);
  const [isOpenSaveAsDraft, setIsOpenSaveAsDraft] = useState(false);
  const [isCheckedAgreement, setIsCheckedAgreement] = useState<boolean>(false);
  const [isCheckedHold, setIsCheckedHold] = useState<boolean>(false);
  const [holdComment, setHoldComment] = useState<string>("");
  const [isHoldApplicationModal, setIsHoldApplicationModal] = useState(false);
  const [isPendingSaveApplication, setIsPendingSaveApplication] =
    useState(false);
  const [docTypeVerificationModal, setDocTypeVerificationModal] =
    useState(false);

  const { getStatusForApplication } = useReadyStatus();

  const hasOpenedRef = useRef(false);
  const submitInFlightRef = useRef(false);

  const isMobile = useIsMobile();
  const isMobileUserAgent = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Mobile/i.test(
      navigator.userAgent,
    );
  }, []);
  const shouldUseMobileTabValidation = isMobile || isMobileUserAgent;

  const { goToTrackApplications, goToPaymentSummaryWithReset } =
    useAppNavigation();
  const {
    activeApplicantId,
    applicationReadiness,
    applicationId,
    applicants,
    applicantLimitDialogOpen,
    setApplicantLimitDialogOpen,
    showHoldConfirmationModal,
    setShowHoldConfirmationModal,
    applicationDetails,
    getVisaFormValues,
    validateVisaForm,
    activeTab,
    setActiveTab,
  } = useApplicationState();

  const application = applicationDetails?.application;
  const hasApplicants = applicants.length > 0;

  console.log("disabled state application readiness >>", applicationReadiness);

  const { mutateAsync } = useSaveApplicanForm();
  const isHoldApplication = application?.application_status === "on_hold";

  const {
    mutate: holdBackApplication,
    isPending: isLoadingHoldBackApplication,
  } = useMutation(
    orpc.visa.backOnHoldApplicationForProcessing.mutationOptions({
      onSuccess: (data) => {
        console.log("success data", data);
        if (data?.data?.data === "success") {
          toast.success(
            data?.data?.msg || "Application moved back to processing",
          );
          goToTrackApplications();
        } else {
          console.log(
            "'error prompt': Failed while moving application back to processing:",
            data,
          );
          setIsError(true);
        }
      },
      onError: () => {
        console.log(
          "'error prompt': Error occurred while moving application back to processing",
        );
        setIsError(true);
      },
    }),
  );

  useEffect(() => {
    if (
      !hasOpenedRef.current &&
      application?.application_status === "on_hold"
    ) {
      setIsHoldApplicationModal(true);
      hasOpenedRef.current = true; // mark as opened
    }
  }, [application]);

  useEffect(() => {
    const val = localStorage.getItem("isAutoLink");
    console.log("isAutoLink --->", docTypeVerificationModal);

    if (val === null || val === "false") {
      setDocTypeVerificationModal(true);
    }
  }, []);

  const handleIAcknowledgeBtn = async () => {
    setDocTypeVerificationModal(false);
    localStorage.setItem("isAutoLink", "true");
  };

  const handleSubmitHoldBackApplication = () => {
    holdBackApplication({
      application_id: application?._id!,
      remark: holdComment,
    });
  };

  const saveApplicantForm = async () => {
    const { formValues, ...formData } = getVisaFormValues();
    const payload = {
      formData,
      applicantId: activeApplicantId!,
      applicationId,
    };
    console.log("saveApplicantForm");
    await mutateAsync(payload);
  };

  const handleUserAgreement = () => {
    setIsAgreements(true);
  };

  const areMandatoryDocumentsComplete = () => {
    const activeApplicant = applicants.find(
      (applicant) => applicant.applicantId === activeApplicantId,
    );
    return areApplicantDocumentsComplete(activeApplicant?.documentsList || []);
  };

  const focusVisaFormErrors = useCallback(() => {
    setTimeout(() => {
      void validateVisaForm();
    }, 0);
  }, [validateVisaForm]);

  const validateBeforeProceed = useCallback(async (): Promise<boolean> => {
    const hasRequiredDocuments = areMandatoryDocumentsComplete();
    const isVisaFormValid = await validateVisaForm();

    // Desktop (unchanged)
    if (!shouldUseMobileTabValidation) {
      if (!isVisaFormValid) return false;

      if (!hasRequiredDocuments) {
        console.log("'error prompt': Required documents are not complete");
        setIsError(true);
        return false;
      }

      return true;
    }

    // ----------------------------
    // MOBILE LOGIC (FIXED)
    // ----------------------------

    if (activeTab === "documents") {
      if (!hasRequiredDocuments) {
        console.log("'error prompt': Required documents are not complete");
        setIsError(true);
        return false;
      }

      if (!isVisaFormValid) {
        console.log("'error prompt': Visa form is not valid");
        setActiveTab("visaform");
        focusVisaFormErrors();
        return false;
      }

      return true;
    }

    if (activeTab === "visaform") {
      if (!isVisaFormValid) {
        focusVisaFormErrors();
        return false;
      }

      if (!hasRequiredDocuments) {
        setActiveTab("documents");
        console.log("'error prompt': Required documents are not complete");
        setIsError(true);
        return false;
      }

      return true;
    }

    if (!hasRequiredDocuments) {
      console.log("'error prompt': Required documents are not complete");
      setIsError(true);
      return false;
    }

    if (!isVisaFormValid) {
      setActiveTab("visaform");
      focusVisaFormErrors();
      return false;
    }

    return true;
  }, [
    activeTab,
    areMandatoryDocumentsComplete,
    focusVisaFormErrors,
    setActiveTab,
    setIsError,
    shouldUseMobileTabValidation,
    validateVisaForm,
  ]);

  const handleProceed = async () => {
    goToPaymentSummaryWithReset();
    // setIsCheckedAgreement(false);
  };

  const getSummaryForCurrentApplicants = useCallback(async () => {
    const { data } = await getStatusForApplication();
    const applicantSummary =
      (data?.applicant_summary as ApplicantReadyStatusResponse[]) || [];

    // Keep validation scoped to currently existing applicants only.
    // This avoids false errors when backend summary still contains recently deleted applicants.
    const currentApplicantIds = new Set(
      applicants.map((applicant) => applicant.applicantId),
    );

    return applicantSummary.filter(
      (applicant) => !!applicant?._id && currentApplicantIds.has(applicant._id),
    );
  }, [applicants, getStatusForApplication]);

  const onSubmit = async () => {
    if (submitInFlightRef.current || isPending) return;
    submitInFlightRef.current = true;
    try {
      if (!hasApplicants) {
        submitInFlightRef.current = false;
        return;
      }

      // Ensure modal focus trap does not block RHF invalid-field autofocus.
      setIsError(false);
      const canProceed = await validateBeforeProceed();
      if (!canProceed) {
        submitInFlightRef.current = false;
        return;
      }

      startTransition(async () => {
        try {
          await saveApplicantForm();

          const activeApplicant = applicants.find(
            (applicant) => applicant.applicantId === activeApplicantId,
          );

          let applicantSummaryForCurrentApplicants =
            await getSummaryForCurrentApplicants();
          let isApplicationReady = applicantSummaryForCurrentApplicants.every(
            (a) => a.ready_status === "completed",
          );

          // Retry once to avoid transient backend lag immediately after save.
          if (!isApplicationReady) {
            await new Promise((resolve) => setTimeout(resolve, 400));
            applicantSummaryForCurrentApplicants =
              await getSummaryForCurrentApplicants();
            isApplicationReady = applicantSummaryForCurrentApplicants.every(
              (a) => a.ready_status === "completed",
            );
          }

          const isSingleApplicantMobileReadyLocally =
            shouldUseMobileTabValidation &&
            applicants.length === 1 &&
            activeApplicant?.status === "completed";

          if (!isApplicationReady && isSingleApplicantMobileReadyLocally) {
            isApplicationReady = true;
          }

          const isDuplicatePassport = applicantSummaryForCurrentApplicants
            ?.map((a) => a?.passport_number)
            ?.filter(
              (num: string, idx: number, arr: string[]) =>
                arr.indexOf(num) !== idx,
            );

          if (!isApplicationReady) {
            const incompleteApplicantSummary =
              applicantSummaryForCurrentApplicants.filter(
                (applicant) => applicant.ready_status !== "completed",
              );
            const isCurrentApplicantIncomplete =
              incompleteApplicantSummary.some(
                (applicant) => applicant._id === activeApplicantId,
              );
            const hasOtherIncompleteApplicants =
              incompleteApplicantSummary.some(
                (applicant) => applicant._id !== activeApplicantId,
              );
            const hasRequiredDocuments = areMandatoryDocumentsComplete();
            const isVisaFormValid = await validateVisaForm();

            if (
              shouldUseMobileTabValidation &&
              isCurrentApplicantIncomplete &&
              !hasOtherIncompleteApplicants
            ) {
              if (!hasRequiredDocuments) {
                setActiveTab("documents");
                setIsError(true);
                return;
              }

              if (!isVisaFormValid) {
                setActiveTab("visaform");
                focusVisaFormErrors();
                return;
              }
            }

            console.log(
              "'error prompt': Application is not ready for processing",
            );
            setIsError(true);
            return;
          }

          if (applicants.length > 9) {
            setApplicantLimitDialogOpen(true);
            return;
          }

          if (isHoldApplication) {
            setShowHoldConfirmationModal(true);
            return;
          }

          if (isDuplicatePassport && isDuplicatePassport?.length > 0) {
            setIsDuplicatePassport({
              isOpen: true,
              passports: isDuplicatePassport,
            });
            return;
          }

          handleUserAgreement();
        } finally {
          submitInFlightRef.current = false;
        }
      });
    } catch (error) {
      toast.error("An unexpected error occurred during validation.");
      submitInFlightRef.current = false;
    }
  };

  const isReadyToProcess = Object.values(applicationReadiness).every(Boolean);

  return (
    <>
      <div className="space-y-8">
        <div className="flex h-screen flex-col gap-2 overflow-hidden p-3 pb-0">
          {/* Application details */}
          <div className="mb-0 md:mb-3">
            <ErrorBoundary fallback={<ApplicationDetailsSkeleton />}>
              <Suspense fallback={<ApplicationDetailsSkeleton />}>
                <ApplicationDetails />
              </Suspense>
            </ErrorBoundary>
          </div>
          {/* {isHoldApplication && (
              <div className="mb-0 md:mb-3">
                <HoldApplicationDetails />
              </div>
            )} */}
          {applicants.length > 9 && (
            <Card className="p-3">
              <div className="text-md flex items-center gap-2 text-red-600">
                <AlertCircle className="text-destructive h-5 w-5" />
                <span>
                  You have exceeded the maximum number of{" "}
                  <span className="font-medium">9 applicants </span>
                  allowed for this application. Please remove excess applicants
                  to proceed.
                </span>
              </div>
            </Card>
          )}
          {/* Applicants Bar */}
          <div className="mb-0 md:mb-3">
            <ErrorBoundary fallback={<ApplicationApplicantsDetailsSkeleton />}>
              <Suspense fallback={<ApplicationApplicantsDetailsSkeleton />}>
                <ApplicationApplicantsDetails
                  isHoldApplication={isHoldApplication}
                  setIsHoldApplicationModal={setIsHoldApplicationModal}
                />
              </Suspense>
            </ErrorBoundary>
          </div>

          <div className="mb-0 flex h-0 flex-1 gap-3 md:mb-3">
            <Tabs
              defaultValue="documents"
              value={activeTab}
              onValueChange={async (value) => {
                await saveApplicantForm();
                setActiveTab(value as ActiveTabs);
              }}
              className="h-full w-full"
            >
              {isMobile ? (
                <>
                  {/* Mobile Tabs */}
                  <TabsList className="mb-0 flex w-full gap-1 md:mb-3 md:hidden">
                    <TabsTrigger
                      value="documents"
                      className={cn(
                        "flex-1 py-2",
                        "data-[state=active]:bg-primary border-border bg-white text-black data-[state=active]:text-white",
                      )}
                    >
                      Documents
                    </TabsTrigger>
                    <TabsTrigger
                      value="visaform"
                      className={cn(
                        "flex-1 py-2",
                        "data-[state=active]:bg-primary border-border bg-white text-black data-[state=active]:text-white",
                      )}
                    >
                      Visa Form
                    </TabsTrigger>
                  </TabsList>

                  {/* Mobile Tabs Content */}
                  <div className="block h-[calc(100%-50px)] md:hidden">
                    <TabsContent
                      value="documents"
                      forceMount
                      className="h-full data-[state=inactive]:hidden"
                    >
                      <ErrorBoundary fallback={<DocumentsListSkeleton />}>
                        <Suspense fallback={<DocumentsListSkeleton />}>
                          <DocumentsList />
                        </Suspense>
                      </ErrorBoundary>
                    </TabsContent>

                    <TabsContent
                      value="visaform"
                      forceMount
                      className="h-full data-[state=inactive]:hidden"
                    >
                      <ErrorBoundary fallback={<VisaFormSkeleton />}>
                        <Suspense fallback={<VisaFormSkeleton />}>
                          <VisaForm key={activeApplicantId} />
                        </Suspense>
                      </ErrorBoundary>
                    </TabsContent>
                  </div>
                </>
              ) : (
                <>
                  {/* Desktop Layout */}
                  <div className="hidden h-full gap-3 md:flex">
                    <div className="h-full w-1/3 overflow-hidden">
                      <ErrorBoundary fallback={<DocumentsListSkeleton />}>
                        <Suspense fallback={<DocumentsListSkeleton />}>
                          <DocumentsList />
                        </Suspense>
                      </ErrorBoundary>
                    </div>
                    <div className="h-full w-2/3 overflow-hidden">
                      <ErrorBoundary fallback={<VisaFormSkeleton />}>
                        <Suspense fallback={<VisaFormSkeleton />}>
                          <VisaForm key={activeApplicantId} />
                        </Suspense>
                      </ErrorBoundary>
                    </div>
                  </div>
                </>
              )}
            </Tabs>
          </div>
          <div className="bg-card flex w-full items-center justify-end gap-3 rounded-xl rounded-b-none border p-3 shadow-sm">
            {workflow !== "qr-visa" && (
              <Button
                type="button"
                variant="outline"
                disabled={!isReadyToProcess}
                onClick={() => setIsOpenSaveAsDraft(true)}
              >
                Save as Draft
              </Button>
            )}
            <Button
              type="button"
              isLoading={isPending}
              disabled={!hasApplicants || isPending}
              onClick={onSubmit}
            >
              Confirm & Proceed
            </Button>
          </div>
        </div>
      </div>

      <HoldApplicationWorningPrompt
        open={isHoldApplicationModal}
        onOpenChange={() => setIsHoldApplicationModal(false)}
      />

      <ConfirmationDialog
        open={isOpenSaveAsDraft}
        onOpenChange={setIsOpenSaveAsDraft}
        isLoading={isPendingSaveApplication}
        onConfirm={async () => {
          setIsPendingSaveApplication(true);
          await saveApplicantForm();
          setIsPendingSaveApplication(false);
          goToTrackApplications();
        }}
        confirmText="Save"
        cancelText="Cancel"
        title="Save as Draft"
        description=" We will save your information and documents. You can resume anytime from 'Track Application'."
      />

      <ConfirmationDialog
        open={isDuplicatePassport.isOpen}
        onOpenChange={(value: boolean) =>
          setIsDuplicatePassport({ isOpen: false, passports: null })
        }
        onConfirm={() => {
          setIsDuplicatePassport({ isOpen: false, passports: null });
          setTimeout(() => {
            setIsAgreements(true);
          }, 500);
        }}
        confirmText="Proceed Anyway"
        cancelText="Ok"
        title="Caution"
        description={`Duplicate Passport Number  ${isDuplicatePassport?.passports?.map(
          (i, index, arr) => (arr.length > 1 ? `${i}` : `${i}`),
        )} Detected. The passport you uploaded is already associated with another applicant. Please verify and upload the correct passport for each applicant.`}
      />

      {isAgreements && (
        <UserAgreementDialog
          open={isAgreements}
          onOpenChange={() => {
            setIsAgreements(false);
            setIsCheckedAgreement(false);
          }}
          applicants={applicants?.length || 0}
          onConfirm={handleProceed}
          setIsChecked={setIsCheckedAgreement}
          isChecked={isCheckedAgreement}
        />
      )}

      <ConfirmationDialog
        onConfirm={() => setApplicantLimitDialogOpen(false)}
        title="Maximum Applicants Reached"
        description="You have reached the maximum applicants for this application. You can only add maximum 9 applicants per application."
        confirmText="Ok"
        cancelText="Cancel"
        variant="default"
        onOpenChange={setApplicantLimitDialogOpen}
        open={applicantLimitDialogOpen}
      />

      {showHoldConfirmationModal && (
        <HoldApplicationConfirmationDialog
          open={showHoldConfirmationModal}
          onCheckedChange={setIsCheckedHold}
          isChecked={isCheckedHold}
          onConfirm={handleSubmitHoldBackApplication}
          onOpenChange={setShowHoldConfirmationModal}
          holdComment={holdComment}
          setHoldComment={setHoldComment}
          isLoading={isLoadingHoldBackApplication}
        />
      )}

      {/* Error Modal */}
      <ErrorDialog isOpen={isError} setIsOpen={setIsError} />

      {/* Dialog for hotel accomodation and Airline ticket auto attached behaviour */}

      <Dialog
        open={docTypeVerificationModal}
        onOpenChange={setDocTypeVerificationModal}
      >
        <DialogContent
          className="overflow-y-auto p-0 md:min-w-3xl"
          style={{ borderBottom: "1px solid #E7E7E7" }}
        >
          <DialogHeader
            className="h-10"
            style={{ borderBottom: "1px solid #E7E7E7" }}
          >
            <DialogTitle className="p-4 text-black">
              <h5
                className="mb-0"
                style={{ fontWeight: "600", fontSize: "14px" }}
              >
                Beta Feature - Document Auto Linking
              </h5>
            </DialogTitle>
          </DialogHeader>
          <div
            style={{
              fontWeight: "400",
              fontSize: "12px",
              color: "#364153",
              padding: "1rem",
            }}
          >
            This feature automatically attaches supported documents using our
            AI-powered system, where applicable.
            <br />
            <br />
            As this feature is currently in beta, results may vary in some
            cases. We recommend reviewing all auto-linked documents before
            proceeding.
            <br />
            <br />
            Auto-linking feature is still under evaluation.
            <br />
            <br />
            The following documents may be automatically linked:
            <ul className="list-inside list-disc pl-5">
              <li>Hotel Reservation / Accommodation</li>
              <li>Airline Tickets / Return Air Tickets</li>
              <li>Parent's Passports(for minor applicants)</li>
              <li>Birth Certificate(for minor applicants)</li>
            </ul>
          </div>
          <DialogFooter className="p-2">
            <Button
              color="dark"
              style={{
                textTransform: "none",
                minWidth: 100,
                borderRadius: "10px",
                backgroundColor: "#000000",
                color: "white",
              }}
              onClick={handleIAcknowledgeBtn}
            >
              I acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// export default memo(VisaReviewLayout);
export default ReviewVisaView;

export function ReviewVisaViewSkeleton() {
  return (
    <div className="flex h-screen flex-col gap-2 overflow-hidden p-3 pb-0">
      <div className="mb-0 md:mb-3">
        <ApplicationDetailsSkeleton />
      </div>
      <div className="mb-0 md:mb-3">
        <ApplicationApplicantsDetailsSkeleton />
      </div>
      <div className="mb-0 flex h-0 flex-1 gap-3 md:mb-3">
        <div className="hidden h-full w-full gap-3 md:flex">
          <div className="h-full w-1/3 overflow-hidden">
            <DocumentsListSkeleton />
          </div>
          <div className="h-full w-2/3 overflow-hidden">
            <VisaFormSkeleton />
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 md:hidden">
          <DocumentsListSkeleton />
        </div>
      </div>
    </div>
  );
}
