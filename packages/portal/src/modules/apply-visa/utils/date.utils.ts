import type { DateRangeTypes } from "@repo/ui/components/date-range-picker";

import {
  DEFAULT_DAYS_TO_TRAVEL,
  DEFAULT_TRAVEL_YEARS,
} from "../constants/apply-visa.constants";

export function getDefaultDateRange(): NonNullable<DateRangeTypes> {
  const from = new Date();
  from.setDate(from.getDate() + DEFAULT_DAYS_TO_TRAVEL);
  from.setHours(12, 0, 0, 0);

  const to = new Date(from);
  to.setFullYear(to.getFullYear() + DEFAULT_TRAVEL_YEARS);

  return { from, to };
}

export function toIsoDate(date: Date | undefined) {
  return date ? date.toISOString() : "";
}
