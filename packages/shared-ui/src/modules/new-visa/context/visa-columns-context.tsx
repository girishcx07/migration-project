"use client";

import { NoticeResult } from "@acme/shared-ui/lib/new-visa-utils";
import { getCookie, setClientCookie } from "@acme/shared-ui/lib/cookies";
import { UploadedDocumentFiles, VisaOffer } from "@acme/types/new-visa";
import { addDays } from "date-fns";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { VisaApplicationState } from "../types";

interface VisaColumnData {
  visaApplication: VisaApplicationState;
  visaOffer: VisaOffer | null;
  uploadedDocuments?: UploadedDocumentFiles;
}

type CommonNoticeType = {
  isOpen: boolean;
  title: string;
  html_content: string;
};

type VisaNoticeType = {
  isOpen: boolean;
  isPendingOpen: boolean;
  data: NoticeResult | null;
};

interface VisaColumnContextType {
  columnNumber: number;
  setColumnNumber: React.Dispatch<React.SetStateAction<number>>;

  currency: string;
  setCurrency: React.Dispatch<React.SetStateAction<string>>;
  host: string;

  isUploadingDocuments: boolean;
  setUploadingDocuments: (val: boolean) => void;

  data: VisaColumnData;
  setData: (data: VisaColumnData) => void;

  commonNotice: CommonNoticeType;
  setCommonNotice: (data: CommonNoticeType) => void;

  visaNotice: VisaNoticeType;
  setVisaNotice: (data: VisaNoticeType) => void;

  // Mutators
  setVisaApplicationField: <K extends keyof VisaApplicationState>(
    field: K,
    value: VisaApplicationState[K],
  ) => void;

  setVisaOffer: (data: VisaOffer | null) => void;
  setUploadedDocuments: (
    docs:
      | UploadedDocumentFiles
      | ((prev: UploadedDocumentFiles) => UploadedDocumentFiles),
  ) => void;

  raffApplicants: string[];
  setRaffApplicants: (data: string[]) => void;
  isNoticeHandled: boolean;
  setIsNoticeHandled: (val: boolean) => void;

  shouldTriggerNoticeRef: React.MutableRefObject<boolean>;
}

const VisaColumnContext = createContext<VisaColumnContextType | undefined>(
  undefined,
);

export const VisaColumnProvider = ({
  children,
  initialCurrency,
  initialHost,
}: {
  children: React.ReactNode;
  initialCurrency?: string;
  initialHost?: string;
}) => {
  const [columnNumber, setColumnNumber] = useState<number>(1);
  const [commonNotice, setCommonNotice] = useState<CommonNoticeType>({
    isOpen: false,
    title: "",
    html_content: "",
  });

  const [visaNotice, setVisaNotice] = useState<VisaNoticeType>({
    isOpen: false,
    isPendingOpen: false,
    data: null,
  });

  const [currency, setCurrency] = useState<string>("USD");
  const [host, setHost] = useState<string>(initialHost ?? "");
  const [isUploadingDocuments, setUploadingDocuments] =
    useState<boolean>(false);
  const [raffApplicants, setRaffApplicants] = useState<string[]>([]);
  const [isNoticeHandled, setIsNoticeHandled] = useState(false);

  const shouldTriggerNoticeRef = useRef(false);

  useEffect(() => {
    const cookieHost = getCookie("host");
    const resolvedHost = initialHost || cookieHost || "";

    setHost(resolvedHost);

    if (initialHost) {
      setClientCookie("host", initialHost);
    }
  }, [initialHost]);

  useEffect(() => {
    const defaultCurrency = getCookie("selected_currency");
    const userCurrency = getCookie("currency");
    const cookieHost = getCookie("host");
    const resolvedHost = initialHost || cookieHost || "";

    if (resolvedHost === "arcube") {
      setCurrency("OMR");
    } else if (initialCurrency) {
      setCurrency(initialCurrency);
    } else if (defaultCurrency) {
      setCurrency(defaultCurrency);
    } else if (userCurrency) {
      setCurrency(userCurrency);
    } else {
      setCurrency("USD");
    }
  }, [initialCurrency, initialHost, setCurrency]);

  useEffect(() => {
    if (initialCurrency) {
      setClientCookie("selected_currency", initialCurrency);
    }
  }, [initialCurrency]);

  const [data, setData] = useState<VisaColumnData>({
    visaApplication: {
      nationality: null,
      travellingTo: null,
      countryOfOrigin: null,
      dateRange: undefined,
    },
    visaOffer: null,
    uploadedDocuments: [],
  });

  useEffect(() => {
    // if (isMobile) {
    //   setData((prev) => ({
    //     ...prev,
    //     visaApplication: {
    //       ...prev.visaApplication,
    //       dateRange: undefined,
    //     },
    //   }));
    // } else {
    setData((prev) => ({
      ...prev,
      visaApplication: {
        ...prev.visaApplication,
        dateRange: {
          from: addDays(new Date(), 2),
          to: addDays(new Date(), 8),
        },
      },
    }));
    // }
  }, []);

  const setVisaApplicationField = <K extends keyof VisaApplicationState>(
    field: K,
    value: VisaApplicationState[K],
  ) => {
    setData((prev) => ({
      ...prev,
      visaApplication: {
        ...prev.visaApplication,
        [field]: value,
      },
    }));
  };

  const setVisaOffer = (newData: VisaOffer | null) => {
    setData((prev) => ({
      ...prev,
      visaOffer: newData,
    }));
  };

  const setUploadedDocuments = (
    newData:
      | UploadedDocumentFiles
      | ((prev: UploadedDocumentFiles) => UploadedDocumentFiles),
  ) => {
    setData((prev) => ({
      ...prev,
      uploadedDocuments:
        typeof newData === "function"
          ? newData(prev.uploadedDocuments || [])
          : newData,
    }));
  };
  // console.log("data1111 >>", data);

  return (
    <VisaColumnContext.Provider
      value={{
        visaNotice,
        setVisaNotice,
        columnNumber,
        setColumnNumber,
        isUploadingDocuments,
        setUploadingDocuments,
        currency,
        setCurrency,
        host,
        data,
        setData,
        setVisaApplicationField,
        setVisaOffer,
        setUploadedDocuments,
        raffApplicants,
        setRaffApplicants,
        commonNotice,
        setCommonNotice,
        isNoticeHandled,
        setIsNoticeHandled,
        shouldTriggerNoticeRef,
      }}
    >
      {children}
    </VisaColumnContext.Provider>
  );
};

export const useVisaColumn = () => {
  const context = useContext(VisaColumnContext);
  if (!context) {
    throw new Error("useVisaColumn must be used within VisaColumnProvider");
  }
  return context;
};
