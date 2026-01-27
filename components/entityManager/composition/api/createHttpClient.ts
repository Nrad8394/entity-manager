/**
 * Create HTTP Client
 * 
 * Factory function to create API clients with automatic authentication.
 * Uses the connectionManager's authApi for all requests.
 */

import { ApiClient, ApiResponse, ListQueryParams } from './types';
import { BaseEntity } from '../../primitives/types';
import { authApi, handleApiError } from '@/components/connectionManager/http/client';
import axios, { AxiosError } from 'axios';
import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';

export interface HttpClientConfig {
  /** Base endpoint (e.g., '/api/v1/accounts/users/') */
  endpoint: string;

  /** Custom actions endpoints (optional) */
  customActions?: Record<string, string>;
}

/**
 * Convert data with file fields to FormData for multipart upload
 */
function convertToFormData(data: Record<string, unknown>): FormData | Record<string, unknown> {
  // Check if data contains any File objects
  const hasFiles = Object.values(data).some(value => value instanceof File);
  
  if (!hasFiles) {
    return data;
  }

  // Convert to FormData for multipart requests
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      // Skip null/undefined values
      return;
    }
    
    if (value instanceof File) {
      // Append File objects directly
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      // Handle arrays by appending each item
      value.forEach((item, index) => {
        if (item instanceof File) {
          formData.append(`${key}`, item);
        } else if (item !== null && item !== undefined) {
          formData.append(`${key}`, String(item));
        }
      });
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      // Convert objects to JSON strings (excluding Date objects)
      formData.append(key, JSON.stringify(value));
    } else {
      // Append primitive values
      formData.append(key, String(value));
    }
  });

  return formData;
}

/**
 * Build query params object for axios
 */
function buildQueryParams(params?: ListQueryParams): Record<string, unknown> {
  if (!params) return {};

  const queryParams: Record<string, unknown> = {};

  if (params.page) queryParams.page = params.page;
  if (params.pageSize) queryParams.page_size = params.pageSize;
  if (params.sortField) {
    queryParams.ordering = params.sortDirection === 'desc' ? `-${params.sortField}` : params.sortField;
  }
  if (params.search) {
    queryParams.search = params.search;
    console.log('🔎 SEARCH PARAM SET:', { search: params.search });
  }

  // Add filters with Django field lookup syntax
  if (params.filters) {
    params.filters.forEach(filter => {
      const { field, operator, value } = filter;
      if (value !== undefined && value !== null) {
        // Map filter operators to Django field lookups
        let filterKey = field;

        switch (operator) {
          case 'equals':
            filterKey = field; // exact match (default)
            break;
          case 'notEquals':
            filterKey = field; // will need to handle this differently
            break;
          case 'contains':
            filterKey = `${field}__icontains`; // case-insensitive contains
            break;
          case 'startsWith':
            filterKey = `${field}__istartswith`; // case-insensitive starts with
            break;
          case 'endsWith':
            filterKey = `${field}__iendswith`; // case-insensitive ends with
            break;
          case 'greaterThan':
            filterKey = `${field}__gt`;
            break;
          case 'greaterThanOrEqual':
            filterKey = `${field}__gte`;
            break;
          case 'lessThan':
            filterKey = `${field}__lt`;
            break;
          case 'lessThanOrEqual':
            filterKey = `${field}__lte`;
            break;
          case 'in':
            filterKey = `${field}__in`;
            break;
          case 'notIn':
            filterKey = field; // will need to handle this differently
            break;
          case 'isNull':
            filterKey = `${field}__isnull`;
            queryParams[filterKey] = true;
            return; // Skip setting value below
          case 'isNotNull':
            filterKey = `${field}__isnull`;
            queryParams[filterKey] = false;
            return; // Skip setting value below
          case 'between':
            // For between, we need two parameters
            if (Array.isArray(value) && value.length === 2) {
              queryParams[`${field}__gte`] = value[0];
              queryParams[`${field}__lte`] = value[1];
            }
            return;
          default:
            filterKey = field; // fallback to exact match
        }

        queryParams[filterKey] = value;
      }
    });
  }

  // Add any additional params
  Object.keys(params).forEach(key => {
    if (!['page', 'pageSize', 'sortField', 'sortDirection', 'search', 'filters'].includes(key)) {
      const value = params[key];
      if (value !== undefined && value !== null) {
        queryParams[key] = value;
      }
    }
  });

  return queryParams;
}

