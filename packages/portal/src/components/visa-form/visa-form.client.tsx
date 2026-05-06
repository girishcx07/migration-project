"use client";

import { InputMask } from "@react-input/mask";
import { useMutation } from "@tanstack/react-query";
import AutoSelect from "@workspace/common-ui/components/auto-select";
import { debounce, getApplicantName } from "@workspace/common-ui/lib/utils";
import { orpc } from "@workspace/orpc/lib/orpc";
import { FormStatus, VisaFormField, WhenType } from "@workspace/types/review";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import clsx from "clsx";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon, RefreshCw } from "lucide-react";
import React, {
  createContext,
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import ArabicKeyboard from "../components/arabic-keyboard";
import AnimatedCircularProgressBar from "../components/animated-circular-progress-bar";
import {
  ApplicantErrors,
  useApplicationState,
} from "../context/review-visa-context";
import { useReadyStatus } from "../hooks/use-ready-status";
import { getApplicantComputedStatus } from "../lib/ready-status";
import {
  buildSubGroupRow,
  createVisaFormResolver,
  DATE_FORMAT,
  getDefaultFieldValue,
  getFieldPath,
  getNonRequiredLabelError,
  getVisaFormCompletionFromErrors,
  hasMandatoryFieldValue,
  VisaFormGeneratedErrors,
  VisaFormRuntime,
} from "./visa-form.generator";

interface VisaFormClientProps {
  runtime: VisaFormRuntime;
  applicationId?: string;
  applicantId?: string;
}

interface ProgressSyncInput {
  trigger: ReturnType<typeof useFormContext>["trigger"];
  getValues: ReturnType<typeof useFormContext>["getValues"];
  getFieldState: ReturnType<typeof useFormContext>["getFieldState"];
  setValue: ReturnType<typeof useFormContext>["setValue"];
  fieldName: string;
  label: string;
  isRequiredField: boolean;
}

const VisaFormScrollContext = createContext<{
  scrollRef: React.RefObject<HTMLDivElement | null>;
} | null>(null);

const VisaFormErrorVisibilityContext = createContext<{
  showErrors: boolean;
}>({
  showErrors: false,
});

const syncFieldProgressState = async ({
  trigger,
  getValues,
  getFieldState,
  setValue,
  fieldName,
  label,
  isRequiredField,
}: ProgressSyncInput): Promise<void> => {
  if (!isRequiredField) return;

  await trigger(fieldName);

  const currentValue = getValues(fieldName);
  const hasValue = hasMandatoryFieldValue(currentValue);
  const state = getFieldState(fieldName);
  const hasError = !!state.error;
  const currentFormValues = (getValues("formValues") ?? {}) as VisaFormGeneratedErrors;

  setValue(
    "formValues",
    {
      ...currentFormValues,
      [fieldName]: {
        isValid: hasValue && !hasError,
        label,
        isRequiredField: true,
        name: fieldName,
        hasValue,
        hasError,
        validated: true,
      },
    },
    {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    },
  );
};

const removeFieldProgressState = ({
  getValues,
  setValue,
  fieldName,
}: Pick<ProgressSyncInput, "getValues" | "setValue" | "fieldName">): void => {
  const currentFormValues = {
    ...((getValues("formValues") ?? {}) as VisaFormGeneratedErrors),
  };
  delete currentFormValues[fieldName];

  setValue("formValues", currentFormValues, {
    shouldDirty: false,
    shouldTouch: false,
    shouldValidate: false,
  });
};

const syncCurrentFormProgressState = ({
  getValues,
  getFieldState,
  setValue,
}: Pick<ProgressSyncInput, "getValues" | "getFieldState" | "setValue">): VisaFormGeneratedErrors => {
  const currentFormValues = (getValues("formValues") ?? {}) as VisaFormGeneratedErrors;

  const nextFormValues = Object.entries(currentFormValues).reduce<VisaFormGeneratedErrors>(
    (accumulator, [fieldName, fieldState]) => {
      if (!fieldState?.isRequiredField) return accumulator;

      const currentValue = getValues(fieldName);
      const hasValue = hasMandatoryFieldValue(currentValue);
      const hasError = !!getFieldState(fieldName).error;

      accumulator[fieldName] = {
        ...fieldState,
        name: fieldName,
        hasValue,
        hasError,
        isValid: hasValue && !hasError,
        validated: true,
      };

      return accumulator;
    },
    {},
  );

  setValue("formValues", nextFormValues, {
    shouldDirty: false,
    shouldTouch: false,
    shouldValidate: false,
  });

  return nextFormValues;
};

const getDatePickerRange = (checkMinMaxDate: WhenType) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  if (checkMinMaxDate === "after") {
    return {
      before: new Date(currentYear, currentDate.getMonth(), currentDate.getDate()),
      after: new Date(currentYear + 100, currentDate.getMonth(), currentDate.getDate()),
    };
  }

  if (checkMinMaxDate === "before") {
    return {
      before: new Date(currentYear - 100, currentDate.getMonth(), currentDate.getDate()),
      after: new Date(currentYear, currentDate.getMonth(), currentDate.getDate()),
    };
  }

  return {
    before: new Date(currentYear - 50, currentDate.getMonth(), currentDate.getDate()),
    after: new Date(currentYear + 50, currentDate.getMonth(), currentDate.getDate()),
  };
};

