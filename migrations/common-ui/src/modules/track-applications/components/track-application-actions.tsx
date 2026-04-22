"use client";

import React, { useCallback, useState } from "react";

import {
  ActivitySVG,
  ArchiveSVG,
  NotesSVGIcon,
} from "@workspace/common-ui/components/icons";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import ApplicationActivity from "./application-actions/application-activity";

import NotesDialog from "@workspace/common-ui/components/notes-dialog";
import { useApplicationDetails } from "@workspace/common-ui/hooks/global-queries";
import { getCookie, setClientCookie } from "@workspace/common-ui/lib/utils";
import { orpc } from "@workspace/orpc/lib/orpc";
import { Application } from "@workspace/types/review";
import { EllipsisVertical, History } from "lucide-react";
import PromptModal from "./promt-modal";
import { useAppNavigation } from "@workspace/common-ui/hooks/use-app-navigation";

export interface ActivityObj {
  _id: string;
  application_id: string;
  activity: string;
  activity_on: number;
  user_id: string;
}

const TrackApplicationActions = ({
  applicationData,
}: {
  applicationData: Application;
}) => {
  const [loading, setLoading] = useState(false);
  const [isOpenNotes, setIsOpenNotes] = useState(false);
  const [isResumeIssue, setIsResumeIssue] = useState({
    isOpen: true,
    applicants: 0,
  });
  const [promptInfo, setPromptInfo] = useState({
    isOpen: false,
    title: "",
    description: "",
    isCTA: true,
    content: null as React.ReactNode,
  });

  const { _id, application_status, creator_user, archival_details } =
    applicationData;
  const creator_user_id = creator_user?._id || "";
  // const archival_user_id = archival_details?.archived_by || "";
  const queryClient = useQueryClient();
  const { goToReview, goToApplicationDetails } = useAppNavigation();
  const user_id = getCookie("user_id");
  const host = getCookie("host");

  useApplicationDetails();

  const refreshTabData = () => {
    queryClient.invalidateQueries({
      queryKey: orpc.visa.getTrackVisaApplicationsData.key(),
    });
  };

  const refetchApplicationDetails = () => {
    queryClient.invalidateQueries({ queryKey: ["applicationDetails"] });
  };

  console.log("applicationData", applicationData);
  const isApplicationArchived = application_status === "archived";

  const isArchived =
    creator_user_id === user_id && application_status === "uploading";

  // const isRestore = archival_user_id === user_id && isApplicationArchived
  const isRestore = creator_user_id === user_id && isApplicationArchived;

  const isApplicationResume =
    application_status === "uploading" ||
    (application_status === "on_hold" &&
      applicationData?.creator_user?._id === user_id);

  console.log("applictionStatus===>", {
    applicationData,
    isHold: applicationData?.creator_user?._id === user_id,
  });

  const { refetch: restoreApp } = useQuery(
    orpc.visa.restoreApplication.queryOptions({
      input: {
        applicationId: _id,
      },
      enabled: false,
    }),
  );
  const { refetch: archiveApp } = useQuery(
    orpc.visa.archiveApplication.queryOptions({
      input: {
        applicationId: _id,
      },
      enabled: false,
    }),
  );

  const openPrompt = useCallback(
    (
      title: string,
      description: string,
      isCTA: boolean,
      content: React.ReactNode,
    ) => {
      setPromptInfo({ isOpen: true, title, description, isCTA, content });
    },
    [],
  );

  const handleArchive = () =>
    openPrompt(
      "Archive Application",
      "Are you sure you want to archive this application?",
      true,
      <p className="text-muted-foreground text-sm">
        You cannot perform any action on the archived application. Are you sure
        you want to archive this application?
      </p>,
    );

  const handleRestore = () =>
    openPrompt(
      "Restore Application",
      "",
      true,
      <p className="text-muted-foreground text-sm">
        Are you sure you want to restore this application ?
      </p>,
    );

  const handleViewActivity = async () => {
    openPrompt(
      "Application Activity",
      "",
      false,
      <div className="h-[50vh] overflow-auto">
        <ApplicationActivity _id={_id} host={host!} />
      </div>,
    );
  };

  const handleResume = async () => {
    const startDate = applicationData?.journey_start_date;
    const isPasstDate = startDate
      ? new Date(startDate) < new Date(new Date().toDateString())
      : false;

    if (isPasstDate) {
      toast.error(
        "Travel Dates have already passed. Please apply for a New Application.",
      );
      return;
    }
    if (applicationData?.total_applicants > 9) {
      setIsResumeIssue({
        isOpen: true,
        applicants: applicationData?.total_applicants,
      });

      openPrompt(
        "Applicant Limit Exceeded.",
        `This visa application has ${applicationData?.total_applicants} applicants. A maximum of 9 applicants is allowed per application.`,
        false,
        "",
      );

      return;
    }
    setClientCookie("application_id", _id);

    // document.cookie = `application_id=${_id}; path=/`;
    goToReview();
  };

  const handleVisaDetails = async () => {
    // document.cookie = `application_id=${_id}; path=/`;
    setClientCookie("application_id", _id);
    await refetchApplicationDetails();
    goToApplicationDetails();
  };

  const handleClose = () =>
    setPromptInfo((prev) => ({ ...prev, isOpen: false }));

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const actionMap: Record<string, () => Promise<any>> = {
        "Restore Application": restoreApp,
        "Archive Application": archiveApp,
      };

      const requestFn = actionMap[promptInfo.title];
      if (!requestFn) return;

      const result = await requestFn();
      const response = result?.data;

      if (response?.status === "success") {
        toast.success(response?.msg || "Operation successful");
        await refreshTabData();
      } else {
        toast.error(response?.msg || "Operation failed");
      }
    } catch {
      toast.error("An error occurred during the operation.");
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="mr-2 min-w-[200px]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* <DropdownMenuItem onClick={handleReview}>
            <History /> Review
          </DropdownMenuItem> */}

          {isApplicationResume && (
            <DropdownMenuItem onClick={handleResume}>
              <History /> Resume
            </DropdownMenuItem>
          )}
          {
            <DropdownMenuItem onClick={handleVisaDetails}>
              <History /> Visa Details
            </DropdownMenuItem>
          }

          {!isApplicationArchived && isArchived && (
            <DropdownMenuItem onClick={handleArchive}>
              <ArchiveSVG /> Archive
            </DropdownMenuItem>
          )}
          {isRestore && (
            <DropdownMenuItem onClick={handleRestore}>
              <History /> Restore
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsOpenNotes(true);
            }}
          >
            <NotesSVGIcon showDot={false} />
            Notes
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleViewActivity}>
            <ActivitySVG /> Activity
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {promptInfo.isOpen && (
        <PromptModal
          open={promptInfo.isOpen}
          onCancel={handleClose}
          onSubmit={handleSubmit}
          title={promptInfo.title}
          description={promptInfo.description}
          isCTA={promptInfo.isCTA}
          submitText={loading ? "Processing..." : "Ok"}
          cancelText="Cancel"
          submitDisabled={loading}
        >
          {promptInfo.content}
        </PromptModal>
      )}

      {/* Notes */}
      {isOpenNotes && (
        <NotesDialog
          open={isOpenNotes}
          onOpenChange={setIsOpenNotes}
          applicationId={_id}
          ref_code={applicationData?.application_reference_code!}
        />
      )}
    </>
  );
};

export default TrackApplicationActions;
