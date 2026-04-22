"use client";

import fallbackUser from "@workspace/common-ui/assets/img/fallback_user.png";
import { useSaveApplicanForm } from "@workspace/common-ui/hooks/global-queries";
import { useIsMobile } from "@workspace/common-ui/hooks/use-is-mobile";
import { getStaticImageFromPath } from "@workspace/common-ui/lib/img-helper";

import { useMutation } from "@tanstack/react-query";
import { orpc } from "@workspace/orpc/lib/orpc";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { AlertCircle, CircleAlert } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "sonner";
import { AddApplicant } from "../components/add-applicant";
import {
  ApplicantCard,
  ApplicantCardSkeleton,
} from "../components/applicant-card";
import { ConfirmationDialog } from "../components/confirmation-dialog";
import { useApplicationState } from "../context/review-visa-context";
import { queryClient } from "@workspace/common-ui/lib/react-query";
import { useAppRouter } from "../../../platform/navigation";

const ApplicationApplicantsDetails = ({
  isHoldApplication,
  setIsHoldApplicationModal,
}: {
  isHoldApplication: boolean;
  setIsHoldApplicationModal: (open: boolean) => void;
}) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isAddingNewApplicant, setIsAddingNewApplicant] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null,
  );
  const {
    setActiveApplicant,
    addApplicant: addApplicantState,
    activeApplicantId,
    removeApplicant,
    setApplicantLimitDialogOpen,
    applicationDetails,
    applicationId,
    setApplicationReadiness,
    getVisaFormValues,
    resetVisaForm,
    setActiveTab,
  } = useApplicationState();

  const router = useAppRouter();
  const isMobile = useIsMobile();

  const activeApplicantRef = useRef<HTMLDivElement>(null);

  const { mutateAsync: saveVisaApplication } = useSaveApplicanForm();

  // CRITICAL FIX: Use useMemo to ensure we always have fresh applicants data
  const applicants = useMemo(() => {
    const apps = applicationDetails?.applicants || [];
    console.log("🔍 Applicants in component:", {
      count: apps.length,
      ids: apps.map((a) => a._id),
      timestamp: new Date().toISOString(),
    });
    return apps;
  }, [applicationDetails?.applicants]);

  const fallbackUserImage = getStaticImageFromPath(fallbackUser);

  // For Deleting applicant
  const { mutate: deleteApplicant, isPending } = useMutation(
    orpc.visa.deleteApplicantForApplication.mutationOptions({
      onSuccess: (data, variables) => {
        console.log(
          "✅ Applicant deleted successfully:",
          variables.applicantId,
        );
        removeApplicant(variables.applicantId);
        setDialogOpen(false);
        setActiveTab("documents");
        router.refresh();
      },
      onError: (error) => {
        console.warn("Error deleting applicant", error);
        toast.error("Error deleting applicant");
      },
    }),
  );

  const { mutateAsync: addApplicant, isPending: isAddingApplicant } =
    useMutation(
      orpc.visa.addApplicantForApplication.mutationOptions({
        onSuccess: (data) => {
          if (data.status === "success") {
            console.log("✅ Applicant added successfully", data);
            const applicantId = data?.data?._id;
            resetVisaForm({});
            queryClient.removeQueries({
              queryKey: orpc.visa.getVisaFormForApplicant.key(),
            });
            queryClient.removeQueries({
              queryKey: orpc.visa.getApplicantDocData.key(),
            });
            setActiveApplicant(applicantId);
            addApplicantState(data?.data!);
            setActiveTab("documents");

            setIsAddingNewApplicant(false);
            setApplicationReadiness((prev) => ({
              ...prev,
              hasApplicants: true,
            }));
          }
        },
        onError: (error) => {
          console.log("Error adding applicant", error);
          toast.error("Error adding applicant");
        },
      }),
    );

  const handleOnRemove = (applicantId: string) => {
    setDialogOpen(true);
    setSelectedApplicantId(applicantId);
  };

  const handleAddApplicant = async () => {
    // If no applicants yet → just add one directly
    if (applicants.length === 0) {
      await addApplicant({
        applicationId,
      });
      return;
    }

    // If already 9 → show limit dialog
    if (applicants.length >= 9) {
      setApplicantLimitDialogOpen(true);
      return;
    }

    // Progress start here
    setIsAddingNewApplicant(true);

    // Save current form + add new applicant
    await saveApplicantForm();
    await addApplicant({ applicationId });
  };

  const saveApplicantForm = async () => {
    const { formValues, ...formData } = getVisaFormValues();
    console.log("💾 Saving applicant form");
    await saveVisaApplication({
      formData,
      applicantId: activeApplicantId!,
      applicationId,
    });
  };

  const handleOnClick = async (newApplicantId: string) => {
    if (activeApplicantId === newApplicantId) return;

    console.log("🔄 Switching applicant:", {
      from: activeApplicantId,
      to: newApplicantId,
    });

    await saveApplicantForm();

    resetVisaForm({});
    queryClient.removeQueries({
      queryKey: orpc.visa.getVisaFormForApplicant.key(),
    });

    queryClient.removeQueries({
      queryKey: orpc.visa.getApplicantDocData.key(),
    });

    setActiveApplicant(newApplicantId);
    if (isMobile) {
      setActiveTab("documents");
    }
  };

  // scroll to active applicant
  useEffect(() => {
    if (activeApplicantRef.current) {
      activeApplicantRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest", // prevents vertical jumps
      });
    }
  }, [activeApplicantId]);

  // DEBUG: Log when applicants change
  useEffect(() => {
    console.log("🔄 Applicants changed in component:", {
      count: applicants.length,
      ids: applicants.map((a) => a._id),
    });
  }, [applicants]);

  if (!applicants || applicants?.length === 0) {
    return (
      <ApplicantErrorAlert
        onAddApplicant={handleAddApplicant}
        isPending={isAddingApplicant}
      />
    );
  }

  return (
    <>
      <Card className="w-full overflow-hidden py-0">
        <CardContent className="flex gap-2 px-2">
          <ScrollArea className="my-auto flex-grow overflow-x-auto py-2">
            <div className="flex w-full gap-0">
              {applicants.map((applicant) => (
                <ApplicantCard
                  applicant={applicant}
                  key={applicant?._id}
                  fallbackUserImage={fallbackUserImage}
                  onDeleteClick={() => handleOnRemove(applicant._id)}
                  onClick={() => handleOnClick(applicant._id)}
                  canDelete={applicants.length > 1 && !isHoldApplication}
                  ref={
                    applicant._id === activeApplicantId
                      ? activeApplicantRef
                      : undefined
                  }
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {isHoldApplication ? (
            <div
              className="ml-2 flex cursor-pointer items-center gap-1 text-red-700"
              onClick={() => setIsHoldApplicationModal(true)}
            >
              <CircleAlert className="h-5 w-5" />
              <span className="text-sm hover:underline">On Hold Comment</span>
            </div>
          ) : (
            <AddApplicant
              onAddApplicant={handleAddApplicant}
              isPending={isAddingNewApplicant}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        onConfirm={async () => {
          deleteApplicant({
            applicantId: selectedApplicantId!,
            applicationId,
          });
        }}
        title="Delete Applicant"
        description="Are you sure you want to delete this applicant?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isPending}
        onOpenChange={setDialogOpen}
        open={isDialogOpen}
      />
    </>
  );
};

export default ApplicationApplicantsDetails;

ApplicationApplicantsDetails.displayName = "ApplicationApplicantsDetails";

export const ApplicationApplicantsDetailsSkeleton = () => {
  return (
    <Card className="w-full overflow-hidden py-0">
      <CardContent className="flex gap-2 px-2">
        <ScrollArea className="my-auto flex-grow overflow-x-auto py-2">
          <div className="flex w-full gap-3">
            <ApplicantCardSkeleton />
            <ApplicantCardSkeleton />
            <ApplicantCardSkeleton />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="flex items-center justify-center">
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

export function ApplicantErrorAlert({
  onAddApplicant,
  isPending,
}: {
  onAddApplicant: () => void;
  isPending: boolean;
}) {
  return (
    <Alert
      variant="destructive"
      className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="text-destructive mt-1 h-5 w-5" />
        <div>
          <AlertTitle className="text-destructive font-semibold">
            Error
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            No passport document found! Please click 'Add Applicant' to upload a
            clearer copy for the applicant.
          </AlertDescription>
        </div>
      </div>
      <Button
        variant="default"
        type="button"
        onClick={onAddApplicant}
        isLoading={isPending}
        className="z-50 mt-2 self-start sm:mt-0 sm:self-center"
      >
        + Add Applicant
      </Button>
    </Alert>
  );
}
