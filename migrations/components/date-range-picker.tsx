"use client";

import type {
  DateRange,
  DayEventHandler,
  DropdownNavProps,
  DropdownProps,
  OnSelectHandler,
} from "react-day-picker";
import * as React from "react";
import { Button } from "@repo/ui/button";
import { Calendar } from "@repo/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import { cn } from "@repo/ui/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { addDays, addYears, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

export interface DateRangeValue {
  from: Date;
  to: Date;
}

export interface DateRangePickerProps {
  className?: string;
  value?: DateRangeValue;
  onValueChange?: (value: DateRangeValue | undefined) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  fromDate?: Date;
  toDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

const defaultFromDate = addDays(new Date(), 1);
const defaultToDate = addYears(defaultFromDate, 25);

function formatRangeLabel(value: DateRangeValue | undefined) {
  if (!value) return "";
  if (value.from.getTime() === value.to.getTime()) {
    return format(value.from, "dd MMM yyyy");
  }

  return `${format(value.from, "dd MMM yyyy")} - ${format(value.to, "dd MMM yyyy")}`;
}

function normalizeRange(
  range: DateRange | undefined,
): DateRangeValue | undefined {
  if (!range?.from) return undefined;

  return { from: range.from, to: range.to ?? range.from };
}

function adaptDropdownChange(
  value: string | null,
  handler: React.ChangeEventHandler<HTMLSelectElement>,
) {
  handler({
    target: { value: String(value ?? "") },
  } as React.ChangeEvent<HTMLSelectElement>);
}

function CalendarDropdownNav({ children }: DropdownNavProps) {
  return <div className="flex w-full items-center gap-2">{children}</div>;
}

function CalendarDropdown(props: DropdownProps) {
  return (
    <Select
      value={String(props.value)}
      onValueChange={(value) => {
        if (props.onChange) adaptDropdownChange(value, props.onChange);
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
}

export const DateRangePicker = React.memo(function DateRangePicker({
  className,
  value,
  onValueChange,
  open: openProp,
  onOpenChange,
  title = "Select Travel Dates",
  description = "Choose the departure and return dates for your trip.",
  fromDate = defaultFromDate,
  toDate = defaultToDate,
  placeholder = "Select travel dates",
  disabled = false,
  id,
}: DateRangePickerProps) {
  const isMobile = useIsMobile();
  const [committed, setCommitted] = React.useState<DateRangeValue | undefined>(
    value,
  );
  const [draft, setDraft] = React.useState<DateRange | undefined>(value);
  const [openInternal, setOpenInternal] = React.useState(false);

  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openInternal;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setOpenInternal(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  React.useEffect(() => {
    setCommitted(value);
    setDraft(value);
  }, [value]);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) setDraft(committed);
      setOpen(next);
    },
    [committed, setOpen],
  );

  const handleSelect: OnSelectHandler<DateRange | undefined> =
    React.useCallback(
      (range) => {
        if (draft?.from && !draft.to) {
          setDraft(range);
        }
      },
      [draft],
    );

  const handleDayClick: DayEventHandler<React.MouseEvent> = React.useCallback(
    (day) => {
      if (!draft?.from || draft.to) {
        setDraft({ from: day, to: undefined });
      }
    },
    [draft],
  );

  const handleClear = React.useCallback(() => {
    setDraft(undefined);
  }, []);

  const handleApply = React.useCallback(() => {
    const normalized = normalizeRange(draft);
    setCommitted(normalized);
    onValueChange?.(normalized);
    setOpen(false);
  }, [draft, onValueChange, setOpen]);

  const triggerLabel = formatRangeLabel(committed);
  const draftLabel = React.useMemo(() => {
    if (!draft?.from) return null;
    if (!draft.to || draft.from.getTime() === draft.to.getTime()) {
      return format(draft.from, "dd MMM yyyy");
    }

    return `${format(draft.from, "dd MMM yyyy")} - ${format(draft.to, "dd MMM yyyy")}`;
  }, [draft]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger
          render={
            <Button
              id={id}
              variant="outline"
              disabled={disabled}
              aria-label={triggerLabel || placeholder}
              className={cn(
                "w-full justify-start gap-2 text-left font-normal",
                !committed && "text-muted-foreground",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <CalendarIcon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">{triggerLabel || placeholder}</span>
            </Button>
          }
        />

        <DialogContent
          className={cn(
            "mx-auto flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0",
            "sm:max-w-[550px]",
          )}
        >
          <DialogHeader className="px-4 pt-4 pb-3">
            <DialogTitle>{title}</DialogTitle>
            <div className="flex flex-col gap-1.5 text-sm">
              <span>{description}</span>
              {draftLabel ? (
                <span className="text-foreground inline-flex items-center gap-1 font-semibold">
                  <CalendarIcon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                  {draftLabel}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Click a day to set the start date.
                </span>
              )}
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex justify-center border-y">
              <Calendar
                mode="range"
                numberOfMonths={isMobile ? 1 : 2}
                pagedNavigation
                showOutsideDays={false}
                defaultMonth={draft?.from ?? fromDate}
                startMonth={fromDate}
                endMonth={toDate}
                disabled={{ before: fromDate, after: toDate }}
                selected={draft}
                onSelect={handleSelect}
                onDayClick={handleDayClick}
                className="flex-1 text-xs sm:text-sm"
                components={{
                  DropdownNav: CalendarDropdownNav,
                  Dropdown: CalendarDropdown,
                }}
              />
            </div>
          </div>

          <DialogFooter className="m-0">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={!draft?.from}
                >
                  Clear
                </Button>
              }
            />
            <Button
              type="button"
              size="sm"
              disabled={!draft?.from}
              onClick={handleApply}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

DateRangePicker.displayName = "DateRangePicker";
