"use client";

import { InputMask } from "@react-input/mask";
import {
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";

import { Input } from "@workspace/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  addDays,
  format,
  isBefore,
  isValid,
  parse,
  startOfDay,
} from "date-fns";
import ArabicKeyboard from "../components/arabic-keyboard";

import React, {
  createContext,
  forwardRef,
  useImperativeHandle,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import AutoSelect from "@workspace/common-ui/components/auto-select";
import { NoDataCard } from "@workspace/common-ui/components/no-data-card";
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
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import clsx from "clsx";
import { CalendarIcon, RefreshCw } from "lucide-react";
import AnimatedCircularProgressBar from "../components/animated-circular-progress-bar";
import {
  ApplicantErrors,
  useApplicationState,
} from "../context/review-visa-context";
import { useReadyStatus } from "../hooks/use-ready-status";
import { getVisaFormCompletion } from "../lib/ready-status";

export interface FormFieldConfig {
  name: string;
  type: string;
  value?: any;
  label?: string;
  validations?: any;
  options?: any[];
  sub_group_elements?: any[][];
  sub_label?: string;
  group_elements?: any[];
  dependent_elements?: any[];
  has_arabic?: boolean;
  associated_field?: string;
  keyboard_type?: string;
  max_count?: number;
  sub_type?: string;
}

const VisaFormScrollContext = createContext<{
  scrollRef: React.RefObject<HTMLDivElement | null>;
} | null>(null);
const VisaFormErrorVisibilityContext = createContext<{
  showErrors: boolean;
}>({
  showErrors: false,
});

const getNonRequiredLabelError = (
  errorType?: string,
  message?: string,
): string => {
  if (!message) return "";
  if (errorType === "required") return "";
  return message;
};

const hasMandatoryFieldValue = (value: unknown): boolean => {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
};

const VisaFormContent = memo(() => {
  const {
    activeApplicantId,
    applicationId,
    setApplicationReadiness,
    updateApplicant,
  } = useApplicationState();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { data } = useSuspenseQuery(
    orpc.visa.getVisaFormForApplicant.queryOptions({
      input: {
        applicantId: activeApplicantId!,
        applicationId: applicationId!,
      },
    }),
  );

  const formData = data?.data?.visa_form;

  const { reset } = useFormContext();

  // Enhanced default value generation with proper regeneration support
  const generateDefaultValues = useCallback(
    (formData: FormFieldConfig[]): Record<string, any> => {
      const values: Record<string, any> = {};
      const formValues: Record<string, any> = {};

      const processField = (
        field: FormFieldConfig,
        parentName: string = "",
        isSubGroup: boolean = false,
      ): void => {
        const fieldName = isSubGroup
          ? `${parentName}.${field.name}`
          : `${parentName}-${field.name}`;

        // Store validation info for progress tracking
        if (
          field.validations?.mandatory &&
          field?.validations?.display === true
        ) {
          const hasValue = hasMandatoryFieldValue(field.value);
          formValues[fieldName] = {
            isValid: hasValue,
            label: field.label || field.name,
            isRequiredField: true,
            hasValue,
            hasError: false,
            validated: false,
          };
        }

        switch (field.type) {
          case "subGroup":
            if (
              field.sub_group_elements &&
              Array.isArray(field.sub_group_elements)
            ) {
              // ✅ FIXED: Only create the array structure, NOT individual field paths
              const arrayValues = field.sub_group_elements.map(
                (row: FormFieldConfig[]) => {
                  return row.reduce(
                    (acc, subField) => {
                      acc[subField.name] = subField.value || "";
                      return acc;
                    },
                    {} as Record<string, any>,
                  );
                },
              );

              console.log("arrayValues", arrayValues);

              values[fieldName] = arrayValues;
            }
            break;

          default:
            values[fieldName] = field.value || "";
            break;
        }

        // Process dependent elements
        if (
          field.dependent_elements &&
          Array.isArray(field.dependent_elements)
        ) {
          field.dependent_elements.forEach(
            (dependentField: FormFieldConfig) => {
              processField(dependentField, fieldName, isSubGroup);
            },
          );
        }
      };

      const processGroup = (group: FormFieldConfig): void => {
        if (group.group_elements && Array.isArray(group.group_elements)) {
          group.group_elements.forEach((element: FormFieldConfig) => {
            processField(element, group.name, false);
          });
        }
      };

      // Process all groups
      formData.forEach(processGroup);

      // Add formValues object for progress tracking
      values.formValues = formValues;

      return values;
    },
    [],
  );

  const lastResetKeyRef = useRef<string>("");

  // Enhanced reset effect with proper regeneration
  useEffect(() => {
    if (formData && formData.length > 0) {
      const resetKey = `${activeApplicantId ?? ""}:${JSON.stringify(formData)}`;
      if (lastResetKeyRef.current === resetKey) return;
      lastResetKeyRef.current = resetKey;

      console.log("🔄 Resetting form with new data");

      setApplicationReadiness((prev) => ({ ...prev, hasVisaForm: true }));

      const defaultValues = generateDefaultValues(formData);

      reset(defaultValues, {
        keepDirty: false,
        keepTouched: false,
        keepErrors: false,
      });

      updateApplicant(activeApplicantId!, {
        errors: defaultValues.formValues || {},
        formProgress: getVisaFormCompletion(defaultValues.formValues || {})
          .progress,
        hasLoadedVisaForm: true,
      });

      console.log("✅ Form reset completed", defaultValues);
    }
  }, [
    activeApplicantId,
    formData,
    generateDefaultValues,
    reset,
    setApplicationReadiness,
    updateApplicant,
  ]);

  return (
    <>
      <Card className="h-full gap-0 overflow-hidden py-0">
        <CardHeader className="hidden bg-gray-100 py-2 md:block">
          <CardTitle>
            <div className="flex items-center justify-between gap-3">
              <div className="text-md">Visa Form</div>
              {formData ? <FormProgress /> : <div className="size-10" />}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="visa_card_body h-full px-0 md:pb-12">
          <VisaFormScrollContext.Provider value={{ scrollRef }}>
            <ScrollArea
              viewportRef={scrollRef as React.RefObject<HTMLDivElement>}
              className="h-full pb-6"
            >
              {!formData ? (
                <NoDataCard title="No Visa Form Available" />
              ) : (
                formData?.map((x, i: number) => {
                  const name: string = x?.name;
                  return (
                    <div className="p-4" key={x?.name || i}>
                      <div className="mb-2 text-xl font-bold text-black">
                        {x?.label}
                      </div>
                      <div className="mb-2 text-[0.8rem] text-slate-400">
                        {x?.sub_label}
                      </div>
                      <hr className="w-1/2" />
                      <div className="grid grid-cols-1 gap-6 p-2 sm:grid-cols-2 lg:grid-cols-3">
                        {x?.group_elements?.map((a, i: number) => (
                          <FormRenderer
                            field={a}
                            arrayIndex={i}
                            parentName={name}
                            key={`${activeApplicantId}.${a?.name}.${i}`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </ScrollArea>
          </VisaFormScrollContext.Provider>
        </CardContent>
      </Card>
    </>
  );
});

VisaFormContent.displayName = "VisaFormContent";

const VisaForm = memo(() => {
  const {
    reviewVisaFormRef,
    activeApplicantId,
    setApplicantFormErrorVisible,
    getApplicantFormErrorVisible,
  } = useApplicationState();
  const methods = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {},
  });

  const { trigger, getValues, reset } = methods;
  const showErrors = getApplicantFormErrorVisible(activeApplicantId || "");

  useImperativeHandle(
    reviewVisaFormRef,
    () => ({
      validate: async () => {
        setApplicantFormErrorVisible(true, activeApplicantId || "");
        return trigger(undefined, { shouldFocus: true });
      },
      getValues,
      reset: (values?: Record<string, any>) => reset(values || {}),
    }),
    [
      trigger,
      getValues,
      reset,
      setApplicantFormErrorVisible,
      activeApplicantId,
    ],
  );

  return (
    <VisaFormErrorVisibilityContext.Provider value={{ showErrors }}>
      <Form {...methods}>
        <form className="h-full">
          <VisaFormContent />
        </form>
      </Form>
    </VisaFormErrorVisibilityContext.Provider>
  );
});

VisaForm.displayName = "VisaForm";

export default VisaForm;

interface TextFieldProps {
  field: VisaFormField;
  parentName: string;
  isPartOfSubGroup?: boolean;
}

export const TextField = memo(
  ({ field, parentName, isPartOfSubGroup }: TextFieldProps) => {
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

    const { control, trigger, setValue, getValues, getFieldState } =
      useFormContext();

    const {
      activeApplicantId,
      updateApplicant,
      applicationDetails,
      setApplicationDetails,
    } = useApplicationState();

    const defaultValue = value ? value : "";

    const isRequiredField = !!validations?.mandatory;

    const fieldName = isPartOfSubGroup
      ? `${parentName}.${name}`
      : `${parentName}-${name}`;

    const associateFieldName = isPartOfSubGroup
      ? `${parentName}.${associated_field}`
      : `${parentName}-${associated_field}`;

    const arabicValue = useWatch({
      name: fieldName,
      control: control,
      defaultValue,
    });

    const checkValidateOrNot = useCallback(async () => {
      await trigger(fieldName);
      const isRequiredField = !!validations?.mandatory;
      const currentValue = getValues(fieldName);
      const hasValue = hasMandatoryFieldValue(currentValue);
      const state = getFieldState(fieldName);
      const hasError =
        !!state.error && (showErrors || state.isDirty || state.isTouched);
      const obj = {
        isValid: hasValue && !hasError,
        label,
        isRequiredField,
        name: fieldName,
        hasValue,
        hasError,
        validated: true,
      };
      const formData = getValues("formValues");
      setValue("formValues", { ...formData, [fieldName]: obj });
    }, [
      trigger,
      fieldName,
      validations?.mandatory,
      label,
      name,
      getValues,
      getFieldState,
      setValue,
      showErrors,
    ]);

    const debouncedCheckValidateOrNot = useMemo(
      () => debounce(() => void checkValidateOrNot(), 120),
      [checkValidateOrNot],
    );
    const lastAppliedServerValueRef = useRef<string>("");

    // const syncApplicantName = useCallback(
    //   (fieldName: string, fieldValue: string) => {
    //     if (!activeApplicantId) return;
    //     if (fieldName !== "first_name" && fieldName !== "last_name") return;

    //     const applicant = applicationDetails?.applicants?.find(
    //       (app) => app._id === activeApplicantId,
    //     );
    //     if (!applicant) return;

    //     const targetKey =
    //       fieldName === "first_name"
    //         ? "applicant_first_name"
    //         : "applicant_last_name";
    //     const normalizedValue = (fieldValue || "").toUpperCase();

    //     // if ((applicant[targetKey] || "") === normalizedValue) return;

    //     const updatedApplicant = {
    //       ...applicant,
    //       // [targetKey]: normalizedValue,
    //     };

    //     const name = getApplicantName(updatedApplicant)
    //     console.log("getApplicantNamename", { name, updatedApplicant })

    //     setApplicationDetails((prev) => {
    //       if (!prev) return prev;
    //       return {
    //         ...prev,
    //         applicants: prev.applicants.map((app) =>
    //           app._id === activeApplicantId
    //             ? { ...app, [targetKey]: normalizedValue }
    //             : app,
    //         ),
    //       };
    //     });

    //     setTimeout(() => updateApplicant(activeApplicantId, {
    //       name: name,
    //     }), 0)
    //   },
    //   [
    //     activeApplicantId,
    //     applicationDetails?.applicants,
    //     setApplicationDetails,
    //     updateApplicant,
    //   ],
    // );

    const syncApplicantName = useCallback(
      (fieldName: string, fieldValue: string) => {
        if (!activeApplicantId || parentName !== "personal_details") return;
        if (fieldName !== "first_name" && fieldName !== "last_name") return;

        const isFirst = fieldName === "first_name";
        const targetKey = isFirst
          ? "applicant_first_name"
          : "applicant_last_name";

        const normalizedValue = (fieldValue || "").toUpperCase();

        setApplicationDetails((prev) => {
          if (!prev) return prev;

          let newName = "";
          const updatedApplicants = prev.applicants.map((app) => {
            if (app._id === activeApplicantId) {
              const updatedApp = {
                ...app,
                [targetKey]: normalizedValue,
              };
              newName = getApplicantName(updatedApp);
              return updatedApp;
            }
            return app;
          });
          // console.log("getApplicantNamename", { newName, updatedApplicants })

          if (newName) {
            setTimeout(
              () => updateApplicant(activeApplicantId, { name: newName }),
              0,
            );
          }

          return { ...prev, applicants: updatedApplicants };
        });
      },
      [
        activeApplicantId,
        applicationDetails,
        setApplicationDetails,
        updateApplicant,
        isPartOfSubGroup,
      ],
    );

    const { mutate: mutateEngToArb, isPending } = useMutation(
      orpc.visa.englishToArabicTranslation.mutationOptions({
        onSuccess: (data) => {
          const convertedText = data?.data?.translated;
          console.log("converted text >>", convertedText);

          setValue(associateFieldName, convertedText, {
            // shouldDirty: true,
            // shouldTouch: true,
            // shouldValidate: true,
          });
        },
      }),
    );

    const getValidationRules = useCallback(() => {
      return {
        required: isRequiredField && "Required",
        validate: (value: string) => {
          if (!value) return true; // Required handles empty

          // 1. Email format
          if (
            validations?.input_type === "email" &&
            !emailPattern.test(value)
          ) {
            return "Must be a valid email";
          }

          // 2. Digits only
          if (
            (validations?.isDigit || validations?.input_type === "numeric") &&
            !/^\d+$/.test(value)
          ) {
            return "Must contain only numbers";
          }

          // 3. Alphabets only
          if (validations?.isTextOnly && !/^[A-Za-z\s]+$/.test(value)) {
            return "Must contain only alphabetic characters";
          }

          // 4. No special characters
          if (
            validations?.special_char === false &&
            validations?.input_type !== "email" &&
            validations?.keyboard_type !== "arabic" &&
            !/^[a-zA-Z0-9\s\u0600-\u06FF]+$/.test(value)
          ) {
            return "Special characters are not allowed!";
          }

          // 5. Min length
          if (
            validations?.min_length &&
            value?.length < validations?.min_length
          ) {
            const unit =
              validations?.isDigit || validations?.input_type === "numeric"
                ? "digits"
                : "characters";
            return `Must be at least ${validations.min_length} ${unit} long`;
          }

          // 6. Max length
          if (
            validations?.max_length &&
            value?.length > validations?.max_length
          ) {
            const unit =
              validations?.isDigit || validations?.input_type === "numeric"
                ? "digits"
                : "characters";
            return `Cannot exceed ${validations?.max_length} ${unit}`;
          }

          return true;
        },
      };
    }, [validations]);

    const validationRules = getValidationRules();

    useEffect(() => {
      const nextValue = defaultValue || "";
      const serverValueKey = `${fieldName}::${nextValue}`;
      if (lastAppliedServerValueRef.current === serverValueKey) return;
      lastAppliedServerValueRef.current = serverValueKey;

      const currentValue = getValues(fieldName) || "";
      if (nextValue !== currentValue) {
        setValue(fieldName, nextValue, {
          shouldValidate: true,
          shouldDirty: false,
          shouldTouch: false,
        });

        // Keep applicant card name in sync when OCR/server refresh updates first/last name.
        if (
          parentName === "personal_details" &&
          (name === "first_name" || name === "last_name")
        ) {
          syncApplicantName(name, nextValue);
        }
      }

      if (has_arabic && defaultValue) {
        const associateFieldValue = getValues(associateFieldName);
        if (associateFieldValue) return;
        mutateEngToArb({ text: value });
      }
    }, [
      defaultValue,
      fieldName,
      setValue,
      getValues,
      has_arabic,
      associateFieldName,
      mutateEngToArb,
      value,
      name,
      parentName,
      syncApplicantName,
    ]);

    useEffect(() => {
      void checkValidateOrNot();
    }, [checkValidateOrNot]);

    useEffect(() => {
      return () => {
        const formCheckValues = { ...(getValues("formValues") ?? {}) };
        delete formCheckValues[fieldName];
        setValue("formValues", formCheckValues);
      };
    }, [fieldName, getValues, setValue]);

    useEffect(() => {
      if (has_arabic || keyboard_type === "arabic") {
        void checkValidateOrNot();
      }
    }, [arabicValue, has_arabic, keyboard_type, checkValidateOrNot]);

    useEffect(() => {
      return () => {
        debouncedCheckValidateOrNot.cancel();
      };
    }, [debouncedCheckValidateOrNot]);

    const handleArabicInputChange = (input: string) => {
      console.log("input >>", input, " associateFieldName >>", fieldName);
      let normalizedInput = input;
      if (parentName === "personal_details") {
        normalizedInput = (input || "").toUpperCase();
      }
      setValue(fieldName, normalizedInput, {
        shouldValidate: true,
      });
      if (parentName === "personal_details") {
        syncApplicantName(name, normalizedInput);
      }
    };

    return (
      <PopoverWrapper
        keyboardType={keyboard_type as string}
        name={associateFieldName}
        isRequiredField={isRequiredField}
        onBlur={handleArabicInputChange}
        label={label}
        value={arabicValue}
        setIsPopoverOpen={setIsPopoverOpen}
        isPopoverOpen={isPopoverOpen}
      >
        <FormField
          control={control}
          name={fieldName}
          defaultValue={defaultValue || ""}
          rules={{
            onChange: () => debouncedCheckValidateOrNot(),
            ...validationRules,
          }}
          render={({
            field: { onChange, value, onBlur, ...fieldProps },
            fieldState: { invalid, error, isDirty, isTouched },
          }) => {
            const hasVisibleError =
              invalid && (showErrors || isDirty || isTouched);
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
                      value={value}
                      {...fieldProps}
                      onBlur={(e) => {
                        let upperCaseValue = e.target.value;
                        upperCaseValue = upperCaseValue?.trim()?.toUpperCase();
                        setValue(fieldName, upperCaseValue, {
                          shouldValidate: true,
                        });
                        if (parentName === "personal_details") {
                          syncApplicantName(name, upperCaseValue);
                        }
                        onBlur();
                      }}
                      onChange={(e) => {
                        onChange(e);
                      }}
                      onClick={(e) => {
                        if (keyboard_type === "arabic") {
                          e.preventDefault();
                        }
                      }}
                      onFocus={(e) => {
                        if (keyboard_type === "arabic") {
                          setIsPopoverOpen(true);
                          e.target.blur();
                        }
                      }}
                      endIcon={
                        has_arabic && (
                          <RefreshCw
                            onClick={() => mutateEngToArb({ text: value })}
                            className={clsx(
                              "h-4 w-4 cursor-pointer opacity-50",
                              {
                                "animate-spin": isPending,
                              },
                            )}
                          />
                        )
                      }
                      className={cn(
                        "uppercase placeholder:normal-case",
                        hasVisibleError ? "bg-red-500/20" : "",
                      )}
                    />
                  </FormControl>
                  {/* Inline error text intentionally hidden */}
                  {/* <div className="min-h-5">
                  </div> */}
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

const PopoverWrapper: React.FC<PopoverWrapperProps> = ({
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
  const [inputValue, setInputValue] = useState<string>(value || "");

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleOnClose = (open: boolean) => {
    setIsPopoverOpen(open);
    onBlur?.(inputValue);
  };

  if (keyboardType === "arabic") {
    return (
      <Popover onOpenChange={handleOnClose} open={isPopoverOpen}>
        <PopoverTrigger>{children}</PopoverTrigger>
        <PopoverContent className="min-w-[415px]">
          <ArabicKeyboard
            setArabicInput={(value) => {
              const NewValue = value?.trim();
              setInput?.(inputValue);
              setInputValue(NewValue);
            }}
            setPopover={handleOnClose}
            input={value}
            label={label}
            isRequiredField={isRequiredField}
            name={name}
          />
        </PopoverContent>
      </Popover>
    );
  }
  return <>{children}</>;
};

const DropDownField: React.FC<FieldRenderProps> = memo(
  ({ field, parentName, isPartOfSubGroup }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { showErrors } = React.useContext(VisaFormErrorVisibilityContext);
    const { control, trigger, getValues, setValue, getFieldState } =
      useFormContext(); // retrieve all hook methods
    const { activeApplicantId } = useApplicationState();
    const scrollContext = React.useContext(VisaFormScrollContext);
    const scrollRef = scrollContext?.scrollRef;

    const {
      name,
      label,
      validations,
      value: defaultValue,
      options,
      dependent_elements = [],
    } = field;

    const isRequiredField = !!validations?.mandatory;
    const fieldName = isPartOfSubGroup
      ? `${parentName}.${name}`
      : `${parentName}-${name}`;

    const renderOpt = options?.map((x: string) => ({
      label: x,
      value: x,
    }));

    const dependatValue = useWatch({
      name: fieldName,
      control,
      defaultValue: defaultValue ?? "",
    });

    const dependantArr: VisaFormField[] = useMemo(() => {
      return dependent_elements.filter(
        (a) => a?.dependent_value === dependatValue,
      );
    }, [dependatValue, dependent_elements]);

    const checkValidateOrNot = async () => {
      await trigger(fieldName);
      const isRequiredField = !!validations?.mandatory;
      const currentValue = getValues(fieldName);
      const hasValue = hasMandatoryFieldValue(currentValue);
      const state = getFieldState(fieldName);
      const hasError = !!state.error && showErrors;
      const obj = {
        isValid: hasValue && !hasError,
        label,
        isRequiredField,
        name: fieldName,
        hasValue,
        hasError,
        validated: true,
      };
      const formData = getValues("formValues");
      setValue("formValues", { ...formData, [fieldName]: obj });
    };

    const renderCards = () => {
      // console.log("dependantArr renders here >>", dependantArr);
      return dependantArr?.map((a, i) => (
        <FormRenderer
          isPartOfSubGroup={false}
          field={a}
          arrayIndex={i}
          parentName={fieldName}
          key={`${activeApplicantId}.${fieldName}.${i}`}
        />
      ));
    };

    useEffect(() => {
      setValue(fieldName, defaultValue || "", {
        shouldValidate: true,
      });

      return () => {
        setValue(fieldName, "");
      };
    }, [defaultValue]);

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
    }, []);

    useEffect(() => {
      checkValidateOrNot();
      return () => {
        const formCheckValues = { ...(getValues("formValues") ?? {}) };
        delete formCheckValues[fieldName];
        setValue("formValues", formCheckValues);
      };
    }, [field]);

    useEffect(() => {
      checkValidateOrNot();
    }, [showErrors]);

    return (
      <>
        <FormField
          control={control}
          name={fieldName}
          rules={{
            required: isRequiredField && "Required",
            minLength: validations?.min_length,
            onChange: () => {
              checkValidateOrNot();
            },
          }}
          //
          defaultValue={defaultValue ? defaultValue : ""}
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
                    options={renderOpt?.length ? renderOpt : []}
                    isDisabled={!!validations?.read_only}
                    className={
                      !!hasVisibleError
                        ? "[&>.text-popover-foreground]:bg-white [&>div]:bg-red-500/20"
                        : ""
                    }
                    menuIsOpen={menuOpen}
                    onMenuOpen={() => setMenuOpen(true)}
                    onMenuClose={() => setMenuOpen(false)}
                    menuPosition="fixed"
                    // menuPosition="absolute"
                    menuPlacement="auto"
                    // menuShouldScrollIntoView
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : null
                    }
                    closeMenuOnScroll={true}
                    // menuShouldBlockScroll
                    // menuShouldScrollIntoView
                    placeholder="Select an option"
                    value={value ? { label: value, value: value } : null}
                    // @ts-expect-error - TS doesn't know about the components prop
                    onChange={(
                      option: { label: string; value: string } | null,
                    ) => {
                      const selectedValue = option?.value ?? "";
                      onChange(selectedValue);
                      setValue(fieldName, selectedValue, {
                        // shouldDirty: true,
                        // shouldTouch: true,
                        // shouldValidate: true,
                      });
                      checkValidateOrNot();
                      if (isPartOfSubGroup) {
                        trigger(fieldName);
                      }
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
                {/* Inline error text intentionally hidden */}
                {/* <div className="min-h-5">
                  </div> */}
              </FormItem>
            );
          }}
        />
        {renderCards()}
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
    // Generate stable key for proper re-rendering
    const fieldKey = useMemo(() => {
      if (isPartOfSubGroup && arrayIndex !== undefined) {
        return `${parentName}.${arrayIndex}.${field.name}`;
      } else if (isPartOfSubGroup) {
        return `${parentName}.${field.name}`;
      } else {
        return `${parentName}-${field.name}`;
      }
    }, [field.name, parentName, isPartOfSubGroup, arrayIndex]);

    const fieldType =
      field?.validations?.display === false ? "hidden" : field?.type;

    const renderField = useMemo(() => {
      const commonProps = {
        field,
        parentName,
        isPartOfSubGroup,
        arrayIndex, // ✅ Pass arrayIndex to all field components
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
    }, [field, fieldType, parentName, isPartOfSubGroup, arrayIndex]);

    return <React.Fragment key={fieldKey}>{renderField}</React.Fragment>;
  },
);

FormRenderer.displayName = "FormRenderer";

interface SubGroupProps {
  field: VisaFormField;
  children?: React.ReactNode;
  parentName?: string;
  isPartOfSubGroup?: boolean;
}

interface FieldRenderProps {
  field: VisaFormField;
  parentName?: string;
  isPartOfSubGroup?: boolean;
}

const SubGroup: React.FC<SubGroupProps> = ({ field, parentName }) => {
  const { name, label, sub_group_elements, max_count = 0, sub_type } = field;
  const { control, setValue } = useFormContext();
  const { activeApplicantId } = useApplicationState();

  const fieldName: string = `${parentName}-${name}`;

  const { fields, append, remove } = useFieldArray({
    name: fieldName,
    control,
  });

  // Initialize with proper default values - ENHANCED
  useEffect(() => {
    if (sub_group_elements && sub_group_elements.length > 0) {
      console.log(
        "🔄 Initializing SubGroup:",
        fieldName,
        "with data:",
        sub_group_elements,
      );

      const initialArray = sub_group_elements.map((row) =>
        row.reduce(
          (acc, subField) => ({
            ...acc,
            [subField.name]: subField.value || "",
          }),
          {},
        ),
      );

      console.log("📦 SubGroup initial values:", initialArray);
      setValue(fieldName, initialArray);
    }
  }, [sub_group_elements, fieldName, setValue]);

  const handleAddMore = useCallback(() => {
    if (sub_group_elements && sub_group_elements[0]) {
      const newRow = sub_group_elements[0].reduce(
        (acc, subField) => ({
          ...acc,
          [subField.name]: subField.value || "",
        }),
        {},
      );

      append(newRow);
    }
  }, [sub_group_elements, append]);

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
            {sub_group_elements &&
              sub_group_elements[0]?.map((subField, subIndex) => (
                <FormRenderer
                  field={subField}
                  key={`${activeApplicantId}.${fieldItem.id}.${subField.name}`}
                  parentName={`${fieldName}.${index}`} // ✅ This creates: "group-fieldName.index"
                  isPartOfSubGroup={true}
                  arrayIndex={index} // ✅ CRITICAL FIX: Pass arrayIndex instead of ind
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
};

SubGroup.displayName = "SubGroup";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const HiddenField: React.FC<FieldRenderProps> = memo(
  ({ field, parentName, isPartOfSubGroup }) => {
    const { register } = useFormContext();
    const { name, value } = field;

    const fieldName = isPartOfSubGroup
      ? `${parentName}.${name}`
      : `${parentName}-${name}`;

    return (
      <input
        type="hidden"
        {...register(fieldName, {
          value: value || "",
          //  : true,
        })}
      />
    );
  },
);

HiddenField.displayName = "HiddenField";

const DATE_FORMAT = "dd-MM-yyyy";

const DatePickerField: React.FC<FieldRenderProps> = memo(
  ({ field, parentName, isPartOfSubGroup }) => {
    const { showErrors } = React.useContext(VisaFormErrorVisibilityContext);
    const [selectedDate, setSelectedDate] = useState<string | Date | null>(
      null,
    );

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { control, setValue, trigger, getValues, getFieldState } =
      useFormContext(); // retrieve all hook methods
    const { name, label, validations, value } = field;

    const fieldName: string = isPartOfSubGroup
      ? `${parentName}.${name}`
      : `${parentName}-${name}`;

    const checkMinMaxDate: WhenType = validations?.when || "before"; // Providing a default value of 'before' if validations?.when is undefined
    const isRequiredField = !!validations?.mandatory;

    const calculateDateRange = (checkMinMaxDate: WhenType) => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();

      let before: Date | undefined;
      let after: Date | undefined;

      if (checkMinMaxDate === "after") {
        before = new Date(
          currentYear,
          currentDate.getMonth(),
          currentDate.getDate(),
        );
        after = new Date(
          currentYear + 100,
          currentDate.getMonth(),
          currentDate.getDate(),
        );
      } else if (checkMinMaxDate === "before") {
        before = new Date(
          currentYear - 100,
          currentDate.getMonth(),
          currentDate.getDate(),
        );
        after = new Date(
          currentYear,
          currentDate.getMonth(),
          currentDate.getDate(),
        );
      } else {
        // Default range: 100 years centered around the current date
        before = new Date(
          currentYear - 50,
          currentDate.getMonth(),
          currentDate.getDate(),
        );
        after = new Date(
          currentYear + 50,
          currentDate.getMonth(),
          currentDate.getDate(),
        );
      }

      // console.log("Field " + name + ": ", { before, after });

      return { before, after };
    };

    const getDateValidationRules = useCallback(() => {
      return {
        required: isRequiredField && "Required",
        validate: (value: string) => {
          if (!isRequiredField && !value) return true;

          const normalizedValue = (value || "").trim();
          const exactDatePattern = /^\d{2}-\d{2}-\d{4}$/;
          if (!exactDatePattern.test(normalizedValue)) {
            return `Please enter a valid date in ${DATE_FORMAT} format`;
          }

          const parsedDate = parse(normalizedValue, DATE_FORMAT, new Date());
          if (!isValid(parsedDate)) {
            return `Please enter a valid date in ${DATE_FORMAT} format`;
          }

          // Strict round-trip check so partial/ambiguous inputs never pass.
          if (format(parsedDate, DATE_FORMAT) !== normalizedValue) {
            return `Please enter a valid date in ${DATE_FORMAT} format`;
          }

          const selected = startOfDay(parsedDate);

          // 'after' field comparison
          if (validations?.after) {
            const dependantFieldName = isPartOfSubGroup
              ? `${parentName}.${validations.after}`
              : `${parentName}-${validations.after}`;

            const dependantValue = getValues(dependantFieldName);
            const dependantDate = parse(
              dependantValue,
              DATE_FORMAT,
              new Date(),
            );

            if (isValid(dependantDate)) {
              const dependant = startOfDay(dependantDate);

              // Allow same-day or after
              if (isBefore(selected, dependant)) {
                return "The selected date must be the same as or after the start date.";
              }
            }
          }

          // checkMinMaxDate: past/future
          if (checkMinMaxDate === "before") {
            const yesterday = startOfDay(addDays(new Date(), -1));
            if (!isBefore(selected, yesterday)) {
              return "The selected date must be a past date.";
            }
          }

          if (checkMinMaxDate === "after") {
            const tomorrow = startOfDay(addDays(new Date(), 1));
            if (isBefore(selected, tomorrow)) {
              return "The selected date must be a future date.";
            }
          }

          // Expiry date check
          if (name === "date_of_expiry") {
            const minDays = validations?.min_days || 180;
            const minValidDate = startOfDay(addDays(new Date(), minDays - 1));
            if (isBefore(selected, minValidDate)) {
              return `The date of expiry should be at least ${minDays} days after today's date.`;
            }
          }

          return true;
        },
      };
    }, [
      validations,
      checkMinMaxDate,
      isRequiredField,
      getValues,
      parentName,
      isPartOfSubGroup,
      label,
      name,
    ]);

    const validationRules = getDateValidationRules();

    const getParsedDate = (value: string) =>
      new Date(value.split("-").reverse().join("-")).toISOString();

    const checkValidateOrNot = async () => {
      await trigger(fieldName);
      const isRequiredField = !!validations?.mandatory;
      const currentValue = getValues(fieldName);
      const hasValue = hasMandatoryFieldValue(currentValue);
      const state = getFieldState(fieldName);
      const hasError = !!state.error && showErrors;
      const obj = {
        isValid: hasValue && !hasError,
        label,
        isRequiredField,
        name: fieldName,
        hasValue,
        hasError,
        validated: true,
      };
      const formData = getValues("formValues");
      setValue("formValues", { ...formData, [fieldName]: obj });
    };

    useEffect(() => {
      if (!value) {
        setSelectedDate("");
        setValue(fieldName, "", {
          shouldValidate: true,
        });
        return;
      }
      const parsedDate = getParsedDate(value);
      setSelectedDate(parsedDate);
      setValue(fieldName, value || "", {
        shouldValidate: true,
      });

      return () => {
        setValue(fieldName, "");
      };
    }, [value]);

    useEffect(() => {
      checkValidateOrNot();
      return () => {
        const formCheckValues = { ...(getValues("formValues") ?? {}) };
        delete formCheckValues[fieldName];
        setValue("formValues", formCheckValues);
      };
    }, [field]);

    useEffect(() => {
      checkValidateOrNot();
    }, [showErrors]);

    return (
      <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <FormField
            rules={{
              onChange: () => checkValidateOrNot(),
              ...validationRules,
            }}
            control={control}
            name={fieldName}
            defaultValue={value ?? ""}
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
                      // replacement={"*"}
                      invalid={hasVisibleError}
                      ref={ref}
                      label={label}
                      area-invalid={`${hasVisibleError}`}
                      setIsOpen={setIsOpen}
                      disabled={validations?.read_only}
                      // @ts-expect-error - TS doesn't know about the value prop
                      onChange={(e) => {
                        onChange(e);
                        const inputValue = e.target.value;
                        const parsedDate = parse(
                          inputValue,
                          "dd-MM-yyyy",
                          new Date(),
                        );

                        if (isValid(parsedDate)) {
                          setSelectedDate(parsedDate as unknown as string);
                        }
                      }}
                      value={value}
                      className={hasVisibleError ? "bg-red-500/20" : ""}
                      {...args}
                    />
                  </FormControl>
                  {/* Inline error text intentionally hidden */}
                  {/* <div className="min-h-5">
                  </div> */}
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
                defaultMonth={
                  selectedDate ? new Date(selectedDate as string) : new Date()
                }
                captionLayout="dropdown"
                startMonth={calculateDateRange(checkMinMaxDate)?.before}
                endMonth={calculateDateRange(checkMinMaxDate)?.after}
                disabled={calculateDateRange(checkMinMaxDate)}
                // {...calculateDateRange(checkMinMaxDate)}
                mode="single"
                selected={new Date(selectedDate as unknown as Date)}
                onSelect={(date: unknown) => {
                  if (!date) return;
                  const val = format(date as Date, "dd-MM-yyyy");

                  setValue(fieldName, val, {
                    // shouldDirty: true,
                    // shouldTouch: true,
                    // shouldValidate: true,
                  });
                  checkValidateOrNot();
                  setSelectedDate(date as unknown as Date);
                  setIsOpen(false);
                }}
                className="rounded-md border"
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

DatePickerField.displayName = "DatePickerField";

interface CustomInputProps {
  label: string;
  invalid?: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DateInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, invalid, setIsOpen, ...args }, forwardedRef) => {
    // console.log("date input >>", invalid);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow number input handling
      // if (e.key !== 'Enter' && !/[0-9]/.test(e.key)) {
      //   e.preventDefault();
      // }

      // Handle Enter key
      if (e.key === "Enter") {
        e.preventDefault();
        // Find the closest form element and submit it
        const form = (e.target as HTMLElement).closest("form");
        if (form) {
          const submitEvent = new Event("submit", {
            cancelable: true,
            bubbles: true,
          });
          form.dispatchEvent(submitEvent);
        }
      }
    };

    return (
      <div className="relative">
        <Input
          ref={forwardedRef}
          placeholder={label}
          className={invalid ? "bg-red-500/20" : ""}
          {...args}
          onKeyUp={(e) => {
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
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
  const skeletons = useMemo(() => new Array(4).fill(0), []);

  return (
    <>
      {skeletons.map((_, index) => (
        <div key={index} className="mb-3">
          <div className="px-2 py-2">
            <Skeleton className="mb-2 h-5 w-1/2" />
            <Skeleton className="mb-2 h-5 w-1/4" />
          </div>
          <Separator className="mx-2 w-[50%]" />
          <div className="grid grid-cols-3 gap-3 p-2 px-4">
            {Array.from({ length: 5 }).map((__, idx) => (
              <Skeleton key={idx} className="mb-2 h-8 w-full" />
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
  const [previousStatus, setPreviousStatus] = useState<FormStatus>();
  const { getActiveApplicant, activeApplicantId, updateApplicant } =
    useApplicationState();
  const applicantIdRef = useRef(activeApplicantId);

  const { updateApplicantStatus } = useReadyStatus();

  const applicantState = getActiveApplicant();
  const value = useWatch({
    name: "formValues",
    control: form.control,
    defaultValue: form.getValues("formValues") || {},
  });

  console.log("formErrors >>", value);

  const latestStatusRef = useRef<string>("");
  const isUpdatingRef = useRef(false);

  const syncApplicantFormState = useCallback(
    (nextValue: ApplicantErrors) => {
      const normalizedErrors = Object.entries(nextValue || {}).reduce(
        (acc, [key, field]) => {
          if (field?.isRequiredField) {
            acc[key] = field;
          }
          return acc;
        },
        {} as ApplicantErrors,
      );

      const { progress } = getVisaFormCompletion(normalizedErrors);
      setProgress(progress);

      const scopedApplicantId = applicantIdRef.current;
      if (!scopedApplicantId) {
        return;
      }

      updateApplicant(scopedApplicantId, {
        errors: normalizedErrors,
        formProgress: progress,
        hasLoadedVisaForm: true,
      });
    },
    [updateApplicant],
  );

  const debouncedStatusUpdate = useMemo(
    () =>
      debounce(async () => {
        if (
          isUpdatingRef.current ||
          latestStatusRef.current === previousStatus ||
          latestStatusRef.current === "calculating"
        ) {
          return;
        }

        const newStatus = latestStatusRef.current as FormStatus;
        if (!newStatus) return;

        isUpdatingRef.current = true;

        try {
          const scopedApplicantId = applicantIdRef.current;
          if (!scopedApplicantId) {
            return;
          }

          await updateApplicantStatus(scopedApplicantId, newStatus);
          setPreviousStatus(newStatus);
        } catch (error) {
          console.error("Failed to update status:", error);
        } finally {
          isUpdatingRef.current = false;
        }
      }, 500),
    [previousStatus, updateApplicantStatus],
  );

  useEffect(() => {
    syncApplicantFormState(value as ApplicantErrors);
  }, [syncApplicantFormState, value]);

  useEffect(() => {
    const nextStatus = applicantState?.status;
    if (!nextStatus) {
      return;
    }

    latestStatusRef.current = nextStatus;

    if (nextStatus !== previousStatus) {
      debouncedStatusUpdate();
    }

    return () => {
      debouncedStatusUpdate.cancel();
    };
  }, [applicantState?.status, previousStatus, debouncedStatusUpdate]);

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
    const { control, trigger, getValues, setValue, getFieldState } =
      useFormContext();
    const { showErrors } = React.useContext(VisaFormErrorVisibilityContext);

    const checkValidateOrNot = async () => {
      await trigger(name);
      const currentValue = getValues(name);
      const hasValue = hasMandatoryFieldValue(currentValue);
      const state = getFieldState(name);
      const hasError = !!state.error && showErrors;
      const obj = {
        isValid: hasValue && !hasError,
        label: "Accept Declaration",
        isRequiredField: true,
        hasValue,
        hasError,
        validated: true,
      };
      const formData = getValues("formValues");
      setValue("formValues", { ...formData, [name]: obj });
    };

    useEffect(() => {
      checkValidateOrNot();
      return () => {
        const formCheckValues = { ...(getValues("formValues") ?? {}) };
        delete formCheckValues[name];
        setValue("formValues", formCheckValues);
      };
    }, [checked]);

    useEffect(() => {
      checkValidateOrNot();
    }, [showErrors]);

    return (
      <FormField
        control={control}
        name={name}
        defaultValue={checked || false} // Ensure default value is set
        rules={{
          required: "You must accept the declaration to proceed", // Simplified validation
          onChange: () => checkValidateOrNot(),
        }}
        render={({
          field: { onChange, value, ...args },
          fieldState: { invalid },
        }) => (
          <div
            className={clsx("text-left", {
              "text-red-500": showErrors && invalid,
            })}
          >
            <FormItem>
              <div className="items-top flex space-x-2">
                <Checkbox
                  id={name}
                  {...args}
                  checked={value} // Controlled value
                  onCheckedChange={(checked) => {
                    onChange(checked as boolean);
                    onCheckedChange?.(checked as boolean);
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
        )}
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
    <p className={"font-roboto text-destructive text-[0.8rem] font-medium"}>
      {message}
    </p>
  );
};

export const VisaFormSkeleton = () => {
  return (
    <>
      <Card className="h-full overflow-hidden py-0">
        <CardHeader className="hidden bg-gray-100 py-2 md:block">
          <CardTitle>
            <div className="flex items-center justify-between gap-3">
              {/* <div className="text-md">Visa Form</div> */}
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
    </>
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