/**
 * Handle axios response and convert to ApiResponse format
 */
function handleAxiosResponse<T>(data: unknown): ApiResponse<T> {
  // Django REST Framework pagination response
  if (data && typeof data === 'object' && 'results' in data) {
    const paginatedData = data as { 
      results: T; 
      count?: number; 
      next?: string; 
      previous?: string;
      current_page?: number;
      page?: number;
      page_size?: number;
      pageSize?: number;
      total_pages?: number;
      totalPages?: number;
    };
    
    // Extract pagination metadata
    const currentPage = paginatedData.current_page || paginatedData.page || 1;
    const pageSize = paginatedData.page_size || paginatedData.pageSize || 10;
    const totalPages = paginatedData.total_pages || paginatedData.totalPages;
    const totalCount = paginatedData.count || 0;
    
    return {
      data: paginatedData.results,
      meta: {
        total: totalCount,
        page: currentPage,
        pageSize: pageSize,
        totalPages: totalPages,
        hasMore: !!paginatedData.next,
      },
    };
  }

  return {
    data: data as T,
  };
}

/**
 * Handle axios error and convert to ApiResponse format
 */
function handleAxiosError(error: unknown): never {
  // Prefer axios.isAxiosError to detect axios errors reliably
  if (axios.isAxiosError(error)) {
    handleApiError(error);
    throw error;
  }

  // If it's a generic Error, rethrow after logging
  if (error instanceof Error) {
    console.error('Non-axios error in HTTP client:', error);
    throw error;
  }

  throw new Error('An unknown error occurred');
}

/**
 * Create HTTP API Client
 * 
 * Factory function that creates a fully functional API client with authentication.
 * Supports CRUD, bulk operations and custom actions. Custom actions can now be
 * typed per-action using a mapping generic which makes `client.customAction(...)`
 * return a correctly typed `ApiResponse` for each action key.
 * 
 * Examples
 * ```typescript
 * // Basic (no special action types - actions default to returning the entity type)
 * const usersApiClient = createHttpClient<User>({
 *   endpoint: '/api/v1/accounts/users/',
 * });
 *
 * // With action-specific typing: map action keys to result types
 * const rolesClient = createHttpClient<UserRole, {
 *   users: User[];            // users action returns an array of User
 *   approve: User;            // approve returns the updated User
 * }>(
 *   {
 *     endpoint: '/api/v1/accounts/user-roles/',
 *     customActions: {
 *       users: 'users/',
 *       approve: 'approve/',
 *     }
 *   }
 * );
 *
 * // Calling a typed action
 * const usersRes = await rolesClient.customAction('role-id', 'users');
 * // usersRes.data is typed as User[]
 *
 * const approveRes = await rolesClient.customAction('user-id', 'approve');
 * // approveRes.data is typed as User
 * ```
 *
 * Notes:
 * - The `Actions` generic is a mapping from action key (string literal) to the
 *   expected response type. It improves compile-time safety but cannot
 *   validate runtime responses — the axios response is cast to the declared
 *   type.
 * - The optional `config.customActions` lets you provide the endpoint suffix
 *   used for each action (e.g. 'approve/'). Keys in `customActions` should
 *   match the keys declared in the `Actions` mapping.
 */
export function createHttpClient<
  T extends BaseEntity,
  Actions extends Record<string, unknown> = Record<string, T>
