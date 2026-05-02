import { addDays, addYears } from "date-fns";

export const DEFAULT_FROM_DATE = addDays(new Date(), 1);
export const DEFAULT_TO_DATE = addYears(DEFAULT_FROM_DATE, 1);

export const DEFAULT_SELECTED_FROM_DATE = addDays(new Date(), 2);
export const DEFAULT_SELECTED_TO_DATE = addDays(new Date(), 8);
