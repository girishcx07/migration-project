"use client";

import { TabPayload } from "@workspace/types/track-application";
import { useAppSearchParams } from "../../../platform/navigation";
import { createContext, ReactNode, useContext, useState } from "react";
import { subDays } from "date-fns";

export interface DateRangeTypes {
  from: Date; // ISO string
  to: Date; // ISO string
}

export interface TrackApplicationContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  dateRange?: DateRangeTypes;
  setDateRange: React.Dispatch<
    React.SetStateAction<DateRangeTypes | undefined>
  >;

  tabPayload: TabPayload;
  setTabPayload: (payload: TabPayload) => void;
  isLoading: boolean;
  error: Error | null;
}

export const TrackApplicationContext = createContext<
  TrackApplicationContextType | undefined
>(undefined);

interface TrackApplicationProviderProps {
  children: ReactNode;

  from: Date;
  to: Date;
}

export const initialTrackPayload: TabPayload = {
  cost_center: "all",
  page_number: 1,
  page_size: 10,
  search_text: "",
};

const safeDate = (val: string | null, fallback: Date) => {
  const d = val ? new Date(val) : null;
  return d && !isNaN(d.getTime()) ? d.toISOString() : fallback.toISOString();
};

export const TrackApplicationProvider: React.FC<
  TrackApplicationProviderProps
> = ({ children, from, to }) => {
  const searchParams = useAppSearchParams();

  const [activeTab, setActiveTab] = useState<string>(
    searchParams.get("tab") || "my_applications",
  );
  const [searchValue, setSearchValue] = useState<string>(
    searchParams.get("search_text") || "",
  );
  const [tabPayload, setTabPayload] = useState<TabPayload>(initialTrackPayload);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const [dateRange, setDateRange] = useState<DateRangeTypes | undefined>({
    from: from,
    to: to,
  });

  const value = {
    activeTab,
    setActiveTab,
    tabPayload,
    setTabPayload,
    isLoading,
    error,
    setSearchValue,
    searchValue,
    dateRange,
    setDateRange,
  };

  return (
    <TrackApplicationContext.Provider value={value}>
      {children}
    </TrackApplicationContext.Provider>
  );
};

export const useTrackApplication = (): TrackApplicationContextType => {
  const context = useContext(TrackApplicationContext);
  if (!context) {
    throw new Error(
      "useTrackApplication must be used within a TrackApplicationProvider",
    );
  }
  return context;
};
