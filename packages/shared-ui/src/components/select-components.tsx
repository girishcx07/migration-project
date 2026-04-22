"use client";

import type {
  ClearIndicatorProps,
  DropdownIndicatorProps,
  GroupBase,
  InputProps,
  MultiValueRemoveProps,
  PlaceholderProps,
  ValueContainerProps,
} from "react-select";
import { components } from "react-select";
import { ChevronDown, Search, X } from "lucide-react";

import { Flag } from "@acme/shared-ui/components/flag-img";

export const DropdownIndicator = (props: DropdownIndicatorProps) => (
  <components.DropdownIndicator {...props}>
    <ChevronDown className="h-4 w-4 opacity-50" />
  </components.DropdownIndicator>
);

export const ClearIndicator = (props: ClearIndicatorProps) => (
  <components.ClearIndicator {...props}>
    <X className="h-3.5 w-3.5 opacity-50" />
  </components.ClearIndicator>
);

export const MultiValueRemove = (props: MultiValueRemoveProps) => (
  <components.MultiValueRemove {...props}>
    <X className="h-3 w-3 opacity-50" />
  </components.MultiValueRemove>
);

export const SelectInput = (props: InputProps) => (
  <components.Input {...props} className="w-auto" />
);

export const ValueContainer = ({ children, ...props }: ValueContainerProps) => {
  const selected = props.getValue()?.[0] as { icon?: string } | undefined;

  return (
    <components.ValueContainer {...props}>
      <div className="flex w-full min-w-0 items-center gap-2">
        <div className="shrink-0">
          {selected?.icon ? (
            <Flag src={selected.icon} alt="" />
          ) : (
            <Search className="flex h-5 w-4 text-gray-500" />
          )}
        </div>
        <div className="flex min-w-0 truncate">{children}</div>
      </div>
    </components.ValueContainer>
  );
};

export const Placeholder = (
  props: PlaceholderProps<unknown, boolean, GroupBase<unknown>>,
) => (
  <div className="flex items-center justify-center text-sm text-gray-500">
    {props.children}
  </div>
);
