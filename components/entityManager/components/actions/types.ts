/**
 * EntityActions Component Types
 * 
 * Type definitions for the entity actions component.
 * Supports 8 action types: immediate, confirm, form, modal, navigation, bulk, download, custom.
 */

import { BaseEntity } from '../../primitives/types';

/**
 * Action type enumeration
 */
export type ActionType =
  | 'immediate'
  | 'confirm'
  | 'form'
  | 'modal'
  | 'navigation'
  | 'bulk'
  | 'download'
  | 'custom';

/**
 * Action variant (visual style)
 */
export type ActionVariant = 
  | 'primary' 
  | 'secondary' 
  | 'destructive'
  | 'default'
  | 'outline'
  | 'ghost'
  | 'link';

/**
 * Action position in UI
 */
export type ActionPosition = 'toolbar' | 'row' | 'dropdown' | 'context-menu';

/**
 * Base action definition
 */
export interface ActionDefinition<T extends BaseEntity = BaseEntity> {
  /** Unique action ID */
  /** Unique action ID (legacy configs sometimes use 'key') */
  id: string;
  /** Legacy 'key' alias (optional) */
  key?: string;
  
  /** Display label. Can be a React node or a function that returns a node for the given entity. */
  label: React.ReactNode | ((entity?: T) => React.ReactNode);
  
  /** Action type (preferred) */
  actionType?: ActionType;
  /** Legacy 'type' alias used in older configs */
  type?: ActionType;
  
  /** Icon (optional) - either a React node, a component type, or a function that returns a node or component type for the given entity. */
  icon?: React.ReactNode | React.ComponentType<any>;

  /** Visual variant */
  variant?: ActionVariant;
  
  /** Action position */
  position?: ActionPosition;
  
  /** Visibility condition */
  visible?: boolean | ((entity?: T, context?: ActionContext<T>) => boolean);

  /** Disabled condition */
  disabled?: boolean | ((entity?: T, context?: ActionContext<T>) => boolean);
  
  /** Tooltip text */
  tooltip?: string;
  
  /** Requires selection */
  requiresSelection?: boolean;
  
  /** Multiple selection allowed */
  allowMultiple?: boolean;
  
  /** Single permission required */
  permission?: string;
  /** Multiple permissions required (all must be present) */
  permissions?: string[];
}

/**
 * Immediate action - executes immediately
 */
export interface ImmediateAction<T extends BaseEntity = BaseEntity> extends ActionDefinition<T> {
  actionType: 'immediate';

  /** Handler function receiving the entity and action context (context typed as any for compatibility) */
  handler: (entity?: T, context?: any) => void | Promise<void>;
}

/**
 * Confirm action - shows confirmation dialog
 */
export interface ConfirmAction<T extends BaseEntity = BaseEntity> extends ActionDefinition<T> {
  actionType: 'confirm';

  /** Confirmation message - static or generated from the entity */
  confirmMessage: string | ((entity?: T) => string);

  /** Optional confirmation title */
  confirmTitle?: string;

  /** Confirm button text */
  confirmText?: string;

  /** Cancel button text */
  cancelText?: string;

  /** Handler executed when confirmed */
  onConfirm: (entity?: T, context?: any) => void | Promise<void>;

  /** Handler on cancel */
  onCancel?: () => void;
}

/**
 * Form action - shows form modal
 */
export interface FormAction<T extends BaseEntity = BaseEntity> extends ActionDefinition<T> {
  actionType: 'form';

  /** Form title */
  formTitle: string;

  /** Form fields */
  fields: FormFieldDefinition[];

  /** Initial values */
  initialValues?: Record<string, unknown> | ((entity?: T) => Record<string, unknown>);

  /** Form submit handler */
  onSubmit: (values: Record<string, unknown>, entity?: T, context?: any) => void | Promise<void>;

  /** Form cancel handler */
  onCancel?: () => void;

  /** Submit button text */
  submitText?: string;
}

/**
 * Modal action - shows custom modal
 */
export interface ModalAction<T extends BaseEntity = BaseEntity> extends ActionDefinition<T> {
  actionType: 'modal';

  /** Modal title */
  modalTitle: string;

  /** Modal content component */
  content: React.ComponentType<{ entity?: T; context?: any; onClose: () => void }>;

  /** Modal size */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';

  /** On modal close */
  onClose?: () => void;
}

/**
 * Navigation action - navigates to URL
 */
export interface NavigationAction<T extends BaseEntity = BaseEntity> extends ActionDefinition<T> {
  actionType: 'navigation';

  /** URL or URL builder */
  url?: string | ((entity?: T) => string);

  /** Open in new tab */
  newTab?: boolean;

