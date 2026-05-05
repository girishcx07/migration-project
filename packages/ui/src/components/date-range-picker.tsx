"use client";

import * as React from "react";
import { addDays, addYears, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type {
  DateRange,
  DayEventHandler,
  DropdownNavProps,
  DropdownProps,
  OnSelectHandler,
} from "react-day-picker";

import { Button } from "@repo/ui/components/button";
import { Calendar } from "@repo/ui/components/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import { cn } from "@repo/ui/lib/utils";

export type DateRangeTypes =
  | {
      from: Date;
      to: Date;
    }
  | undefined;

interface DateRangePickerProps {
  className?: string;
  selectedDates?: DateRangeTypes;
  onSelect?: (dates: DateRangeTypes) => void;
  title?: string;
  description?: string;
  fromDate?: Date;
  toDate?: Date;
  isDisabled?: boolean;
}

const DEFAULT_FROM_DATE = addDays(new Date(), 1);
const DEFAULT_TO_DATE = addYears(DEFAULT_FROM_DATE, 25);

function DateRangePicker({
  className,
  selectedDates,
  onSelect,
  title = "Select Travel Dates",
  description = "Choose the departure and return dates for your trip.",
  fromDate = DEFAULT_FROM_DATE,
  toDate = DEFAULT_TO_DATE,
  isDisabled = false,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<DateRange | undefined>(
    selectedDates,
  );
  const [date, setDate] = React.useState<DateRange | undefined>(selectedDates);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    setDate(selectedDates);
    setSelected(selectedDates);
  }, [selectedDates?.from?.getTime(), selectedDates?.to?.getTime()]);

  const handleSave = React.useCallback(() => {
    if (date?.from && date.to) {
      onSelect?.({ from: date.from, to: date.to });
      setSelected(date);
    } else if (date?.from) {
      const nextDate = { from: date.from, to: date.from };
      onSelect?.(nextDate);
      setSelected(nextDate);
    } else {
      onSelect?.(undefined);
      setSelected(undefined);
    }

    setOpen(false);
  }, [date, onSelect]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setDate(selected);
    }
  };

  const handleSelect: OnSelectHandler<DateRange | undefined> = (range) => {
    if (date?.from && !date.to) {
      setDate(range);
    }
  };

  const handleDayClick: DayEventHandler<React.MouseEvent> = (rangeFrom) => {
    if (date?.from && !date.to) {
      return;
    }

    setDate({ from: rangeFrom });
  };

  const handleCalendarChange = (
    value: string,
    onChange: React.ChangeEventHandler<HTMLSelectElement>,
  ) => {
    onChange({
      target: { value },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  const travelDate =
    selected?.from && selected.to
      ? `${format(selected.from, "dd MMM yyyy")} - ${format(
          selected.to,
          "dd MMM yyyy",
        )}`
      : "";

  return (
    <div className={cn("grid gap-2", className)}>
      <Dialog onOpenChange={handleOpenChange} open={open}>
        <Button
          className={cn(
            "w-full justify-start bg-white text-left font-normal",
            !selected && "text-muted-foreground",
            isDisabled &&
              "text-muted-foreground border-input cursor-not-allowed border bg-blue-200 shadow-none",
          )}
          disabled={isDisabled}
          id="date"
          onClick={() => setOpen(true)}
          type="button"
          variant="outline"
        >
          <CalendarIcon className="h-4 w-4" />
          {selected?.from ? (
            selected.to ? (
              travelDate
            ) : (
              format(selected.from, "LLL dd, y")
            )
          ) : (
            <span>Select your travel date</span>
          )}
        </Button>
        <DialogContent className="mx-auto flex max-h-[90vh] flex-col overflow-hidden p-0 md:max-w-[550px]">
          <DialogHeader className="p-3">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="flex flex-col gap-2">
              <span>{description}</span>
              {date?.from ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center text-sm font-bold">
                  {date.to ? (
                    <span>
                      {format(date.from, "dd MMM yyyy")} -{" "}
                      {format(date.to, "dd MMM yyyy")}
                    </span>
                  ) : (
                    <span>{format(date.from, "dd MMM yyyy")}</span>
                  )}
                </div>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="h-full flex-1 overflow-y-auto">
            <div className="m-auto flex justify-center overflow-hidden rounded-md border">
              <Calendar
                className="text-xs sm:text-sm"
                components={{
                  DropdownNav: (props: DropdownNavProps) => (
                    <div className="flex w-full items-center gap-2">
                      {props.children}
                    </div>
                  ),
                  Dropdown: (props: DropdownProps) => (
                    <Select
                      onValueChange={(value) => {
                        if (props.onChange) {
                          handleCalendarChange(value ?? "", props.onChange);
                        }
                      }}
                      value={String(props.value)}
                    >
                      <SelectTrigger className="h-8 w-fit font-medium first:grow">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                        {props.options?.map((option) => (
                          <SelectItem
                            disabled={option.disabled}
                            key={option.value}
                            value={String(option.value)}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ),
                }}
                defaultMonth={date?.from}
                disabled={{
                  before: fromDate,
                  after: toDate,
                }}
                endMonth={toDate}
                mode="range"
                numberOfMonths={isMobile ? 1 : 2}
                onDayClick={handleDayClick}
                onSelect={handleSelect}
                pagedNavigation
                selected={date}
                showOutsideDays={false}
                startMonth={fromDate}
              />
            </div>
          </div>
          <DialogFooter className="p-3">
            <Button onClick={() => setDate(undefined)} type="button" variant="outline">
              Clear
            </Button>
            <Button disabled={!date?.from} onClick={handleSave} type="button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default React.memo(DateRangePicker);
