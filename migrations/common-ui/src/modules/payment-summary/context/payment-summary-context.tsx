"use client";

import { useQuery } from "@tanstack/react-query";
import { CHILD_RELATION, DEFAULT_RELATION } from "@workspace/common-ui/constants";
import { orpc } from "@workspace/orpc/lib/orpc";
import { GetApplicationApplicantResponse } from "@workspace/types/review";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

export type PaymentMethodType = "online" | "wallet" | "offline" | "credit_note";
export type OnlineGateway = "stripe" | "razorpay" | "benifit";
export type GroupingAvailable = "yes" | "no";

export interface MetaData {
  host?: string;
  user_id?: string;
  application_id: string;
}
export interface PaymentMode {
  type?: string;
  display_name?: string;
  system_display_name?: string;
  provider?: string;
  payment_config_id?: string;
  currency?: any[];
  status?: string;
  description?: string;
  payment_confirmation_required?: boolean;
  configurations?: PaymentModeConfigurations[] | null
}

export interface PaymentModeConfigurations {
  type: string
  display_name: string
  system_display_name: string
  provider: string
  payment_config_id?: string
  currency: any[]
  status?: string
  isSelected?: boolean;
  description?: string
}
export interface GroupedApplicant {
  applicant_id: string;
  name: string;
  relation: string;
  relationValue: string;
  head_of_family: string;
  HOF_id: string;
  no_of_applicants: number;
  age: number;
}

type FormRef = {
  validate: () => Promise<boolean>;
  getValues: () => Record<string, unknown>;
  reset: () => void;
  getFormState: () => any;
};

export type GroupingData = GroupedApplicant[];

interface PaymentSummaryContextType {
  contactFormRef: React.RefObject<FormRef | null>;
  gstDetailsFormRef: React.RefObject<FormRef | null>;
  couponCodeFormRef: React.RefObject<FormRef | null>;

  childApplicantIds: string[];

  currency: string;
  setCurrency: (currency: string) => void;

  groupingData: GroupingData;
  setGroupingData: React.Dispatch<React.SetStateAction<GroupingData>>;

  selectedPaymentMethod: PaymentMode;
  setSelectedPaymentMethod: (mode: PaymentMode) => void;

  selectedOnlineGateway: OnlineGateway | null;
  setSelectedOnlineGateway: (gateway: OnlineGateway | null) => void;

  isGrouping: GroupingAvailable;
  setIsGrouping: React.Dispatch<React.SetStateAction<GroupingAvailable>>;

  metaData: MetaData;
  setMetaData: React.Dispatch<React.SetStateAction<MetaData>>;

  isDisabledProceed: boolean;
  setIsDisabledProceed: (value: boolean) => void;

  isSingleApplicantChild: boolean;

  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;

  applicationDetails: GetApplicationApplicantResponse | null;
  setApplicationDetails: React.Dispatch<React.SetStateAction<GetApplicationApplicantResponse | null>>;

  acceptedTnc: boolean;
  setAcceptedTnc: React.Dispatch<React.SetStateAction<boolean>>;
}

const PaymentSummaryContext = createContext<
  PaymentSummaryContextType | undefined
>(undefined);

export const PaymentSummaryProvider = ({
  children,
  defaultCurrency
}: {
  children: ReactNode;
  defaultCurrency?: string;
}) => {
  const contactFormRef = useRef<FormRef>(null);
  const gstDetailsFormRef = useRef<FormRef>(null);
  const couponCodeFormRef = useRef<FormRef>(null);

  const [selectedCurrency, setSelectedCurrency] = useState<string>(defaultCurrency || "INR");
  const [applicationDetails, setApplicationDetails] = useState<GetApplicationApplicantResponse | null>(null);
  const [metaData, setMetaData] = useState<MetaData>({
    user_id: "",
    host: "",
    application_id: "",
  });
  const [currency, setCurrency] = useState<string>("INR");
  const [groupingData, setGroupingData] = useState<GroupingData>([]);
  const [isGrouping, setIsGrouping] = useState<GroupingAvailable>("no");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMode>({});
  const [isDisabledProceed, setIsDisabledProceed] = useState<boolean>(false);
  const [acceptedTnc, setAcceptedTnc] = useState(false);

  const [selectedOnlineGateway, setSelectedOnlineGateway] =
    useState<OnlineGateway | null>(null);

  const destinationCioc = applicationDetails?.application?.travelling_to;

  const { data: childAgeData } = useQuery(orpc.visa.getApplicableChildAgeForDestination.queryOptions({
    input: {
      destination_cioc: destinationCioc || ""
    },
    enabled: !!destinationCioc
  }))

  console.log("selectedPaymentMethod", selectedPaymentMethod)
  useEffect(() => {
    if (!selectedPaymentMethod?.payment_config_id) {
      setIsDisabledProceed(true)
    }
  }, [selectedPaymentMethod])

  const childAge = childAgeData?.data?.child_eligible_age || 0;

  const childApplicantIds = groupingData?.filter(a => CHILD_RELATION.some(r => r.value === a.relationValue)).map(a => a.applicant_id) || [];

  const isSingleApplicantChild = groupingData?.length >= 1 && groupingData?.some(a => a.age < childAge && a.relationValue === DEFAULT_RELATION.value);

  const value = useMemo(
    () => ({
      contactFormRef,
      gstDetailsFormRef,
      couponCodeFormRef,
      currency,
      setCurrency,
      groupingData,
      setGroupingData,
      selectedPaymentMethod,
      setSelectedPaymentMethod,
      selectedOnlineGateway,
      setSelectedOnlineGateway,
      isGrouping,
      setIsGrouping,
      setMetaData,
      metaData,
      isDisabledProceed,
      setIsDisabledProceed,
      isSingleApplicantChild,
      applicationDetails,
      setApplicationDetails,
      selectedCurrency,
      setSelectedCurrency,
      childApplicantIds,
      acceptedTnc,
      setAcceptedTnc
    }),
    [
      isDisabledProceed,
      currency,
      groupingData,
      selectedPaymentMethod,
      selectedOnlineGateway,
      isGrouping,
      metaData,
      acceptedTnc,
      isSingleApplicantChild,
      applicationDetails,
      selectedCurrency,
    ],
  );

  return (
    <PaymentSummaryContext.Provider value={value}>
      {children}
    </PaymentSummaryContext.Provider>
  );
};

export const usePaymentSummary = (): PaymentSummaryContextType => {
  const context = useContext(PaymentSummaryContext);
  if (!context) {
    throw new Error("usePaymentSummary must be used within a PaymentProvider");
  }
  return context;
};
