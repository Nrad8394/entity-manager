/**
 * API Types
 * 
 * Core API request and response types.
 * 
 * @module primitives/types/api
 */

import { BaseEntity, PaginatedResponse, FilterConfig, SortConfig } from './entity';

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API endpoint configuration
 */
export interface ApiEndpoint {
  /** Endpoint URL */
  url: string;
  /** HTTP method */
  method: HttpMethod;
  /** Request headers */
  headers?: Record<string, string>;
}

/**
 * Entity endpoints configuration
 */
export interface EntityEndpoints {
  /** List/fetch all entities */
  list: string;
  /** Get single entity by ID */
  get?: string;
  /** Create new entity */
  create?: string;
  /** Update existing entity */
  update?: string;
  /** Delete entity */
  delete?: string;
  /** Bulk operations */
  bulk?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  /** Export endpoint */
  export?: string;
  /** Custom endpoints */
  custom?: Record<string, string>;
}

/**
 * API request configuration
 */
export interface ApiRequest {
  /** Request URL */
  url: string;
  /** HTTP method */
  method: HttpMethod;
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body */
  body?: unknown;
  /** Query parameters */
  params?: Record<string, string | number | boolean>;
  /** Request timeout (ms) */
  timeout?: number;
  /** Retry configuration */
  retry?: {
    attempts: number;
    delay: number;
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
  /** Sort configuration */
  sort?: SortConfig | SortConfig[];
  /** Filter configurations */
  filters?: FilterConfig[];
  /** Search query */
  search?: string;
  /** Fields to include in response */
  fields?: string[];
  /** Fields to expand/populate */
  expand?: string[];
}

/**
 * Create request body
 */
export interface CreateRequest<T extends BaseEntity = BaseEntity> {
  /** Entity data to create */
  data: Omit<T, 'id'>;
}

/**
 * Update request body
 */
export interface UpdateRequest<T extends BaseEntity = BaseEntity> {
  /** Entity ID */
  id: string | number;
  /** Entity data to update */
  data: Partial<Omit<T, 'id'>>;
}

/**
 * Delete request
 */
export interface DeleteRequest {
  /** Entity ID */
  id: string | number;
  /** Soft delete flag */
  soft?: boolean;
}

/**
 * Bulk create request
 */
export interface BulkCreateRequest<T extends BaseEntity = BaseEntity> {
  /** Entities to create */
  entities: Omit<T, 'id'>[];
}

/**
 * Bulk update request
 */
export interface BulkUpdateRequest<T extends BaseEntity = BaseEntity> {
  /** Entities to update */
  entities: { id: string | number; data: Partial<Omit<T, 'id'>> }[];
}

/**
 * Bulk delete request
 */
export interface BulkDeleteRequest {
  /** Entity IDs to delete */
  ids: (string | number)[];
  /** Soft delete flag */
  soft?: boolean;
}

/**
 * Export request configuration
 */
export interface ExportRequest {
  /** Export format */
  format: 'csv' | 'json' | 'xlsx';
  /** Fields to export */
  fields?: string[];
  /** Filters to apply */
  filters?: FilterConfig[];
  /** File name */
  fileName?: string;
}

/**
 * API error
 */
export interface ApiError {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** HTTP status code */
  status?: number;
  /** Error details */
  details?: unknown;
  /** Field-specific errors */
  fieldErrors?: Record<string, string[]>;
}

/**
 * API mutation result
 */
export interface MutationResult<T = unknown> {
  /** Whether mutation was successful */
  success: boolean;
  /** Result data */
  data?: T;
  /** Error if mutation failed */
  error?: ApiError;
  /** Result message */
  message?: string;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Whether to enable caching */
  enabled: boolean;
  /** Cache TTL in milliseconds */
  ttl: number;
  /** Cache key prefix */
  keyPrefix?: string;
  /** Cache storage type */
  storage?: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
}
