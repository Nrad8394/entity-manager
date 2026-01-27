/**
 * EntityView Component Types
 * 
 * Type definitions for the entity detail view component.
 * Supports 4 display modes: detail, card, summary, timeline.
 */

import { BaseEntity } from '../../primitives/types';
import { Action, ActionContext } from '../actions/types';

/**
 * View mode enumeration
 */
export type ViewMode = 'detail' | 'card' | 'summary' | 'timeline' | 'compact' | 'profile' | 'split' | 'table';

/**
 * Field group for organizing fields
 */
export interface FieldGroup {
  /** Group ID */
  id: string;
  
  /** Group label */
  label: string;
  
  /** Group description */
  description?: string;
  
  /** Fields in this group */
  /** Can be an array of field keys (string) or inline field definitions (legacy configs) */
  fields: Array<string | ViewField<BaseEntity>>;
  
  /** Collapsible group */
  collapsible?: boolean;
  
  /** Initially collapsed */
  defaultCollapsed?: boolean;
  
  /** Display order */
  order?: number;
  
  /** icon allowed  */
  icon?: React.ReactNode | React.ElementType | string | null;
}

/**
 * View field definition
 */
export interface ViewField<T extends BaseEntity = BaseEntity> {
  /** Field key from entity */
  key: keyof T | string;
  
  /** Display label */
  label: string;
  
  /** Field type for rendering */
  type?: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'email' | 'url' | 'image' | 'file' | 'json' | 'custom';
  
  /** Custom formatter */
  formatter?: (value: unknown, entity: T) => React.ReactNode;
  
  /** Custom renderer */
  render?: ((entity: T) => React.ReactNode) | ((value: unknown, entity?: T, index?: number) => React.ReactNode);
  
  /** Legacy title builder for field-level titles (some configs define 'title' on view fields) */
  title?: (entity?: T) => string | undefined;
  /** Legacy subtitle builder for field-level subtitles */
  subtitle?: (entity?: T) => string | undefined;
  /** Legacy icon property at field level */
  icon?: React.ReactNode | React.ElementType | string;
  
  /** Show in summary view */
  showInSummary?: boolean;
  
  /** Enable copy to clipboard */
  copyable?: boolean;
  
  /** Help text */
  helpText?: string;
  
  /** Visibility condition */
  visible?: boolean | ((entity: T) => boolean);
  
  /** Field group */
  group?: string;
  
  /** Display order */
  order?: number;
  /** Legacy nested sections (some configs put sections on fields) */
  sections?: FieldGroup[] | unknown;
}

/**
 * Tab definition for tabbed view
 */
export interface ViewTab<T extends BaseEntity = BaseEntity> {
  /** Tab ID */
  id: string;
  
  /** Tab label */
  label: string;
  
  /** Tab icon */
  icon?: string | React.ReactNode;
  
  /** Tab content - optional if tab.id matches a group.id (will auto-render group fields) */
  content?: React.ComponentType<{ entity: T }> | React.ReactNode;
  
  /** Badge count */
  badge?: number | ((entity: T) => number);
  
  /** Lazy load */
  lazy?: boolean;
}

/**
 * EntityView component props
 */
export interface EntityViewProps<T extends BaseEntity = BaseEntity> {
  /** Entity to display */
  entity: T;
  
  /** Fields to display */
  fields: ViewField<T>[];
  
  /** Field groups */
  groups?: FieldGroup[];
  
  /** View mode */
  mode?: ViewMode;
  
  /** Show metadata (created, updated) */
  showMetadata?: boolean;
  
  /** Tabs for additional content */
  tabs?: ViewTab<T>[];

  /** Optional icon for the view (legacy configs sometimes set an icon at the view level) */
  icon?: React.ReactNode | React.ElementType | string;

  /** Optional sections/groups defined at the view level (legacy configs) */
  sections?: FieldGroup[];
  
  /** Title field key */
  titleField?: keyof T | string;
  /** Legacy title builder (kept for backward compatibility) */
  title?: (entity?: T) => string;
  
  /** Subtitle field key */
  subtitleField?: keyof T | string;
  /** Legacy subtitle builder (kept for backward compatibility) */
  subtitle?: (entity?: T) => string;
  
  /** Image field key */
  imageField?: keyof T | string;
  
  /** Loading state */
  loading?: boolean;
  
  /** Error state */
  error?: Error | string;
  
  /** Custom className */
  className?: string;
  
  /** Callback when field is copied */
  onCopy?: (field: keyof T | string, value: unknown) => void;
  
  /** Header actions - either React nodes or Action definitions for single-item rendering */
  actions?: React.ReactNode | Action<T>[];
  
  /** Action context for executing single-item actions */
  actionContext?: ActionContext<T>;
  
  /** Callback when an action completes */
  onActionComplete?: (actionId: string) => void;
}

/**
 * View state
 */
export interface ViewState {
  /** Active tab ID */
  activeTab?: string;
  
  /** Collapsed groups */
  collapsedGroups: Set<string>;
  
  /** Copied field */
  copiedField?: string;
}

/**
 * Field render props
 */
export interface FieldRenderProps<T extends BaseEntity = BaseEntity> {
  field: ViewField<T>;
  entity: T;
  value: unknown;
  onCopy?: (field: keyof T | string, value: unknown) => void;
}
