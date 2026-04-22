"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DayPicker, type DateRange } from "react-day-picker";

import { Button } from "@acme/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/components/popover";
import { cn } from "@acme/ui/lib/utils";

export type DateRangeTypes =
  | {
      from: Date;
      to: Date;
    }
  | undefined;

type DateRangePickerProps = {
  selectedDates: DateRangeTypes;
  onSelect: (range: DateRangeTypes) => void;
  fromDate?: Date;
  toDate?: Date;
  isDisabled?: boolean;
};

const toDateRange = (range?: DateRangeTypes): DateRange | undefined =>
  range ? { from: range.from, to: range.to } : undefined;

export default function DateRangePicker({
  selectedDates,
  onSelect,
  fromDate,
  toDate,
  isDisabled,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const label = selectedDates?.from
    ? selectedDates.to
      ? `${format(selectedDates.from, "dd MMM yyyy")} - ${format(
          selectedDates.to,
          "dd MMM yyyy",
        )}`
      : format(selectedDates.from, "dd MMM yyyy")
    : "Select travel dates";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <Button
          type="button"
          variant="outline"
          disabled={isDisabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDates && "text-muted-foreground",
          )}
        />
      }>
        <CalendarIcon className="mr-2 size-4" />
        {label}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="range"
          numberOfMonths={1}
          selected={toDateRange(selectedDates)}
          defaultMonth={selectedDates?.from ?? fromDate}
          disabled={isDisabled}
          fromDate={fromDate}
          toDate={toDate}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              onSelect({ from: range.from, to: range.to });
              setOpen(false);
              return;
            }

            if (range?.from) {
              onSelect({ from: range.from, to: range.from });
              return;
            }

            onSelect(undefined);
          }}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
}
