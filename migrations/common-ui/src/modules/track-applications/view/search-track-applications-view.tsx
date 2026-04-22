"use client";

import { Button } from "@workspace/ui/components/button";
import { subDays } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useAppNavigation } from "@workspace/common-ui/hooks/use-app-navigation";
import { DateRangeTypes } from "../../new-visa/types";
import { SearchInput } from "../components/search-input";
import { useAppRouter, useAppSearchParams } from "../../../platform/navigation";

const SearchTrackApplicationsView = () => {
  const router = useAppRouter();
  const { goToSearchApplications } = useAppNavigation();
  const searchParams = useAppSearchParams();

  const [value, setValue] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeTypes>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", value);

    goToSearchApplications(params);
  };

  const handleClear = () => {
    if (value.trim() !== "") {
      setValue("");
      router.push("/data-sim/track-application");
    }
  };

  return (
    <>
      {/* <div className="border-b bg-white p-3 shadow-sm"> */}
      <div className="mx-1 my-2 flex w-full flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => router.back()}
          >
            <ChevronLeft />
          </Button>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Track Applications
          </h1>
        </div>

        <div className="w-full max-w-md">
          <SearchInput
            value={value}
            onClear={handleClear}
            onSearch={handleSearch}
            onChange={(e) => setValue(e.target.value)}
            // onFocus={()=>  router.push("/evm/track-applications/search")}
            placeholder="Name, Passport, Application No."
          />
        </div>

        {/* <div className="mx-w-md flex items-center gap-2">
          <DateRangePicker
            className="grow"
            title="Filter by Date Range"
            description="Select a time range to filter your visa applications."
            selectedDates={dateRange}
            fromDate={new Date(new Date().getFullYear() - 100, 0, 1)} // earliest date allowed, change as per your data
            toDate={new Date()} // latest allowed date — today
            onSelect={(range) => setDateRange(range)}
          />
          <FilterSheet />
        </div> */}
      </div>
      {/* </div> */}
    </>
  );
};
export default SearchTrackApplicationsView;
