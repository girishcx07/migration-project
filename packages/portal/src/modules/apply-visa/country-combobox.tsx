"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, LoaderCircle, Search } from "lucide-react";

import { cn } from "@repo/ui/lib/utils";

import type { ApplyVisaCountry, ApplyVisaTravellingToCountry } from "./types";

type CountryOption = ApplyVisaCountry | ApplyVisaTravellingToCountry;

function findCountryOptionByName<T extends CountryOption>(
  items: T[],
  name?: string,
) {
  if (!name) return null;

  return (
    items.find((item) => item.name.toLowerCase() === name.toLowerCase()) ?? null
  );
}

function Flag({
  alt,
  src,
}: Readonly<{
  alt: string;
  src?: string;
}>) {
  if (!src) return null;

  return (
    <img
      alt={alt}
      className="h-3.5 w-6 shrink-0 rounded-[2px] border border-gray-300 bg-white object-contain shadow-sm"
      height={14}
      loading="lazy"
      src={src}
      width={24}
    />
  );
}

function ThreeDotLoader({ className }: Readonly<{ className?: string }>) {
  return (
    <span
      aria-label="Loading options"
      className={cn("flex items-center gap-0.5", className)}
      role="status"
    >
      {[0, 1, 2].map((index) => (
        <span
          className="bg-muted-foreground/70 size-1 animate-pulse rounded-full"
          key={index}
          style={{ animationDelay: `${index * 120}ms` }}
        />
      ))}
    </span>
  );
}

export function CountryCombobox<T extends CountryOption>({
  disabled,
  emptyMessage = "No countries available.",
  isLoading = false,
  items,
  onChange,
  placeholder,
  value,
}: Readonly<{
  disabled?: boolean;
  emptyMessage?: string;
  isLoading?: boolean;
  items: T[];
  onChange: (item: T | null) => void;
  placeholder: string;
  value: T | null;
}>) {
  const selectedName = value?.name ?? "";

  return (
    <CountryComboboxInner
      disabled={disabled}
      emptyMessage={emptyMessage}
      isLoading={isLoading}
      items={items}
      key={selectedName}
      onChange={onChange}
      placeholder={placeholder}
      selectedName={selectedName}
      value={value}
    />
  );
}

