/**
 * Entity Manager Orchestrator
 * 
 * Thin orchestrator that coordinates all components.
 * Maximum ~150 lines - all logic delegated to hooks and components.
 */

'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BaseEntity, FilterConfig, SortConfig } from '../primitives/types';
import { EntityManagerProps, EntityManagerView } from './types';
import { EntityList } from '../components/list';
import { EntityForm } from '../components/form';
import { EntityView } from '../components/view';
import { EntityStateProvider, useEntityState } from '../composition/exports';
import { EntityApiProvider, useEntityMutations } from '../composition/exports';
import { createReactQueryHooks } from '../composition/api/createHttpClient';
import { FormMode } from '../components/form/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import EntityImporter from '@/components/entityManager/components/importer/EntityImporter';
import { usePermissions } from '@/hooks/use-permissions';

/**
 * Build query parameters for API calls
 */
function buildQueryParams(
  page: number,
  pageSize: number,
  sort: SortConfig | null,
  search: string,
  filters: FilterConfig[]
): Record<string, unknown> {
  const queryParams: Record<string, unknown> = {
    page,
    pageSize,
  };

  if (sort) {
    queryParams.sortField = sort.field;
    queryParams.sortDirection = sort.direction;
  }

  if (search) {
    queryParams.search = search;
  }

  if (filters && filters.length > 0) {
    queryParams.filters = filters;
  }

  return queryParams;
}

/**
 * Parse error message from unknown error
 */
function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return defaultMessage;
}

/**
 * Entity Manager Content (with hooks)
 */
