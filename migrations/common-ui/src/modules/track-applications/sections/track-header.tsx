"use client";

import { ChevronLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@workspace/common-ui/lib/utils";
import { TABS } from "@workspace/common-ui/constants/track-applications";
import { useIsMobile } from "@workspace/common-ui/hooks/use-is-mobile";
import { useAppNavigation } from "@workspace/common-ui/hooks/use-app-navigation";
import { SearchInput } from "@workspace/common-ui/modules/track-applications/components/search-input";
import { Button } from "@workspace/ui/components/button";
import DateRangePicker, {
  DateRangeTypes,
} from "@workspace/ui/components/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Skeleton } from "@workspace/ui/components/skeleton";

interface HeaderProps {
  setActiveTab: (tab: string) => void;
  activeTab: string;
  setCurrentPage: (page: number) => void;
  value: string;
  setValue: (value: string) => void;
  dateRange: DateRangeTypes;
  setDateRange: (range: DateRangeTypes) => void;
  isReset: boolean;
  setReset: (value: boolean) => void;
}

const TrackHeader = ({
  setActiveTab,
  activeTab,
  setCurrentPage,
  value,
  setValue,
  dateRange,
  setDateRange,
  isReset,
  setReset,
}: HeaderProps) => {
  const { goToTrackApplications } = useAppNavigation();
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState("");

  const prevTab = useRef<string>("my_applications"); // to remember tab before search

  //  Back button
  const handleBack = () => goToTrackApplications();

  useEffect(() => {
    isReset && setSearchValue("");
  }, [isReset]);

  //  Handle search submit or Enter key
  const handleSearch = () => {
    if (searchValue.trim()) {
      prevTab.current = activeTab !== "search" ? activeTab : prevTab.current;
      setActiveTab("search");
      setValue(searchValue);
      setCurrentPage(1);
    } else {
      handleSearchClear();
    }
  };

  //  Clear search
  const handleSearchClear = () => {
    setValue("");
    setSearchValue("");
    setCurrentPage(1);
    setActiveTab(prevTab.current || "my_applications");
  };

  //  Blur event

  // const handleBlur = () => {
  //   if (value.trim() === "") {
  //     setValue("");
  //     setSearchValue("");
  //   }
  // };

  const handleClear = () => {
    // if (value.trim() !== "") {
    setValue("");
    setSearchValue("");
    // }
  };

  //  Date filter
  const handleDateChange = (dates: DateRangeTypes) => {
    setDateRange(dates);
  };

  //  Tab change
  const handleTabChange = (tab: string) => {
    prevTab.current = tab; // update the remembered tab
    setCurrentPage(1);
    setActiveTab(tab);
  };

  return (
    <header className="border-b bg-white p-3 shadow-sm">
      <div className="mb-3 flex w-full flex-col justify-between gap-3 md:flex-row md:items-center">
        {/* Back + Title */}
        <div className="flex items-center gap-2">
          {isMobile && activeTab === "search" && (
            <ChevronLeft
              className="cursor-pointer text-xl"
              onClick={handleBack}
            />
          )}
          <h1 className="text-2xl font-extrabold tracking-tight whitespace-nowrap">
            Track Applications
          </h1>
        </div>

        {/* 🔍 Search input */}
        <div className="w-full max-w-md">
          <SearchInput
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setReset(false);
            }}
            onSearch={handleSearch}
            onClear={handleClear}
            onFocus={() => {
              prevTab.current = activeTab;
              setActiveTab("search");
              setCurrentPage(1);
              // updateParams({ search_text: value.trim(), tab: "search" });
            }}
            // onBlur={handleBlur}
            placeholder="Name, Email, Application No."
          />
        </div>

        {/*  Date Range Picker */}
        <div className="mx-w-md flex items-center gap-2">
          <DateRangePicker
            className="grow"
            title="Filter by Date Range"
            description="Select a time range to filter your applications."
            selectedDates={dateRange}
            fromDate={new Date(new Date().getFullYear() - 100, 0, 1)}
            toDate={new Date()}
            onSelect={handleDateChange}
          />
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden">
          {activeTab !== "search" && (
            // <TabsSelect tab={activeTab} onSelect={handleTabChange} />
            <Select value={activeTab} onValueChange={handleTabChange}>
              <SelectTrigger className={cn("w-full")}>
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {TABS?.map((tab, i) => (
                  <SelectItem key={tab.name} value={tab.name}>
                    {tab.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/*  Desktop Tabs */}
      {activeTab !== "search" && (
        <div className="hidden w-full gap-3 overflow-x-auto md:flex md:py-2">
          {TABS.map((tab) => (
            <Button
              key={tab.name}
              variant={activeTab === tab.name ? "default" : "outline"}
              onClick={() => handleTabChange(tab.name)}
            >
              {tab.value}
            </Button>
          ))}
        </div>
      )}
    </header>
  );
};

export default TrackHeader;

export const TrackHeaderSkeleton = () => {
  return (
    <header className="border-b bg-white p-3 shadow-sm">
      <div className="mb-3 flex w-full flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="w-full max-w-md">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="mx-w-md flex items-center gap-2">
          <Skeleton className="h-10 w-48 rounded-md" />
        </div>
      </div>
      <div className="hidden w-full gap-3 overflow-x-auto md:flex md:py-2">
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
    </header>
  );
};
