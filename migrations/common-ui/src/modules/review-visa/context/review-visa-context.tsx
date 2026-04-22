"use client";

import {
  getApplicantName,
  setClientCookie,
} from "@workspace/common-ui/lib/utils";
import {
  Applicant,
  ApplicantRequiredDocument,
  Application,
} from "@workspace/types/review";
import type { ReactNode } from "react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getApplicantReadyStatus,
  isApplicantStatusHydrated,
} from "../lib/ready-status";

// ================= Types =================
export interface ApplicantErrors {
  [key: string]: {
    label: string;
    isValid: boolean;
    isRequiredField: boolean;
    hasValue?: boolean;
    hasError?: boolean;
    validated?: boolean;
    name?: string;
  };
}

interface ApplicationReadinessState {
  hasApplicants: boolean;
  hasVisaForm: boolean;
  hasDocuments: boolean;
}

type ApplicationDataType = {
  applicants: Applicant[];
  application: Application;
};

export type ActiveTabs = "documents" | "visaform" | string;

export type FormStatus = "calculating" | "pending" | "completed";
export type ActionType =
  | "edit"
  | "replace"
  | "delete"
  | "add"
  | "link"
  | "preview";

export interface ApplicantState {
  applicantId: string;
  name: string;
  declaration: boolean;
  errors: ApplicantErrors;
  formProgress: number;
  status: FormStatus;
  documentsList: ApplicantRequiredDocument[];
  hasLoadedDocuments: boolean;
  hasLoadedVisaForm: boolean;
}

export interface ReviewVisaFormHandle {
  validate: () => Promise<boolean>;
  getValues: () => Record<string, any>;
  reset: (values?: Record<string, any>) => void;
}

interface ApplicationContextType {
  applicants: ApplicantState[];
  actionType: ActionType | null;
  isDocumentPoolOpen: boolean;
  selectedDocument: ApplicantRequiredDocument | null;
  applicationReadiness: ApplicationReadinessState;

  setApplicationReadiness: React.Dispatch<
    React.SetStateAction<ApplicationReadinessState>
  >;
  setSelectedDocument: React.Dispatch<
    React.SetStateAction<ApplicantRequiredDocument | null>
  >;
  setIsDocumentPoolOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setActionType: React.Dispatch<React.SetStateAction<ActionType | null>>;
  setApplicants: React.Dispatch<React.SetStateAction<ApplicantState[]>>;
  activeApplicantId: string | null;
  applicationId: string;
  setActiveApplicant: (id: string) => void;
  applicationDetails: ApplicationDataType;
  setApplicationDetails: React.Dispatch<
    React.SetStateAction<ApplicationDataType>
  >;

  updateApplicant: (id: string, data: Partial<ApplicantState>) => void;
  removeApplicant: (id: string) => void;
  addApplicant: (applicant: Applicant) => void;
  syncApplicantsFromServer: (serverApplicants: Applicant[]) => void;
  getActiveApplicant: () => ApplicantState | undefined;
  applicantLimitDialogOpen: boolean;
  setApplicantLimitDialogOpen: (value: boolean) => void;
  showHoldConfirmationModal: boolean;
  setShowHoldConfirmationModal: (value: boolean) => void;
  isDocumentSectionError: boolean;
  setIsDocumentSectionError: (value: boolean) => void;
  reviewVisaFormRef: React.MutableRefObject<ReviewVisaFormHandle | null>;
  validateVisaForm: () => Promise<boolean>;
  getVisaFormValues: () => Record<string, any>;
  resetVisaForm: (values?: Record<string, any>) => void;
  setApplicantFormErrorVisible: (
    visible: boolean,
    applicantId?: string,
  ) => void;
  getApplicantFormErrorVisible: (applicantId?: string) => boolean;
  activeTab: ActiveTabs;
  setActiveTab: React.Dispatch<React.SetStateAction<ActiveTabs>>;
}

// ========== Context ==========
const ApplicationContext = createContext<ApplicationContextType | undefined>(
  undefined,
);

