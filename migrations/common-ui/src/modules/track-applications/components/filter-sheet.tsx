"use client";

import { useEffect, useState } from "react";

import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Checkbox } from "@workspace/ui/components/checkbox";

import {
  DESTINATION_OPTIONS,
  PAYMENT_OPTIONS,
  STATUS_OPTIONS,
  TABS,
} from "@workspace/common-ui/constants/track-applications";
import { useAppRouter, useAppSearchParams } from "../../../platform/navigation";

// ----------------------
// Helpers for query arrays
// ----------------------
const getQueryArray = (search: URLSearchParams, key: string): string[] => {
  const v = search.get(key);
  return v ? v.split(",") : [];
};

const setQueryArray = (search: URLSearchParams, key: string, arr: string[]) => {
  if (arr.length === 0) {
    search.delete(key);
  } else {
    search.set(key, arr.join(","));
  }
};

// ----------------------
// Filter Section Component
// ----------------------
type FilterOption = { label: string; value: string };

type FilterSectionProps = {
  title: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
};

const FilterSection = ({
  title,
  options,
  selected,
  onToggle,
  onClear,
}: FilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getLabel = (value: string) =>
    options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="flex flex-col gap-2">
      <Label>{title}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="mt-1 w-full justify-between">
            {selected.length > 0
              ? `${selected.length} selected`
              : `Select ${title}`}
            {isOpen ? (
              <ChevronUp className="ml-2" />
            ) : (
              <ChevronDown className="ml-2" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[280px]">
          <div className="flex flex-col gap-2">
            {options.map(({ label, value }) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2"
              >
                <Checkbox
                  checked={selected.includes(value)}
                  onCheckedChange={() => onToggle(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="text-muted-foreground flex flex-col gap-2 rounded border bg-gray-100 p-3 text-sm">
          <div className="flex flex-wrap gap-2">
            {selected.map((value) => (
              <span
                key={value}
                className="flex items-center gap-2 rounded border border-gray-400 bg-gray-200 px-2 text-xs"
              >
                {getLabel(value)}
                <X
                  width={16}
                  className="cursor-pointer"
                  onClick={() => onToggle(value)}
                />
              </span>
            ))}
          </div>

          <button onClick={onClear} className="text-sm underline">
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

// ----------------------
// Main FilterSheet
// ----------------------
export function FilterSheet() {
  const router = useAppRouter();
  const searchParams = useAppSearchParams();

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    [],
  );

  // Initialize values from URL
  useEffect(() => {
    const search = new URLSearchParams(searchParams.toString());
    setSelectedStatuses(getQueryArray(search, "statuses"));
    setSelectedPayments(getQueryArray(search, "payments"));
    setSelectedDestinations(getQueryArray(search, "destinations"));
  }, []);

  const toggleValue = (
    value: string,
    selected: string[],
    setSelected: (v: string[]) => void,
  ) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];

    setSelected(newSelected);
  };

  const handleApply = () => {
    const search = new URLSearchParams(searchParams.toString());

    setQueryArray(search, "statuses", selectedStatuses);
    setQueryArray(search, "payments", selectedPayments);
    setQueryArray(search, "destinations", selectedDestinations);

    router.push(`?${search.toString()}`);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <SlidersHorizontal />
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col p-0 sm:max-w-sm">
        <SheetHeader className="border-b px-4 pt-4 pb-2">
          <SheetTitle>Filter Applications</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
          <FilterSection
            title="Status"
            options={TABS.map((t) => ({ value: t.name, label: t.value }))}
            selected={selectedStatuses}
            onToggle={(value) =>
              toggleValue(value, selectedStatuses, setSelectedStatuses)
            }
            onClear={() => setSelectedStatuses([])}
          />

          <FilterSection
            title="Mode of Payment"
            options={PAYMENT_OPTIONS}
            selected={selectedPayments}
            onToggle={(value) =>
              toggleValue(value, selectedPayments, setSelectedPayments)
            }
            onClear={() => setSelectedPayments([])}
          />

          <FilterSection
            title="Destinations"
            options={DESTINATION_OPTIONS}
            selected={selectedDestinations}
            onToggle={(value) =>
              toggleValue(value, selectedDestinations, setSelectedDestinations)
            }
            onClear={() => setSelectedDestinations([])}
          />
        </div>

        <SheetFooter className="border-t p-4">
          <SheetClose asChild>
            <Button className="w-full" onClick={handleApply}>
              Apply
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