>(
  config: HttpClientConfig & { customActions?: Record<Extract<keyof Actions, string>, string> }
):
  ApiClient<T> & {
    customListAction: (action: string, config?: { method?: string; params?: Record<string, unknown>; data?: unknown }) => Promise<ApiResponse<any>>;
    customAction: <K extends Extract<keyof Actions, string>>(id: string | number, action: K, data?: unknown) => Promise<ApiResponse<Actions[K]>>;
    __endpoint?: string;
  } {
  const { endpoint } = config;

  return {
    // expose endpoint for react-query hook helpers
    __endpoint: endpoint,
    /**
     * List entities with pagination, filtering, and search
     */
    async list(params?: ListQueryParams): Promise<ApiResponse<T[]>> {
      try {
        const queryParams = buildQueryParams(params);
        const response = await authApi.get(endpoint, { params: queryParams });
        return handleAxiosResponse<T[]>(response.data);
      } catch (error) {
        return handleAxiosError(error);
      }
    },
    /**
     * Execute a list-level custom action (no entity id), e.g. GET /endpoint/upcoming/
     */
    async customListAction(action: string, config?: { method?: string; params?: Record<string, unknown>; data?: unknown }): Promise<ApiResponse<any>> {
      try {
        const method = (config?.method || 'GET').toUpperCase();
        const response = await authApi.request({
          url: `${endpoint}${action}/`,
          method,
          params: config?.params,
          data: config?.data,
        });
        return handleAxiosResponse<any>(response.data);
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    /**
     * Get single entity by ID
     */
    async get(id: string | number): Promise<ApiResponse<T>> {
      try {
        const response = await authApi.get(`${endpoint}${id}/`);
        return handleAxiosResponse<T>(response.data);
      } catch (error) {
        // If the resource is not found (404), return an empty ApiResponse
        // instead of throwing. This allows callers (and react-query hooks)
        // to gracefully handle missing resources without an exception.
        // Use axios.isAxiosError where possible, but also tolerate objects
        // that include a `response` property to catch wrapped/errors from
        // other layers.
        const is404 = (axios.isAxiosError(error) && error.response?.status === 404)
          || (error && typeof error === 'object' && 'response' in error && (error as any).response?.status === 404);

        if (is404) {
          return { data: undefined as unknown as T };
        }

        return handleAxiosError(error);
      }
    },

    /**
     * Create new entity
     */
    async create(data: Partial<T>): Promise<ApiResponse<T>> {
      try {
        const dataToSend = convertToFormData(data as Record<string, unknown>);
        const config = dataToSend instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        const response = await authApi.post(endpoint, dataToSend, config);
        return handleAxiosResponse<T>(response.data);
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    /**
     * Update existing entity
     */
    async update(id: string | number, data: Partial<T>): Promise<ApiResponse<T>> {
      try {
        const dataToSend = convertToFormData(data as Record<string, unknown>);
        const config = dataToSend instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        const response = await authApi.patch(`${endpoint}${id}/`, dataToSend, config);
        return handleAxiosResponse<T>(response.data);
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    /**
     * Delete entity
     */
    async delete(id: string | number): Promise<ApiResponse<void>> {
      try {
        await authApi.delete(`${endpoint}${id}/`);
        return { data: undefined as unknown as void };
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    /**
     * Bulk create entities
     */
    async bulkCreate(dataArray: Partial<T>[]): Promise<ApiResponse<T[]>> {
      try {
        const response = await authApi.post(`${endpoint}bulk_create/`, { items: dataArray });
        return handleAxiosResponse<T[]>(response.data);
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    /**
     * Bulk update entities
     */
    async bulkUpdate(updates: Array<{ id: string | number; data: Partial<T> }>): Promise<ApiResponse<T[]>> {
      try {
        const response = await authApi.post(`${endpoint}bulk_update/`, { updates });
        return handleAxiosResponse<T[]>(response.data);
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    /**
     * Bulk delete entities
     */
    async bulkDelete(ids: Array<string | number>): Promise<ApiResponse<void>> {
      try {
        await authApi.post(`${endpoint}bulk_delete/`, { ids });
        return { data: undefined as unknown as void };
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    /**
     * Bulk import from CSV or Excel file
     */
    async bulkImport(file: File, options?: { preview?: boolean }): Promise<ApiResponse<{ imported: number; errors: string[]; preview?: boolean; results?: any[] }>> {
      try {
        const fd = new FormData();
        fd.append('file', file);
        if (options?.preview) {
          fd.append('preview', 'true');
        }
        // Let axios set the Content-Type (including boundary) automatically when sending FormData
        const response = await authApi.post(`${endpoint}bulk_import/`, fd);

        // The bulk import endpoint returns a wrapper object with { imported, errors, preview, total_rows, results }
        // We must return that raw payload so callers (preview flow) can read `preview` and `results` fields.
        return { data: response.data } as ApiResponse<any>;
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    /**
     * Download a bulk import template (CSV or XLSX) as Blob
     */
    async bulkImportTemplate(export_format: 'csv' | 'xlsx') {
      try {
        const response = await authApi.get(`${endpoint}bulk_import_template/`, { params: { export_format }, responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        return new Blob([response.data], { type: contentType });
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    /**
     * Export entities via backend (returns Blob)
     */
    async bulkExport(params?: { fields?: string[]; file_format?: 'csv' | 'xlsx' }) {
      try {
        const query: Record<string, unknown> = {};
        if (params?.fields) query.fields = params.fields.join(',');
        if (params?.file_format) query.file_format = params.file_format;
        const response = await authApi.get(`${endpoint}bulk_export/`, { params: query, responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        return new Blob([response.data], { type: contentType });
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    /**
     * Execute custom action on entity
     * 
     * @example
     * ```typescript
     * // Approve user
     * await client.customAction(userId, 'approve');
     * 
     * // Change role
     * await client.customAction(userId, 'change_role', { role: 'admin' });
     * ```
     */
    async customAction<K extends Extract<keyof Actions, string>>(id: string | number, action: K, data?: unknown): Promise<ApiResponse<Actions[K]>> {
      try {
        const response = await authApi.post(`${endpoint}${id}/${String(action)}/`, data);
        // Convert response to ApiResponse typed to the action's expected type
        return handleAxiosResponse<Actions[K]>(response.data) as ApiResponse<Actions[K]>;
      } catch (error) {
        return handleAxiosError(error);
      }
    },
  };
}

/**
 * Create React Query hooks bound to a client instance.
 *
 * Usage:
 * const hooks = createReactQueryHooks(usersClient);
 * const { useList, useGet, useCreate, useUpdate, useDelete, useCustomAction } = hooks;
 */
export function createReactQueryHooks<
  T extends BaseEntity,
  Actions extends Record<string, unknown> = Record<string, T>
>(client: ApiClient<T> & { customAction: <K extends Extract<keyof Actions, string>>(id: string | number, action: K, data?: unknown) => Promise<ApiResponse<Actions[K]>>; __endpoint?: string }) {
  const endpoint = client.__endpoint || 'api';

  function useList(params?: ListQueryParams, options?: any) {
    return useQuery<ApiResponse<T[]>>({
      queryKey: [endpoint, 'list', params],
      queryFn: async () => {
        const res = await client.list(params);
        return res as ApiResponse<T[]>;
      },
      ...(options || {}),
    } as any);
  }

  function useGet(id: string | number | undefined, options?: any) {
    return useQuery<ApiResponse<T>>({
      queryKey: [endpoint, 'get', id],
      queryFn: async () => {
        const res = await client.get(id as string | number);
        return res as ApiResponse<T>;
      },
      enabled: !!id,
      ...(options || {}),
    } as any);
  }

  function useCreate(options?: UseMutationOptions<ApiResponse<T>, Error, Partial<T>, unknown>) {
    const qc = useQueryClient();
    const restOptions = { ...(options || {}) } as UseMutationOptions<ApiResponse<T>, Error, Partial<T>, unknown>;
    const originalOnSuccess = options?.onSuccess;
    return useMutation<ApiResponse<T>, Error, Partial<T>, unknown>({
      mutationFn: (data) => client.create(data),
      onSuccess: (data, variables, context, mutation) => {
        // Invalidate only the list queries for this endpoint, preserving page/filter params
        qc.invalidateQueries({ queryKey: [endpoint, 'list'] });
        if (originalOnSuccess) originalOnSuccess(data, variables, context, mutation);
      },
      ...restOptions,
    });
  }

  function useUpdate(options?: UseMutationOptions<ApiResponse<T>, Error, { id: string | number; data: Partial<T> }, unknown>) {
    const qc = useQueryClient();
    const restOptions = { ...(options || {}) } as UseMutationOptions<ApiResponse<T>, Error, { id: string | number; data: Partial<T> }, unknown>;
    const originalOnSuccess = options?.onSuccess;
    return useMutation<ApiResponse<T>, Error, { id: string | number; data: Partial<T> }, unknown>({
      mutationFn: (payload) => client.update(payload.id, payload.data),
      onSuccess: (data, variables, context, mutation) => {
        // Invalidate only the specific item being updated and list queries
        qc.invalidateQueries({ queryKey: [endpoint, 'get', variables.id] });
        qc.invalidateQueries({ queryKey: [endpoint, 'list'] });
        if (originalOnSuccess) originalOnSuccess(data, variables, context, mutation);
      },
      ...restOptions,
    });
  }

  function useDelete(options?: UseMutationOptions<ApiResponse<void>, Error, string | number, unknown>) {
    const qc = useQueryClient();
    const restOptions = { ...(options || {}) } as UseMutationOptions<ApiResponse<void>, Error, string | number, unknown>;
    const originalOnSuccess = options?.onSuccess;
    return useMutation<ApiResponse<void>, Error, string | number, unknown>({
      mutationFn: (id) => client.delete(id),
      onSuccess: (data, variables, context, mutation) => {
        // Invalidate the deleted item and list queries
        qc.invalidateQueries({ queryKey: [endpoint, 'get', variables] });
        qc.invalidateQueries({ queryKey: [endpoint, 'list'] });
        if (originalOnSuccess) originalOnSuccess(data, variables, context, mutation);
      },
      ...restOptions,
    });
  }

  function useCustomAction<K extends Extract<keyof Actions, string>>(action: K, options?: UseMutationOptions<ApiResponse<Actions[K]>, Error, { id: string | number; data?: unknown }, unknown>) {
    const qc = useQueryClient();
    const restOptions = { ...(options || {}) } as UseMutationOptions<ApiResponse<Actions[K]>, Error, { id: string | number; data?: unknown }, unknown>;
    const originalOnSuccess = options?.onSuccess;
    return useMutation<ApiResponse<Actions[K]>, Error, { id: string | number; data?: unknown }, unknown>({
      mutationFn: (payload) => client.customAction(payload.id, action, payload.data) as Promise<ApiResponse<Actions[K]>>,
      onSuccess: (data, variables, context, mutation) => {
        // Invalidate the affected item and list queries
        qc.invalidateQueries({ queryKey: [endpoint, 'get', variables.id] });
        qc.invalidateQueries({ queryKey: [endpoint, 'list'] });
        if (originalOnSuccess) originalOnSuccess(data, variables, context, mutation);
      },
      ...restOptions,
    });
  }

  return {
    useList,
    useGet,
    useCreate,
    useUpdate,
    useDelete,
    useCustomAction,
  };
}

/**
 * Create imperative helpers that use the shared queryClient for fetching data
 * outside React hooks (useful in non-component code or existing async helpers).
 */
import { queryClient } from '@/components/connectionManager/http/queryClient';

export function createReactQueryHelpers<
  T extends BaseEntity,
  Actions extends Record<string, unknown> = Record<string, T>
>(client: ApiClient<T> & { customAction?: (...args: any[]) => Promise<ApiResponse<any>>; __endpoint?: string }) {
  const endpoint = client.__endpoint || 'api';

  return {
    async fetchList(params?: ListQueryParams) {
      return queryClient.fetchQuery({ queryKey: [endpoint, 'list', params], queryFn: () => client.list(params) });
    },
    async fetchGet(id: string | number) {
      return queryClient.fetchQuery({ queryKey: [endpoint, 'get', id], queryFn: () => client.get(id) });
    },
    async fetchCustom<K extends Extract<keyof Actions, string>>(id: string | number, action: K, data?: unknown) {
      // Note: will not type the response strictly here; callers can cast
      return queryClient.fetchQuery({ queryKey: [endpoint, 'action', id, action], queryFn: () => client.customAction!(id, action, data) });
    }
  };
}