function CountryComboboxInner<T extends CountryOption>({
  disabled,
  emptyMessage,
  isLoading,
  items,
  onChange,
  placeholder,
  selectedName,
  value,
}: Readonly<{
  disabled?: boolean;
  emptyMessage: string;
  isLoading: boolean;
  items: T[];
  onChange: (item: T | null) => void;
  placeholder: string;
  selectedName: string;
  value: T | null;
}>) {
  const [inputValue, setInputValue] = useState(selectedName);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const tabbingAwayRef = useRef(false);
  const deferredInputValue = useDeferredValue(inputValue);
  const searchValue = deferredInputValue.trim().toLowerCase();
  const selectedSearchValue = selectedName.toLowerCase();
  const displayValue = open ? inputValue : selectedName;
  const canInteract = !disabled && !isLoading;

  const renderedItems = useMemo(() => {
    if (!searchValue || searchValue === selectedSearchValue) {
      return items;
    }

    return items.filter((item) =>
      item.name.toLowerCase().includes(searchValue),
    );
  }, [items, searchValue, selectedSearchValue]);

  const activeItem = renderedItems[activeIndex] ?? null;
  const activeOptionId = activeItem
    ? `country-option-${activeItem.cioc}-${activeIndex}`
    : undefined;

  const openWithActiveItem = () => {
    setOpen(true);
    setActiveIndex((current) =>
      renderedItems.length > 0
        ? Math.min(Math.max(current, 0), renderedItems.length - 1)
        : 0,
    );
  };

  const selectItem = (item: T | null) => {
    onChange(item);
    setInputValue(item?.name ?? "");
    setOpen(false);
    setActiveIndex(0);
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "border-input focus-within:border-ring focus-within:ring-ring/50 flex h-8 w-full items-center gap-2 rounded-lg border bg-white px-2.5 text-sm transition-colors focus-within:ring-3",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {value ? (
          <Flag alt={value.name} src={value.flag} />
        ) : (
          <Search className="text-muted-foreground size-4 shrink-0" />
        )}
        <input
          aria-autocomplete="list"
          aria-activedescendant={open ? activeOptionId : undefined}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
          disabled={disabled}
          onBlur={() => {
            window.setTimeout(() => {
              setOpen(false);
              tabbingAwayRef.current = false;
              setInputValue(selectedName);
            }, 0);
          }}
          onChange={(event) => {
            const nextValue = event.target.value;

            if (tabbingAwayRef.current) {
              return;
            }

            setInputValue(nextValue);
            setActiveIndex(0);
            if (canInteract && nextValue !== selectedName) {
              setOpen(true);
            }
          }}
          onClick={() => {
            if (canInteract) {
              inputRef.current?.select();
              openWithActiveItem();
            }
          }}
          onFocus={() => {
            if (canInteract) {
              openWithActiveItem();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Tab") {
              tabbingAwayRef.current = true;
              setOpen(false);
              return;
            }

            if (event.key === "Escape") {
              setOpen(false);
              setInputValue(selectedName);
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              if (!canInteract) return;

              if (!open) {
                openWithActiveItem();
                return;
              }

              setActiveIndex((current) =>
                renderedItems.length > 0
                  ? Math.min(current + 1, renderedItems.length - 1)
                  : 0,
              );
              return;
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              if (!canInteract) return;

              if (!open) {
                openWithActiveItem();
                return;
              }

              setActiveIndex((current) => Math.max(current - 1, 0));
              return;
            }

            if (event.key === "Enter") {
              event.preventDefault();
              const exactMatch = findCountryOptionByName(items, inputValue);
              selectItem(activeItem ?? exactMatch ?? renderedItems[0] ?? null);
              return;
            }

            if (canInteract && event.key.length === 1) {
              setOpen(true);
            }
          }}
          placeholder={isLoading ? "Loading..." : placeholder}
          ref={inputRef}
          value={displayValue}
        />
        <button
          aria-label={isLoading ? "Loading options" : "Open options"}
          className="text-muted-foreground inline-flex size-6 shrink-0 items-center justify-center rounded-md hover:bg-slate-100 disabled:pointer-events-none"
          disabled={!canInteract}
          onMouseDown={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
            setOpen((current) => {
              if (!current) {
                setActiveIndex(0);
              }

              return !current;
            });
          }}
          type="button"
        >
          {isLoading ? <ThreeDotLoader /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {open ? (
        <div
          className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-lg bg-white py-1 text-sm shadow-md ring-1 ring-black/10"
          role="listbox"
        >
          {isLoading ? (
            <div className="text-muted-foreground flex items-center justify-center gap-2 px-3 py-3">
              <LoaderCircle className="size-4 animate-spin" />
              Loading options...
            </div>
          ) : renderedItems.length > 0 ? (
            renderedItems.map((item, index) => {
              const selected = item.name === selectedName;
              const active = index === activeIndex;

              return (
                <button
                  aria-selected={selected}
                  className={cn(
                    "flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left hover:bg-slate-100",
                    active && "bg-slate-100",
                    selected && "font-medium",
                  )}
                  id={`country-option-${item.cioc}-${index}`}
                  key={`${item.cioc}-${item.name}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectItem(item);
                  }}
                  role="option"
                  type="button"
                >
                  <Flag alt={item.name} src={item.flag} />
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  {selected ? <Check className="size-4 shrink-0" /> : null}
                </button>
              );
            })
          ) : (
            <div className="text-muted-foreground px-3 py-3 text-center">
              {emptyMessage}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
