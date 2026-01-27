/**
 * EntityForm Component Types
 * 
 * Type definitions for the entity form component.
 * Supports 15+ field types, multiple layouts, and comprehensive validation.
 */

import { BaseEntity } from '../../primitives/types';

/**
 * Form mode
 */
export type FormMode = 'create' | 'edit' | 'view';

/**
 * Form layout
 */
export type FormLayout = 'vertical' | 'horizontal' | 'grid' | 'tabs' | 'wizard';

/**
 * Field type enumeration
 */
export type FieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'email'
  | 'password'
  | 'url'
  | 'tel'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'datetime'
  | 'time'
  | 'file'
  | 'image'
  | 'color'
  | 'range'
  | 'json'
  | 'relation'
  | 'relationship'
  | 'multirelation'
  | 'custom';

/**
 * Form field definition
 */
export interface FormField<T extends BaseEntity = BaseEntity> {
  /** Field name (entity property key) */
  name: keyof T | string;

  /** Field label */
  label: string;
  /** Legacy description field retained for compatibility */
  description?: string;

  /** Field type */
  type: FieldType;

  /** Placeholder text */
  placeholder?: string;

  /** Help text */
  helpText?: string;

  /** Default value */
  defaultValue?: unknown;

  /** Required field */
  required?: boolean | ((values: Partial<T>) => boolean);

  /** Disabled state */
  disabled?: boolean | ((values: Partial<T>) => boolean);

  /** Visibility condition */
  visible?: boolean | ((values: Partial<T>) => boolean);

  /** Validation rules */
  validation?: ValidationRule[];

  /** Field width (for grid layout) */
  width?: number | string;

  /** Field group/section */
  group?: string;

  /** Field order */
  order?: number;

  /** Options for select/radio/multiselect */
  options?: FieldOption[] | ((values: Partial<T>, query?: string) => FieldOption[] | Promise<FieldOption[]>);

  /** Whether the select field is searchable */
  searchable?: boolean;

  /** Min value (number/range) */
  min?: number;

  /** Max value (number/range) */
  max?: number;

  /** Step (number/range) */
  step?: number;

  /** Min length (text) */
  minLength?: number;

  /** Max length (text) */
  maxLength?: number;

  /** Rows (textarea) */
  rows?: number;

  /** Accept (file) */
  accept?: string;

  /** Multiple (file/select) */
  multiple?: boolean;

  /** Max file size in bytes (file) */
  maxSize?: number;

  /** Custom renderer */
  render?: (props: FieldRenderProps<T>) => React.ReactNode;

  /** Custom component for 'custom' field type */
  customComponent?: React.ComponentType<CustomComponentProps<any>>;

  /** Transform value before save */
  transform?: (value: unknown) => unknown;

  /** Relation config (for relation fields) */
  /** Relation config (for relation fields) */
  relationConfig?: RelationConfig;
}

/**
 * Field option (for select/radio/etc)
 */
export interface FieldOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}

/**
 * Custom component props (for 'custom' field type)
 * Generic type that allows any value type for the custom component
 */
export interface CustomComponentProps<T = unknown> {
  value?: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  helpText?: string;
  [key: string]: unknown;
}

/**
 * Relation configuration
 */
export interface RelationConfig<R extends BaseEntity = BaseEntity> {
  /** Entity name */
  entity: string;

  /** Display field */
  displayField: keyof R | string;

  /** Value field */
  valueField: keyof R | string;

  /** Fetch function */
  fetchOptions: (search?: string) => Promise<R[]>;

  /** Fetch single entity by id (optional) - used to ensure selected item(s) are loaded */
  fetchById?: (id: string) => Promise<R | null>;

  /** Fetch multiple entities by ids (optional) */
  fetchByIds?: (ids: string[]) => Promise<R[]>;

  /** Create new option */
  onCreate?: (value: string) => Promise<R>;

  /** Multiple selection */
  multiple?: boolean;

  /** Maximum selections (for multirelation) */
  maxSelections?: number;
}

/**
 * Validation rule
 */
export interface ValidationRule {
  type: 'required' | 'email' | 'url' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom' | 'async';
  message: string;
  value?: unknown;
  validator?: (value: unknown, values: Record<string, unknown>) => boolean | Promise<boolean>;
}

/**
 * Field group
 */
export interface FieldSection {
  id: string;
  label: string;
  description?: string;
  fields: string[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  order?: number;
  icon?: React.ReactNode;
}

/**
 * Form tab
 */
export interface FormTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  fields: string[];
  order?: number;
}

/**
 * Wizard step
 */
export interface WizardStep {
  id: string;
  label: string;
  description?: string;
  fields: string[];
  validate?: (values: Record<string, unknown>) => Record<string, string> | Promise<Record<string, string>>;
  order?: number;
}

/**
 * EntityForm component props
 */
export interface EntityFormProps<T extends BaseEntity = BaseEntity> {
  /** Form fields */
  fields: FormField<T>[];

  /** Form mode */
  mode?: FormMode;

  /** Form layout */
  layout?: FormLayout;

  /** Initial values */
  initialValues?: Partial<T>;

  /** Entity being edited */
  entity?: T;

  /** Field sections (for grouped layout) */
  sections?: FieldSection[];

  /** Tabs (for tabbed layout) */
  tabs?: FormTab[];

  /** Wizard steps (for wizard layout) */
  steps?: WizardStep[];

  /** Submit handler */
  onSubmit: (values: Partial<T>) => void | Promise<void>;

  /** Cancel handler */
  onCancel?: () => void;

  /** Change handler */
  onChange?: (values: Partial<T>) => void;

  /** Validation handler */
  onValidate?: (values: Partial<T>) => Record<string, string> | Promise<Record<string, string>>;

  /** Submit button text */
  submitText?: string;

  /** Cancel button text */
  cancelText?: string;

  /** Show cancel button */
  showCancel?: boolean;

  /** Show reset button */
  showReset?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Disabled state */
  disabled?: boolean;

  /** Custom className */
  className?: string;

  /** Validate on change */
  validateOnChange?: boolean;

  /** Validate on blur */
  validateOnBlur?: boolean;

  /** Reset form after successful submission */
  resetOnSubmit?: boolean;
}

/**
 * Form state
 */
export interface FormState<T extends BaseEntity = BaseEntity> {
  /** Form values */
  values: Partial<T>;

  /** Validation errors */
  errors: Record<string, string>;

  /** Touched fields */
  touched: Set<string>;

  /** Dirty fields */
  dirty: Set<string>;

  /** Submitting state */
  submitting: boolean;

  /** Submission error */
  submitError?: string;

  /** Current wizard step */
  currentStep?: number;

  /** Current tab */
  currentTab?: string;

  /** Current tab index */
  currentTabIndex?: number;

  /** Collapsed sections */
  collapsedSections: Set<string>;
}

/**
 * Field render props
 */
export interface FieldRenderProps<T extends BaseEntity = BaseEntity> {
  field: FormField<T>;
  value: unknown;
  error?: string;
  touched: boolean;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  disabled: boolean;
  mode: FormMode;
  validateOnChange?: boolean;
  formValues: Partial<T>;
}

/**
 * Form context
 */
export interface FormContextValue<T extends BaseEntity = BaseEntity> {
  values: Partial<T>;
  errors: Record<string, string>;
  touched: Set<string>;
  setFieldValue: (field: string, value: unknown) => void;
  setFieldError: (field: string, error: string) => void;
  setFieldTouched: (field: string) => void;
  validateField: (field: string) => Promise<void>;
  submitForm: () => Promise<void>;
}
