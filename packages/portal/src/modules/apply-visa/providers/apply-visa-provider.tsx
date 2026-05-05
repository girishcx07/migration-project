"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import type {
  UploadedDocumentFiles,
  VisaOffer,
  VisaType,
} from "@repo/types/new-visa";
import type { DateRangeTypes } from "@repo/ui/components/date-range-picker";
import { getClientIpData } from "@repo/api/browser";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";

import type { ModuleBootstrap } from "../../../lib/module-registry";
import type { ApplyVisaInitialData } from "../../../queries/apply-visa";
import type {
  ApplyVisaActions,
  ApplyVisaCountry,
  ApplyVisaTravellingToCountry,
  ApplyVisaUploadDocumentRequest,
} from "../types";
import type { CommonNotice, NoticeResult } from "../types/apply-visa.types";
import { MAX_DOCUMENT_UPLOAD_SIZE } from "../constants/document-upload.constants";
import {
  isAbortError,
  useLatestClientTask,
} from "../hooks/use-apply-visa-queries";
import { useLatestRef } from "../hooks/use-latest-ref";
import { setClientCookie } from "../utils/cookie.utils";
import { findByName, findCountryByIpData } from "../utils/country.utils";
import { resolveInitialCurrency } from "../utils/currency.utils";
import { getDefaultDateRange } from "../utils/date.utils";
import { getTravellingToIdentity } from "../utils/document.utils";
import {
  isAcceptedDocumentFile,
  isWithinDocumentUploadSize,
} from "../utils/file-validation.utils";
import {
  getVisaNoticeContent,
  shouldShowPriceChangeAlert,
} from "../utils/notice.utils";
import { createApplicationPayload, getOfferType } from "../utils/payload.utils";
import {
  createRequestKey,
  createUniqueRequestKey,
} from "../utils/request-key.utils";

interface ApplyVisaProviderProps {
  actions: ApplyVisaActions;
  bootstrap: ModuleBootstrap;
  children: React.ReactNode;
  initialData: ApplyVisaInitialData;
  uploadDocumentEndpoint?: string;
}

export interface ApplyVisaContextValue {
  activeVisaNotice: NoticeResult | null;
  acknowledgePriceChange: () => void;
  bootstrap: ModuleBootstrap;
  canMoveToVisaType: boolean;
  canSubmit: boolean;
  closeCommonNotice: () => void;
  closeOfferDetails: () => void;
  closeVisaNotice: () => void;
  columnDirection: "forward" | "backward";
  columnNumber: number;
  commonNotice: CommonNotice;
  confirmColumnReset: () => void;
  countryOfOrigin: ApplyVisaCountry | null;
  currencies: { currency: string }[];
  currency: string;
  dateRange: DateRangeTypes;
  documents: Awaited<ReturnType<ApplyVisaActions["getVisaDocuments"]>> | null;
  documentsPending: boolean;
  handleCountryOfOriginChange: (
    nextCountryOfOrigin: ApplyVisaCountry | null,
  ) => void;
  handleCurrencyChange: (nextCurrency: string | null) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleRaffSearch: () => void;
  handleSubmit: () => void;
  handleTravellingToChange: (
    nextDestination: ApplyVisaTravellingToCountry | null,
  ) => void;
  handleUpload: (files: File[]) => void;
  handleVisaOfferSelect: (selectedOffer: VisaOffer) => void;
  invalidDocumentDialogOpen: boolean;
  isMobile: boolean;
  isPriceAlertOpen: boolean;
  message: string | null;
  nationalities: ApplyVisaCountry[];
  nationality: ApplyVisaCountry | null;
  offerDetails: VisaOffer | null;
  offersPending: boolean;
  proceedFromVisaNotice: () => void;
  raffApplicants: string[];
  raffPending: boolean;
  raffSearchText: string;
  removeDocument: (index: number) => void;
  resetDialogOpen: boolean;
  cancelVisaNotice: () => void;
  setDateRange: React.Dispatch<React.SetStateAction<DateRangeTypes>>;
  setInvalidDocumentDialogOpen: (open: boolean) => void;
  setNationality: (nextNationality: ApplyVisaCountry | null) => void;
  setOfferDetails: (offer: VisaOffer | null) => void;
  setRaffSearchText: (text: string) => void;
  setResetDialogColumn: (column: number | null) => void;
  submitApplication: () => void;
  submitPending: boolean;
  travellingTo: ApplyVisaTravellingToCountry | null;
  travellingToOptions: ApplyVisaTravellingToCountry[];
  travellingToPending: boolean;
  uploadPending: boolean;
  uploadedDocuments: UploadedDocumentFiles;
  visaOffer: VisaOffer | null;
  visaOffers: VisaOffer[];
}

