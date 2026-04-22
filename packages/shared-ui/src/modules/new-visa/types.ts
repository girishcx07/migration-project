import type { Options } from "@acme/shared-ui/components/auto-select";


export type CountryOptionsList = Options<
  NationalityCountry | TravellingToCountry
>;

export type DateRangeTypes =
  | {
      from: Date;
      to: Date;
    }
  | undefined;

export interface VisaApplicationState {
  nationality: WithOptionFields<NationalityCountry> | null;
  travellingTo: WithOptionFields<TravellingToCountry> | null;
  countryOfOrigin: WithOptionFields<NationalityCountry> | null;
  dateRange: DateRangeTypes;
}

export type NationalityCountry = {
  name: string;
  cioc: string;
  callingCodes: string;
  flag: string;
  synonyms: string[];
  alpha2Code: string;
};

export type TravellingToCountry = {
  identity: string;
  name: string;
  cioc: string;
  flag: string;
  max_travel_days: string;
  allowed_visa_applications: string;
  managed_by: string;
  is_e_visa: boolean;
  visa_types: any[];
  cor_required?: boolean;
  destination_info: any;
};

export type WithOptionFields<T> = T & {
  label: string;
  value: string;
  icon: string;
};
