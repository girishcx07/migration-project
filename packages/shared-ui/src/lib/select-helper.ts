import type { CSSProperties } from "react";

import { cn } from "@repo/ui/lib/utils";

const controlStyles = {
  base: "flex min-h-9 w-full rounded-md border border-input bg-transparent py-1 pr-1 pl-3 gap-1 text-base shadow-sm transition-colors hover:cursor-pointer md:text-sm",
  focus: "outline-none ring-1 ring-ring",
  disabled: "cursor-not-allowed opacity-50 bg-blue-200",
};

const placeholderStyles = "text-sm text-muted-foreground";
const valueContainerStyles = "gap-1";
const multiValueStyles =
  "inline-flex items-center gap-2 rounded-md border border-transparent bg-secondary px-1.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none";
const indicatorsContainerStyles = "gap-1";
const clearIndicatorStyles = "rounded-md p-1";
const indicatorSeparatorStyles = "bg-border";
const dropdownIndicatorStyles = "rounded-md p-1";
const menuStyles =
  "mt-1 rounded-md border bg-popover p-1 text-popover-foreground shadow-md";
const groupHeadingStyles =
  "px-1 py-2 text-sm font-semibold text-secondary-foreground";
const optionStyles = {
  base: "hover:cursor-pointer hover:bg-accent hover:text-accent-foreground px-2 py-1.5 rounded-sm !text-sm !cursor-default !select-none !outline-none font-sans",
  focus: "bg-accent text-accent-foreground active:bg-accent/90",
  disabled: "pointer-events-none opacity-50",
  selected: "",
};
const noOptionsMessageStyles =
  "rounded-sm border border-dashed border-border bg-accent p-2 text-accent-foreground";
const loadingIndicatorStyles =
  "flex h-4 w-4 items-center justify-center opacity-50";
const loadingMessageStyles = "bg-accent p-2 text-accent-foreground";

interface ClassNames {
  clearIndicator?: (state: unknown) => string;
  container?: (state: unknown) => string;
  control?: (state: { isDisabled: boolean; isFocused: boolean }) => string;
  dropdownIndicator?: (state: unknown) => string;
  group?: (state: unknown) => string;
  groupHeading?: (state: unknown) => string;
  indicatorsContainer?: (state: unknown) => string;
  indicatorSeparator?: (state: unknown) => string;
  input?: (state: unknown) => string;
  loadingIndicator?: (state: unknown) => string;
  loadingMessage?: (state: unknown) => string;
  menu?: (state: unknown) => string;
  menuList?: (state: unknown) => string;
  menuPortal?: (state: unknown) => string;
  multiValue?: (state: unknown) => string;
  multiValueLabel?: (state: unknown) => string;
  multiValueRemove?: (state: unknown) => string;
  noOptionsMessage?: (state: unknown) => string;
  option?: (state: {
    isFocused: boolean;
    isDisabled: boolean;
    isSelected: boolean;
  }) => string;
  placeholder?: (state: unknown) => string;
  singleValue?: (state: unknown) => string;
  valueContainer?: (state: unknown) => string;
}

export const createClassNames = (classNames: ClassNames) => ({
  clearIndicator: (state: unknown) =>
    cn(clearIndicatorStyles, classNames.clearIndicator?.(state)),
  container: (state: unknown) => cn(classNames.container?.(state)),
  control: (state: { isDisabled: boolean; isFocused: boolean }) =>
    cn(
      controlStyles.base,
      state.isDisabled && controlStyles.disabled,
      state.isFocused && controlStyles.focus,
      classNames.control?.(state),
    ),
  dropdownIndicator: (state: unknown) =>
    cn(dropdownIndicatorStyles, classNames.dropdownIndicator?.(state)),
  group: (state: unknown) => cn(classNames.group?.(state)),
  groupHeading: (state: unknown) =>
    cn(groupHeadingStyles, classNames.groupHeading?.(state)),
  indicatorsContainer: (state: unknown) =>
    cn(indicatorsContainerStyles, classNames.indicatorsContainer?.(state)),
  indicatorSeparator: (state: unknown) =>
    cn(indicatorSeparatorStyles, classNames.indicatorSeparator?.(state)),
  input: (state: unknown) => cn(classNames.input?.(state)),
  loadingIndicator: (state: unknown) =>
    cn(loadingIndicatorStyles, classNames.loadingIndicator?.(state)),
  loadingMessage: (state: unknown) =>
    cn(loadingMessageStyles, classNames.loadingMessage?.(state)),
  menu: (state: unknown) => cn(menuStyles, classNames.menu?.(state)),
  menuList: (state: unknown) => cn(classNames.menuList?.(state)),
  menuPortal: (state: unknown) => cn(classNames.menuPortal?.(state)),
  multiValue: (state: unknown) =>
    cn(multiValueStyles, classNames.multiValue?.(state)),
  multiValueLabel: (state: unknown) => cn(classNames.multiValueLabel?.(state)),
  multiValueRemove: (state: unknown) =>
    cn(classNames.multiValueRemove?.(state)),
  noOptionsMessage: (state: unknown) =>
    cn(noOptionsMessageStyles, classNames.noOptionsMessage?.(state)),
  option: (state: {
    isFocused: boolean;
    isDisabled: boolean;
    isSelected: boolean;
  }) =>
    cn(
      optionStyles.base,
      state.isFocused && optionStyles.focus,
      state.isDisabled && optionStyles.disabled,
      state.isSelected && optionStyles.selected,
      classNames.option?.(state),
    ),
  placeholder: (state: unknown) =>
    cn(placeholderStyles, classNames.placeholder?.(state)),
  singleValue: (state: unknown) => cn(classNames.singleValue?.(state)),
  valueContainer: (state: unknown) =>
    cn(valueContainerStyles, classNames.valueContainer?.(state)),
});

export const defaultClassNames = createClassNames({});

export const defaultStyles: Record<
  string,
  (base: CSSProperties) => CSSProperties
> = {
  input: (base) => ({
    ...base,
    "input:focus": {
      boxShadow: "none",
      outline: "none",
      border: "none",
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  multiValueLabel: (base) => ({
    ...base,
    whiteSpace: "normal",
    overflow: "visible",
  }),
  control: (base) => ({
    ...base,
    transition: "none",
  }),
  singleValue: (base) => ({
    ...base,
    maxWidth: "170px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  menuList: (base) => ({
    ...base,
    fontSize: "0.775rem",
  }),
};
