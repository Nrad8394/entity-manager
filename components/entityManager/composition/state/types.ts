/**
 * Entity State Types
 * 
 * Type definitions for entity state management.
 */

import { BaseEntity, FilterConfig, SortConfig } from '../../primitives/types';

/**
 * Entity state
 */
export interface EntityState<T extends BaseEntity = BaseEntity> {
  /** All entities */
  entities: T[];
  
  /** Entities by ID */
  entitiesById: Map<string | number, T>;
  
  /** Selected IDs */
  selectedIds: Set<string | number>;
  
  /** Primary key field name */
  primaryKeyField: string;
  
  /** Current page */
  page: number;
  
  /** Page size */
  pageSize: number;
  
  /** Sort config */
  sort?: SortConfig;
  
  /** Active filters */
  filters: FilterConfig[];
  
  /** Search query */
  search: string;
  
  /** Loading state */
  loading: boolean;
  
  /** Error state */
  error: Error | string | undefined;
  
  /** Total count (server-side) */
  total?: number;
  
  /** Has more data */
  hasMore?: boolean;
}

/**
 * Entity cache entry
 */
export interface CacheEntry<T = unknown> {
  /** Cached data */
  data: T;
  
  /** Timestamp */
  timestamp: number;
  
  /** Expiration time (ms) */
  ttl: number;
  
  /** Cache key */
  key: string;
}

/**
 * Cache options
 */
export interface CacheOptions {
  /** Time to live (ms) */
  ttl?: number;
  
  /** Max cache size */
  maxSize?: number;
  
  /** Cache strategy */
  strategy?: 'memory' | 'localStorage' | 'sessionStorage';
}

/**
 * Entity state actions
 */
export type EntityStateAction<T extends BaseEntity = BaseEntity> =
  | { type: 'SET_ENTITIES'; payload: T[] }
  | { type: 'ADD_ENTITY'; payload: T }
  | { type: 'UPDATE_ENTITY'; payload: T }
  | { type: 'DELETE_ENTITY'; payload: string | number }
  | { type: 'SET_SELECTED'; payload: Set<string | number> }
  | { type: 'SELECT'; payload: string | number }
  | { type: 'DESELECT'; payload: string | number }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'SET_SORT'; payload: SortConfig }
  | { type: 'SET_FILTERS'; payload: FilterConfig[] }
  | { type: 'ADD_FILTER'; payload: FilterConfig }
  | { type: 'REMOVE_FILTER'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | string | null }
  | { type: 'SET_TOTAL'; payload: number }
  | { type: 'RESET' };

/**
 * Entity state provider props
 */
export interface EntityStateProviderProps<T extends BaseEntity = BaseEntity> {
  /** Initial entities */
  initialEntities?: T[];
  
  /** Initial page */
  initialPage?: number;
  
  /** Initial page size */
  initialPageSize?: number;
  
  /** Initial sort */
  initialSort?: SortConfig;
  
  /** Initial filters */
  initialFilters?: FilterConfig[];
  
  /** Primary key field name (defaults to 'id') */
  primaryKeyField?: string;
  
  /** Children */
  children: React.ReactNode;
}

/**
 * Entity state context value
 */
export interface EntityStateContextValue<T extends BaseEntity = BaseEntity> {
  /** Current state */
  state: EntityState<T>;
  
  /** Set entities */
  setEntities: (entities: T[]) => void;
  
  /** Add entity */
  addEntity: (entity: T) => void;
  
  /** Update entity */
  updateEntity: (entity: T) => void;
  
  /** Delete entity */
  deleteEntity: (id: string | number) => void;
  
  /** Select entity */
  select: (id: string | number) => void;
  
  /** Deselect entity */
  deselect: (id: string | number) => void;
  
  /** Select all */
  selectAll: () => void;
  
  /** Deselect all */
  deselectAll: () => void;
  
  /** Set selected IDs */
  setSelected: (ids: Set<string | number>) => void;
  
  /** Set page */
  setPage: (page: number) => void;
  
  /** Set page size */
  setPageSize: (pageSize: number) => void;
  
  /** Set sort */
  setSort: (sort: SortConfig) => void;
  
  /** Set filters */
  setFilters: (filters: FilterConfig[]) => void;
  
  /** Add filter */
  addFilter: (filter: FilterConfig) => void;
  
  /** Remove filter */
  removeFilter: (field: string) => void;
  
  /** Set search */
  setSearch: (search: string) => void;
  
  /** Set loading */
  setLoading: (loading: boolean) => void;
  
  /** Set error */
  setError: (error: Error | string | null) => void;
  
  /** Set total */
  setTotal: (total: number) => void;
  
  /** Reset state */
  reset: () => void;
  
  /** Get entity by ID */
  getEntity: (id: string | number) => T | undefined;
  
  /** Get selected entities */
  getSelected: () => T[];
}
