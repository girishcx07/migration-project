"use client";

import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import React, { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VisaOffer, VisaType as VisaTypeData } from "@workspace/types/new-visa";
import AutoSelect from "@workspace/common-ui/components/auto-select";
import { Flag } from "@workspace/common-ui/components/flag-img";
import {
  useEnterpriseGlobalData,
  useEVMGlobalRequestData,
  useIpData,
} from "@workspace/common-ui/hooks/global-queries";
import {
  getCookie,
  getLockConfig,
  getTravellingToIdentity, 
} from "@workspace/common-ui/lib/utils";
import { orpc } from "@workspace/orpc/lib/orpc";
import DateRangePicker from "@workspace/ui/components/date-range-picker";
import { Label } from "@workspace/ui/components/label";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { addDays, addYears } from "date-fns";
import { components, OptionProps } from "react-select";
import { MaxWidthContainer } from "../components/max-width-container";
import { useVisaColumn } from "../context/visa-columns-context";
import {
  DateRangeTypes,
  NationalityCountry,
  TravellingToCountry,
  WithOptionFields,
} from "../types";
import { useIsMobile } from "@workspace/common-ui/hooks/use-is-mobile"; 

const DEFAULT_FROM_DATE = addDays(new Date(), 1);
const DEFAULT_TO_DATE = addYears(DEFAULT_FROM_DATE, 1);

