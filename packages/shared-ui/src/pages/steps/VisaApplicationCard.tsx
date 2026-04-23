import { useEffect, useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";

import { useTRPC } from "@acme/api/react";
import { Flag } from "@acme/shared-ui/components/flag-img";
import { getCountryFlagBy3Code } from "@acme/shared-ui/lib/flag";
import { Country, TravellingToCountry } from "@acme/types";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@acme/ui/components/combobox";
import { InputGroupAddon } from "@acme/ui/components/input-group";
import { Skeleton } from "@acme/ui/components/skeleton";

import { useStepContext } from "../../context/StepContext";

export function VisaApplicationCard() {
  const { next } = useStepContext();

  const [selectedNationality, setSelectedNationality] =
    useState<Country | null>(null);
  const [selectedTravellingTo, setSelectedTravellingTo] =
    useState<TravellingToCountry | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<Country | null>(null);

  const trpc = useTRPC();

  const {
    data: { data: nationalitiesList },
  } = useSuspenseQuery(trpc.newVisa.getNationalities.queryOptions());

  const { refetch, data } = useQuery(
    trpc.newVisa.getTravellingTo.queryOptions(
      {
        nationality: selectedNationality?.name!,
        origin: selectedNationality?.name!,
      },
      {
        enabled: !!selectedNationality?.name,
      },
    ),
  );

  const travellingToList = data?.data ?? [];

  const handleNationalityChange = (value: Country | null) => {
    setSelectedNationality(value);
    setSelectedOrigin(value);
    setSelectedTravellingTo(null);
    refetch();
  };
  const handleOriginChange = (value: Country | null) => {
    setSelectedNationality(value);
    setSelectedTravellingTo(null);
    refetch();
  };

  const handleTravellingToChange = (value: TravellingToCountry | null) => {
    setSelectedTravellingTo(value);
  };

  return (
    <div className="flex flex-col gap-4">
      <CountrySelect<Country>
        onValueChange={handleNationalityChange}
        data={nationalitiesList!}
        value={selectedNationality}
        placeHolder="Select a Nationality"
      />
      <CountrySelect<TravellingToCountry>
        onValueChange={handleTravellingToChange}
        data={travellingToList!}
        value={selectedTravellingTo}
        placeHolder="Select a Travelling to"
      />
      <CountrySelect
        onValueChange={handleOriginChange}
        data={nationalitiesList!}
        value={selectedOrigin}
        placeHolder="Select a Country of Residence"
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
