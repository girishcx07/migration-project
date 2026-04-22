import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { Search, X } from "lucide-react";
import React, { ChangeEvent, FormEvent, forwardRef } from "react";
import { toast } from "sonner";

interface SearchInputProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onChange" | "onSubmit"> {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  placeholder?: string;
  inputClassName?: string;
  className?: string;
  disabled?: boolean;
  onClear: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onSearch,
      placeholder = "Search...",
      className,
      inputClassName,
      disabled,
      onClear,
      ...formProps
    },
    ref
  ) => {
    const validateAndSearch = () => {
      const wordCount = value.trim().length;
      if (wordCount < 3) {
        toast.error("Please enter at least 3 characters.");
        return false;
      }
      onSearch();
      return true;
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      validateAndSearch();
    };

    return (
      <form
        onSubmit={handleSubmit}
        className={cn("flex flex-col gap-2", className)}
        {...formProps}
      >
        <div className="flex items-center gap-2">
          <div className="relative w-full flex gap-1 ">
            <Input
              ref={ref} // ✅ ref works here
              type="text"
              startIcon={<Search className="text-muted-foreground size-4" />}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className={cn(inputClassName, "pr-10 overflow-x-auto whitespace-nowrap")}
              disabled={disabled}
              {...(value && !disabled ? {
                endIcon: (
                  <X
                    className="size-4 cursor-pointer text-gray-400 hover:text-gray-700"
                    onClick={onClear}
                  />
                )
              } : {})}
            />
            {/* {value && !disabled && (
              <button
                type="button"
                onClick={onClear}
                className=" absolute bg-white inset-y-0 my-1 right-0 flex items-center px-3 
        text-gray-400 hover:text-gray-700"
              >
                <X className="size-4" />
              </button>
            )} */}
          </div>
          <Button type="submit" disabled={disabled}>
            Search
          </Button>
        </div>
      </form>
    );
  }
);

SearchInput.displayName = "SearchInput";
