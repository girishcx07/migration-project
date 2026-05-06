import {
  addDays,
  format,
  isBefore,
  isValid,
  parse,
  startOfDay,
} from "date-fns";
import { VisaFormField, WhenType } from "@workspace/types/review";

export const DATE_FORMAT = "dd-MM-yyyy";

export interface FormFieldConfig {
  name: string;
  type: string;
  value?: unknown;
  label?: string;
  validations?: VisaFormValidationConfig;
  options?: unknown[];
  sub_group_elements?: FormFieldConfig[][];
  sub_label?: string;
  group_elements?: FormFieldConfig[];
  dependent_elements?: FormFieldConfig[];
  dependent_value?: unknown;
  has_arabic?: boolean;
  associated_field?: string;
  keyboard_type?: string;
  max_count?: number;
  sub_type?: string;
}

export interface VisaFormValidationConfig {
  mandatory?: boolean;
  display?: boolean;
  input_type?: string;
  isDigit?: boolean;
  isTextOnly?: boolean;
  special_char?: boolean;
  min_length?: number;
  max_length?: number;
  read_only?: boolean;
  when?: WhenType;
  after?: string;
  min_days?: number;
  keyboard_type?: string;
  [key: string]: unknown;
}

export interface VisaFormGeneratedFieldState {
  isValid: boolean;
  label: string;
  isRequiredField: boolean;
  name: string;
  hasValue: boolean;
  hasError: boolean;
  validated: boolean;
}

export type VisaFormGeneratedErrors = Record<string, VisaFormGeneratedFieldState>;

export interface VisaFormCompletionState {
  progress: number;
  isComplete: boolean;
  totalRequired: number;
  completedRequired: number;
}

export interface VisaFormValidationDescriptor {
  path: string;
  label: string;
  type: string;
  required: boolean;
  display: boolean;
  inputType?: string;
  isDigit?: boolean;
  isTextOnly?: boolean;
  allowSpecialCharacters?: boolean;
  minLength?: number;
  maxLength?: number;
  keyboardType?: string;
  when?: WhenType;
  afterPath?: string;
  minDays?: number;
}

export interface VisaFormRuntime {
  formData: VisaFormField[];
  defaultValues: Record<string, unknown>;
  validationSchema: Record<string, VisaFormValidationDescriptor>;
  initialFormValues: VisaFormGeneratedErrors;
  completion: VisaFormCompletionState;
  hasVisaForm: boolean;
  generatedAt: string;
  runtimeKey: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DIGITS_ONLY_PATTERN = /^\d+$/;
const TEXT_ONLY_PATTERN = /^[A-Za-z\s]+$/;
const NO_SPECIAL_CHARS_PATTERN = /^[a-zA-Z0-9\s\u0600-\u06FF]+$/;
const DATE_PATTERN = /^\d{2}-\d{2}-\d{4}$/;

export const getDefaultFieldValue = (value: unknown): unknown => value ?? "";

export const hasMandatoryFieldValue = (value: unknown): boolean => {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
};

export const getFieldPath = (
  parentName: string | undefined,
  fieldName: string,
  isPartOfSubGroup = false,
): string => {
  if (!parentName) return fieldName;
  return isPartOfSubGroup ? `${parentName}.${fieldName}` : `${parentName}-${fieldName}`;
};

export const getNonRequiredLabelError = (
  errorType?: string,
  message?: string,
): string => {
  if (!message) return "";
  if (errorType === "required") return "";
  return message;
};

const hashString = (value: string): string => {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
};

const normalizeStringValue = (value: unknown): string => String(value ?? "").trim();

const getValueAtPath = (values: Record<string, unknown>, path: string): unknown => {
  return path.split(".").reduce<unknown>((currentValue, segment) => {
    if (currentValue == null) return undefined;
    return (currentValue as Record<string, unknown>)[segment];
  }, values);
};

const setValueAtPath = (
  target: Record<string, unknown>,
  path: string,
  value: unknown,
): void => {
  const segments = path.split(".");
  let cursor: Record<string, unknown> = target;

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      cursor[segment] = value;
      return;
    }

    const nextSegment = segments[index + 1];
    const shouldCreateArray = /^\d+$/.test(nextSegment ?? "");
    const existingValue = cursor[segment];

    if (existingValue == null || typeof existingValue !== "object") {
      cursor[segment] = shouldCreateArray ? [] : {};
    }

    cursor = cursor[segment] as Record<string, unknown>;
  });
};