function EntityManagerContent<T extends BaseEntity = BaseEntity>(
  props: EntityManagerProps<T>
) {
  const { config: rawConfig } = props;

  // Normalize legacy/compact config shapes into canonical EntityManagerConfig
  const normalizedConfig = React.useMemo(() => {
    const raw = rawConfig as any;
    const base = { ...raw } as any;

    const entity = base.config || {};

    const normalizedEntity: any = {
      name: entity.name || entity.entityName || entity.label || 'Entity',
      primaryKeyField: entity.primaryKeyField || 'id',
      label: entity.label || entity.entityName || entity.name || 'Entity',
      labelPlural: entity.labelPlural || entity.entityNamePlural || entity.pluralName || `${entity.name || entity.entityName || 'Entities'}`,
      description: entity.description,
      apiEndpoint: entity.apiEndpoint || entity.api || undefined,
      permissions: entity.permissions,
      metadata: entity.metadata,
      icon: entity.icon,
    };

    // Normalize list
    const list = entity.list ?? entity.columns ?? entity.listConfig ?? entity.listColumns;
    if (Array.isArray(list)) {
      normalizedEntity.list = { columns: list };
    } else {
      normalizedEntity.list = list || { columns: [] };
    }

    // Normalize view
    const view = entity.view ?? entity.viewFields ?? entity.viewConfig;
    if (Array.isArray(view)) {
      normalizedEntity.view = { fields: view };
    } else {
      normalizedEntity.view = view || { fields: [] };
    }

    // Normalize form fields
    normalizedEntity.form = entity.form ?? { fields: entity.fields ?? [] };

    // Normalize actions
    const actions = entity.actions ?? entity.actionConfig ?? {};
    if (Array.isArray(actions)) {
      normalizedEntity.actions = { actions };
    } else if (actions.actions || actions.row || actions.bulk) {
      normalizedEntity.actions = {
        actions: actions.actions || actions.row || [],
        bulk: actions.bulk || [],
      };
    } else {
      normalizedEntity.actions = actions;
    }

    // Normalize exporter
    const exporter = entity.exporter ?? entity.export ?? entity.exportConfig;
    if (Array.isArray(exporter)) {
      normalizedEntity.exporter = { fields: exporter };
    } else {
      normalizedEntity.exporter = exporter || { fields: [] };
    }

    return { ...base, config: normalizedEntity } as typeof rawConfig;
  }, [rawConfig]);

  // Use normalized config in place of raw config
  const config = normalizedConfig as typeof rawConfig;

  // Permissions hook (gives current user's permissions and helpers)
  const permissionsHook = usePermissions();

  // Resolve entity-level permission specs (which can be boolean, string, or string[])
  const resolvedPermissions = useMemo(() => {
    const spec = config.config.permissions || {};
    const resolve = (v: any, actionKey: 'create' | 'read' | 'update' | 'delete' | 'export') => {
      // If unspecified, default to allow (backwards compatibility)
      if (v === undefined) return true;

      // If boolean: interpret `true` as "require the user's entity-level permission"
      // and `false` as explicitly denied.
      if (typeof v === 'boolean') {
        return v;
      }

      // If a string or array, treat as permission codename(s)
      if (typeof v === 'string') return permissionsHook.hasPermission(v);
      if (Array.isArray(v)) return v.every((p: string) => permissionsHook.hasPermission(p));
      return Boolean(v);
    };

    return {
      create: resolve(spec.create, 'create'),
      read: resolve(spec.read, 'read'),
      update: resolve(spec.update, 'update'),
      delete: resolve(spec.delete, 'delete'),
      export: resolve(spec.export, 'export'),
    };
  }, [config.config.permissions, permissionsHook]);

  // Use initialView/initialId from config or props (props take precedence)
  const initialViewToUse = config.initialView ?? 'list';
  const initialIdToUse = config.initialId;
  const onViewChangeToUse = config.onViewChange;

  const [view, setView] = useState<EntityManagerView>(initialViewToUse);
  const [selectedId, setSelectedId] = useState<string | number | null>(initialIdToUse || null);
  const fetchAttempted = useRef(false);
  const initialListFetchCompleted = useRef(false);

  const state = useEntityState<T>();
  const mutations = useEntityMutations<T>();

  // Create react-query hooks bound to the provided API client when available.
  // We keep calling the factory here (it's lightweight) so hooks are available
  // to useQuery/useMutation consumers below. If no client is provided, hooks
  // will be null and we fallback to imperative client calls.
  const rq = config.apiClient ? createReactQueryHooks<T, any>(config.apiClient as any) : null;

  // Memoize pagination config to prevent unnecessary re-renders
  const memoizedPaginationConfig = useMemo(() => ({
    ...config.config.list.paginationConfig,
    page: state.state.page,
    pageSize: state.state.pageSize,
    totalCount: state.state.total
  }), [config.config.list.paginationConfig, state.state.page, state.state.pageSize, state.state.total]);

  // Build a stable queryParams object used for react-query hooks when available
  const currentQueryParams = useMemo(() => {
    const params = buildQueryParams(state.state.page, state.state.pageSize, state.state.sort ?? null, state.state.search, state.state.filters);
    if (state.state.search) {
      console.log('🔍 currentQueryParams updated with search:', { search: state.state.search, params });
    }
    return params;
  }, [state.state.page, state.state.pageSize, state.state.sort, state.state.search, state.state.filters]);

  // Helper to normalize entity id from common shapes (id, pk, uuid, slug)
  const normalizeEntity = useCallback((e: any) => {
    if (!e) return e;
    const id = e.id ?? e.pk ?? e.uuid ?? e.slug ?? e.name ?? e.pk_id;
    return { ...e, id };
  }, []);

  // Bind react-query list/get hooks at top level (hooks must be called unconditionally)
  const listQuery = rq ? rq.useList(currentQueryParams, { enabled: false }) : null;
  const getQuery = rq ? rq.useGet(selectedId ?? undefined, { enabled: false }) : null;

  // Watch for initialView and initialId changes from parent
  useEffect(() => {
    setView(initialViewToUse);

    if (initialViewToUse === 'list') {
      setSelectedId(null);
    } else if (initialIdToUse !== undefined && initialIdToUse !== null) {
      setSelectedId(initialIdToUse);
    }

    // Reset fetch flag when view changes to allow refetching if needed
    if (initialViewToUse !== 'list') {
      fetchAttempted.current = false;
    }
  }, [initialViewToUse, initialIdToUse]);

  /**
   * Fetch entities from API with given parameters
   */
  const fetchEntities = useCallback(async (
    page: number,
    pageSize: number,
    sort: SortConfig | null,
    search: string,
    filters: FilterConfig[]
  ) => {
    if (!config.apiClient) return;

    state.setLoading(true);
    const queryParams = buildQueryParams(page, pageSize, sort, search, filters);
    console.log('🌐 fetchEntities called with page:', page, 'buildQueryParams result:', queryParams);

    try {
      // Always use the imperative API client to ensure pagination params are passed correctly
      // React-query's refetch() doesn't support passing new parameters, so we use apiClient directly
      const response = await config.apiClient.list(queryParams as Parameters<typeof config.apiClient.list>[0]) as any;
      console.log('✨ API Response received:', response);
      // Normalize legacy DRF responses if necessary
      const normalized = ((): { data: any[]; meta?: { total?: number; page?: number; pageSize?: number } } => {
        if (response && typeof response === 'object') {
          if ('data' in response) {
            const dataValue = Array.isArray(response.data) ? response.data : [];
            return { data: dataValue, meta: response.meta };
          }
          if ('results' in response) {
            const resultsValue = Array.isArray(response.results) ? response.results : [];
            return { data: resultsValue, meta: { total: response.count ?? resultsValue.length, page: response.current_page || response.page, pageSize: response.page_size || response.pageSize } };
          }
        }
        return { data: Array.isArray(response) ? response : [] };
      })();

      console.log('📊 Normalized data:', { dataLength: normalized.data.length, meta: normalized.meta });
      const data = Array.isArray(normalized.data) ? normalized.data.map(normalizeEntity) : [];
      state.setEntities(data as T[]);
      if (normalized.meta?.total !== undefined) {
        state.setTotal(normalized.meta.total);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to load data');
      console.error('❌ fetchEntities error:', errorMessage, error);
      state.setError(errorMessage);
    } finally {
      state.setLoading(false);
    }
  }, [config, state, normalizeEntity]);

  /**
   * Fetch a single entity by ID
   */
  const fetchSingleEntity = useCallback(async (id: string | number, merge = false) => {
    if (!config.apiClient) return;

    state.setLoading(true);

    try {
      // Always use the imperative API client with the provided id. The
      // react-query `get` hook (getQuery) is bound to `selectedId` when it
      // was created and may hold a stale/undefined id. Using the client
      // directly ensures we request the correct resource URL for the
      // id passed into this function.
      const response = await config.apiClient.get(id) as any;
      const entity = normalizeEntity(('data' in response) ? response.data : response);

      if (merge) {
        state.updateEntity(entity);
      } else {
        state.setEntities([entity]);
        state.setTotal(1);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to load entity');
      state.setError(errorMessage);
    } finally {
      state.setLoading(false);
    }
  }, [config.apiClient, state, normalizeEntity]);

  // Auto-fetch data on mount if API client is available
  useEffect(() => {
    if (!config.apiClient || fetchAttempted.current) {
      // If no API client or fetch already attempted, mark as completed to allow filter/sort changes
      initialListFetchCompleted.current = true;
      return;
    }

    fetchAttempted.current = true;

    // If starting in edit/view mode with an ID, fetch that specific entity
    if ((initialViewToUse === 'edit' || initialViewToUse === 'view') && initialIdToUse) {
      initialListFetchCompleted.current = true;
      fetchSingleEntity(initialIdToUse);
    }
    // If starting in list mode with an initial ID, fetch only that entity
    else if (initialViewToUse === 'list' && initialIdToUse) {
      fetchSingleEntity(initialIdToUse).then(() => {
        initialListFetchCompleted.current = true;
      });
    }
    // If starting in list mode or create mode, fetch all entities
    else if (initialViewToUse === 'list' || initialViewToUse === 'create') {
      const { page, pageSize, sort, search, filters } = state.state;
      fetchEntities(page, pageSize, sort ?? null, search, filters).then(() => {
        initialListFetchCompleted.current = true;
      });
    }
    else {
      // No initial fetch needed (e.g., initialData provided), mark as completed
      initialListFetchCompleted.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.apiClient, initialViewToUse, initialIdToUse]);

  // Use refs to track previous filters/search/sort to avoid unnecessary refetches
  const prevFiltersKeyRef = useRef<string>('');
  const prevFiltersObjectRef = useRef<FilterConfig[]>([]);
  const stableFilters = useMemo(() => {
    const filtersJson = JSON.stringify(state.state.filters);
    // If key matches previous key, return the same object reference to avoid re-renders
    if (filtersJson === prevFiltersKeyRef.current) {
      return prevFiltersObjectRef.current;
    }
    // Otherwise return the new filters (do not mutate prevFiltersKeyRef here - update after fetch)
    return state.state.filters;
  }, [state.state.filters]);

  // Refetch data when sorting, search, or filters change (but not pagination, handled directly)
  // Track previous values to prevent unnecessary refetches
  const prevSortRef = useRef<string | null>(null);
  const prevSearchRef = useRef<string>('');
  const searchDebounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!config.apiClient || view !== 'list') return;
    if (!initialListFetchCompleted.current) return;

    const { page, pageSize, sort, search } = state.state;

    const sortKey = sort ? `${sort.field}-${sort.direction}` : null;
    const filtersKey = JSON.stringify(state.state.filters);

    const sortChanged = sortKey !== prevSortRef.current;
    const searchChanged = search !== prevSearchRef.current;
    const filtersChanged = filtersKey !== prevFiltersKeyRef.current;

    console.log('🔍 Search effect triggered:', { search, searchChanged, prevSearch: prevSearchRef.current, sortChanged, filtersChanged });

    // If nothing changed, skip
    if (!sortChanged && !searchChanged && !filtersChanged) {
      console.log('⏭️ No changes detected, skipping fetch');
      return;
    }

    // If search changed but filters/sort did not, debounce the search to avoid rapid requests
    if (searchChanged && !sortChanged && !filtersChanged) {
      console.log('⏳ SEARCH CHANGED - DEBOUNCING for 350ms. New search value:', search);
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      searchDebounceRef.current = window.setTimeout(() => {
        console.log('⏰ DEBOUNCE FIRED - NOW FETCHING with search:', search);
        prevSearchRef.current = search;
        prevFiltersKeyRef.current = filtersKey;
        prevFiltersObjectRef.current = state.state.filters;
        prevSortRef.current = sortKey;
        fetchEntities(page, pageSize, sort ?? null, search, state.state.filters);
        searchDebounceRef.current = null;
      }, 350);
      return;
    }

    // Immediate fetch for sort or filters changes
    console.log('⚡ SORT OR FILTER CHANGED - IMMEDIATE FETCH');
    prevSortRef.current = sortKey;
    prevSearchRef.current = search;
    prevFiltersKeyRef.current = filtersKey;
    prevFiltersObjectRef.current = state.state.filters;

    fetchEntities(page, pageSize, sort ?? null, search, stableFilters);
    // Using specific state properties to prevent infinite loop - state.state changes on every update
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
    };
  }, [config.apiClient, view, state.state.sort, state.state.search, state.state.page, state.state.pageSize, stableFilters, fetchEntities]);

  // listen for view change and call onviewchange callback
  useEffect(() => {
    onViewChangeToUse?.(view);
  }, [view, onViewChangeToUse]);

  // Get selected entity
  const selectedEntity = selectedId ? state.getEntity(selectedId) : undefined;

  // Refresh function for actions
  const refreshData = useCallback(async () => {
    if (!config.apiClient || view !== 'list') return;

    const { page, pageSize, sort, search } = state.state;
    await fetchEntities(page, pageSize, sort ?? null, search, stableFilters);
    // Using specific state properties to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.apiClient, view, state.state.page, state.state.pageSize, state.state.sort, state.state.search, stableFilters, fetchEntities]);

  // Memoize actions with context to prevent re-renders
  const actionsWithContext = useMemo(() => {
    if (!config.config.actions) return undefined;
    // Clone actions to avoid mutating original config
    const raw = config.config.actions as any;
    const clone: any = { ...(raw as any) };

    // Helper to infer required entity-level permission for actions that don't declare action-level permissions
    const inferEntityRequirement = (action: any): { require?: 'create'|'read'|'update'|'delete'|'export' } => {
      // If action explicitly declares a permission, don't infer
      if (action.permission || (Array.isArray(action.permissions) && action.permissions.length > 0)) return {};
      const id = String(action.id || '').toLowerCase();
      const label = String(action.label || '').toLowerCase();
      if (id.includes('delete') || label.includes('delete') || action.variant === 'destructive') return { require: 'delete' };
      if (id.includes('export') || label.includes('export')) return { require: 'export' };
      if (id.includes('create') || label.includes('create') || id.includes('add')) return { require: 'create' };
      return {};
    };

    // Filter helper applying resolved entity permissions
    const filterArray = (arr: any[] | undefined) => {
      if (!Array.isArray(arr)) return arr;
      return arr.filter(a => {
        const inferred = inferEntityRequirement(a);
        if (inferred.require) {
          return Boolean(resolvedPermissions[inferred.require]);
        }
        return true;
      });
    };

    // Support both normalized `actions.actions` and legacy { row, bulk } shapes
    const normalizedActions = Array.isArray(raw.actions) ? raw.actions : (Array.isArray(raw.row) ? raw.row : []);
    const normalizedBulk = Array.isArray(raw.bulk) ? raw.bulk : [];

    const filteredActions = filterArray(normalizedActions);
    const filteredBulk = filterArray(normalizedBulk);

    return {
      ...raw,
      actions: filteredActions,
      bulk: filteredBulk,
      context: {
        ...raw.context,
        refresh: refreshData,
        customData: {
          allData: state.state.entities, // Pass all data for export
        },
        // Permissions context: provide current user's permission codenames to action handlers
        permissions: permissionsHook.userPermissions,
        // Also include resolved entity-level permissions for action handlers
        entityPermissions: resolvedPermissions,
      },
    };
  }, [config.config.actions, refreshData, state.state.entities, permissionsHook.userPermissions, resolvedPermissions]);

  // Importer modal state
  const [importerOpen, setImporterOpen] = React.useState(false);

  // Helper to download blob
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // Build default toolbar actions (Import / Template / Export) when apiClient exists
  const toolbarActionsNode = useMemo(() => {
    if (!config.apiClient) return null;

    // Template download is handled inside the Importer modal

    const handleExport = async (format: 'csv' | 'xlsx' = 'csv') => {
      try {
        // Normalize exporter fields: support strings or column objects
        const rawFields = config.config.exporter?.fields ?? undefined;
        const fields = rawFields ? rawFields.map((f: any) => {
          if (typeof f === 'string') return f;
          if (f == null) return String(f);
          // Prefer `key`, then `name`, then `field`
          if (typeof f === 'object') return String(f.key ?? f.name ?? f.field ?? f.value ?? JSON.stringify(f));
          return String(f);
        }) : undefined;

        const blob = await config.apiClient!.bulkExport!({ fields, file_format: format });
        const baseName = config.config.label || config.config.name || 'export';
        const fname = `${baseName}_Export.${format === 'csv' ? 'csv' : 'xlsx'}`;
        downloadBlob(blob, fname);
        toast.success('Export started');
      } catch (err) {
        toast.error('Export failed');
      }
    };

    return (
      <div className="flex items-center gap-2">
        {resolvedPermissions.create && (
          <Button variant="outline" size="sm" onClick={() => setImporterOpen(true)}>Import</Button>
        )}
        {resolvedPermissions.export && (
          <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}>Export (xlsx)</Button>
        )}
      </div>
    );
  }, [config.apiClient, config.config.name, config.config.exporter, resolvedPermissions, config.config.label]);

  // Handle edit
  const handleEdit = useCallback((entity: T) => {
    // Respect entity-level update permission
    if (!resolvedPermissions.update) {
      toast.error('You do not have permission to edit this item');
      return;
    }
    setView('edit');
    setSelectedId(entity[config.config.primaryKeyField || 'id']);
    fetchSingleEntity(entity[config.config.primaryKeyField || 'id'], true);
  }, [fetchSingleEntity, resolvedPermissions]);

  // Handle view
  const handleView = useCallback((entity: T) => {
    // Respect entity-level read permission
    if (!resolvedPermissions.read) {
      toast.error('You do not have permission to view this item');
      return;
    }
    setView('view');
    setSelectedId(entity[config.config.primaryKeyField || 'id']);
    fetchSingleEntity(entity[config.config.primaryKeyField || 'id'], true);
  }, [fetchSingleEntity, resolvedPermissions]);

  // Handle back to list
  const handleBack = useCallback(() => {
    setView('list');
    setSelectedId(null);
  }, []);

  // Handle form submit
  const handleSubmit = useCallback(async (values: Record<string, unknown>) => {
    try {
      if (view === 'create') {
        const created = await mutations.create(values as Partial<T>);
        state.addEntity(created);
        toast.success('Created successfully');
      } else if (view === 'edit' && selectedId) {
        const updated = await mutations.update(selectedId, values as Partial<T>);
        state.updateEntity(updated);
        toast.success('Updated successfully');
      }
      handleBack();
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Operation failed');
      state.setError(errorMessage);
    }
  }, [view, selectedId, mutations, state, handleBack]);

  // Handle pagination change
  const handlePaginationChange = useCallback(async (paginationConfig: { page?: number; pageSize?: number }) => {
    const newPage = paginationConfig.page || 1;
    const newPageSize = paginationConfig.pageSize || state.state.pageSize;

    // Update page first
    state.setPage(newPage);
    
    // Only update page size if it changed
    if (newPageSize !== state.state.pageSize) {
      state.setPageSize(newPageSize);
    }

    // Trigger API call directly
    if (config.apiClient && view === 'list') {
      const { sort, search, filters } = state.state;
      await fetchEntities(newPage, newPageSize, sort ?? null, search, filters);
    }
  }, [config.apiClient, view, state, fetchEntities]);

  // Render breadcrumbs
  const renderBreadcrumbs = () => {
    return (
      <nav className="flex mb-3 sm:mb-4 text-xs sm:text-sm overflow-x-auto" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 min-w-max px-1">
          <li className="inline-flex items-center">
            <button
              onClick={handleBack}
              className={`inline-flex items-center font-medium transition-colors ${view === 'list'
                ? 'text-primary cursor-default'
                : 'text-muted-foreground hover:text-primary'
                }`}
              disabled={view === 'list'}
              aria-current={view === 'list' ? 'page' : undefined}
            >
              {config.config.name || 'Items'}
            </button>
          </li>
          {view !== 'list' && (
            <>
              <li aria-hidden="true">
                <div className="flex items-center">
                  <svg
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground mx-1"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                </div>
              </li>
              <li>
                <span className="ml-0.5 sm:ml-1 font-medium text-primary">
                  {view === 'create' && 'Create New'}
                  {view === 'edit' && 'Edit'}
                  {view === 'view' && 'View Details'}
                </span>
              </li>
            </>
          )}
        </ol>
      </nav>
    );
  };

  // Render list view
  if (view === 'list') {
    return (
      <div className="space-y-4">
        {renderBreadcrumbs()}
        <>
          <EntityList
            data={state.state.entities}
            columns={config.config.list.columns}
            view="table"
            toolbar={{
              ...(config.config.list.toolbar || {}), actions: (
                <>
                  {config.config.list.toolbar?.actions}
                  {toolbarActionsNode}
                </>
              )
            }}
            selectable={config.config.list.selectable}
            multiSelect={config.config.list.multiSelect}
            selectedIds={state.state.selectedIds}
            onSelectionChange={state.setSelected}
            onRowClick={config.config.list.onRowClick || handleView}
            onRowDoubleClick={config.config.list.onRowDoubleClick || handleEdit}
            pagination={true}
            paginationConfig={memoizedPaginationConfig}
            onPaginationChange={handlePaginationChange}
            sortable={config.config.list.sortable}
            sortConfig={state.state.sort}
            onSortChange={state.setSort}
            filterable={config.config.list.filterable}
            filterConfigs={state.state.filters}
            onFilterChange={state.setFilters}
            searchable={config.config.list.searchable}
            searchValue={state.state.search}
            onSearchChange={state.setSearch}
            searchPlaceholder={config.config.list.searchPlaceholder}
            emptyMessage={config.config.list.emptyMessage}
            onCreate={() => {
              // Switch to create form when user clicks create from empty state
              setView('create');
              setSelectedId(null);
            }}
            loading={state.state.loading}
            error={state.state.error}
            actions={actionsWithContext}
            className={config.config.list.className}
            hover={config.config.list.hover}
            striped={config.config.list.striped}
            bordered={config.config.list.bordered}
            titleField={config.config.list.titleField}
            subtitleField={config.config.list.subtitleField}
            imageField={config.config.list.imageField}
            dateField={config.config.list.dateField}
          />
          {/* Importer modal */}
          {importerOpen && (
            <EntityImporter
              apiClient={config.apiClient}
              open={importerOpen}
              onClose={() => setImporterOpen(false)}
              entityName={config.config.label || config.config.name}
              onImported={async (summary) => {
                // Do NOT auto-close importer here — let the importer show the result step
                if (summary) {
                  // Show import result toast
                  toast.success(`Imported ${summary.imported} items`);
                  if (summary.errors && summary.errors.length > 0) {
                    toast.error(`${summary.errors.length} errors occurred during import`);
                    // Keep importer open so user can review errors in the result step
                    console.warn('Import errors:', summary.errors);
                  }
                  if (summary.imported > 0 && refreshData) {
                    await refreshData();
                  }
                } else {
                  toast.error('Import completed with no summary');
                }
              }}
            />
          )}
        </>
      </div>
    );
  }

  // Render form view (create/edit)
  if (view === 'create' || view === 'edit') {
    const currentMode: FormMode = view === 'create' ? 'create' : 'edit';

    const formLayout = config.config.form.layout;
    const formSections = config.config.form.sections;
    const formFields = config.config.form.fields;

    return (
      <div className="space-y-3 sm:space-y-4">
        {renderBreadcrumbs()}
        <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-6">
          <EntityForm
            fields={formFields as never}
            entity={view === 'edit' ? selectedEntity : undefined}
            mode={currentMode}
            layout={formLayout}
            sections={formSections as never}
            onSubmit={handleSubmit}
            onCancel={handleBack}
            onValidate={config.config.onValidate}
          />
        </div>
      </div>
    );
  }

  // Render detail view
  if (view === 'view') {
    if (!selectedEntity) {
      return (
        <div className="space-y-3 sm:space-y-4">
          {renderBreadcrumbs()}
          <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-6 text-center">
            <p className="text-sm sm:text-base text-muted-foreground mb-4">No entity selected</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 sm:space-y-4">
        {renderBreadcrumbs()}
        <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-6">
          <EntityView
            entity={selectedEntity}
            fields={config.config.view.fields}
            groups={config.config.view.groups}
            mode={config.config.view.mode || "detail"}
            showMetadata={config.config.view.showMetadata}
            tabs={config.config.view.tabs}
            titleField={config.config.view.titleField}
            subtitleField={config.config.view.subtitleField}
            imageField={config.config.view.imageField}
            loading={state.state.loading}
            error={state.state.error}
            className={config.config.view.className}
            onCopy={() => {
              toast.success('Successfully copied to clipboard');
            }}
            actions={config.config.view.actions}
          />
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Entity Manager Component
 */
export function EntityManager<T extends BaseEntity = BaseEntity>(
  props: EntityManagerProps<T>
) {
  const { config, className = '', children } = props;

  // Custom layout via children
  if (children) {
    return <div className={`timex ${className}`}>{children}</div>;
  }

  // Extract "view" filter if present to set initial view mode
  const viewFilterValue = config.initialFilters?.find(f => f.field === 'view')?.value as EntityManagerView | undefined;
  const filteredInitialFilters = config.initialFilters?.filter(f => f.field !== 'view');
  
  // Use view filter to override initialView if not already set
  const effectiveInitialView = config.initialView || viewFilterValue || 'list';

  // Create modified props with updated initialView
  const modifiedProps: EntityManagerProps<T> = {
    ...props,
    config: {
      ...config,
      initialView: effectiveInitialView,
    },
  };

  // Default layout with providers

  return (
    <div className={`nnp-timex ${className}`}>
      <EntityStateProvider
        initialEntities={config.initialData}
        initialPageSize={config.config.list.paginationConfig?.pageSize || 10}
        initialSort={config.config.list.sortConfig}
        initialFilters={filteredInitialFilters}
        primaryKeyField={config.config.primaryKeyField || 'id'}
      >
        {config.apiClient ? (
          <EntityApiProvider client={config.apiClient}>
            <EntityManagerContent {...modifiedProps} />
          </EntityApiProvider>
        ) : (
          <EntityManagerContent {...modifiedProps} />
        )}
      </EntityStateProvider>
    </div>
  );
}
