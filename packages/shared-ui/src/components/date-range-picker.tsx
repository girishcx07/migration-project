"use client";

import * as React from "react";
import { addDays, addYears, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  DateRange,
  DayEventHandler,
  DropdownNavProps,
  DropdownProps,
  OnSelectHandler,
} from "react-day-picker";

import { Button } from "@acme/ui/components/button";
import { Calendar } from "@acme/ui/components/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/components/select";
import { useIsMobile } from "@acme/ui/hooks/use-mobile";
import { cn } from "@acme/ui/lib/utils";

export type DateRangeTypes =
  | {
      from: Date;
      to: Date;
    }
  | undefined;

interface Props {
  className?: string;
  selectedDates?: DateRangeTypes;
  onSelect?: (dates: DateRangeTypes) => void;
  title?: string;
  description?: string;
  fromDate?: Date | undefined;
  toDate?: Date | undefined;
  isDisabled?: boolean;
}

const DEFAULT_FROM_DATE = addDays(new Date(), 1);
const DEFAULT_TO_DATE = addYears(DEFAULT_FROM_DATE, 25);

// eslint-disable-next-line react/display-name
const DateRangePicker = React.memo(
  ({
    className,
    selectedDates,
    onSelect,
    title = "Select Travel Dates",
    description = "Choose the departure and return dates for your trip.",
    fromDate = DEFAULT_FROM_DATE,
    toDate = DEFAULT_TO_DATE,
    isDisabled = false,
  }: Props) => {
    const [open, setOpen] = React.useState(false);
    const [selected, setSelected] = React.useState<DateRange | undefined>(
      selectedDates,
    );
    const [date, setDate] = React.useState<DateRange | undefined>(
      selectedDates,
    );

    const isMobile = useIsMobile();

    const handleClear = () => {
      setDate(undefined);
    };

    const handleSave = React.useCallback(() => {
      const selectedDate = date as DateRange;

      if (selectedDate?.from && selectedDate?.to) {
        // Normal case: both dates selected and possibly different
        onSelect?.(selectedDate as DateRangeTypes);
        setSelected(selectedDate);
      } else if (selectedDate?.from && !selectedDate?.to) {
        // Only from date selected — use same value for 'to'
        const newDateRange = { from: selectedDate.from, to: selectedDate.from };
        onSelect?.(newDateRange);
        setSelected(newDateRange);
      } else {
        // Nothing selected
        onSelect?.(undefined);
        setSelected(undefined);
      }
      setOpen(false);
    }, [date, onSelect, setOpen]);

    const handleOpenChange = (isOpen: boolean) => {
      setOpen(isOpen);
      if (!isOpen) {
        setDate(selected);
      }
    };

    const handleSelect: OnSelectHandler<DateRange | undefined> = (range) => {
      // the other cases are handled by onDayClick handler
      if (date?.from && !date.to) {
        setDate(range);
      }
    };

    const handleDayClick: DayEventHandler<React.MouseEvent> = (rangeFrom) => {
      // handled by onSelect handler
      if (date?.from && !date.to) {
        return;
      }
      setDate({ from: rangeFrom });
    };

    const handleCalendarChange = (
      _value: string | null,
      _e: React.ChangeEventHandler<HTMLSelectElement>,
    ) => {
      const _event = {
        target: {
          value: String(_value),
        },
      } as React.ChangeEvent<HTMLSelectElement>;
      _e(_event);
    };

    React.useEffect(() => {
      setDate(selectedDates);
      setSelected(selectedDates);
      // }
    }, [selectedDates?.from?.getTime(), selectedDates?.to?.getTime()]);

    const today = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(today.getFullYear() + 1);

    let Traveldate = "";

    if (selected?.from && selected?.to) {
      Traveldate = `${format(selected.from, "dd MMM yyyy")} - ${format(
        selected.to,
        "dd MMM yyyy",
      )}`;
    }
    return (
      <div className={cn("grid gap-2", className)}>
        <Dialog onOpenChange={handleOpenChange} open={open}>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start bg-white text-left font-normal",
              !selected && "text-muted-foreground",
              isDisabled &&
                "text-muted-foreground border-input cursor-not-allowed border bg-blue-200 shadow-none",
            )}
            disabled={isDisabled}
            onClick={() => setOpen(true)}
          >
            <CalendarIcon className="h-4 w-4" />
            {selected?.from ? (
              selected.to ? (
                Traveldate
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
                {date?.from && (
                  <div className="text-muted-foreground flex flex-col items-center justify-center text-sm font-bold">
                    {date.to ? (
                      <span>
                        {format(date.from, "dd MMM yyyy")} —{" "}
                        {format(date.to, "dd MMM yyyy")}
                      </span>
                    ) : (
                      <span>{format(date.from, "dd MMM yyyy")}</span>
                    )}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="h-full flex-1 overflow-y-auto">
              <div className="m-auto flex justify-center overflow-hidden rounded-md border">
                <Calendar
                  // captionLayout="dropdown"
                  mode="range"
                  numberOfMonths={isMobile ? 1 : 2}
                  pagedNavigation
                  showOutsideDays={false}
                  defaultMonth={date?.from}
                  disabled={{
                    before: fromDate,
                    after: toDate,
                  }}
                  startMonth={fromDate}
                  endMonth={toDate}
                  selected={date}
                  onSelect={handleSelect}
                  onDayClick={handleDayClick}
                  // hideNavigation
                  className="text-xs sm:text-sm"
                  components={{
                    DropdownNav: (props: DropdownNavProps) => {
                      return (
                        <div className="flex w-full items-center gap-2">
                          {props.children}
                        </div>
                      );
                    },
                    Dropdown: (props: DropdownProps) => {
                      return (
                        <Select
                          value={String(props.value)}
                          onValueChange={(value) => {
                            if (props.onChange) {
                              handleCalendarChange(value, props.onChange);
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 w-fit font-medium first:grow">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                            {props.options?.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={String(option.value)}
                                disabled={option.disabled}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    },
                  }}
                />
              </div>
            </div>

            <DialogFooter className="p-3">
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button onClick={handleSave} disabled={!date?.from}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
);

DateRangePicker.displayName = "DateRangePicker";

export default DateRangePicker;