const FORM_SKELETON_GROUPS = Array.from({ length: 4 });
const FORM_SKELETON_FIELDS = Array.from({ length: 5 });

const VisaFormContent = memo(
  ({ runtime, scopedApplicantId }: { runtime: VisaFormRuntime; scopedApplicantId: string }) => {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const groups = runtime.formData;

    return (
      <Card className="h-full gap-0 overflow-hidden py-0">
        <CardHeader className="hidden bg-gray-100 py-2 md:block">
          <CardTitle>
            <div className="flex items-center justify-between gap-3">
              <div className="text-md">Visa Form</div>
              {runtime.hasVisaForm ? <FormProgress /> : <div className="size-10" />}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="visa_card_body h-full px-0 md:pb-12">
          <VisaFormScrollContext.Provider value={{ scrollRef }}>
            <ScrollArea
              viewportRef={scrollRef as React.RefObject<HTMLDivElement>}
              className="h-full pb-6"
            >
              {groups.map((group, groupIndex) => {
                const groupName = group?.name;

                return (
                  <div className="p-4" key={groupName || groupIndex}>
                    <div className="mb-2 text-xl font-bold text-black">
                      {group?.label}
                    </div>
                    <div className="mb-2 text-[0.8rem] text-slate-400">
                      {group?.sub_label}
                    </div>
                    <hr className="w-1/2" />
                    <div className="grid grid-cols-1 gap-6 p-2 sm:grid-cols-2 lg:grid-cols-3">
                      {group?.group_elements?.map((field, fieldIndex: number) => (
                        <FormRenderer
                          field={field}
                          arrayIndex={fieldIndex}
                          parentName={groupName}
                          key={`${scopedApplicantId}.${groupName}.${field?.name}.${fieldIndex}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </VisaFormScrollContext.Provider>
        </CardContent>
      </Card>
    );
  },
);

VisaFormContent.displayName = "VisaFormContent";

export const VisaFormClient = memo(({ runtime, applicantId }: VisaFormClientProps) => {
  const {
    reviewVisaFormRef,
    activeApplicantId,
    setApplicantFormErrorVisible,
    getApplicantFormErrorVisible,
    setApplicationReadiness,
    updateApplicantReviewState,
  } = useApplicationState();

  const scopedApplicantId = activeApplicantId ?? applicantId ?? "";
  const resolver = useMemo(
    () => createVisaFormResolver(runtime.validationSchema),
    [runtime.validationSchema],
  );

  const methods = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: runtime.defaultValues,
    resolver,
  });

  const { trigger, getValues, reset, setValue, getFieldState } = methods;
  const showErrors = getApplicantFormErrorVisible(scopedApplicantId);
  const errorVisibilityContextValue = useMemo(() => ({ showErrors }), [showErrors]);

  useEffect(() => {
    setApplicationReadiness((previousState) => ({
      ...previousState,
      hasVisaForm: runtime.hasVisaForm,
    }));

    if (!scopedApplicantId) return;

    reset(runtime.defaultValues, {
      keepDirty: false,
      keepTouched: false,
      keepErrors: false,
    });

    updateApplicantReviewState(scopedApplicantId, {
      errors: runtime.initialFormValues as ApplicantErrors,
      formProgress: runtime.completion.progress,
      visaFormResolved: true,
      visaFormComplete: runtime.completion.isComplete,
    });
  }, [
    reset,
    runtime.completion.isComplete,
    runtime.completion.progress,
    runtime.defaultValues,
    runtime.hasVisaForm,
    runtime.initialFormValues,
    runtime.runtimeKey,
    scopedApplicantId,
    setApplicationReadiness,
    updateApplicantReviewState,
  ]);

  useImperativeHandle(
    reviewVisaFormRef,
    () => ({
      validate: async () => {
        setApplicantFormErrorVisible(true, scopedApplicantId);
        const resolverValid = await trigger(undefined, { shouldFocus: true });
        const progressValues = syncCurrentFormProgressState({
          getValues,
          getFieldState,
          setValue,
        });
        const completion = getVisaFormCompletionFromErrors(progressValues);

        if (scopedApplicantId) {
          updateApplicantReviewState(scopedApplicantId, {
            errors: progressValues as ApplicantErrors,
            formProgress: completion.progress,
            visaFormResolved: true,
            visaFormComplete: completion.isComplete,
          });
        }

        return resolverValid && completion.isComplete;
      },
      getValues,
      reset: (values?: Record<string, unknown>) => reset(values ?? runtime.defaultValues),
    }),
    [
      getFieldState,
      getValues,
      reset,
      reviewVisaFormRef,
      runtime.defaultValues,
      scopedApplicantId,
      setApplicantFormErrorVisible,
      setValue,
      trigger,
      updateApplicantReviewState,
    ],
  );

  return (
    <VisaFormErrorVisibilityContext.Provider value={errorVisibilityContextValue}>
      <Form {...methods}>
        <form className="h-full">
          <VisaFormContent runtime={runtime} scopedApplicantId={scopedApplicantId} />
        </form>
      </Form>
    </VisaFormErrorVisibilityContext.Provider>
  );
});

VisaFormClient.displayName = "VisaFormClient";

export default VisaFormClient;

interface TextFieldProps {
  field: VisaFormField;
  parentName: string;
  isPartOfSubGroup?: boolean;
}

export const TextField = memo(
  ({ field, parentName, isPartOfSubGroup = false }: TextFieldProps) => {
    const {
      name,
      label,
      value,
      validations,
      has_arabic,
      associated_field = "",
      keyboard_type,
    } = field;

    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
    const { showErrors } = React.useContext(VisaFormErrorVisibilityContext);
    const { control, trigger, setValue, getValues, getFieldState } = useFormContext();
    const { activeApplicantId, setApplicationDetails } = useApplicationState();

    const defaultValue = getDefaultFieldValue(value);
    const isRequiredField = !!validations?.mandatory;
    const fieldName = getFieldPath(parentName, name, isPartOfSubGroup);
    const associateFieldName = associated_field
      ? getFieldPath(parentName, associated_field, isPartOfSubGroup)
      : "";

    const arabicValue = useWatch({
      name: fieldName,
      control,
      defaultValue,
    });

    const syncApplicantName = useCallback(
      (changedFieldName: string, fieldValue: string) => {
        if (!activeApplicantId || parentName !== "personal_details") return;
        if (changedFieldName !== "first_name" && changedFieldName !== "last_name") return;

        const targetKey =
          changedFieldName === "first_name"
            ? "applicant_first_name"
            : "applicant_last_name";
        const normalizedValue = fieldValue.toUpperCase();

        setApplicationDetails((previousDetails) => {
          if (!previousDetails) return previousDetails;

          return {
            ...previousDetails,
            applicants: previousDetails.applicants.map((applicant) => {
              if (applicant._id !== activeApplicantId) return applicant;

              const updatedApplicant = {
                ...applicant,
                [targetKey]: normalizedValue,
              };

              return {
                ...updatedApplicant,
                name: getApplicantName(updatedApplicant),
              };
            }),
          };
        });
      },
      [activeApplicantId, parentName, setApplicationDetails],
    );

    const { mutate: mutateEngToArb, isPending } = useMutation(
      orpc.visa.englishToArabicTranslation.mutationOptions({
        onSuccess: (data) => {
          const convertedText = data?.data?.translated;
          if (!associateFieldName || !convertedText) return;

          setValue(associateFieldName, convertedText, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        },
      }),
    );

    const checkValidateOrNot = useCallback(async () => {
      await syncFieldProgressState({
        trigger,
        getValues,
        getFieldState,
        setValue,
        fieldName,
        label,
        isRequiredField,
      });
    }, [
      fieldName,
      getFieldState,
      getValues,
      isRequiredField,
      label,
      setValue,
      trigger,
    ]);

    const debouncedCheckValidateOrNot = useMemo(
      () => debounce(() => void checkValidateOrNot(), 120),
      [checkValidateOrNot],
    );

    const lastAppliedServerValueRef = useRef<string>("");

    useEffect(() => {
      const nextValue = getDefaultFieldValue(defaultValue);
      const serverValueKey = `${fieldName}::${String(nextValue)}`;
      if (lastAppliedServerValueRef.current === serverValueKey) return;
      lastAppliedServerValueRef.current = serverValueKey;

      if (getValues(fieldName) !== nextValue) {
        setValue(fieldName, nextValue, {
          shouldValidate: true,
          shouldDirty: false,
          shouldTouch: false,
        });
      }

      if (parentName === "personal_details" && (name === "first_name" || name === "last_name")) {
        syncApplicantName(name, String(nextValue ?? ""));
      }

      if (has_arabic && associateFieldName && nextValue && !getValues(associateFieldName)) {
        mutateEngToArb({ text: String(nextValue) });
      }
    }, [
      associateFieldName,
      defaultValue,
      fieldName,
      getValues,
      has_arabic,
      mutateEngToArb,
      name,
      parentName,
      setValue,
      syncApplicantName,
    ]);

    useEffect(() => {
      void checkValidateOrNot();
      return () => {
        removeFieldProgressState({ getValues, setValue, fieldName });
      };
    }, [checkValidateOrNot, fieldName, getValues, setValue]);

    useEffect(() => {
      if (has_arabic || keyboard_type === "arabic") {
        void checkValidateOrNot();
      }
    }, [arabicValue, checkValidateOrNot, has_arabic, keyboard_type]);

    useEffect(() => {
      return () => {
        debouncedCheckValidateOrNot.cancel();
      };
    }, [debouncedCheckValidateOrNot]);

    const handleArabicInputChange = useCallback(
      (input: string) => {
        const normalizedInput =
          parentName === "personal_details" ? input.toUpperCase() : input;

        setValue(fieldName, normalizedInput, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });

        if (parentName === "personal_details") {
          syncApplicantName(name, normalizedInput);
        }

        void checkValidateOrNot();
      },
      [checkValidateOrNot, fieldName, name, parentName, setValue, syncApplicantName],
    );

    return (
      <PopoverWrapper
        keyboardType={keyboard_type as string}
        name={associateFieldName || fieldName}
        isRequiredField={isRequiredField}
        onBlur={handleArabicInputChange}
        label={label}
        value={String(arabicValue ?? "")}
        setIsPopoverOpen={setIsPopoverOpen}
        isPopoverOpen={isPopoverOpen}
      >
        <FormField
          control={control}
          name={fieldName}
          defaultValue={defaultValue}
          render={({
            field: { onChange, value, onBlur, ...fieldProps },
            fieldState: { invalid, error },
          }) => {
            const hasVisibleError = showErrors && invalid;
            const labelError = hasVisibleError
              ? getNonRequiredLabelError(error?.type, error?.message)
              : "";

            return (
              <div className="h-full text-left">
                <FormItem className="grid h-full grid-rows-[1fr_auto]">
                  <FormLabel
                    label={label}
                    mandatory={!!validations?.mandatory}
                    invalid={hasVisibleError}
                    customError={labelError}
                  />
                  <FormControl>
                    <Input
                      placeholder={label}
                      value={value ?? ""}
                      {...fieldProps}
                      onBlur={(event) => {
                        const normalizedValue = event.target.value.trim().toUpperCase();

                        setValue(fieldName, normalizedValue, {
                          shouldValidate: true,
                          shouldDirty: true,
                          shouldTouch: true,
                        });

                        if (parentName === "personal_details") {
                          syncApplicantName(name, normalizedValue);
                        }

                        onBlur();
                        void checkValidateOrNot();
                      }}
                      onChange={(event) => {
                        onChange(event);
                        debouncedCheckValidateOrNot();
                      }}
                      onClick={(event) => {
                        if (keyboard_type === "arabic") {
                          event.preventDefault();
                        }
                      }}
                      onFocus={(event) => {
                        if (keyboard_type === "arabic") {
                          setIsPopoverOpen(true);
                          event.target.blur();
                        }
                      }}
                      endIcon={
                        has_arabic && (
                          <RefreshCw
                            onClick={() => {
                              if (value) mutateEngToArb({ text: String(value) });
                            }}
                            className={clsx("h-4 w-4 cursor-pointer opacity-50", {
                              "animate-spin": isPending,
                            })}
                          />
                        )
                      }
                      className={cn(
                        "uppercase placeholder:normal-case",
                        hasVisibleError && "bg-red-500/20",
                      )}
                    />
                  </FormControl>
                </FormItem>
              </div>
            );
          }}
        />
      </PopoverWrapper>
    );
  },
);

TextField.displayName = "TextField";

interface PopoverWrapperProps {
  children: ReactNode;
  keyboardType: string;
  name: string;
  label: string;
  value: string;
  setInput?: (value: string) => void;
  onBlur?: (value: string) => void;
  isPopoverOpen: boolean;
  setIsPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isRequiredField: boolean;
}

const PopoverWrapper: React.FC<PopoverWrapperProps> = memo(
  ({
    children,
    keyboardType,
    name,
    setInput,
    label,
    value,
    onBlur,
    setIsPopoverOpen,
    isPopoverOpen,
    isRequiredField,
  }) => {
    const [inputValue, setInputValue] = useState<string>(value ?? "");

    useEffect(() => {
      setInputValue(value ?? "");
    }, [value]);

    const handleOnClose = useCallback(
      (open: boolean) => {
        setIsPopoverOpen(open);
        if (!open) onBlur?.(inputValue);
      },
      [inputValue, onBlur, setIsPopoverOpen],
    );

    if (keyboardType !== "arabic") {
      return <>{children}</>;
    }

    return (
      <Popover onOpenChange={handleOnClose} open={isPopoverOpen}>
        <PopoverTrigger>{children}</PopoverTrigger>
        <PopoverContent className="min-w-[415px]">
          <ArabicKeyboard
            setArabicInput={(nextValue) => {
              const normalizedValue = nextValue?.trim() ?? "";
              setInputValue(normalizedValue);
              setInput?.(normalizedValue);
            }}
            setPopover={handleOnClose}
            input={inputValue}
            label={label}
            isRequiredField={isRequiredField}
            name={name}
          />
        </PopoverContent>
      </Popover>
    );
  },
);

PopoverWrapper.displayName = "PopoverWrapper";

interface FieldRenderProps {
  field: VisaFormField;
  parentName?: string;
  isPartOfSubGroup?: boolean;
  arrayIndex?: number;
}

const DropDownField: React.FC<FieldRenderProps> = memo(
  ({ field, parentName, isPartOfSubGroup = false }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { showErrors } = React.useContext(VisaFormErrorVisibilityContext);
    const { control, trigger, getValues, setValue, getFieldState } = useFormContext();
    const { activeApplicantId } = useApplicationState();
    const scrollContext = React.useContext(VisaFormScrollContext);
    const scrollRef = scrollContext?.scrollRef;

    const {
      name,
      label,
      validations,
      value,
      options,
      dependent_elements = [],
    } = field;

    const defaultValue = getDefaultFieldValue(value);
    const isRequiredField = !!validations?.mandatory;
    const fieldName = getFieldPath(parentName, name, isPartOfSubGroup);

    const selectOptions = useMemo(
      () =>
        (options ?? []).map((option) => ({
          label: String(option),
          value: String(option),
        })),
      [options],
    );

    const dependantValue = useWatch({
      name: fieldName,
      control,
      defaultValue,
    });

    const dependantArr: VisaFormField[] = useMemo(() => {
      return dependent_elements.filter(
        (dependentField) => dependentField?.dependent_value === dependantValue,
      );
    }, [dependantValue, dependent_elements]);

    const checkValidateOrNot = useCallback(async () => {
      await syncFieldProgressState({
        trigger,
        getValues,
        getFieldState,
        setValue,
        fieldName,
        label,
        isRequiredField,
      });
    }, [
      fieldName,
      getFieldState,
      getValues,
      isRequiredField,
      label,
      setValue,
      trigger,
    ]);

    const dependentCards = useMemo(() => {
      return dependantArr.map((dependentField, index) => (
        <FormRenderer
          isPartOfSubGroup={false}
          field={dependentField}
          arrayIndex={index}
          parentName={fieldName}
          key={`${activeApplicantId}.${fieldName}.${dependentField.name}.${index}`}
        />
      ));
    }, [activeApplicantId, dependantArr, fieldName]);

    useEffect(() => {
      setValue(fieldName, defaultValue, {
        shouldValidate: true,
        shouldDirty: false,
        shouldTouch: false,
      });
    }, [defaultValue, fieldName, setValue]);

    useEffect(() => {
      const container = scrollRef?.current;
      if (!container) return;

      const handleScroll = () => {
        setMenuOpen(false);
      };

      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }, [scrollRef]);

    useEffect(() => {
      void checkValidateOrNot();
      return () => {
        removeFieldProgressState({ getValues, setValue, fieldName });
      };
    }, [checkValidateOrNot, fieldName, getValues, setValue]);

    return (
      <>
        <FormField
          control={control}
          name={fieldName}
          defaultValue={defaultValue}
          render={({
            field: { value, onChange, ...args },
            fieldState: { invalid, error },
          }) => {
            const hasVisibleError = showErrors && invalid;
            const labelError = hasVisibleError
              ? getNonRequiredLabelError(error?.type, error?.message)
              : "";

            return (
              <FormItem className="grid h-full w-full grid-rows-[1fr_auto] place-self-stretch">
                <FormLabel
                  label={label}
                  mandatory={!!validations?.mandatory}
                  invalid={hasVisibleError}
                  customError={labelError}
                />
                <FormControl>
                  <AutoSelect
                    options={selectOptions}
                    isDisabled={!!validations?.read_only}
                    className={
                      hasVisibleError
                        ? "[&>.text-popover-foreground]:bg-white [&>div]:bg-red-500/20"
                        : ""
                    }
                    menuIsOpen={menuOpen}
                    onMenuOpen={() => setMenuOpen(true)}
                    onMenuClose={() => setMenuOpen(false)}
                    menuPosition="fixed"
                    menuPlacement="auto"
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : null
                    }
                    closeMenuOnScroll={true}
                    placeholder="Select an option"
                    value={value ? { label: String(value), value: String(value) } : null}
                    onChange={(option: { label: string; value: string } | null) => {
                      const selectedValue = option?.value ?? "";
                      onChange(selectedValue);
                      setValue(fieldName, selectedValue, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                      void checkValidateOrNot();
                    }}
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                    {...args}
                  />
                </FormControl>
              </FormItem>
            );
          }}
        />
        {dependentCards}
      </>
    );
  },
);

DropDownField.displayName = "DropDownField";

interface FormRendererProps {
  field: VisaFormField;
  parentName: string;
  isPartOfSubGroup?: boolean;
  arrayIndex?: number;
}

export const FormRenderer: React.FC<FormRendererProps> = memo(
  ({ field, parentName, isPartOfSubGroup = false, arrayIndex }) => {
    const fieldType =
      field?.validations?.display === false ? "hidden" : field?.type;
    const commonProps = {
      field,
      parentName,
      isPartOfSubGroup,
      arrayIndex,
    };

    switch (fieldType) {
      case "subGroup":
        return <SubGroup {...commonProps} />;
      case "textField":
        return <TextField {...commonProps} />;
      case "dropdown":
        return <DropDownField {...commonProps} />;
      case "dateControl":
        return <DatePickerField {...commonProps} />;
      case "hidden":
        return <HiddenField {...commonProps} />;
      default:
        return <TextField {...commonProps} />;
    }
  },
);

FormRenderer.displayName = "FormRenderer";

interface SubGroupProps {
  field: VisaFormField;
  parentName?: string;
  isPartOfSubGroup?: boolean;
}

const SubGroup: React.FC<SubGroupProps> = memo(
  ({ field, parentName, isPartOfSubGroup = false }) => {
    const { name, label, sub_group_elements, max_count = 0, sub_type } = field;
    const { control } = useFormContext();
    const { activeApplicantId } = useApplicationState();
    const fieldName = getFieldPath(parentName, name, isPartOfSubGroup);
    const templateRow = sub_group_elements?.[0] ?? [];

    const { fields, append, remove, replace } = useFieldArray({
      name: fieldName,
      control,
    });

    useEffect(() => {
      if (!sub_group_elements || sub_group_elements.length === 0) return;
      replace(sub_group_elements.map((row) => buildSubGroupRow(row)));
    }, [replace, sub_group_elements]);

    const handleAddMore = useCallback(() => {
      if (!templateRow.length) return;
      if (max_count && fields.length >= max_count) return;
      append(buildSubGroupRow(templateRow));
    }, [append, fields.length, max_count, templateRow]);

    const handleRemove = useCallback(
      (index: number) => {
        remove(index);
      },
      [remove],
    );

    return (
      <>
        {fields.map((fieldItem, index) => (
          <Card
            className="col-span-full gap-0 overflow-hidden pt-0"
            key={fieldItem.id}
          >
            <CardHeader className="bg-slate-100 py-3">
              <CardTitle className="flex items-center justify-between text-sm">
                {label} {index + 1}
                {index !== 0 && sub_type === "incremental" && (
                  <button
                    type="button"
                    className="text-xs text-red-500 hover:text-red-700"
                    onClick={() => handleRemove(index)}
                  >
                    Delete
                  </button>
                )}
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="grid grid-cols-1 gap-6 px-3 pt-3 md:grid-cols-2 xl:grid-cols-3">
              {templateRow.map((subField) => (
                <FormRenderer
                  field={subField}
                  key={`${activeApplicantId}.${fieldItem.id}.${subField.name}`}
                  parentName={`${fieldName}.${index}`}
                  isPartOfSubGroup={true}
                  arrayIndex={index}
                />
              ))}
            </CardContent>
          </Card>
        ))}

        {sub_type === "incremental" && max_count > fields.length && (
          <CardFooter className="col-span-full">
            <button
              type="button"
              className="ml-auto text-sm text-blue-500 hover:text-blue-700"
              onClick={handleAddMore}
            >
              Add More+
            </button>
          </CardFooter>
        )}
      </>
    );
  },
);

SubGroup.displayName = "SubGroup";

const HiddenField: React.FC<FieldRenderProps> = memo(
  ({ field, parentName, isPartOfSubGroup = false }) => {
    const { register } = useFormContext();
    const { name, value } = field;
    const fieldName = getFieldPath(parentName, name, isPartOfSubGroup);

    return (
      <input
        type="hidden"
        {...register(fieldName, {
          value: value ?? "",
        })}
      />
    );
  },
);

HiddenField.displayName = "HiddenField";

const DatePickerField: React.FC<FieldRenderProps> = memo(
  ({ field, parentName, isPartOfSubGroup = false }) => {
    const { showErrors } = React.useContext(VisaFormErrorVisibilityContext);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { control, setValue, trigger, getValues, getFieldState } = useFormContext();
    const { name, label, validations, value } = field;

    const fieldName = getFieldPath(parentName, name, isPartOfSubGroup);
    const defaultValue = getDefaultFieldValue(value);
    const checkMinMaxDate: WhenType = validations?.when || "before";
    const isRequiredField = !!validations?.mandatory;
    const dateRange = useMemo(
      () => getDatePickerRange(checkMinMaxDate),
      [checkMinMaxDate],
    );

    const parseCalendarDate = useCallback((dateValue: unknown) => {
      const normalizedValue = String(dateValue ?? "").trim();
      if (!/^\d{2}-\d{2}-\d{4}$/.test(normalizedValue)) return null;

      const parsedDate = parse(normalizedValue, DATE_FORMAT, new Date());
      if (!isValid(parsedDate)) return null;
      if (format(parsedDate, DATE_FORMAT) !== normalizedValue) return null;

      return parsedDate;
    }, []);

    const checkValidateOrNot = useCallback(async () => {
      await syncFieldProgressState({
        trigger,
        getValues,
        getFieldState,
        setValue,
        fieldName,
        label,
        isRequiredField,
      });
    }, [
      fieldName,
      getFieldState,
      getValues,
      isRequiredField,
      label,
      setValue,
      trigger,
    ]);

    useEffect(() => {
      setSelectedDate(parseCalendarDate(defaultValue));
      setValue(fieldName, defaultValue, {
        shouldValidate: true,
        shouldDirty: false,
        shouldTouch: false,
      });
    }, [defaultValue, fieldName, parseCalendarDate, setValue]);

    useEffect(() => {
      void checkValidateOrNot();
      return () => {
        removeFieldProgressState({ getValues, setValue, fieldName });
      };
    }, [checkValidateOrNot, fieldName, getValues, setValue]);

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <FormField
          control={control}
          name={fieldName}
          defaultValue={defaultValue}
          render={({
            field: { onChange, value, ref, ...args },
            fieldState: { invalid, error },
          }) => {
            const hasVisibleError = showErrors && invalid;
            const labelError = hasVisibleError
              ? getNonRequiredLabelError(error?.type, error?.message)
              : "";

            return (
              <FormItem className="grid h-full grid-rows-[1fr_auto]">
                <FormLabel
                  label={label}
                  mandatory={!!validations?.mandatory}
                  invalid={hasVisibleError}
                  customError={labelError}
                />
                <FormControl>
                  <InputMask
                    mask="__-__-____"
                    component={DateInput}
                    replacement={{ _: /\d/ }}
                    invalid={hasVisibleError}
                    ref={ref}
                    label={label}
                    aria-invalid={hasVisibleError}
                    setIsOpen={setIsOpen}
                    disabled={validations?.read_only}
                    onChange={(event) => {
                      onChange(event);
                      setSelectedDate(parseCalendarDate(event.target.value));
                      void checkValidateOrNot();
                    }}
                    value={value ?? ""}
                    className={hasVisibleError ? "bg-red-500/20" : ""}
                    {...args}
                  />
                </FormControl>
              </FormItem>
            );
          }}
        />

        <DialogContent className="md:max-w-[300px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold tracking-normal">
              Select a <span className="text-primary">{label}</span>
              {!!validations?.mandatory && (
                <span className="text-red-500">*</span>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Please select a {label} as per your document.
            </DialogDescription>
          </DialogHeader>
          <div className="-mx-6 flex justify-center">
            <Calendar
              defaultMonth={selectedDate ?? new Date()}
              captionLayout="dropdown"
              startMonth={dateRange.before}
              endMonth={dateRange.after}
              disabled={dateRange}
              mode="single"
              selected={selectedDate ?? undefined}
              onSelect={(date: unknown) => {
                if (!date) return;

                const nextValue = format(date as Date, DATE_FORMAT);
                setValue(fieldName, nextValue, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
                setSelectedDate(date as Date);
                setIsOpen(false);
                void checkValidateOrNot();
              }}
              className="rounded-md border"
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);

DatePickerField.displayName = "DatePickerField";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  invalid?: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DateInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, invalid, setIsOpen, ...args }, forwardedRef) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const form = (event.target as HTMLElement).closest("form");
        if (!form) return;

        form.dispatchEvent(
          new Event("submit", {
            cancelable: true,
            bubbles: true,
          }),
        );
      }
    };

    return (
      <div className="relative">
        <Input
          ref={forwardedRef}
          placeholder={label}
          className={invalid ? "bg-red-500/20" : ""}
          {...args}
          onKeyUp={(event) => {
            if (!/[0-9]/.test(event.key)) {
              event.preventDefault();
            }
          }}
          onKeyDown={handleKeyDown}
          endIcon={
            <CalendarIcon
              className="h-4 w-4 cursor-pointer opacity-50"
              onClick={() => setIsOpen(true)}
            />
          }
        />
      </div>
    );
  },
);

DateInput.displayName = "DateInput";

export const FormSkeleton = () => {
  return (
    <>
      {FORM_SKELETON_GROUPS.map((_, index) => (
        <div key={index} className="mb-3">
          <div className="px-2 py-2">
            <Skeleton className="mb-2 h-5 w-1/2" />
            <Skeleton className="mb-2 h-5 w-1/4" />
          </div>
          <Separator className="mx-2 w-[50%]" />
          <div className="grid grid-cols-3 gap-3 p-2 px-4">
            {FORM_SKELETON_FIELDS.map((__, fieldIndex) => (
              <Skeleton key={fieldIndex} className="mb-2 h-8 w-full" />
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

const FormProgress: React.FC = () => {
  const form = useFormContext();
  const [progress, setProgress] = useState(0);
  const {
    getActiveApplicant,
    getApplicantReviewState,
    activeApplicantId,
    updateApplicantReviewState,
  } = useApplicationState();
  const { updateApplicantStatus } = useReadyStatus();

  const applicantIdRef = useRef(activeApplicantId);
  const latestStatusRef = useRef<FormStatus | "calculating" | "">("");
  const previousStatusRef = useRef<FormStatus>();
  const isUpdatingRef = useRef(false);

  const applicantState = getActiveApplicant();
  const value = useWatch({
    name: "formValues",
    control: form.control,
    defaultValue: form.getValues("formValues") ?? {},
  });

  useEffect(() => {
    applicantIdRef.current = activeApplicantId;
  }, [activeApplicantId]);

  const syncApplicantFormState = useCallback(
    (nextValue: ApplicantErrors) => {
      const normalizedErrors = Object.entries(nextValue ?? {}).reduce(
        (accumulator, [key, field]) => {
          const progressField = field as ApplicantErrors[string] | undefined;
          if (progressField?.isRequiredField) {
            accumulator[key] = progressField;
          }
          return accumulator;
        },
        {} as ApplicantErrors,
      );

      const completion = getVisaFormCompletionFromErrors(
        normalizedErrors as unknown as VisaFormGeneratedErrors,
      );
      setProgress((currentProgress) =>
        currentProgress === completion.progress ? currentProgress : completion.progress,
      );

      const scopedApplicantId = applicantIdRef.current;
      if (!scopedApplicantId) return;

      updateApplicantReviewState(scopedApplicantId, {
        errors: normalizedErrors,
        formProgress: completion.progress,
        visaFormResolved: true,
        visaFormComplete: completion.isComplete,
      });
    },
    [updateApplicantReviewState],
  );

  const debouncedStatusUpdate = useMemo(
    () =>
      debounce(async () => {
        const nextStatus = latestStatusRef.current;

        if (
          isUpdatingRef.current ||
          !nextStatus ||
          nextStatus === "calculating" ||
          nextStatus === previousStatusRef.current
        ) {
          return;
        }

        isUpdatingRef.current = true;

        try {
          const scopedApplicantId = applicantIdRef.current;
          if (!scopedApplicantId) return;

          await updateApplicantStatus(scopedApplicantId, nextStatus);
          previousStatusRef.current = nextStatus;
        } catch (error) {
          console.error("Failed to update status:", error);
        } finally {
          isUpdatingRef.current = false;
        }
      }, 500),
    [updateApplicantStatus],
  );

  useEffect(() => {
    syncApplicantFormState(value as ApplicantErrors);
  }, [syncApplicantFormState, value]);

  useEffect(() => {
    const nextStatus = applicantState
      ? getApplicantComputedStatus(
          applicantState,
          getApplicantReviewState(applicantState._id),
        )
      : undefined;

    if (!nextStatus) return;

    latestStatusRef.current = nextStatus;

    if (nextStatus !== previousStatusRef.current) {
      debouncedStatusUpdate();
    }

    return () => {
      debouncedStatusUpdate.cancel();
    };
  }, [applicantState, getApplicantReviewState, debouncedStatusUpdate]);

  return (
    <AnimatedCircularProgressBar
      max={100}
      min={0}
      value={progress}
      gaugePrimaryColor={"var(--primary)"}
      gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
      className="text-primary h-11 w-11 text-sm"
    />
  );
};

interface DeclarationCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  name: string;
}

export const DeclarationCheckbox: React.FC<DeclarationCheckboxProps> = memo(
  ({ checked, onCheckedChange, name }) => {
    const { control, trigger, getValues, setValue, getFieldState } = useFormContext();
    const { showErrors } = React.useContext(VisaFormErrorVisibilityContext);

    const checkValidateOrNot = useCallback(async () => {
      await syncFieldProgressState({
        trigger,
        fieldName: name,
        label: "Accept Declaration",
        isRequiredField: true,
        getValues,
        getFieldState,
        setValue,
      });
    }, [getFieldState, getValues, name, setValue, trigger]);

    useEffect(() => {
      void checkValidateOrNot();
      return () => {
        removeFieldProgressState({ getValues, setValue, fieldName: name });
      };
    }, [checkValidateOrNot, checked, getValues, name, setValue]);

    return (
      <FormField
        control={control}
        name={name}
        defaultValue={checked ?? false}
        render={({ field: { onChange, value, ...args } }) => {
          const hasVisibleError = showErrors && !value;

          return (
            <div
              className={clsx("text-left", {
                "text-red-500": hasVisibleError,
              })}
            >
              <FormItem>
                <div className="items-top flex space-x-2">
                  <Checkbox
                    id={name}
                    {...args}
                    checked={!!value}
                    onCheckedChange={(checked) => {
                      const nextValue = !!checked;
                      onChange(nextValue);
                      setValue(name, nextValue, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                      onCheckedChange?.(nextValue);
                      void checkValidateOrNot();
                    }}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={name}
                      className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Accept Declaration <span className="text-red-500">*</span>
                    </label>
                    <p className="text-muted-foreground text-sm">
                      I hereby declare that the information provided by me in this
                      application is true and correct to the best of my knowledge
                      and belief.
                    </p>
                  </div>
                </div>
              </FormItem>
            </div>
          );
        }}
      />
    );
  },
);

DeclarationCheckbox.displayName = "DeclarationCheckbox";

export const DeclarationSkeleton = () => {
  return (
    <div className="items-top flex space-x-2">
      <Skeleton className="h-4 w-4" />
      <div className="grid grow gap-1.5 leading-none">
        <Skeleton className="h-4 w-2/4" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
};

interface ErrorTextProps {
  message: string;
}

export const ErrorText: React.FC<ErrorTextProps> = ({ message }): ReactNode => {
  return (
    <p className="font-roboto text-destructive text-[0.8rem] font-medium">
      {message}
    </p>
  );
};

export const VisaFormSkeleton = () => {
  return (
    <Card className="h-full overflow-hidden py-0">
      <CardHeader className="hidden bg-gray-100 py-2 md:block">
        <CardTitle>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="visa_card_body h-full px-0 md:pb-12">
        <ScrollArea className="h-full pb-6">
          <FormSkeleton />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const FormLabel = ({
  mandatory,
  label,
  invalid = false,
  customError = "",
}: {
  mandatory: boolean;
  label: string;
  invalid?: boolean;
  customError?: string;
}) => {
  return (
    <div className="flex min-h-0 items-end text-left">
      <Label
        className={cn(
          "text-[12px] leading-tight break-words whitespace-normal",
          invalid && "text-red-500",
        )}
      >
        {!!mandatory && <span className="text-red-500">*&nbsp;</span>}
        {label}
        {!!customError && ` (${customError})`}
      </Label>
    </div>
  );
};
