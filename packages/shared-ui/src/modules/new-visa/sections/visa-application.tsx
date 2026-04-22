"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addDays, addYears } from "date-fns";
import { components, type OptionProps } from "react-select";

import { useTRPC } from "@acme/api/react";
import AutoSelect from "@acme/shared-ui/components/auto-select";
import DateRangePicker from "@acme/shared-ui/components/date-range-picker";
import { Flag } from "@acme/shared-ui/components/flag-img";
import { Label } from "@acme/ui/components/label";
import { Skeleton } from "@acme/ui/components/skeleton";
import { MaxWidthContainer } from "../components/max-width-container";
import { useVisaColumn } from "../context/visa-columns-context";
import type {
  DateRangeTypes,
  NationalityCountry,
  TravellingToCountry,
  WithOptionFields,
} from "../types";

const DEFAULT_FROM_DATE = addDays(new Date(), 1);
const DEFAULT_TO_DATE = addYears(DEFAULT_FROM_DATE, 1);
const mobileSafeSelectStyles = {
  input: (base: Record<string, unknown>) => ({
    ...base,
    fontSize: "16px",
  }),
  control: (base: Record<string, unknown>) => ({
    ...base,
    fontSize: "16px",
  }),
};

const createOptions = <T extends { name: string; flag: string }>(
  data: T,
): WithOptionFields<T> => ({
  ...data,
  icon: data.flag,
  label: data.name,
  value: data.name,
});

export default function VisaApplication() {
  const trpc = useTRPC();
  const {
    setColumnNumber,
    setVisaApplicationField,
    setCommonNotice,
    shouldTriggerNoticeRef,
    data: state,
  } = useVisaColumn();
  const {
    visaApplication: { countryOfOrigin, dateRange, nationality, travellingTo },
  } = state;

  const { data: nationalitiesData } = useQuery(
    trpc.newVisa.getNationalities.queryOptions(),
  );

  const {
    mutate: fetchTravellingTo,
    data: travellingToData,
    isPending,
  } = useMutation(trpc.newVisa.getTravellingTo.mutationOptions());

  const nationalitiesList = nationalitiesData?.data ?? [];
  const travellingToList = travellingToData?.data ?? [];

  const nationalityOptions = useMemo(
    () => nationalitiesList.map(createOptions),
    [nationalitiesList],
  );
  const travellingToOptions = useMemo(
    () => travellingToList.map(createOptions),
    [travellingToList],
  );
  const countryOfResidenceOptions = useMemo(
    () => nationalitiesList.map(createOptions),
    [nationalitiesList],
  );

  useEffect(() => {
    if (nationality?.value) {
      fetchTravellingTo({
        nationality: nationality.value,
        origin: nationality.value,
      });
    }
  }, [fetchTravellingTo, nationality]);

  const handleNationalityChange = useCallback(
    (value: unknown) => {
      const selected = value as WithOptionFields<NationalityCountry> | null;
      setVisaApplicationField("nationality", selected);
      setVisaApplicationField("countryOfOrigin", selected);
      setVisaApplicationField("travellingTo", null);

      if (selected?.value) {
        fetchTravellingTo({
          nationality: selected.value,
          origin: selected.value,
        });
      }
    },
    [fetchTravellingTo, setVisaApplicationField],
  );

  const handleTravellingToChange = useCallback(
    (value: unknown) => {
      const selected = value as WithOptionFields<TravellingToCountry> | null;
      setVisaApplicationField("travellingTo", selected);
      setCommonNotice({
        isOpen: !!selected?.destination_info,
        title: selected?.destination_info?.title || "",
        html_content: selected?.destination_info?.html_content || "",
      });

      if (!selected?.cor_required) {
        setVisaApplicationField("countryOfOrigin", nationality);
      }

      setColumnNumber(2);
    },
    [nationality, setColumnNumber, setCommonNotice, setVisaApplicationField],
  );

  const handleCountryOfOriginChange = useCallback(
    (value: unknown) => {
      setVisaApplicationField(
        "countryOfOrigin",
        value as WithOptionFields<NationalityCountry> | null,
      );
    },
    [setVisaApplicationField],
  );

  const handleDateChange = useCallback(
    (dates: DateRangeTypes) => {
      setVisaApplicationField("dateRange", dates);
    },
    [setVisaApplicationField],
  );

  const OptionComponent = ({ data, ...props }: OptionProps<any>) => (
    <components.Option data={data} {...props}>
      <div className="flex items-center gap-2">
        {data?.icon ? <Flag src={data.icon} alt={data.value} /> : null}
        {data?.label}
      </div>
    </components.Option>
  );

  return (
    <div className="flex h-auto flex-col">
      <div className="mt-3 flex flex-1 flex-col space-y-4">
        <MaxWidthContainer className="grid w-full items-center gap-1.5">
          <Label htmlFor="nationality">Nationality</Label>
          <AutoSelect
            styles={mobileSafeSelectStyles}
            options={nationalityOptions}
            value={nationality}
            placeholder="Select your nationality"
            components={{ Option: OptionComponent }}
            onChange={handleNationalityChange}
            isClearable
          />
        </MaxWidthContainer>

        <MaxWidthContainer className="grid w-full items-center gap-1.5">
          <Label htmlFor="travelling_to">Travelling To</Label>
          <AutoSelect
            styles={mobileSafeSelectStyles}
            options={travellingToOptions}
            value={travellingTo}
            placeholder="Select your destination"
            isLoading={isPending}
            components={{ Option: OptionComponent }}
            onFocus={() => {
              shouldTriggerNoticeRef.current = true;
            }}
            onChange={handleTravellingToChange}
            isClearable
          />
        </MaxWidthContainer>

        {!!travellingTo?.cor_required && (
          <MaxWidthContainer className="grid w-full items-center gap-1.5">
            <Label htmlFor="country_of_origin">Country of Residence</Label>
            <AutoSelect
              styles={mobileSafeSelectStyles}
              options={countryOfResidenceOptions}
              value={countryOfOrigin}
              components={{ Option: OptionComponent }}
              onChange={handleCountryOfOriginChange}
              placeholder="Select your country"
              isClearable
            />
          </MaxWidthContainer>
        )}

        <MaxWidthContainer className="grid w-full items-center gap-1.5">
          <Label htmlFor="date_range">Travelling Dates</Label>
          <DateRangePicker
            fromDate={DEFAULT_FROM_DATE}
            toDate={DEFAULT_TO_DATE}
            selectedDates={dateRange}
            onSelect={handleDateChange}
          />
        </MaxWidthContainer>
      </div>
    </div>
  );
}

export function VisaApplicationSkeleton() {
  return (
    <MaxWidthContainer className="py-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="mb-4">
          <Skeleton className="mb-2.5 h-5 w-3/5" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </MaxWidthContainer>
  );
}