// ========== Provider ==========
export const ApplicationProvider = ({
  children,
  initialApplicantId,
  initialApplicationId,
  applicationDetailsData,
}: {
  children: ReactNode;
  initialApplicantId: string;
  initialApplicationId: string;
  applicationDetailsData: ApplicationDataType;
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTabs>("documents");

  const [activeApplicantId, setActiveApplicantId] =
    useState(initialApplicantId);
  const [selectedDocument, setSelectedDocument] =
    useState<ApplicantRequiredDocument | null>(null);
  const [applicants, setApplicants] = useState<ApplicantState[]>([]);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [isDocumentPoolOpen, setIsDocumentPoolOpen] = useState(false);
  const [applicationDetails, setApplicationDetails] =
    useState<ApplicationDataType>(applicationDetailsData);
  const [applicationReadiness, setApplicationReadiness] =
    useState<ApplicationReadinessState>({
      hasApplicants: applicationDetailsData?.applicants?.length > 0,
      hasVisaForm: false,
      hasDocuments: false,
    });
  const [applicantLimitDialogOpen, setApplicantLimitDialogOpen] =
    useState(false);
  const [showHoldConfirmationModal, setShowHoldConfirmationModal] =
    useState(false);

  const [isDocumentSectionError, setIsDocumentSectionError] = useState(false);
  const [applicantFormErrorVisibility, setApplicantFormErrorVisibility] =
    useState<Record<string, boolean>>({});
  const reviewVisaFormRef = useRef<ReviewVisaFormHandle | null>(null);

  const validateVisaForm = useCallback(async () => {
    if (!reviewVisaFormRef.current) return false;
    return reviewVisaFormRef.current.validate();
  }, []);

  const getVisaFormValues = useCallback(() => {
    return reviewVisaFormRef.current?.getValues() || {};
  }, []);

  const resetVisaForm = useCallback((values?: Record<string, any>) => {
    reviewVisaFormRef.current?.reset(values);
  }, []);

  const setApplicantFormErrorVisible = useCallback(
    (visible: boolean, applicantId?: string) => {
      const targetApplicantId = applicantId || activeApplicantId;
      if (!targetApplicantId) return;
      setApplicantFormErrorVisibility((prev) => ({
        ...prev,
        [targetApplicantId]: visible,
      }));
    },
    [activeApplicantId],
  );

  const getApplicantFormErrorVisible = useCallback(
    (applicantId?: string) => {
      const targetApplicantId = applicantId || activeApplicantId;
      if (!targetApplicantId) return false;
      return !!applicantFormErrorVisibility[targetApplicantId];
    },
    [activeApplicantId, applicantFormErrorVisibility],
  );

  // ===== Helpers =====
  const createApplicantState = useCallback((app: Applicant): ApplicantState => {
    return {
      applicantId: app._id,
      name: getApplicantName(app),
      declaration: false,
      errors: {},
      formProgress: 0,
      status: "calculating",
      documentsList: [],
      hasLoadedDocuments: false,
      hasLoadedVisaForm: false,
    };
  }, []);

  const filterServerFields = useCallback((data: Partial<ApplicantState>) => {
    // whitelist only fields that exist in server schema
    const allowed: Partial<Applicant> = {};
    if (data.status) allowed["ready_status"] = data.status;
    return allowed;
  }, []);

  const applyApplicantReadiness = useCallback((applicant: ApplicantState) => {
    const status = isApplicantStatusHydrated(applicant)
      ? getApplicantReadyStatus({
          documents: applicant.documentsList,
          errors: applicant.errors,
          hasLoadedDocuments: applicant.hasLoadedDocuments,
          hasLoadedVisaForm: applicant.hasLoadedVisaForm,
        })
      : applicant.status;

    return {
      ...applicant,
      status,
    };
  }, []);

  //   console.log('🎯 Setting up navigation listeners...');

  //   const handlePageShow = (event: PageTransitionEvent) => {
  //     console.log('📄 Pageshow event fired!', {
  //       persisted: event.persisted,
  //       type: event.type,
  //     });

  //     if (event.persisted) {
  //       console.log('📦 Page restored from bfcache (browser back button)');
  //       refetchApplicationData();
  //     } else {
  //       console.log('🆕 Page loaded normally (not from cache)');
  //     }
  //   };

  //   const handlePageHide = (event: PageTransitionEvent) => {
  //     console.log('👋 Pagehide event fired!', {
  //       persisted: event.persisted,
  //     });
  //   };

  //   // Also handle window focus - useful when user switches tabs
  //   const handleFocus = () => {
  //     console.log('👁️ Window focused, refreshing data...');
  //     refetchApplicationData();
  //   };

  //   // Handle visibility change (more reliable than focus)
  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === 'visible') {
  //       console.log('👀 Page became visible, refreshing data...');
  //       refetchApplicationData();
  //     }
  //   };

  //   window.addEventListener('pageshow', handlePageShow);
  //   window.addEventListener('pagehide', handlePageHide);
  //   window.addEventListener('focus', handleFocus);
  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   return () => {
  //     console.log('🧹 Cleaning up listeners...');
  //     window.removeEventListener('pageshow', handlePageShow);
  //     window.removeEventListener('pagehide', handlePageHide);
  //     window.removeEventListener('focus', handleFocus);
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };

  // ========== syncApplicantsFromServer ==========
  const syncApplicantsFromServer = useCallback(
    (serverApplicants: Applicant[]) => {
      console.log("🔄 Syncing applicants from server:", {
        count: serverApplicants?.length,
        ids: serverApplicants?.map((a) => a._id),
      });

      setApplicants((prevApplicants) =>
        serverApplicants.map((app) => {
          const existing = prevApplicants.find(
            (prev) => prev.applicantId === app._id,
          );
          const base = createApplicantState(app);
          if (!existing) return base;

          const mergedApplicant = {
            ...base,
            declaration: existing.declaration,
            errors: existing.errors,
            formProgress: existing.formProgress,
            documentsList: existing.documentsList,
            hasLoadedDocuments: existing.hasLoadedDocuments,
            hasLoadedVisaForm: existing.hasLoadedVisaForm,
            name: existing.name || base.name,
          };

          if (!isApplicantStatusHydrated(existing) && app.ready_status) {
            mergedApplicant.status = app.ready_status;
          }

          return applyApplicantReadiness(mergedApplicant);
        }),
      );
    },
    [applyApplicantReadiness, createApplicantState],
  );

  // sync on mount
  useEffect(() => {
    syncApplicantsFromServer(applicationDetailsData?.applicants || []);
  }, [applicationDetailsData, syncApplicantsFromServer]);

  // ========== updateApplicant ==========
  const updateApplicant = useCallback(
    (id: string, data: Partial<ApplicantState>) => {
      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.applicantId === id
            ? applyApplicantReadiness({ ...applicant, ...data })
            : applicant,
        ),
      );

      setApplicationDetails((prev) => {
        if (!prev) return prev;

        const { application, applicants } = prev;

        const updated = applicants.map((app) =>
          app._id === id ? { ...app, ...filterServerFields(data) } : app,
        );

        return { application, applicants: updated };
      });
    },
    [applyApplicantReadiness, filterServerFields],
  );

  // ========== removeApplicant ==========
  const removeApplicant = useCallback(
    (id: string) => {
      setApplicants((prev) => {
        const filtered = prev.filter((a) => a.applicantId !== id);

        if (activeApplicantId === id) {
          const next =
            filtered.length > 0 ? filtered[0]?.applicantId || "" : "";
          setActiveApplicantId(next);
          setClientCookie("applicant_id", next);
        }
        return filtered;
      });

      setApplicationDetails((prev) => {
        if (!prev) return prev;

        const { application, applicants } = prev;
        const filtered = applicants.filter((app) => app._id !== id);

        return {
          application,
          applicants: filtered,
        };
      });
    },
    [activeApplicantId, setActiveApplicantId],
  );

  // ========== setActiveApplicant ==========
  const setActiveApplicant = useCallback((id: string) => {
    // set the cookie for iframe accessible and others
    setClientCookie("applicant_id", id);

    setActiveApplicantId(id);
  }, []);

  // ========== addApplicant ==========
  const addApplicant = useCallback(
    (newApplicant: Applicant) => {
      setApplicants((prev) => {
        const exists = prev.some((a) => a.applicantId === newApplicant._id);
        if (exists) return prev;
        return [...prev, createApplicantState(newApplicant)];
      });

      setApplicationDetails((prev) => {
        if (!prev) return prev;

        const { applicants, application } = prev;
        const exists = applicants.some((a) => a._id === newApplicant._id);
        if (exists) return prev;

        return {
          application,
          applicants: [...applicants, newApplicant],
        };
      });
    },
    [createApplicantState],
  );

  // ========== getActiveApplicant ==========
  const getActiveApplicant = useCallback(() => {
    return applicants.find((a) => a.applicantId === activeApplicantId);
  }, [applicants, activeApplicantId]);

  // ========== Memo Value ==========
  const value = useMemo(
    () => ({
      applicationId: initialApplicationId,
      applicants,
      applicationDetails,
      setApplicationDetails,
      setApplicants,
      selectedDocument,
      activeApplicantId,
      setActiveApplicant,
      updateApplicant,
      removeApplicant,
      addApplicant,
      syncApplicantsFromServer,
      getActiveApplicant,
      setActionType,
      setSelectedDocument,
      actionType,
      isDocumentPoolOpen,
      setIsDocumentPoolOpen,
      applicationReadiness,
      setApplicationReadiness,
      applicantLimitDialogOpen,
      setApplicantLimitDialogOpen,
      showHoldConfirmationModal,
      setShowHoldConfirmationModal,
      isDocumentSectionError,
      setIsDocumentSectionError,
      reviewVisaFormRef,
      validateVisaForm,
      getVisaFormValues,
      resetVisaForm,
      setApplicantFormErrorVisible,
      getApplicantFormErrorVisible,
      activeTab,
      setActiveTab,
    }),
    [
      initialApplicationId,
      applicants,
      applicationDetails,
      selectedDocument,
      activeApplicantId,
      setActiveApplicant,
      updateApplicant,
      removeApplicant,
      addApplicant,
      syncApplicantsFromServer,
      getActiveApplicant,
      actionType,
      isDocumentPoolOpen,
      applicationReadiness,
      applicantLimitDialogOpen,
      showHoldConfirmationModal,
      isDocumentSectionError,
      validateVisaForm,
      getVisaFormValues,
      resetVisaForm,
      setApplicantFormErrorVisible,
      getApplicantFormErrorVisible,
      activeTab,
      setActiveTab,
    ],
  );

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};

// ========== Hook ==========
export const useApplicationState = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error(
      "useApplicationState must be used within an ApplicationProvider",
    );
  }
  return context;
};
