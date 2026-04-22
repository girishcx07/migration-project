"use client";

import { useCallback, useEffect, useState } from "react";
import {
  checkNavigationFlag,
  usePersistedState,
} from "@workspace/common-ui/hooks/use-persisted-state";

const CONTACT_PERSISTENCE_KEY = "contact_details_persistence";
const FROM_REVIEW_PAGE_FLAG = "from_review_page";
const ONE_HOUR_MS = 60 * 60 * 1000;

export interface ContactFormData {
  firstName: string;
  lastName: string;
  mobile_no: string;
  email: string;
}

export interface ContactPersistenceState {
  formData: ContactFormData;
  otpVerified: boolean;
  otpSent: boolean;
}

const DEFAULT_FORM_DATA: ContactFormData = {
  firstName: "",
  lastName: "",
  mobile_no: "",
  email: "",
};

const DEFAULT_STATE: ContactPersistenceState = {
  formData: DEFAULT_FORM_DATA,
  otpVerified: false,
  otpSent: false,
};

interface UseContactPersistenceReturn {
  // State values
  persistedState: ContactPersistenceState;
  isFromReviewPage: boolean;
  isHydrated: boolean;

  // State setters
  setOtpVerified: (value: boolean) => void;
  setOtpSent: (value: boolean) => void;
  updateFormData: (data: Partial<ContactFormData>) => void;

  // Utilities
  clearPersistence: () => void;
  refreshTimestamp: () => void;
}

/**
 * A hook for managing ContactDetails persistence state.
 *
 * Features:
 * - Persists email verification status and form data to localStorage
 * - Automatically expires after 1 hour
 * - Resets state when navigating from review page
 * - Preserves state on page refresh or navigation from other pages
 */
export function useContactPersistence(): UseContactPersistenceReturn {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isFromReviewPage, setIsFromReviewPage] = useState(false);

  const [persistedState, setPersistedState, clearPersistence] =
    usePersistedState<ContactPersistenceState>({
      key: CONTACT_PERSISTENCE_KEY,
      defaultValue: DEFAULT_STATE,
      expirationMs: ONE_HOUR_MS,
    });

  // Check navigation source on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const fromReview = checkNavigationFlag(FROM_REVIEW_PAGE_FLAG, true);

    if (fromReview) {
      // Clear persisted data when coming from review page
      clearPersistence();
      setIsFromReviewPage(true);
    }

    setIsHydrated(true);
  }, [clearPersistence]);

  // Set OTP verified status
  const setOtpVerified = useCallback(
    (value: boolean) => {
      setPersistedState((prev) => ({
        ...prev,
        otpVerified: value,
      }));
    },
    [setPersistedState],
  );

  // Set OTP sent status
  const setOtpSent = useCallback(
    (value: boolean) => {
      setPersistedState((prev) => ({
        ...prev,
        otpSent: value,
      }));
    },
    [setPersistedState],
  );

  // Update form data partially
  const updateFormData = useCallback(
    (data: Partial<ContactFormData>) => {
      setPersistedState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          ...data,
        },
      }));
    },
    [setPersistedState],
  );

  // Refresh timestamp to extend expiration
  const refreshTimestamp = useCallback(() => {
    setPersistedState((prev) => ({ ...prev }));
  }, [setPersistedState]);

  return {
    persistedState,
    isFromReviewPage,
    isHydrated,
    setOtpVerified,
    setOtpSent,
    updateFormData,
    clearPersistence,
    refreshTimestamp,
  };
}

/**
 * Export the flag key constant for use in review pages.
 */
export { FROM_REVIEW_PAGE_FLAG };