  /** Before navigation handler */
  beforeNavigate?: (entity?: T, context?: any) => boolean | Promise<boolean>;
}

/**
 * Bulk action - batch operation
 */
export interface BulkAction<T extends BaseEntity = BaseEntity> extends ActionDefinition<T> {
  actionType: 'bulk';

  /** Batch handler */
  handler: (items: T[], context?: any) => void | Promise<void>;

  /** Confirmation for bulk */
  confirmBulk?: boolean;

  /** Bulk confirmation message */
  confirmMessage?: string | ((items?: T[]) => string);

  /** Require explicit confirmation */
  requireConfirm?: boolean;

  /** Max items for bulk */
  maxItems?: number;
}

/**
 * Download action - export/download
 */
export interface DownloadAction<T extends BaseEntity = BaseEntity> extends ActionDefinition<T> {
  actionType: 'download';

  /** Download handler */
  handler: (entity?: T | T[], context?: any) => void | Promise<void>;

  /** Download URL */
  downloadUrl?: string | ((entity?: T) => string);

  /** Filename */
  filename?: string | ((entity?: T) => string);
}

/**
 * Custom action - user-defined
 */
export interface CustomAction<T extends BaseEntity = BaseEntity> extends ActionDefinition<T> {
  actionType: 'custom';

  /** Custom component to render (optional) */
  component?: React.ComponentType<{ entity?: T; context?: ActionContext<T> }>;

  /** Custom handler */
  handler?: (entity?: T, context?: any) => void | Promise<void>;
}

/**
 * Union type of all actions
 */
export type Action<T extends BaseEntity = BaseEntity> =
  | ImmediateAction<T>
  | ConfirmAction<T>
  | FormAction<T>
  | ModalAction<T>
  | NavigationAction<T>
  | BulkAction<T>
  | DownloadAction<T>
  | CustomAction<T>;

/**
 * Form field definition
 */
export interface FormFieldDefinition {
  /** Field name */
  name: string;
  
  /** Field label */
  label: string;
  
  /** Field type */
  type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';
  
  /** Required field */
  required?: boolean;
  
  /** Default value */
  defaultValue?: unknown;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Validation rules */
  validation?: ValidationRule[];
  
  /** Options for select/radio */
  options?: Array<{ label: string; value: unknown }>;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Help text */
  helpText?: string;
}

/**
 * Validation rule
 */
export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  message: string;
  value?: unknown;
  validator?: (value: unknown) => boolean;
}

/**
 * Action context
 */
export interface ActionContext<T extends BaseEntity = BaseEntity> {
  /** All entities */
  entities?: T[];
  
  /** Selected entities */
  selectedEntities?: T[];
  
  /** Selected IDs */
  selectedIds?: Set<string | number>;
  
  /** Refresh callback */
  refresh?: () => void | Promise<void>;
  
  /** Custom data */
  customData?: Record<string, unknown>;
  /** Current user's permission codenames */
  permissions?: string[];
  
  /** Legacy convenience API surface kept for compatibility with older action handlers */
  api?: any;
  delete?: (id: string | number) => Promise<void>;
  bulkDelete?: (ids: Array<string | number>) => Promise<void>;
  showDialog?: (options: any) => Promise<boolean>;
  customApi?: any;
}

/**
 * Action execution result
 */
export interface ActionResult {
  /** Success flag */
  success: boolean;
  
  /** Result message */
  message?: string;
  
  /** Error if failed */
  error?: Error;
  
  /** Result data */
  data?: unknown;
}

/**
 * EntityActions component props
 */
export interface EntityActionsProps<T extends BaseEntity = BaseEntity> {
  /** Actions to display */
  actions: Action<T>[];
  
  /** Current entity (for row actions) */
  entity?: T;
  
  /** Action context */
  context?: ActionContext<T>;
  
  /** Display mode */
  mode?: 'buttons' | 'dropdown' | 'context-menu';
  
  /** Filter actions by position */
  position?: ActionPosition;
  
  /** Custom className */
  className?: string;
  
  /** Callback when action starts */
  onActionStart?: (actionId: string) => void;
  
  /** Callback when action completes */
  onActionComplete?: (actionId: string, result: ActionResult) => void;
  
  /** Callback when action fails */
  onActionError?: (actionId: string, error: Error) => void;
}

/**
 * Action state
 */
export interface ActionState {
  /** Currently executing action */
  executing?: string;
  
  /** Loading state */
  loading: boolean;
  
  /** Error state */
  error?: Error;
  
  /** Modal open state */
  modalOpen: boolean;
  
  /** Current modal content */
  modalContent?: React.ReactNode;
  
  /** Dropdown open state */
  dropdownOpen?: boolean;
  
  /** Overflow menu open state */
  overflowOpen?: boolean;
}