const VisaApplication = () => {

  const { data: ipData } = useIpData();
  const {
    data: { data: nationalitiesData },
  } = useSuspenseQuery(orpc.visa.getNationalities.queryOptions());

  const { data: evmData } = useEVMGlobalRequestData();
  const { data: enterpriseResp } = useEnterpriseGlobalData();

  const {
    currency,
    data: state,
    setVisaApplicationField,
    setColumnNumber,
    columnNumber,
    setVisaOffer,
    setCommonNotice,
    commonNotice,
    visaNotice,
    setVisaNotice,
    shouldTriggerNoticeRef,
    isNoticeHandled, setIsNoticeHandled
  } = useVisaColumn();

  const {
    visaApplication: { countryOfOrigin, dateRange, nationality, travellingTo },
  } = state;

  const evmRequestData = evmData?.data;
  const enterpriseData = enterpriseResp?.data;

  const isMobile = useIsMobile();

  /** ---------- Lock Config ---------- */
  const lockConfig = useMemo(
    () => getLockConfig(evmRequestData!, enterpriseData!),
    [evmRequestData, enterpriseData],
  );


  const moduleType =
    getCookie("module_type") === "qr-visa" ? "qr_app" : "apply_new_visa";


  const {
    data: travellingToData,
    mutate: mutateTravellingTo,
    isPending,
  } = useMutation(orpc.visa.getTravellingTo.mutationOptions());

  const nationalitiesList = nationalitiesData?.data || [];
  const travellingToList = travellingToData?.data?.data || [];

  const createOptions = <T extends { name: string; flag: string }>(
    data: T,
  ): WithOptionFields<T> => {
    return {
      label: data.name,
      value: data.name,
      icon: data.flag,
      ...data,
    };
  };

  const nationalityOptions = useMemo(
    () => nationalitiesList.map(createOptions),
    [nationalitiesList],
  );

  const travellingToOptions = useMemo(
    () => travellingToList.map(createOptions),
    [travellingToList],
  );

  const countryofResidenceOptions = useMemo(
    () => nationalitiesList.map(createOptions),
    [nationalitiesList],
  );

  useEffect(() => {
    if (nationality) {
      mutateTravellingTo({
        origin: nationality.value,
        nationality: nationality.value,
      });
    }
  }, [nationality]);

  const handleNationalityChange = useCallback(
    (data: unknown) => {
      const typedData = data as WithOptionFields<NationalityCountry> | null;
      setVisaApplicationField("nationality", typedData);
      setVisaApplicationField("countryOfOrigin", typedData);
      setVisaApplicationField("travellingTo", null);
      if (typedData?.value) {
        mutateTravellingTo({
          origin: typedData.value,
          nationality: typedData.value,
        });
      }
    },
    [mutateTravellingTo, setVisaApplicationField],
  );

  const handleTravellingToChange = useCallback(
    (value: unknown) => {
      let typedValue = value as WithOptionFields<TravellingToCountry> | null;

      setIsNoticeHandled(false)

      setVisaApplicationField("travellingTo", typedValue);

      !isMobile && setColumnNumber(2);


      setCommonNotice({
        isOpen: !!typedValue?.destination_info,
        title: typedValue?.destination_info?.title || "",
        html_content: typedValue?.destination_info?.html_content || "",
      });

      if (!typedValue?.cor_required) {
        setVisaApplicationField("countryOfOrigin", nationality);
      }
      // if (isMobile && typedValue?.cor_required) {
      //   setVisaApplicationField("countryOfOrigin", null);
      // }

    },
    [nationality, setVisaApplicationField],
  );

  const handleCountryOfOriginChange = useCallback(
    (value: unknown) => {
      const typedValue = value as WithOptionFields<NationalityCountry> | null;
      setVisaApplicationField("countryOfOrigin", typedValue);
      // if (nationality?.value && typedValue?.value) {
      //   mutateTravellingTo({
      //     origin: typedValue.value,
      //     nationality: nationality.value,
      //   });
      // }
    },
    [mutateTravellingTo, nationality, setVisaApplicationField],
  );

  const handleDateChange = useCallback(
    (dates: DateRangeTypes) => {
      setVisaApplicationField("dateRange", dates);
    },
    [setVisaApplicationField],
  );

  const handleNoticeClose = () => {
    setColumnNumber(2)
    setCommonNotice({
      isOpen: false,
      title: "",
      html_content: "",
    });
  };

  /** ---------- Prefill from IP or EVM Request ---------- */

  useEffect(() => {
    if (
      !nationality &&
      (ipData?.country_name || evmRequestData?.nationality) &&
      nationalitiesList.length
    ) {
      const defaultOption = nationalitiesList.find(
        (n) =>
          n.name?.toLowerCase() ===
          evmRequestData?.nationality?.toLowerCase() ||
          n.name?.toLowerCase() === ipData?.country_name?.toLowerCase(),
      );

      if (defaultOption) {
        handleNationalityChange({
          ...defaultOption,
          icon: defaultOption.flag,
          label: defaultOption.name,
          value: defaultOption.name,
        });
      }
    }
  }, [ipData, nationalitiesList]);

  useEffect(() => {
    if (evmRequestData?.destination && travellingToOptions) {
      const defaultOption = travellingToOptions.find(
        (n) => n.name === evmRequestData?.destination,
      );

      if (defaultOption) {
        const payload: any = {
          ...defaultOption,
          icon: defaultOption.flag,
          label: defaultOption.name,
          value: defaultOption.name,
        };
        setVisaApplicationField("travellingTo", payload);
      }
    }

    if (evmRequestData?.start_date && evmRequestData?.end_date) {
      const dates = {
        from: new Date(evmRequestData?.start_date),
        to: new Date(evmRequestData.end_date),
      };
      setVisaApplicationField("dateRange", dates);
    }
  }, [evmRequestData, travellingToOptions, setVisaApplicationField]);



  const OptionComponent = ({ data, ...props }: OptionProps<any>) => (
    <components.Option data={data} {...props}>
      <RenderSelectData option={data} />
    </components.Option>
  );

  return (
    <div className="flex h-auto flex-col">
      <div className="mt-3 flex flex-1 flex-col space-y-4">
        <MaxWidthContainer className="grid w-full items-center gap-1.5">
          <Label htmlFor="nationality">Nationality</Label>
          <AutoSelect
            styles={{
              input: (base) => ({
                ...base,
                fontSize: "16px", // prevents iOS zooming
              }),
              control: (base) => ({
                ...base,
                fontSize: "16px",
              }),
            }}
            options={nationalityOptions}
            value={nationality}
            placeholder="Select your nationality"
            components={{ Option: OptionComponent }}
            onChange={handleNationalityChange}
            isClearable
            isDisabled={lockConfig.nationality}
          />
        </MaxWidthContainer>

        <MaxWidthContainer className="grid w-full items-center gap-1.5">
          <Label htmlFor="travelling_to">Travelling To</Label>
          <AutoSelect
            styles={{
              input: (base) => ({
                ...base,
                fontSize: "16px", // prevents iOS zooming
              }),
              control: (base) => ({
                ...base,
                fontSize: "16px",
              }),
            }}
            options={travellingToOptions}
            value={travellingTo}
            placeholder="Select your destination"
            isLoading={isPending}
            components={{ Option: OptionComponent }}
            onFocus={() => {
              shouldTriggerNoticeRef.current = true; // ✅ no re-render

            }}
            onChange={handleTravellingToChange}
            isClearable
            isDisabled={lockConfig.travellingTo}
          />
        </MaxWidthContainer>

        {!!travellingTo?.cor_required && (
          <MaxWidthContainer className="grid w-full items-center gap-1.5">
            <Label htmlFor="country_of_origin">
              {/* Country of Origin */}
              Country of Residence
            </Label>
            <AutoSelect
              styles={{
                input: (base) => ({
                  ...base,
                  fontSize: "16px", // prevents iOS zooming
                }),
                control: (base) => ({
                  ...base,
                  fontSize: "16px",
                }),
              }}
              options={countryofResidenceOptions}
              components={{ Option: OptionComponent }}
              value={countryOfOrigin}
              onChange={handleCountryOfOriginChange}
              placeholder="Select your country"
              isClearable
            />
          </MaxWidthContainer>
        )}

        <MaxWidthContainer className="grid w-full items-center gap-1.5">
          <Label htmlFor="date_range">Travelling Dates</Label>
          <DateRangePicker
            // fromDate={new Date()}
            isDisabled={lockConfig?.dateRange!}
            fromDate={DEFAULT_FROM_DATE}
            toDate={DEFAULT_TO_DATE}
            selectedDates={dateRange}
            onSelect={handleDateChange}
          />
        </MaxWidthContainer>
      </div>
    </div>
  );
};

export default VisaApplication;

interface RenderSelectDataProps {
  option: WithOptionFields<NationalityCountry | TravellingToCountry>;
}

const RenderSelectData: React.FC<RenderSelectDataProps> = ({ option }) => (
  <div className="flex items-center gap-2">
    {option?.icon && (
      <Flag src={option?.icon || ""} alt={option?.value || ""} />
    )}
    {option?.label}
  </div>
);

export const VisaApplicationSkeleton = () => {
  return (
    <>
      <MaxWidthContainer className="py-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mb-4">
            <Skeleton className="mb-2.5 h-5 w-3/5" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </MaxWidthContainer>
    </>
  );
};
