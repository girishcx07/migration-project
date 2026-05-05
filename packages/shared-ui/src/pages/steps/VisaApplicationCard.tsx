import { useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";

import { useTRPC } from "@repo/api/react";
import DateRangePicker, {
  DateRangeTypes,
} from "@repo/shared-ui/components/date-range-picker";
import { Flag } from "@repo/shared-ui/components/flag-img";
import {
  DEFAULT_FROM_DATE,
  DEFAULT_SELECTED_FROM_DATE,
  DEFAULT_SELECTED_TO_DATE,
  DEFAULT_TO_DATE,
} from "@repo/shared-ui/constants";
import { getCountryFlagBy3Code } from "@repo/shared-ui/lib/flag";
import { Country, TravellingToCountry } from "@repo/types";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@repo/ui/components/combobox";
import { InputGroupAddon } from "@repo/ui/components/input-group";
import { Skeleton } from "@repo/ui/components/skeleton";

import { useStepContext } from "../../context/StepContext";

export function VisaApplicationCard() {
  const { next } = useStepContext();
  const [selectedDates, setSelectedDates] = useState<DateRangeTypes>({
    from: DEFAULT_SELECTED_FROM_DATE,
    to: DEFAULT_SELECTED_TO_DATE,
  });

  const [selectedNationality, setSelectedNationality] =
    useState<Country | null>(null);
  const [selectedTravellingTo, setSelectedTravellingTo] =
    useState<TravellingToCountry | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<Country | null>(null);

  const trpc = useTRPC();

  const {
    data: { data: nationalitiesList },
  } = useSuspenseQuery(trpc.newVisa.getNationalities.queryOptions());

  const travellingToQuery = useQuery(
    trpc.newVisa.getTravellingTo.queryOptions(
      {
        nationality: selectedNationality?.name ?? "",
        origin: selectedNationality?.name ?? "",
      },
      {
        enabled: !!selectedNationality?.name && !!selectedOrigin?.name,
      },
    ),
  );

  const travellingToList = travellingToQuery?.data?.data ?? [];

  const handleNationalityChange = (value: Country | null) => {
    setSelectedNationality(value);
    setSelectedOrigin(value);
    setSelectedTravellingTo(null);
  };

  const handleOriginChange = (value: Country | null) => {
    setSelectedOrigin(value);
    setSelectedTravellingTo(null);
  };

  const handleTravellingToChange = (value: TravellingToCountry | null) => {
    setSelectedTravellingTo(value);
    next();
  };

  const handleDatesChange = (value: DateRangeTypes) => {
    setSelectedDates(value);
  };

  return (
    <div className="flex flex-col gap-4">
      <CountrySelect<Country>
        onValueChange={handleNationalityChange}
        data={nationalitiesList ?? []}
        value={selectedNationality}
        placeHolder="Select a Nationality"
      />
      <CountrySelect<TravellingToCountry>
        onValueChange={handleTravellingToChange}
        data={travellingToList ?? []}
        value={selectedTravellingTo}
        placeHolder="Select a Travelling to"
      />
      <CountrySelect
        onValueChange={handleOriginChange}
        data={nationalitiesList ?? []}
        value={selectedOrigin}
        placeHolder="Select a Country of Residence"
      />
      <DateRangePicker
        isDisabled={false}
        fromDate={DEFAULT_FROM_DATE}
        toDate={DEFAULT_TO_DATE}
        selectedDates={selectedDates}
        onSelect={handleDatesChange}
      />
    </div>
  );
}

type CountrySelectBase = {
  name: string;
  cioc: string;
  flag: string;
};
interface CountrySelectProps<T extends CountrySelectBase> {
  value: T | null | undefined;
  onValueChange: (value: T | null) => void;
  data: T[];
  placeHolder?: string;
}

const CountrySelect = <T extends CountrySelectBase>({
  value,
  onValueChange,
  data,
  placeHolder = "Select an option",
}: CountrySelectProps<T>) => {
  return (
    <Combobox
      items={data}
      value={value}
      onValueChange={onValueChange}
      itemToStringLabel={(opt) => opt.name}
    >
      <ComboboxInput placeholder={placeHolder}>
        <InputGroupAddon>
          {value?.name ? (
            <Flag src={getCountryFlagBy3Code(value.cioc)} alt="" />
          ) : (
            <SearchIcon />
          )}
        </InputGroupAddon>
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxEmpty>No data found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.name} value={item}>
              <Flag src={getCountryFlagBy3Code(item.cioc)} alt="" />
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export const VisaApplicationCardSkeleton = () => {
  return Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} />);
};
