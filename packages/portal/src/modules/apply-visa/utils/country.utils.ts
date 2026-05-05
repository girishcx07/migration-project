import type { IpData } from "@repo/types";

import type { ApplyVisaCountry } from "../types";

export function findByName<T extends { name: string }>(
  items: T[],
  name?: string,
) {
  if (!name) return null;

  return (
    items.find((item) => item.name.toLowerCase() === name.toLowerCase()) ?? null
  );
}

export function findCountryByIpData(
  countries: ApplyVisaCountry[],
  ipData: IpData,
) {
  const countryName = ipData.country_name.toLowerCase();
  const alpha2Code = ipData.country_code.toLowerCase();
  const alpha3Code = ipData.country_code_iso3.toLowerCase();

  return (
    countries.find(
      (country) =>
        country.name.toLowerCase() === countryName ||
        (country.alpha2Code
          ? country.alpha2Code.toLowerCase() === alpha2Code
          : false) ||
        country.cioc.toLowerCase() === alpha3Code,
    ) ?? null
  );
}
