/**
 * EntityList Component Types
 * 
 * Type definitions for the entity list component.
 * Supports 8 view modes, search, filter, sort, and pagination.
 */

import { BaseEntity, FilterConfig, SortConfig, PaginationConfig } from '../../primitives/types';

/**
 * List view mode
 */
export type ListView = 
  | 'table'      // Table with columns
  | 'card'       // Card grid
  | 'list'       // Compact list
  | 'grid'       // Grid layout
  | 'compact'    // Dense table
  | 'timeline'   // Timeline view
  | 'detailed'   // Detailed list
  | 'gallery';   // Image gallery

/**
 * Column definition
 */
export interface Column<T extends BaseEntity = BaseEntity> {
  /** Column key */
  key: keyof T | string;
  
  /** Column label (preferred) */
  label?: string;

  /** Legacy header alias for label (kept for backward compatibility) */
  header?: string;
  
  /** Column width */
  width?: number | string;
  
  /** Sortable column */
  sortable?: boolean;
  
  /** Filterable column */
  filterable?: boolean;
  
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  
  /** Custom renderer */
  render?: (value: any, entity?: T, index?: number) => React.ReactNode;
  
  /** Custom formatter */
  formatter?: (value: unknown, entity: T) => string | number;
  
  /** Field type (for filtering) */
  type?: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'select';
  
  /** Filter options (for select type) */
  filterOptions?: Array<{ label: string; value: unknown }>;
  
  /** Visible column */
  visible?: boolean;
  
  /** Fixed column */
  fixed?: 'left' | 'right';
  
  /** Column order */
  order?: number;
}

/**
 * List toolbar configuration
 */
export interface ToolbarConfig {
  /** Show search */
  search?: boolean;
  
  /** Show filters */
  filters?: boolean;
  
  /** Show view switcher */
  viewSwitcher?: boolean;
  
  /** Show column selector */
  columnSelector?: boolean;
  
  /** Show refresh button */
  refresh?: boolean;
  
  /** Show export button */
  export?: boolean;
  
  /** Custom actions */
  actions?: React.ReactNode;
}

/**
 * Legacy pagination shape used across some feature configs
 */
export interface LegacyPagination {
  defaultPageSize?: number;
  pageSizeOptions?: number[];
}

/**
 * EntityList component props
 */
export interface EntityListProps<T extends BaseEntity = BaseEntity> {
  /** Entity data */
  data: T[];
  
  /** Column definitions */
  columns: Column<T>[];
  
  /** View mode */
  view?: ListView;
  
  /** Toolbar configuration */
  toolbar?: ToolbarConfig;
  
  /** Enable selection */
  selectable?: boolean;
  
  /** Multiple selection */
  multiSelect?: boolean;
  
  /** Selected IDs */
  selectedIds?: Set<string | number>;
  
  /** Selection change handler */
  onSelectionChange?: (selectedIds: Set<string | number>, selectedEntities: T[]) => void;
  
  /** Row click handler */
  onRowClick?: (entity: T, index: number) => void;
  
  /** Row double click handler */
  onRowDoubleClick?: (entity: T, index: number) => void;
  
  /** Enable pagination. Can be a boolean, full PaginationConfig, or legacy pagination object */
  pagination?: boolean | PaginationConfig | LegacyPagination;
  
  /** Pagination config (preferred) */
  paginationConfig?: PaginationConfig;
  
  /** Pagination change handler */
  onPaginationChange?: (config: PaginationConfig) => void;
  
  /** Enable sorting */
  sortable?: boolean;
  
  /** Sort config */
  sortConfig?: SortConfig;
  
  /** Sort change handler */
  onSortChange?: (config: SortConfig) => void;
  
  /** Enable filtering */
  filterable?: boolean;
  
  /** Filter configs */
  filterConfigs?: FilterConfig[];
  
  /** Filter change handler */
  onFilterChange?: (filters: FilterConfig[]) => void;
  
  /** Enable search */
  searchable?: boolean;
  
  /** Search value */
  searchValue?: string;
  
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  
  /** Search placeholder */
  searchPlaceholder?: string;
  
  /** Empty state message */
  emptyMessage?: string;

  /** Create action handler for empty states */
  onCreate?: () => void;
  
  /** Loading state */
  loading?: boolean;
  
  /** Error state */
  error?: Error | string;
  
  /** Row height */
  rowHeight?: number | 'auto';
  
  /** Actions (includes both row-level and bulk actions - filtered internally by actionType and position) */
  actions?: import('../actions/types').EntityActionsProps<T>;
  
  /** Custom className */
  className?: string;
  
  /** Row className function */
  rowClassName?: (entity: T, index: number) => string;
  
  /** Enable row hover */
  hover?: boolean;
  
  /** Enable striped rows */
  striped?: boolean;
  
  /** Bordered table */
  bordered?: boolean;
  
  /** Title field (for card/list views) */
  titleField?: keyof T | string;
  
  /** Subtitle field (for card/list views) */
  subtitleField?: keyof T | string;
  
  /** Image field (for gallery view) */
  imageField?: keyof T | string;
  
  /** Date field (for timeline view) */
  dateField?: keyof T | string;
}

/**
 * List state
 */
export interface ListState {
  /** Current view */
  view: ListView;
  
  /** Selected IDs */
  selectedIds: Set<string | number>;
  
  /** Current page */
  page: number;
  
  /** Page size */
  pageSize: number;
  
  /** Sort config */
  sort?: SortConfig;
  
  /** Active filters */
  filters: FilterConfig[];
  
  /** Search value */
  search: string;
  
  /** Visible columns */
  visibleColumns: Set<string>;
  
  /** Column widths */
  columnWidths: Map<string, number>;
  
  /** Bulk actions dropdown open */
  bulkActionsOpen?: boolean;
}

/**
 * Cell render props
 */
export interface CellRenderProps<T extends BaseEntity = BaseEntity> {
  column: Column<T>;
  entity: T;
  value: unknown;
  index: number;
}

/**
 * Row render props
 */
export interface RowRenderProps<T extends BaseEntity = BaseEntity> {
  entity: T;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onClick?: () => void;
  onDoubleClick?: () => void;
}
