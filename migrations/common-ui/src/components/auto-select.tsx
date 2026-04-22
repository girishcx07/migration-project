"use client";

import {
  defaultClassNames,
  defaultStyles,
} from "@workspace/common-ui/lib/helper";
import * as React from "react";
import Select, {
  GroupBase,
  SelectInstance,
  Props as SelectProps,
  StylesConfig,
} from "react-select";
import {
  ClearIndicator,
  DropdownIndicator,
  MultiValueRemove,
  Placeholder,
  ValueContainer,
} from "./components";

export type {
  GroupBase,
  Options,
  OptionProps,
  SingleValue,
  MultiValue,
  StylesConfig,
  Props as SelectProps,
} from "react-select";

// Define explicit types for the component props
interface AutoSelectProps
  extends SelectProps<unknown, boolean, GroupBase<unknown>> {
  placeholder?: string;
}

// Create a properly typed forwardRef component
const AutoSelect = React.forwardRef<
  SelectInstance<unknown, boolean, GroupBase<unknown>>,
  AutoSelectProps
>((props, ref) => {
  const mergedStyles: StylesConfig<unknown, boolean> = {
    ...(defaultStyles as StylesConfig<unknown, boolean>),
    ...(props.styles as StylesConfig<unknown, boolean>),
  };

  const {
    value,
    onChange,
    options = [],
    classNames = defaultClassNames,
    components = {},
    id = "auto-select",
    ...rest
  } = props;

  return (
    <Select<unknown, boolean, GroupBase<unknown>>
      ref={ref}
      value={value}
      onChange={onChange}
      options={options}
      unstyled
      id={id}
      instanceId={props.placeholder?.toString()}
      components={{
        DropdownIndicator,
        ClearIndicator,
        MultiValueRemove,
        ValueContainer: ValueContainer,
        Placeholder,
        ...components,
      }}
      styles={mergedStyles}
      classNames={classNames}
      {...rest}
    />
  );
});

AutoSelect.displayName = "AutoSelect";

export default React.memo(AutoSelect) as typeof AutoSelect;
