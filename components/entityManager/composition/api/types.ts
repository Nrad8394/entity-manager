/**
 * Entity API Types
 * 
 * Type definitions for API integration.
 */

import { BaseEntity, FilterConfig } from '../../primitives/types';

/**
 * API response
 */
export interface ApiResponse<T = unknown> {
  /** Response data */
  data: T;

  /** Response metadata */
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
    hasMore?: boolean;
  };

  /** Response error */
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

/**
 * List query parameters
 */
export interface ListQueryParams {
  /** Page number */
  page?: number;

  /** Page size */
  pageSize?: number;

  /** Sort field */
  sortField?: string;

  /** Sort direction */
  sortDirection?: 'asc' | 'desc';

  /** Filters */
  filters?: FilterConfig[];

  /** Search query */
  search?: string;

  /** Additional params */
  [key: string]: unknown;
}

/**
 * API client interface
 */
export interface ApiClient<T extends BaseEntity = BaseEntity> {
  /** List entities - supports either new ApiResponse<T[]> shape or legacy { results, count } shape */
  list(params?: ListQueryParams): Promise<ApiResponse<T[]> | { results: T[]; count: number }>;

  /** Get single entity */
  get(id: string | number): Promise<ApiResponse<T>>;

  /** Create entity */
  create(data: Partial<T>): Promise<ApiResponse<T>>;

  /** Update entity */
  update(id: string | number, data: Partial<T>): Promise<ApiResponse<T>>;

  /** Delete entity */
  delete(id: string | number): Promise<ApiResponse<void>>;

  /** Bulk operations */
  bulkCreate?(data: Partial<T>[]): Promise<ApiResponse<T[]>>;
  bulkUpdate?(updates: Array<{ id: string | number; data: Partial<T> }>): Promise<ApiResponse<T[]>>;
  bulkDelete?(ids: Array<string | number>): Promise<ApiResponse<void>>;
  /** Bulk import from file (CSV/XLSX) - returns import summary */
  bulkImport?: (file: File, options?: { preview?: boolean }) => Promise<ApiResponse<{ imported: number; errors: string[]; preview?: boolean; results?: any[] }>>;
  /** Downloadable import template (CSV/XLSX) - returns raw blob */
  bulkImportTemplate?: (format: 'csv' | 'xlsx') => Promise<Blob>;
  /** Bulk export - returns raw blob (CSV/XLSX) */
  bulkExport?: (params?: { fields?: string[]; file_format?: 'csv' | 'xlsx' }) => Promise<Blob>;
}

/**
 * Request config
 */
export interface RequestConfig {
  /** Request headers */
  headers?: Record<string, string>;

  /** Request timeout */
  timeout?: number;

  /** Retry config */
  retry?: {
    count: number;
    delay: number;
  };

  /** Cache config */
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}

/**
 * Entity API provider props
 */
export interface EntityApiProviderProps<T extends BaseEntity = BaseEntity> {
  /** API client */
  client: ApiClient<T>;

  /** Request config */
  config?: RequestConfig;

  /** Children */
  children: React.ReactNode;
}

/**
 * Use entity API return type
 */
export interface UseEntityApiReturn<T extends BaseEntity = BaseEntity> {
  /** List entities */
  list: (params?: ListQueryParams) => Promise<T[]>;

  /** Get single entity */
  get: (id: string | number) => Promise<T>;

  /** Refresh data */
  refresh: () => Promise<void>;

  /** Loading state */
  loading: boolean;

  /** Error state */
  error: Error | null;

  /** Data */
  data: T[] | null;

  /** Total count */
  total: number | null;
}

/**
 * Use entity mutations return type
 */
export interface UseEntityMutationsReturn<T extends BaseEntity = BaseEntity> {
  /** Create entity */
  create: (data: Partial<T>) => Promise<T>;

  /** Update entity */
  update: (id: string | number, data: Partial<T>) => Promise<T>;

  /** Delete entity */
  delete: (id: string | number) => Promise<void>;

  /** Bulk create */
  bulkCreate: (data: Partial<T>[]) => Promise<T[]>;

  /** Bulk update */
  bulkUpdate: (updates: Array<{ id: string | number; data: Partial<T> }>) => Promise<T[]>;

  /** Bulk delete */
  bulkDelete: (ids: Array<string | number>) => Promise<void>;

  /** Loading state */
  loading: boolean;

  /** Error state */
  error: Error | null;
}

/**
 * API context value
 */
export interface EntityApiContextValue<T extends BaseEntity = BaseEntity> {
  /** API client */
  client: ApiClient<T>;

  /** Request config */
  config?: RequestConfig;
}
