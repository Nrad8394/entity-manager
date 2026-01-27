/**
 * Configuration Builder Types
 * 
 * Type definitions for configuration builders.
 */

import { BaseEntity} from '../../primitives/types';
import { EntityActionsProps, Action } from '../../components/actions/types';
import { EntityExporterProps, ExportField } from '../../components/exporter/types';
import { EntityFormProps, FormField } from '../../components/form/types';
import { EntityListProps, Column } from '../../components/list/types';
import { EntityViewProps, ViewField } from '../../components/view/types';

/**
 * Entity actions configuration
 */
/**
 * Entity actions configuration
 *
 * Backwards compatible: accept either the compact object shape used across feature configs
 * (with optional `row` and `bulk` arrays) or the normalized `EntityActionsProps`-derived shape.
 */
export type EntityActionsConfig<T extends BaseEntity = BaseEntity> =
  | (Omit<EntityActionsProps<T>, 'entity' | 'context' | 'onActionComplete' | 'onActionError'> & {
      /** Allow extra legacy properties while migrating */
      [key: string]: any;
    })
  /** Legacy compact actions shape used across older feature configs */
  | ({ row?: Action<T>[]; bulk?: Action<T>[] } & { [key: string]: any });

/**
 * Entity exporter configuration
 */
export type EntityExporterConfig<T extends BaseEntity = BaseEntity> = Omit<EntityExporterProps<T>, 'data' | 'onExportStart' | 'onExportComplete' | 'onExportError'> & {
  /** Allow legacy top-level exporter keys during migration */
  [key: string]: any;
};

/**
 * Entity form configuration
 */
export type EntityFormConfig<T extends BaseEntity = BaseEntity> = Omit<EntityFormProps<T>, 'initialValues' | 'entity' | 'onSubmit' | 'onCancel' | 'onChange' | 'onValidate'> & {
  /** Allow legacy fieldGroups and other adapter/shorthand keys during migration */
  fieldGroups?: any;
  [key: string]: any;
};

/**
 * Entity list configuration
 */
export type EntityListConfig<T extends BaseEntity = BaseEntity> = Omit<EntityListProps<T>, 'data' | 'selectedIds' | 'onSelectionChange' | 'onRowClick' | 'onRowDoubleClick' | 'onPaginationChange' | 'onSortChange' | 'onFilterChange' | 'onSearchChange'> & {
  /** Legacy migration-friendly keys (defaultSort, searchableFields, etc.) */
  defaultSort?: { field: string; direction: 'asc' | 'desc' };
  searchableFields?: string[];
  /** Allow arbitrary legacy properties temporarily during migration */
  [key: string]: any;
};

/**
 * Entity view configuration
 */
export type EntityViewConfig<T extends BaseEntity = BaseEntity> =
  Omit<EntityViewProps<T>, 'entity' | 'onCopy'> & {
    /** Allow legacy layout property used in some feature configs */
    layout?: string;
    /** Allow extra legacy properties while we migrate configs */
    [key: string]: any;
  };

/**
 * Entity configuration
 */
export interface EntityConfig<T extends BaseEntity = BaseEntity> {
  /** Entity name */
  name: string;
  
  /** Primary key field name (defaults to 'id') */
  primaryKeyField?: string;
  
  /** Entity display name (plural) */
  pluralName?: string;
  
  /** Entity label (alias for name) */
  label: string;
  
  /** Entity label plural (alias for pluralName) */
  labelPlural: string;
  
  /** Entity description */
  description?: string;
  
  /** List configuration */
  list: EntityListConfig<T>;
  
  /** Form configuration */
  form: EntityFormConfig<T>;
  
  /** View configuration */
  view: EntityViewConfig<T>;
  
  /** Actions configuration */
  actions: EntityActionsConfig<T>;
  
  /** Exporter configuration */
  exporter: EntityExporterConfig<T>;
  
  /** Custom validation function */
  onValidate?: (values: Partial<T>) => Record<string, string> | Promise<Record<string, string>>;
  
  /** API endpoint */
  apiEndpoint?: string;
  
  /** Icon */
  icon?: string;
  
  /** Permissions */
  permissions?: {
    // Support either static boolean flags or permission codenames (string) or arrays of codenames.
    // Example: { create: true } or { create: 'can_manage_users' } or { create: ['role:admin', 'can_manage_users'] }
    create?: boolean | string | string[];
    read?: boolean | string | string[];
    update?: boolean | string | string[];
    delete?: boolean | string | string[];
    export?: boolean | string | string[];
  };
  
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Builder callback type
 */
export type BuilderCallback<T, B> = (builder: B) => T | void;

/**
 * Field builder options
 */
export interface FieldBuilderOptions {
  /** Field name */
  name: string;
  
  /** Field label */
  label: string;
  
  /** Field type */
  type?: string;
}

/**
 * Column builder options
 */
export interface ColumnBuilderOptions {
  /** Column key */
  key: string;
  
  /** Column label */
  label: string;
}

/**
 * Action builder options
 */
export interface ActionBuilderOptions {
  /** Action ID */
  id: string;
  
  /** Action label */
  label: string;
  
  /** Action type */
  type?: string;
}

/**
 * Config adapter interface
 */
export interface ConfigAdapter<T = unknown> {
  /** Adapt external config to internal format */
  adapt: (externalConfig: T) => Partial<EntityConfigBuilderState>;
  
  /** Validate external config */
  validate?: (externalConfig: T) => boolean;
}

/**
 * Internal builder state type
 * Used by EntityConfigBuilder and adapters for flat configuration building
 * before transforming to nested EntityConfig structure
 */
export interface EntityConfigBuilderState<T extends BaseEntity = BaseEntity> {
  /** Entity name */
  name: string;
  
  /** Entity display name (plural) */
  pluralName?: string;
  
  /** Entity label */
  label?: string;
  
  /** Entity label plural */
  labelPlural?: string;
  
  /** Entity description */
  description?: string;
  
  /** Flat columns array (for builder) */
  columns?: Column<T>[];
  
  /** Flat fields array (for builder) */
  fields?: FormField<T>[];
  
  /** Flat view fields array (for builder) */
  viewFields?: ViewField<T>[];
  
  /** Flat actions array (for builder) */
  actions?: Action<T>[];
  
  /** Flat export fields array (for builder) */
  exportFields?: ExportField<T>[];
  
  /** Default sort configuration */
  defaultSort?: { field: string; direction: 'asc' | 'desc' };
  
  /** Default page size */
  defaultPageSize?: number;
  
  /** Searchable fields */
  searchableFields?: string[];
  
  /** Filterable fields */
  filterableFields?: string[];
  
  /** Title field */
  titleField?: string;
  
  /** Subtitle field */
  subtitleField?: string;
  
  /** Image field */
  imageField?: string;
  
  /** Date field */
  dateField?: string;
  
  /** API endpoint */
  apiEndpoint?: string;
  
  /** Icon */
  icon?: string;
  
  /** Permissions */
  permissions?: {
    create?: boolean | string | string[];
    read?: boolean | string | string[];
    update?: boolean | string | string[];
    delete?: boolean | string | string[];
    export?: boolean | string | string[];
  };
  
  /** Metadata */
  metadata?: Record<string, unknown>;
}