export const ApplyVisaContext = createContext<ApplyVisaContextValue | null>(
  null,
);

async function uploadDocumentViaEndpoint(
  endpoint: string,
  formData: FormData,
  signal: AbortSignal,
) {
  const response = await fetch(endpoint, {
    body: formData,
    method: "POST",
    signal,
  });
  const payload = (await response.json()) as Awaited<
    ReturnType<ApplyVisaUploadDocumentRequest>
  >;

  if (!response.ok) {
    return {
      data: null,
      msg: payload.msg ?? "Document upload failed.",
      status: "error" as const,
    };
  }

  return payload;
}

export function ApplyVisaProvider({
  actions,
  bootstrap,
  children,
  initialData,
  uploadDocumentEndpoint,
}: Readonly<ApplyVisaProviderProps>) {
  const nationalities = useMemo(
    () => initialData.nationalities.data?.data ?? [],
    [initialData.nationalities.data],
  );
  const evmRequest = initialData.evmRequest?.data ?? null;
  const currencies = initialData.supportedCurrencies.data?.currencies ?? [];
  const defaultNationality = useMemo(
    () => findByName(nationalities, evmRequest?.nationality),
    [evmRequest?.nationality, nationalities],
  );

  const [columnNumber, setColumnNumber] = useState(1);
  const [nationality, setNationalityState] = useState<ApplyVisaCountry | null>(
    defaultNationality,
  );
  const [countryOfOrigin, setCountryOfOrigin] =
    useState<ApplyVisaCountry | null>(defaultNationality);
  const [travellingTo, setTravellingTo] =
    useState<ApplyVisaTravellingToCountry | null>(null);
  const [travellingToOptions, setTravellingToOptions] = useState<
    ApplyVisaTravellingToCountry[]
  >([]);
  const [dateRange, setDateRange] = useState<DateRangeTypes>(() => {
    if (evmRequest?.start_date && evmRequest.end_date) {
      return {
        from: new Date(evmRequest.start_date),
        to: new Date(evmRequest.end_date),
      };
    }

    return getDefaultDateRange();
  });
  const [currency, setCurrency] = useState(() =>
    resolveInitialCurrency(currencies, evmRequest?.currency),
  );
  const [visaOffers, setVisaOffers] = useState<VisaOffer[]>([]);
  const [visaOffer, setVisaOffer] = useState<VisaOffer | null>(null);
  const [offerDetails, setOfferDetails] = useState<VisaOffer | null>(null);
  const [documents, setDocuments] = useState<Awaited<
    ReturnType<ApplyVisaActions["getVisaDocuments"]>
  > | null>(null);
  const [uploadedDocuments, setUploadedDocuments] =
    useState<UploadedDocumentFiles>([]);
  const [raffApplicants, setRaffApplicants] = useState<string[]>([]);
  const [raffSearchText, setRaffSearchText] = useState("");
  const [commonNotice, setCommonNotice] = useState<CommonNotice>({
    htmlContent: "",
    isOpen: false,
    title: "",
  });
  const [visaNotice, setVisaNotice] = useState<NoticeResult | null>(null);
  const [isVisaNoticeHandled, setIsVisaNoticeHandled] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState(
    shouldShowPriceChangeAlert,
  );
  const [invalidDocumentDialogOpen, setInvalidDocumentDialogOpen] =
    useState(false);
  const [resetDialogColumn, setResetDialogColumn] = useState<number | null>(
    null,
  );
  const [columnDirection, setColumnDirection] = useState<
    "forward" | "backward"
  >("forward");
  const actionsRef = useLatestRef(actions);
  const hasUserSelectedNationality = useRef(Boolean(defaultNationality));
  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();
  const [travellingToTransitionPending, startTravellingToTransition] =
    useTransition();
  const [offersTransitionPending, startOffersTransition] = useTransition();
  const [documentsTransitionPending, startDocumentsTransition] =
    useTransition();
  const [uploadTransitionPending, startUploadTransition] = useTransition();
  const [submitTransitionPending, startSubmitTransition] = useTransition();
  const {
    abort: abortTravellingTo,
    isRunning: travellingToRunning,
    run: runTravellingTo,
  } = useLatestClientTask(
    "apply-visa:travelling-to",
    startTravellingToTransition,
  );
  const {
    abort: abortVisaOffers,
    isRunning: visaOffersRunning,
    run: runVisaOffers,
  } = useLatestClientTask("apply-visa:visa-offers", startOffersTransition);
  const {
    abort: abortDocuments,
    isRunning: documentsRunning,
    run: runDocuments,
  } = useLatestClientTask("apply-visa:documents", startDocumentsTransition);
  const {
    abort: abortUpload,
    isRunning: uploadRunning,
    run: runUpload,
  } = useLatestClientTask("apply-visa:upload", startUploadTransition);
  const {
    abort: abortRaffSearch,
    isRunning: raffSearchRunning,
    run: runRaffSearch,
  } = useLatestClientTask("apply-visa:raff-search", startTransition);
  const { abort: abortPriceAcknowledge, run: runPriceAcknowledge } =
    useLatestClientTask("apply-visa:price-acknowledge", startTransition);
  const {
    abort: abortSubmit,
    isRunning: submitRunning,
    run: runSubmit,
  } = useLatestClientTask("apply-visa:submit", startSubmitTransition);
  const raffPending = isPending || raffSearchRunning;
  const travellingToPending =
    travellingToTransitionPending || travellingToRunning;
  const offersPending = offersTransitionPending || visaOffersRunning;
  const documentsPending = documentsTransitionPending || documentsRunning;
  const uploadPending = uploadTransitionPending || uploadRunning;
  const submitPending = submitTransitionPending || submitRunning;

  const abortUploadWork = useCallback(() => {
    abortUpload();
  }, [abortUpload]);

  const uploadDocument: ApplyVisaUploadDocumentRequest = (formData, signal) => {
    if (uploadDocumentEndpoint) {
      return uploadDocumentViaEndpoint(
        uploadDocumentEndpoint,
        formData,
        signal,
      );
    }

    if (actionsRef.current.uploadDocument) {
      return actionsRef.current.uploadDocument(formData);
    }

    return Promise.resolve({
      data: null,
      msg: "Document upload is not configured.",
      status: "error" as const,
    });
  };

  useEffect(() => {
    return () => {
      abortTravellingTo();
      abortVisaOffers();
      abortDocuments();
      abortUpload();
      abortRaffSearch();
      abortPriceAcknowledge();
      abortSubmit();
    };
  }, [
    abortDocuments,
    abortPriceAcknowledge,
    abortRaffSearch,
    abortSubmit,
    abortTravellingTo,
    abortUpload,
    abortVisaOffers,
  ]);

  useEffect(() => {
    if (
      defaultNationality ||
      nationality ||
      hasUserSelectedNationality.current ||
      !nationalities.length
    ) {
      return;
    }

    const controller = new AbortController();

    getClientIpData({ signal: controller.signal })
      .then((ipData) => {
        if (hasUserSelectedNationality.current) return;

        const ipNationality = findCountryByIpData(nationalities, ipData);
        if (ipNationality) {
          setNationalityState(ipNationality);
          setCountryOfOrigin(ipNationality);
        }
      })
      .catch(() => {
        // IP defaulting is best-effort and must not block the form.
      });

    return () => controller.abort();
  }, [defaultNationality, nationalities, nationality]);

  useEffect(() => {
    setClientCookie("selected_currency", currency);
  }, [currency]);

  useEffect(() => {
    const origin = countryOfOrigin ?? nationality;

    if (!nationality || !origin) {
      abortTravellingTo();
      return;
    }

    const requestKey = createRequestKey([
      bootstrap.module,
      nationality.name,
      origin.name,
      evmRequest?.destination ?? "",
    ]);

    runTravellingTo(requestKey, async ({ isCurrent, runAction }) => {
      const response = await runAction(() =>
        actionsRef.current.getTravellingTo({
          module: bootstrap.module,
          nationality: nationality.name,
          origin: origin.name,
        }),
      );
      if (!isCurrent()) {
        return;
      }

      const options = response.data?.data ?? [];
      setTravellingToOptions(options);

      const defaultDestination = findByName(options, evmRequest?.destination);
      if (defaultDestination && isCurrent()) {
        setTravellingTo(defaultDestination);
      }
    });
  }, [
    actionsRef,
    abortTravellingTo,
    bootstrap.module,
    countryOfOrigin,
    evmRequest?.destination,
    nationality,
    runTravellingTo,
  ]);

  const travellingToIdentity = getTravellingToIdentity({
    countryOfOrigin,
    nationality,
    travellingTo,
  });

  useEffect(() => {
    if (!currency || !nationality || !countryOfOrigin || !travellingTo) {
      abortVisaOffers();
      return;
    }

    const requestKey = createRequestKey([
      bootstrap.module,
      currency,
      travellingTo.managed_by ?? "",
      travellingTo.name,
      travellingToIdentity,
      getOfferType(bootstrap.module),
    ]);

    runVisaOffers(requestKey, async ({ isCurrent, runAction }) => {
      const response = await runAction(() =>
        actionsRef.current.getVisaOffers({
          currency,
          managedBy: travellingTo.managed_by ?? "",
          module: bootstrap.module,
          travellingTo: travellingTo.name,
          travellingToIdentity,
          type: getOfferType(bootstrap.module),
        }),
      );
      if (!isCurrent()) {
        return;
      }

      setVisaOffers(response.data ?? []);
    });
  }, [
    actionsRef,
    abortVisaOffers,
    bootstrap.module,
    countryOfOrigin,
    currency,
    nationality,
    runVisaOffers,
    travellingTo,
    travellingToIdentity,
  ]);

  const visaNoticeContent = useMemo(() => {
    return getVisaNoticeContent({
      selectedNationality: nationality?.name ?? "",
      selectedTravellingTo: travellingTo?.name ?? "",
      visaOffers,
      visaTypesData: (travellingTo?.visa_types ?? []) as VisaType[],
    });
  }, [
    nationality?.name,
    travellingTo?.name,
    travellingTo?.visa_types,
    visaOffers,
  ]);

  const hasRestrictedVisaNotice = useMemo(
    () =>
      ((travellingTo?.visa_types ?? []) as VisaType[]).some((item) => {
        const type = item.type.toLowerCase();
        return type === "entry_restricted" || type === "visa_exempt";
      }),
    [travellingTo?.visa_types],
  );

  const hasVisaOnArrivalNotice = useMemo(
    () =>
      ((travellingTo?.visa_types ?? []) as VisaType[]).some(
        (item) => item.type.toLowerCase() === "visa_on_arrival",
      ),
    [travellingTo?.visa_types],
  );

  const shouldSuppressVisaOnArrivalNotice =
    hasVisaOnArrivalNotice && !hasRestrictedVisaNotice;

  const shouldOpenVisaNotice =
    visaNoticeContent.navigateToNotification &&
    !shouldSuppressVisaOnArrivalNotice;
  const activeVisaNotice =
    visaNotice ??
    (!isMobile &&
    shouldOpenVisaNotice &&
    !isVisaNoticeHandled &&
    !commonNotice.isOpen
      ? visaNoticeContent.obj
      : null);

  useEffect(() => {
    if (
      !visaOffer?.visa_details?.visa_id ||
      !visaOffer.travelling_to_identity
    ) {
      abortDocuments();
      abortUploadWork();
      return;
    }

    const requestKey = createRequestKey([
      bootstrap.module,
      visaOffer.travelling_to_identity,
      visaOffer.visa_details.visa_id,
    ]);

    abortUploadWork();
    // Show the document skeleton immediately when the selected offer changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDocuments(null);

    runDocuments(requestKey, async ({ isCurrent, runAction }) => {
      const response = await runAction(() =>
        actionsRef.current.getVisaDocuments({
          module: bootstrap.module,
          travellingToIdentity: visaOffer.travelling_to_identity ?? "",
          visaId: visaOffer.visa_details?.visa_id ?? "",
        }),
      );
      if (!isCurrent()) {
        return;
      }

      setDocuments(response);
    });
  }, [
    abortDocuments,
    abortUploadWork,
    actionsRef,
    bootstrap.module,
    runDocuments,
    visaOffer,
  ]);

  const canMoveToVisaType =
    Boolean(nationality) &&
    Boolean(countryOfOrigin) &&
    Boolean(travellingTo) &&
    Boolean(dateRange?.from) &&
    Boolean(dateRange?.to);
  const canSubmit =
    Boolean(visaOffer) &&
    (uploadedDocuments.length > 0 || raffApplicants.length > 0) &&
    !uploadPending &&
    !submitPending;

  const setActiveColumn = (nextColumn: number) => {
    setColumnDirection(nextColumn >= columnNumber ? "forward" : "backward");
    setColumnNumber(nextColumn);
  };

  const rejectDocumentWork = () => {
    abortDocuments();
    abortUploadWork();
  };

  const rejectVisaOfferWork = () => {
    abortVisaOffers();
    rejectDocumentWork();
  };

  const rejectRouteWork = () => {
    abortTravellingTo();
    rejectVisaOfferWork();
  };

  const resetRouteSelection = () => {
    rejectRouteWork();
    setTravellingTo(null);
    setTravellingToOptions([]);
    setVisaOffer(null);
    setDocuments(null);
    setVisaOffers([]);
    setUploadedDocuments([]);
    setCommonNotice({ htmlContent: "", isOpen: false, title: "" });
    setVisaNotice(null);
    setIsVisaNoticeHandled(false);
  };

  const handleNationalityChange = (
    nextNationality: ApplyVisaCountry | null,
  ) => {
    hasUserSelectedNationality.current = true;
    setNationalityState(nextNationality);
    setCountryOfOrigin(nextNationality);
    resetRouteSelection();
    setActiveColumn(1);
  };

  const handleCountryOfOriginChange = (
    nextCountryOfOrigin: ApplyVisaCountry | null,
  ) => {
    setCountryOfOrigin(nextCountryOfOrigin);
    resetRouteSelection();
    setActiveColumn(1);
  };

  const handleTravellingToChange = (
    nextDestination: ApplyVisaTravellingToCountry | null,
  ) => {
    rejectVisaOfferWork();
    setTravellingTo(nextDestination);
    setVisaOffer(null);
    setDocuments(null);
    setUploadedDocuments([]);
    setVisaOffers([]);
    setVisaNotice(null);
    setIsVisaNoticeHandled(false);
    setCommonNotice({
      htmlContent: nextDestination?.destination_info?.html_content ?? "",
      isOpen: Boolean(nextDestination?.destination_info),
      title: nextDestination?.destination_info?.title ?? "",
    });

    if (!nextDestination?.cor_required) {
      setCountryOfOrigin(nationality);
    }

    if (nextDestination && !nextDestination.destination_info && !isMobile) {
      setActiveColumn(2);
    }
  };

  const handleCurrencyChange = (nextCurrency: string | null) => {
    if (!nextCurrency) return;

    if (visaOffer) {
      rejectVisaOfferWork();
      setVisaOffer(null);
      setDocuments(null);
      setUploadedDocuments([]);
      setActiveColumn(2);
    }

    setClientCookie("selected_currency", nextCurrency);
    setCurrency(nextCurrency);
  };

  const handleVisaOfferSelect = (selectedOffer: VisaOffer) => {
    rejectDocumentWork();
    setVisaOffer(selectedOffer);
    if (!isMobile) {
      setActiveColumn(3);
    }
  };

  const handleUpload = (files: File[]) => {
    const acceptedFiles = files.filter(
      (file) =>
        isAcceptedDocumentFile(file) && isWithinDocumentUploadSize(file),
    );

    const hasInvalidType = files.some((file) => !isAcceptedDocumentFile(file));
    const hasOversizedFile = files.some(
      (file) =>
        isAcceptedDocumentFile(file) && !isWithinDocumentUploadSize(file),
    );

    if (hasInvalidType) {
      toast.error("Upload JPG, JPEG, JFIF, PNG, or PDF documents only.");
    }

    if (hasOversizedFile) {
      toast.error(
        `Each document must be ${(MAX_DOCUMENT_UPLOAD_SIZE / (1024 * 1024)).toFixed()} MB or smaller.`,
      );
    }

    if (
      !acceptedFiles.length ||
      !nationality ||
      !visaOffer?.visa_details?.visa_id
    ) {
      return;
    }

    const uploadVisaId = visaOffer.visa_details.visa_id;
    const uploadNationalityCode = nationality.cioc;

    runUpload(
      createUniqueRequestKey("upload"),
      async ({ isCurrent, runAction, signal }) => {
        const uploadResults = await Promise.allSettled(
          acceptedFiles.map((file) => {
            const formData = new FormData();
            formData.append("document", file);
            formData.append("module", bootstrap.module);
            formData.append("nationalityCode", uploadNationalityCode);
            formData.append("visaId", uploadVisaId);

            return runAction(() => uploadDocument(formData, signal));
          }),
        );

        if (!isCurrent()) {
          return;
        }

        const uploaded = uploadResults.flatMap((result) => {
          if (
            result.status === "fulfilled" &&
            result.value.status === "success" &&
            result.value.data
          ) {
            return result.value.data;
          }

          return [];
        });
        const failedUpload = uploadResults.find((result) => {
          if (result.status === "rejected") {
            return !isAbortError(result.reason);
          }

          return result.value.status !== "success" || !result.value.data;
        });

        if (uploaded.length > 0) {
          setUploadedDocuments((previous) => [...previous, ...uploaded]);
        }

        if (failedUpload) {
          toast.error(
            failedUpload.status === "fulfilled"
              ? (failedUpload.value.msg ?? "Document upload failed.")
              : "Document upload failed.",
          );
        }
      },
    );
  };

  const handleRaffSearch = () => {
    if (!raffSearchText.trim()) return;
    const searchText = raffSearchText.trim();

    runRaffSearch(searchText, async ({ isCurrent, runAction }) => {
      const response = await runAction(() =>
        actionsRef.current.searchRaffApplication({
          module: bootstrap.module,
          searchText,
        }),
      );
      if (!isCurrent()) {
        return;
      }
      const applicantRefs =
        response.data?.map((applicant) => applicant.ref_code).filter(Boolean) ??
        [];
      setRaffApplicants((previous) =>
        Array.from(new Set([...previous, ...applicantRefs])),
      );
      if (applicantRefs.length === 0) {
        setMessage(response.msg ?? "No RAFF applicants found.");
      }
    });
  };

  const submitApplication = () => {
    const payload = createApplicationPayload({
      bootstrap,
      countryOfOrigin,
      currency,
      dateRange,
      nationality,
      raffApplicants,
      travellingTo,
      travellingToIdentity,
      uploadedDocuments,
      visaOffer,
    });

    if (!payload) {
      setMessage("Complete the application details before proceeding.");
      return;
    }

    runSubmit(
      createUniqueRequestKey("submit"),
      async ({ isCurrent, runAction }) => {
        const response = await runAction(() =>
          actionsRef.current.createApplication(payload),
        );
        if (!isCurrent()) {
          return;
        }

        if (response.status === "success") {
          window.location.assign(`/${bootstrap.module}/review`);
          return;
        }

        setMessage(response.msg ?? "Failed to create an application.");
      },
    );
  };

  const handleSubmit = () => {
    const hasInvalidDocuments = uploadedDocuments.some(
      (document) =>
        !document.is_valid && document.file_type !== "application/pdf",
    );

    if (hasInvalidDocuments) {
      setInvalidDocumentDialogOpen(true);
      return;
    }

    submitApplication();
  };

  const confirmColumnReset = () => {
    if (!resetDialogColumn) return;

    if (resetDialogColumn === 1) {
      rejectRouteWork();
      setTravellingTo(null);
      setVisaOffer(null);
      setDocuments(null);
      setUploadedDocuments([]);
    }

    if (resetDialogColumn === 2) {
      rejectVisaOfferWork();
      setVisaOffer(null);
      setDocuments(null);
      setUploadedDocuments([]);
    }

    setActiveColumn(resetDialogColumn);
    setResetDialogColumn(null);
  };

  const handlePrevious = () => {
    if (columnNumber <= 1) return;

    if (columnNumber === 3) {
      rejectDocumentWork();
      setVisaOffer(null);
      setDocuments(null);
      setUploadedDocuments([]);
    }

    if (columnNumber === 2) {
      rejectRouteWork();
      setTravellingTo(null);
      setVisaOffers([]);
      setCommonNotice({ htmlContent: "", isOpen: false, title: "" });
      setVisaNotice(null);
      setIsVisaNoticeHandled(false);
    }

    setActiveColumn(columnNumber - 1);
  };

  const handleNext = () => {
    if (columnNumber === 1) {
      if (commonNotice.isOpen) return;

      if (shouldOpenVisaNotice && !isVisaNoticeHandled) {
        setVisaNotice(visaNoticeContent.obj);
        return;
      }
    }

    setActiveColumn(Math.min(3, columnNumber + 1));
  };

  const closeCommonNotice = () => {
    setCommonNotice({ htmlContent: "", isOpen: false, title: "" });
    if (travellingTo && !isMobile) {
      setActiveColumn(2);
    }
  };

  const proceedFromVisaNotice = () => {
    setVisaNotice(null);
    setIsVisaNoticeHandled(true);
    setActiveColumn(2);
  };

  const cancelVisaNotice = () => {
    rejectRouteWork();
    setVisaNotice(null);
    setIsVisaNoticeHandled(true);
    setTravellingTo(null);
    setVisaOffers([]);
    setVisaOffer(null);
    setDocuments(null);
    setUploadedDocuments([]);
    setActiveColumn(1);
  };

  const acknowledgePriceChange = () => {
    setClientCookie("price_change_ack", "true");
    setIsPriceAlertOpen(false);

    runPriceAcknowledge("acknowledge", async ({ runAction }) => {
      await runAction(() =>
        actionsRef.current.acknowledgePriceChange({ module: bootstrap.module }),
      );
    });
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments((previous) =>
      previous.filter((_, documentIndex) => documentIndex !== index),
    );
  };

  const closeOfferDetails = () => {
    setOfferDetails(null);
  };

  const closeVisaNotice = () => {
    setVisaNotice(null);
  };

  const contextValue: ApplyVisaContextValue = {
    activeVisaNotice,
    acknowledgePriceChange,
    bootstrap,
    canMoveToVisaType,
    canSubmit,
    cancelVisaNotice,
    closeCommonNotice,
    closeOfferDetails,
    closeVisaNotice,
    columnDirection,
    columnNumber,
    commonNotice,
    confirmColumnReset,
    countryOfOrigin,
    currencies,
    currency,
    dateRange,
    documents,
    documentsPending,
    handleCountryOfOriginChange,
    handleCurrencyChange,
    handleNext,
    handlePrevious,
    handleRaffSearch,
    handleSubmit,
    handleTravellingToChange,
    handleUpload,
    handleVisaOfferSelect,
    invalidDocumentDialogOpen,
    isMobile,
    isPriceAlertOpen,
    message,
    nationalities,
    nationality,
    offerDetails,
    offersPending,
    proceedFromVisaNotice,
    raffApplicants,
    raffPending,
    raffSearchText,
    removeDocument,
    resetDialogOpen: Boolean(resetDialogColumn),
    setDateRange,
    setInvalidDocumentDialogOpen,
    setNationality: handleNationalityChange,
    setOfferDetails,
    setRaffSearchText,
    setResetDialogColumn,
    submitApplication,
    submitPending,
    travellingTo,
    travellingToOptions,
    travellingToPending,
    uploadPending,
    uploadedDocuments,
    visaOffer,
    visaOffers,
  };

  return (
    <ApplyVisaContext.Provider value={contextValue}>
      {children}
    </ApplyVisaContext.Provider>
  );
}