const getAllValuePaths = (value: unknown, basePath = ""): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => getAllValuePaths(item, `${basePath}.${index}`));
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, nestedValue]) => {
      const nextPath = basePath ? `${basePath}.${key}` : key;
      return getAllValuePaths(nestedValue, nextPath);
    });
  }

  return basePath ? [basePath] : [];
};

const createWildcardMatcher = (schemaPath: string): RegExp => {
  const escaped = schemaPath
    .split(".")
    .map((segment) => (segment === "*" ? "[^.]+" : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
    .join("\\.");

  return new RegExp(`^${escaped}$`);
};

const createValidationDescriptor = (
  field: FormFieldConfig,
  fieldPath: string,
  parentName: string | undefined,
  isPartOfSubGroup: boolean,
): VisaFormValidationDescriptor => {
  const validations = field.validations ?? {};
  const afterPath = validations.after
    ? getFieldPath(parentName, String(validations.after), isPartOfSubGroup)
    : undefined;

  return {
    path: fieldPath,
    label: field.label || field.name,
    type: field.type,
    required: !!validations.mandatory && validations.display !== false,
    display: validations.display !== false,
    inputType: typeof validations.input_type === "string" ? validations.input_type : undefined,
    isDigit: !!validations.isDigit,
    isTextOnly: !!validations.isTextOnly,
    allowSpecialCharacters: validations.special_char !== false,
    minLength: typeof validations.min_length === "number" ? validations.min_length : undefined,
    maxLength: typeof validations.max_length === "number" ? validations.max_length : undefined,
    keyboardType: field.keyboard_type || (validations.keyboard_type as string | undefined),
    when: validations.when,
    afterPath,
    minDays: typeof validations.min_days === "number" ? validations.min_days : undefined,
  };
};

const resolveDescriptorPath = (
  descriptorPath: string | undefined,
  schemaPath: string,
  fieldPath: string,
): string | undefined => {
  if (!descriptorPath) return undefined;
  if (!descriptorPath.includes("*")) return descriptorPath;

  const schemaSegments = schemaPath.split(".");
  const fieldSegments = fieldPath.split(".");
  const resolvedSegments = descriptorPath.split(".");

  schemaSegments.forEach((segment, index) => {
    if (segment === "*" && fieldSegments[index]) {
      resolvedSegments[index] = fieldSegments[index];
    }
  });

  return resolvedSegments.join(".");
};

const validateDateValue = (
  value: unknown,
  descriptor: VisaFormValidationDescriptor,
  values: Record<string, unknown>,
  fieldPath: string,
): string | null => {
  const normalizedValue = normalizeStringValue(value);

  if (!descriptor.required && !normalizedValue) return null;
  if (!DATE_PATTERN.test(normalizedValue)) {
    return `Please enter a valid date in ${DATE_FORMAT} format`;
  }

  const parsedDate = parse(normalizedValue, DATE_FORMAT, new Date());
  if (!isValid(parsedDate) || format(parsedDate, DATE_FORMAT) !== normalizedValue) {
    return `Please enter a valid date in ${DATE_FORMAT} format`;
  }

  const selectedDate = startOfDay(parsedDate);

  const afterPath = resolveDescriptorPath(descriptor.afterPath, descriptor.path, fieldPath);

  if (afterPath) {
    const dependantValue = getValueAtPath(values, afterPath);
    const dependantDate = parse(normalizeStringValue(dependantValue), DATE_FORMAT, new Date());

    if (isValid(dependantDate) && isBefore(selectedDate, startOfDay(dependantDate))) {
      return "The selected date must be the same as or after the start date.";
    }
  }

  if (descriptor.when === "before") {
    const today = startOfDay(new Date());
    if (!isBefore(selectedDate, today)) {
      return "The selected date must be a past date.";
    }
  }

  if (descriptor.when === "after") {
    const tomorrow = startOfDay(addDays(new Date(), 1));
    if (isBefore(selectedDate, tomorrow)) {
      return "The selected date must be a future date.";
    }
  }

  if (descriptor.minDays) {
    const minValidDate = startOfDay(addDays(new Date(), descriptor.minDays));
    if (isBefore(selectedDate, minValidDate)) {
      return `The date of expiry should be at least ${descriptor.minDays} days after today's date.`;
    }
  }

  return null;
};

const validateFieldValue = (
  value: unknown,
  descriptor: VisaFormValidationDescriptor | undefined,
  values: Record<string, unknown>,
  fieldPath: string,
): string | null => {
  if (!descriptor || !descriptor.display) return null;

  const hasValue = hasMandatoryFieldValue(value);
  if (descriptor.required && !hasValue) return "Required";
  if (!hasValue) return null;

  if (descriptor.type === "dateControl") {
    return validateDateValue(value, descriptor, values, fieldPath);
  }

  const normalizedValue = normalizeStringValue(value);

  if (descriptor.inputType === "email" && !EMAIL_PATTERN.test(normalizedValue)) {
    return "Must be a valid email";
  }

  if ((descriptor.isDigit || descriptor.inputType === "numeric") && !DIGITS_ONLY_PATTERN.test(normalizedValue)) {
    return "Must contain only numbers";
  }

  if (descriptor.isTextOnly && !TEXT_ONLY_PATTERN.test(normalizedValue)) {
    return "Must contain only alphabetic characters";
  }

  if (
    descriptor.allowSpecialCharacters === false &&
    descriptor.inputType !== "email" &&
    descriptor.keyboardType !== "arabic" &&
    !NO_SPECIAL_CHARS_PATTERN.test(normalizedValue)
  ) {
    return "Special characters are not allowed!";
  }

  if (descriptor.minLength && normalizedValue.length < descriptor.minLength) {
    const unit = descriptor.isDigit || descriptor.inputType === "numeric" ? "digits" : "characters";
    return `Must be at least ${descriptor.minLength} ${unit} long`;
  }

  if (descriptor.maxLength && normalizedValue.length > descriptor.maxLength) {
    const unit = descriptor.isDigit || descriptor.inputType === "numeric" ? "digits" : "characters";
    return `Cannot exceed ${descriptor.maxLength} ${unit}`;
  }

  return null;
};

const normalizeFormData = (formData: unknown): FormFieldConfig[] => {
  return Array.isArray(formData) ? (formData as FormFieldConfig[]) : [];
};

const getActiveDependents = (field: FormFieldConfig): FormFieldConfig[] => {
  if (!Array.isArray(field.dependent_elements)) return [];

  const currentValue = getDefaultFieldValue(field.value);
  return field.dependent_elements.filter((dependentField) => dependentField.dependent_value === currentValue);
};

const assignSubGroupRowValue = (
  rowValues: Record<string, unknown>,
  field: FormFieldConfig,
  parentKey?: string,
): void => {
  const rowKey = parentKey ? `${parentKey}-${field.name}` : field.name;
  rowValues[rowKey] = getDefaultFieldValue(field.value);

  getActiveDependents(field).forEach((dependentField) => {
    assignSubGroupRowValue(rowValues, dependentField, rowKey);
  });
};

export const buildSubGroupRow = (row: VisaFormField[] | FormFieldConfig[]): Record<string, unknown> => {
  return (row as FormFieldConfig[]).reduce<Record<string, unknown>>((accumulator, subField) => {
    assignSubGroupRowValue(accumulator, subField);
    return accumulator;
  }, {});
};

const processSchemaField = (
  field: FormFieldConfig,
  parentName: string,
  isPartOfSubGroup: boolean,
  schema: Record<string, VisaFormValidationDescriptor>,
): void => {
  const fieldPath = getFieldPath(parentName, field.name, isPartOfSubGroup);

  if (field.type === "subGroup") {
    const templateRow = field.sub_group_elements?.[0] ?? [];
    templateRow.forEach((subField) => {
      processSchemaField(subField, `${fieldPath}.*`, true, schema);
    });
    return;
  }

  schema[fieldPath] = createValidationDescriptor(field, fieldPath, parentName, isPartOfSubGroup);

  if (Array.isArray(field.dependent_elements)) {
    field.dependent_elements.forEach((dependentField) => {
      processSchemaField(dependentField, fieldPath, false, schema);
    });
  }
};

const processDefaultField = (
  field: FormFieldConfig,
  parentName: string,
  isPartOfSubGroup: boolean,
  values: Record<string, unknown>,
): void => {
  const fieldPath = getFieldPath(parentName, field.name, isPartOfSubGroup);

  if (field.type === "subGroup") {
    const rows = field.sub_group_elements ?? [];
    values[fieldPath] = rows.map((row) => buildSubGroupRow(row));
    return;
  }

  values[fieldPath] = getDefaultFieldValue(field.value);

  getActiveDependents(field).forEach((dependentField) => {
    processDefaultField(dependentField, fieldPath, false, values);
  });
};

const findDescriptorForPath = (
  fieldPath: string,
  schema: Record<string, VisaFormValidationDescriptor>,
  wildcardDescriptors: Array<{ matcher: RegExp; descriptor: VisaFormValidationDescriptor }>,
): VisaFormValidationDescriptor | undefined => {
  if (schema[fieldPath]) return schema[fieldPath];
  return wildcardDescriptors.find(({ matcher }) => matcher.test(fieldPath))?.descriptor;
};

const createInitialFormValues = (
  values: Record<string, unknown>,
  schema: Record<string, VisaFormValidationDescriptor>,
): VisaFormGeneratedErrors => {
  const wildcardDescriptors = Object.entries(schema)
    .filter(([fieldPath]) => fieldPath.includes(".*."))
    .map(([fieldPath, descriptor]) => ({ matcher: createWildcardMatcher(fieldPath), descriptor }));

  return getAllValuePaths(values).reduce<VisaFormGeneratedErrors>((accumulator, fieldPath) => {
    const descriptor = findDescriptorForPath(fieldPath, schema, wildcardDescriptors);
    if (!descriptor?.required) return accumulator;

    const value = getValueAtPath(values, fieldPath);
    const hasValue = hasMandatoryFieldValue(value);
    const validationMessage = validateFieldValue(value, descriptor, values, fieldPath);
    const hasError = !!validationMessage;

    accumulator[fieldPath] = {
      isValid: hasValue && !hasError,
      label: descriptor.label,
      isRequiredField: true,
      name: fieldPath,
      hasValue,
      hasError,
      validated: false,
    };

    return accumulator;
  }, {});
};

export const getVisaFormCompletionFromErrors = (
  errors: VisaFormGeneratedErrors,
): VisaFormCompletionState => {
  const requiredFields = Object.values(errors ?? {}).filter((field) => field?.isRequiredField);
  const totalRequired = requiredFields.length;
  const completedRequired = requiredFields.filter((field) => field.isValid).length;
  const progress = totalRequired === 0 ? 0 : Math.round((completedRequired / totalRequired) * 100);

  return {
    progress,
    isComplete: totalRequired > 0 && completedRequired === totalRequired,
    totalRequired,
    completedRequired,
  };
};

export const generateVisaFormRuntime = (formData: unknown): VisaFormRuntime => {
  const groups = normalizeFormData(formData);
  const values: Record<string, unknown> = {};
  const validationSchema: Record<string, VisaFormValidationDescriptor> = {};
  const generatedAt = new Date().toISOString();

  groups.forEach((group) => {
    const groupName = group.name;
    const groupElements = Array.isArray(group.group_elements) ? group.group_elements : [];

    groupElements.forEach((field) => {
      processDefaultField(field, groupName, false, values);
      processSchemaField(field, groupName, false, validationSchema);
    });
  });

  const initialFormValues = createInitialFormValues(values, validationSchema);
  const completion = getVisaFormCompletionFromErrors(initialFormValues);
  const runtimeKey = hashString(
    JSON.stringify({
      formData: groups,
      schemaPaths: Object.keys(validationSchema).sort(),
    }),
  );

  return {
    formData: groups as unknown as VisaFormField[],
    defaultValues: {
      ...values,
      formValues: initialFormValues,
    },
    validationSchema,
    initialFormValues,
    completion,
    hasVisaForm: groups.length > 0,
    generatedAt,
    runtimeKey,
  };
};

const createResolverError = (message: string) => ({
  type: message === "Required" ? "required" : "validate",
  message,
});

export const createVisaFormResolver = (
  schema: Record<string, VisaFormValidationDescriptor>,
) => {
  const wildcardDescriptors = Object.entries(schema)
    .filter(([fieldPath]) => fieldPath.includes(".*."))
    .map(([fieldPath, descriptor]) => ({ matcher: createWildcardMatcher(fieldPath), descriptor }));

  return async (values: Record<string, unknown>) => {
    const errors: Record<string, unknown> = {};
    const candidatePaths = new Set<string>(
      getAllValuePaths(values).filter(
        (fieldPath) => fieldPath !== "formValues" && !fieldPath.startsWith("formValues."),
      ),
    );

    candidatePaths.forEach((fieldPath) => {
      const descriptor = findDescriptorForPath(fieldPath, schema, wildcardDescriptors);
      if (!descriptor) return;

      const value = getValueAtPath(values, fieldPath);
      const validationMessage = validateFieldValue(value, descriptor, values, fieldPath);
      if (!validationMessage) return;

      setValueAtPath(errors, fieldPath, createResolverError(validationMessage));
    });

    return {
      values,
      errors,
    };
  };
};
