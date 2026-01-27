/**
 * EntityList Component
 * 
 * Comprehensive list component with 8 view modes, search, filter, sort, and pagination.
 * Standalone component - works independently.
 */

 'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { format as dfFormat } from 'date-fns';
import Image from 'next/image';
import { BaseEntity, FilterConfig } from '../../primitives/types';
import { EntityActions } from '../actions';
import { Action, ActionContext } from '../actions/types';
import { getEnabledActions } from '../actions/utils';
import { 
  EntityListProps, 
  ListView, 
  ListState,
  CellRenderProps,
} from './types';
import {
  getVisibleColumns,
  getColumnValue,
  formatCellValue,
  searchEntities,
  filterEntities,
  sortEntities,
  paginateEntities,
  getTotalPages,
  getEntityTitle,
  getEntitySubtitle,
  getEntityImageUrl,
  getEntityDate,
  getDefaultPageSizes
} from './utils';
import { ListSkeleton } from './components/Skeleton';
import { EmptyState, CreateEmptyState, SearchEmptyState, FilterEmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { DensitySelector } from './components/DensitySelector';
import { ViewSelector } from './components/ViewSelector';
import { ListDensity } from './variants';
import { Filter, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * EntityList component
 */
export function EntityList<T extends BaseEntity = BaseEntity>(
  props: EntityListProps<T>
) {
  const {
    data,
    columns,
    view: viewProp = 'table',
    toolbar = {},
    selectable = false,
    multiSelect = false,
    selectedIds: selectedIdsProp,
    onSelectionChange,
    onRowClick,
    onRowDoubleClick,
    pagination = false,
    paginationConfig,
    onPaginationChange,
    sortable = false,
    sortConfig: sortConfigProp,
    onSortChange,
    filterable = false,
    filterConfigs: filterConfigsProp,
    onFilterChange,
    searchable = false,
    searchValue: searchValueProp,
    onSearchChange,
    searchPlaceholder = 'Search...',
    emptyMessage,
    loading = false,
    error,
    actions,
    className = '',
    rowClassName,
    hover = true,
    striped = false,
    titleField,
    subtitleField,
    imageField,
    dateField
  } = props;

  console.log('📋 EntityList rendered with:', {
    dataLength: data.length,
    hasPaginationConfig: !!paginationConfig,
    paginationConfig,
    searchable,
    searchValueProp,
    hasOnSearchChange: !!onSearchChange,
  });

  // State
  const [state, setState] = useState<ListState>({
    view: viewProp,
    selectedIds: selectedIdsProp || new Set(),
    page: Math.max(1, paginationConfig?.page ?? 1),
    // If caller provides a pageSize via paginationConfig, respect it even if it's not in the default options
    pageSize: Math.max(1, paginationConfig?.pageSize ?? 10),
    sort: sortConfigProp,
    filters: filterConfigsProp || [],
    search: searchValueProp || '',
    visibleColumns: new Set(columns.map(c => String(c.key))),
    columnWidths: new Map(),
    bulkActionsOpen: false
  });

  // Density state (separate from main state)
  const [density, setDensity] = useState<ListDensity>('comfortable');

  // Refs to track internal updates and prevent circular syncing
  const isInternalFilterUpdate = React.useRef(false);
  const isInternalSortUpdate = React.useRef(false);
  const isInternalSearchUpdate = React.useRef(false);

  // Sync local state with parent's paginationConfig when it changes
  useEffect(() => {
    if (paginationConfig?.page !== undefined && paginationConfig.page !== state.page) {
      setState(prev => ({ ...prev, page: paginationConfig.page }));
    }
    if (paginationConfig?.pageSize !== undefined && paginationConfig.pageSize !== state.pageSize) {
      console.log('🔄 Syncing pageSize from parent:', paginationConfig.pageSize);
      setState(prev => ({ ...prev, pageSize: paginationConfig.pageSize }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationConfig?.page, paginationConfig?.pageSize]);

  // Filter dropdown state
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Filter dialog state
  type FilterOperator = 'equals' | 'notEquals' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual' | 'in' | 'notIn' | 'between' | 'isNull' | 'isNotNull';
  
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedFilterField, setSelectedFilterField] = useState<string | null>(null);
  const [filterOperator, setFilterOperator] = useState<FilterOperator>('equals');
  const [filterValue, setFilterValue] = useState<string | string[]>('');
  const [filterValue2, setFilterValue2] = useState(''); // For 'between' operator

  // Get selected entities for bulk actions (defined early so actionContext can be used by toolbars)
  const selectedEntities = useMemo(() => {
    return data.filter(entity => state.selectedIds.has(entity.id));
  }, [data, state.selectedIds]);

  // Create action context (include user permissions and entityPermissions when provided)
  const actionContext = useMemo<ActionContext<T> | undefined>(() => {
    // Only provide an action context if the caller explicitly supplied one via actions.context
    if (!actions || !actions.context) return undefined;
    return {
      selectedEntities,
      selectedIds: state.selectedIds,
      refresh: actions.context?.refresh,
      customData: actions.context?.customData,
      permissions: actions.context?.permissions,
    } as ActionContext<T>;
  }, [actions, selectedEntities, state.selectedIds]);

  // Filter actions by type and position
  const toolbarBulkActions = useMemo(() => {
    if (!actions?.actions) return [];
    // Filter by position and permissions/visibility
    const candidates = (actions.actions as Action<T>[]).filter((action: Action<T>) => 
      action.actionType === 'bulk' && 
      (action.position === 'toolbar' || !action.position)
    );
    // Use action context to further filter enabled/visible actions
    return actionContext ? getEnabledActions(candidates, undefined, actionContext) : candidates;
  }, [actions, actionContext]);

  const toolbarNonBulkActions = useMemo(() => {
    if (!actions?.actions) return [];
    const candidates = (actions.actions as Action<T>[]).filter((action: Action<T>) => 
      action.actionType !== 'bulk' && 
      action.position === 'toolbar'
    );
    try {
      return actionContext ? getEnabledActions(candidates, undefined, actionContext) : candidates;
    } catch {
      return candidates;
    }
  }, [actions, actionContext]);

  const rowActions = useMemo(() => {
    if (!actions?.actions) return [];
    const candidates = (actions.actions as Action<T>[]).filter((action: Action<T>) => 
      action.actionType !== 'bulk' && 
      (action.position === 'row' || action.position === 'dropdown' || action.position === 'context-menu' || !action.position)
    );
    try {
      // For row actions we can't evaluate visibility without an entity; return all candidates here and let EntityActions filter per-row.
      return candidates;
    } catch {
      return candidates;
    }
  }, [actions]);

  

  // Click handling state
  const [clickTimeoutRef, setClickTimeoutRef] = useState<NodeJS.Timeout | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [clickCount, setClickCount] = useState<number>(0);

  // Sync external state
  React.useEffect(() => {
    if (selectedIdsProp) {
      setState(prev => ({ ...prev, selectedIds: selectedIdsProp }));
    }
  }, [selectedIdsProp]);

  React.useEffect(() => {
    if (sortConfigProp && !isInternalSortUpdate.current) {
      setState(prev => ({ ...prev, sort: sortConfigProp }));
    }
    isInternalSortUpdate.current = false;
  }, [sortConfigProp]);

  React.useEffect(() => {
    if (filterConfigsProp && !isInternalFilterUpdate.current) {
      // Deduplicate filters before setting
      const uniqueFilters = filterConfigsProp.filter(
        (filter, index, self) => 
          index === self.findIndex(f => 
            f.field === filter.field && f.operator === filter.operator
          )
      );
      setState(prev => ({ ...prev, filters: uniqueFilters }));
    }
    isInternalFilterUpdate.current = false;
  }, [filterConfigsProp]);

  React.useEffect(() => {
    if (searchValueProp !== undefined && !isInternalSearchUpdate.current) {
      setState(prev => ({ ...prev, search: searchValueProp }));
    }
    isInternalSearchUpdate.current = false;
  }, [searchValueProp]);

  // Sync pagination config changes
  React.useEffect(() => {
    if (paginationConfig?.page !== undefined && paginationConfig.page !== state.page) {
      setState(prev => ({ ...prev, page: paginationConfig.page || 1 }));
    }
  }, [paginationConfig?.page, state.page]);

  React.useEffect(() => {
    if (paginationConfig?.pageSize !== undefined && paginationConfig.pageSize !== state.pageSize) {
      // Accept the provided pageSize directly and reset to page 1
      setState(prev => ({ ...prev, pageSize: paginationConfig.pageSize as number, page: 1 }));
    }
  }, [paginationConfig?.pageSize, state.pageSize]);

  // Validate page is within bounds when data or totalCount changes
  React.useEffect(() => {
    // Calculate total pages based on available data
    const itemsToUse = paginationConfig?.totalCount ?? data.length;
    const totalPagesForData = itemsToUse > 0 ? Math.ceil(itemsToUse / state.pageSize) : 0;
    
    // If current page exceeds total pages, reset to page 1
    if (totalPagesForData > 0 && state.page > totalPagesForData) {
      setState(prev => ({ ...prev, page: Math.max(1, totalPagesForData) }));
    }
  }, [data.length, paginationConfig, state.pageSize, state.page]);

  // Process data
  const processedData = useMemo(() => {
    // If using server-side pagination, data is already filtered, sorted, and paginated
    if (paginationConfig) {
      console.log('✅ SERVER-SIDE PAGINATION: Returning data as-is (no client-side filtering)', { 
        dataCount: data.length,
        search: state.search,
        filters: state.filters.length,
      });
      return data;
    }

    console.log('⚠️ CLIENT-SIDE PROCESSING: Applying client-side filters', {
      dataCount: data.length,
      search: state.search,
      filters: state.filters.length,
    });

    let result = [...data];
    
    // Search
    if (state.search) {
      const before = result.length;
      result = searchEntities(result, state.search, columns);
      console.log('🔍 After client-side search:', { before, after: result.length });
    }
    
    // Filter
    if (state.filters.length > 0) {
      const before = result.length;
      result = filterEntities(result, state.filters);
      console.log('🔗 After client-side filter:', { before, after: result.length });
    }
    
    // Sort
    if (state.sort) {
      result = sortEntities(result, state.sort);
    }
    
    return result;
  }, [data, state.search, state.filters, state.sort, columns, paginationConfig]);

  // Pagination
  const totalItems = paginationConfig?.totalCount ?? processedData.length;
  const totalPages = getTotalPages(totalItems, state.pageSize);

  // For server-side pagination (when paginationConfig is provided), data is already paginated
  const paginatedData = paginationConfig 
    ? processedData 
    : pagination 
      ? paginateEntities(processedData, state.page, state.pageSize)
      : processedData;

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    const allIds = new Set(processedData.map(e => e.id));
    setState(prev => ({ ...prev, selectedIds: allIds }));
    onSelectionChange?.(allIds, processedData);
  }, [processedData, onSelectionChange]);

  const handleDeselectAll = useCallback(() => {
    const empty = new Set<string | number>();
    setState(prev => ({ ...prev, selectedIds: empty }));
    onSelectionChange?.(empty, []);
  }, [onSelectionChange]);

  // Derive whether multi select should be enabled. Allow explicit prop to override, but
  // also enable multi-select automatically when bulk actions are available (legacy or normalized).
  const hasBulkActions = !!(
    Array.isArray(actions?.actions) && 
    (actions.actions as Action<T>[]).some((a: Action<T>) => a.actionType === 'bulk')
  );
  const allowMultiSelect = multiSelect || hasBulkActions;

  const handleSelectRow = useCallback((id: string | number) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedIds);
      if (allowMultiSelect) {
        if (newSelected.has(id)) {
          newSelected.delete(id);
        } else {
          newSelected.add(id);
        }
      } else {
        newSelected.clear();
        newSelected.add(id);
      }
      const selectedEntities = data.filter(e => newSelected.has(e.id));
      onSelectionChange?.(newSelected, selectedEntities);
      return { ...prev, selectedIds: newSelected };
    });
  }, [allowMultiSelect, onSelectionChange, data]);

  // Search handler
  const handleSearchChange = useCallback((value: string) => {
    console.log('🔍 handleSearchChange called:', { value, hasOnSearchChange: !!onSearchChange });
    isInternalSearchUpdate.current = true;
    setState(prev => ({ ...prev, search: value, page: 1 }));
    if (onSearchChange) {
      console.log('📞 Calling onSearchChange callback with:', value);
      onSearchChange(value);
    } else {
      console.warn('⚠️ onSearchChange callback not provided!');
    }
  }, [onSearchChange]);

  // Sort handler
  const handleSort = useCallback((field: string) => {
    setState(prev => {
      const newSort = prev.sort?.field === field && prev.sort.direction === 'asc'
        ? { field, direction: 'desc' as const }
        : { field, direction: 'asc' as const };
      isInternalSortUpdate.current = true;
      onSortChange?.(newSort);
      return { ...prev, sort: newSort };
    });
  }, [onSortChange]);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    // For server-side pagination, calculate totalPages from paginationConfig
    const maxPage = paginationConfig ? Math.ceil((paginationConfig.totalCount ?? 0) / (paginationConfig.pageSize ?? 10)) : (totalPages || 1);
    
    // Validate page is at least 1 and doesn't exceed max
    const validPage = Math.max(1, Math.min(page, maxPage || 1));
    
    // Update local state immediately for responsive UI
    setState(prev => ({ ...prev, page: validPage }));
    
    // Notify parent with both page and pageSize
    const pageSize = paginationConfig?.pageSize ?? state.pageSize;
    onPaginationChange?.({ ...(paginationConfig ?? {}), page: validPage, pageSize });
  }, [paginationConfig, onPaginationChange, state.pageSize, totalPages]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setState(prev => ({ ...prev, pageSize, page: 1 }));
    onPaginationChange?.({ ...(paginationConfig ?? {}), pageSize, page: 1 });
  }, [paginationConfig, onPaginationChange]);

  // View switcher
  const handleViewChange = useCallback((view: ListView) => {
    setState(prev => ({ ...prev, view }));
  }, []);

  // Filter handlers
  const handleOpenFilterDialog = useCallback((field: string) => {
    setSelectedFilterField(field);
    
    // Detect field type and set appropriate operator
    const selectedColumn = columns.find(c => String(c.key) === field);
    const fieldType = selectedColumn?.type || 'text';
    
    // Set default operator based on field type
    if (fieldType === 'boolean') {
      setFilterOperator('equals');
    } else {
      setFilterOperator('contains');
    }
    
    setFilterValue('');
    setFilterValue2('');
    setFilterDialogOpen(true);
    // Close the dropdown menu to prevent double requests
    setFilterDropdownOpen(false);
  }, [columns]);

  const handleCloseFilterDialog = useCallback(() => {
    setFilterDialogOpen(false);
    setSelectedFilterField(null);
    setFilterOperator('equals');
    setFilterValue('');
    setFilterValue2('');
  }, []);

  const handleSaveFilter = useCallback(() => {
    if (!selectedFilterField) {
      return;
    }

    // Determine the final value shape depending on operator
    let finalValue: unknown = '';

    if (filterOperator === 'isNull' || filterOperator === 'isNotNull') {
      finalValue = '';
    } else if (filterOperator === 'between') {
      finalValue = filterValue2 ? [filterValue, filterValue2] : filterValue;
    } else if (filterOperator === 'in' || filterOperator === 'notIn') {
      if (Array.isArray(filterValue)) {
        finalValue = filterValue;
      } else {
        finalValue = String(filterValue || '').split(',').map(s => s.trim()).filter(Boolean);
      }
    } else {
      // Check if this is a boolean field
      const selectedColumn = selectedFilterField ? columns.find(c => String(c.key) === selectedFilterField) : undefined;
      const fieldType = selectedColumn?.type || 'text';
      
      // For boolean fields, ensure the value is a proper boolean
      if (fieldType === 'boolean') {
        finalValue = String(filterValue) === 'true';
      } else {
        finalValue = Array.isArray(filterValue) ? (filterValue[0] ?? '') : filterValue;
      }
    }

    // For operators requiring a value, ensure we have one
    if (filterOperator !== 'isNull' && filterOperator !== 'isNotNull') {
      if (filterOperator === 'in' || filterOperator === 'notIn') {
        if (!Array.isArray(finalValue) || finalValue.length === 0) return;
      } else {
        if (!String(finalValue).trim()) return;
      }
    }

    const newFilter: FilterConfig = {
      field: selectedFilterField,
      operator: filterOperator,
      value: finalValue,
    };

    // Set ref BEFORE setState to ensure useEffect sees it
    isInternalFilterUpdate.current = true;
    
    setState(prev => {
      // Check for duplicate filters (same field and operator)
      const isDuplicate = prev.filters.some(
        f => f.field === newFilter.field && f.operator === newFilter.operator
      );
      
      if (isDuplicate) {
        return prev;
      }
      
      const newFilters = [...prev.filters, newFilter];
      onFilterChange?.(newFilters);
      return { ...prev, filters: newFilters, page: 1 };
    });

    handleCloseFilterDialog();
  }, [selectedFilterField, filterOperator, filterValue, filterValue2, onFilterChange, handleCloseFilterDialog, columns]);

  const handleEditFilter = useCallback((index: number) => {
    const filter = state.filters[index];
    setSelectedFilterField(filter.field);
    setFilterOperator(filter.operator as FilterOperator);
    
    if (Array.isArray(filter.value)) {
      setFilterValue(filter.value as string[]);
      setFilterValue2(String(filter.value[1] || ''));
    } else {
      setFilterValue(String(filter.value || ''));
      setFilterValue2('');
    }
    
    // Set ref BEFORE setState
    isInternalFilterUpdate.current = true;
    
    // Remove the old filter and notify parent
    setState(prev => {
      const newFilters = prev.filters.filter((_, i) => i !== index);
      onFilterChange?.(newFilters);
      return { ...prev, filters: newFilters };
    });
    
    setFilterDialogOpen(true);
  }, [state.filters, onFilterChange]);

  const handleRemoveFilter = useCallback((index: number) => {
    // Set ref BEFORE setState
    isInternalFilterUpdate.current = true;
    
    setState(prev => {
      const newFilters = prev.filters.filter((_, i) => i !== index);
      onFilterChange?.(newFilters);
      return { ...prev, filters: newFilters, page: 1 };
    });
  }, [onFilterChange]);

  const handleClearFilters = useCallback(() => {
    isInternalFilterUpdate.current = true;
    setState(prev => ({ ...prev, filters: [], page: 1 }));
    onFilterChange?.([]);
  }, [onFilterChange]);

  // Click/Double-click handler with manual timing
  const handleRowClick = useCallback((entity: T, index: number) => {
    const now = Date.now();
    const timeDiff = now - lastClickTime;

    // If this is a double click (within 300ms of last click)
    if (timeDiff < 300 && clickCount === 1) {
      // Clear any pending single click timeout
      if (clickTimeoutRef) {
        clearTimeout(clickTimeoutRef);
        setClickTimeoutRef(null);
      }
      // Execute double click handler
      onRowDoubleClick?.(entity, index);
      // Reset click tracking
      setClickCount(0);
      setLastClickTime(0);
    } else {
      // This is a single click - set timeout
      setClickCount(1);
      setLastClickTime(now);

      const timeout = setTimeout(() => {
        onRowClick?.(entity, index);
        setClickCount(0);
        setLastClickTime(0);
        setClickTimeoutRef(null);
      }, 300); // 300ms delay for double-click detection

      setClickTimeoutRef(timeout);
    }
  }, [onRowClick, onRowDoubleClick, clickTimeoutRef, lastClickTime, clickCount]);

  // Get visible columns
  const visibleColumns = getVisibleColumns(columns);

  // Helper function to get user-friendly operator label
  const getOperatorLabel = (operator: string): string => {
    const labels: Record<string, string> = {
      'contains': 'contains',
      'equals': 'is',
      'notEquals': 'is not',
      'startsWith': 'starts with',
      'endsWith': 'ends with',
      'greaterThan': '>',
      'greaterThanOrEqual': '≥',
      'lessThan': '<',
      'lessThanOrEqual': '≤',
      'in': 'in',
      'notIn': 'not in',
      'between': 'between',
      'isNull': 'is empty',
      'isNotNull': 'is not empty',
    };
    return labels[operator] || operator;
  };

  // Helper function to get column label
  const getColumnLabel = (field: string): string => {
    const column = columns.find(col => String(col.key) === field);
    return column?.label || field;
  };

  // Render toolbar
  const renderToolbar = () => {
    const hasToolbar = (toolbar && Object.keys(toolbar).length > 0) || searchable;
    if (!hasToolbar) {
      return null;
    }

    return (
      <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 bg-card border-b">
        {/* Active Filters Display */}
        {state.filters.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filters:</span>
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {state.filters.map((filter, index) => {
                const columnLabel = getColumnLabel(filter.field);
                const operatorLabel = getOperatorLabel(filter.operator);
                const displayValue = filter.operator === 'isNull' || filter.operator === 'isNotNull' 
                  ? '' 
                  : Array.isArray(filter.value) 
                    ? filter.value.join(' - ') 
                    : String(filter.value);
                
                return (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="gap-2 pr-1 py-1.5 text-xs hover:bg-secondary/80 cursor-pointer group"
                    onClick={() => handleEditFilter(index)}
                  >
                    <span className="font-medium">{columnLabel}</span>
                    <span className="text-muted-foreground">{operatorLabel}</span>
                    {displayValue && <span className="font-semibold text-foreground">&apos;{displayValue}&apos;</span>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFilter(index);
                      }}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-1 transition-colors group-hover:bg-muted"
                      aria-label="Remove filter"
                      title="Remove filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-7 text-xs text-muted-foreground hover:text-destructive px-2"
              >
                Clear all
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            {(toolbar?.search || searchable) && (
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={state.search}
                  onChange={(e) => {
                    console.log('🔤 Search input onChange fired:', { value: e.target.value, timestamp: new Date().toISOString() });
                    handleSearchChange(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                  aria-label="Search"
                />
              </div>
            )}
          </div>
          
          <div className="flex gap-2 items-center flex-wrap justify-end w-full sm:w-auto">
            {toolbar.viewSwitcher && (
              // Match DensitySelector default presentation (dropdown) for compact toolbar
              <ViewSelector value={state.view} onChange={handleViewChange} variant="dropdown" className="" />
            )}

            {/* Filter Button */}
            {(toolbar.filters || filterable) && (
              <DropdownMenu open={filterDropdownOpen} onOpenChange={setFilterDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="min-h-[44px] w-full sm:w-auto">
                    <Filter className="h-4 w-4" />
                    <span className="ml-2">Filter</span>
                    {state.filters.length > 0 && (
                      <Badge variant="default" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {state.filters.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 max-w-md">
                  <DropdownMenuLabel>Add Filter</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-3 space-y-3">
                    {columns.filter(col => col.filterable !== false).length > 0 ? (
                      <>
                        <div className="text-sm text-muted-foreground">
                          What would you like to filter by?
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                          {columns.filter(col => col.filterable !== false).map((column) => (
                            <button
                              key={String(column.key)}
                              onClick={() => handleOpenFilterDialog(String(column.key))}
                              className="w-full text-left px-4 py-3 text-sm rounded-md hover:bg-muted transition-colors border border-transparent hover:border-muted-foreground/20"
                            >
                              {column.label}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No filterable columns available
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Density Selector */}
            <DensitySelector 
              value={density} 
              onChange={setDensity} 
              variant="dropdown"
            />
            
            {/* Non-bulk toolbar actions (like Export) */}
            {toolbarNonBulkActions.length > 0 && (
              <EntityActions 
                actions={toolbarNonBulkActions}
                entity={undefined}
                context={actionContext}
                mode={'buttons'}
                position={'toolbar'}
                className={actions?.className || ''}
                onActionStart={actions?.onActionStart}
                onActionComplete={actions?.onActionComplete}
                onActionError={actions?.onActionError}
              />
            )}
            
            {/* Bulk Actions dropdown (when items are selected) */}
            {toolbarBulkActions.length > 0 && state.selectedIds.size > 0 && (
              <div className="relative inline-block">
                <button 
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                  onClick={() => setState(prev => ({ ...prev, bulkActionsOpen: !prev.bulkActionsOpen }))}
                >
                  Bulk Actions ({state.selectedIds.size})
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {state.bulkActionsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setState(prev => ({ ...prev, bulkActionsOpen: false }))}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md bg-card border shadow-lg">
                      <div className="py-1">
                        {toolbarBulkActions.map(action => (
                          <button
                            key={action.id}
                            onClick={async () => {
                              // Close dropdown immediately for better UX
                              setState(prev => ({ ...prev, bulkActionsOpen: false }));
                              
                              if (actionContext && actions?.onActionStart) {
                                actions.onActionStart(action.id);
                              }
                              try {
                                if (action.actionType === 'bulk' && actionContext) {
                                  await action.handler(actionContext.selectedEntities as T[], actionContext);
                                }
                                if (actions?.onActionComplete) {
                                  actions.onActionComplete(action.id, { success: true });
                                }
                                // Trigger refresh if available
                                if (actionContext?.refresh) {
                                  await actionContext.refresh();
                                }
                              } catch (error) {
                                if (actions?.onActionError) {
                                  actions.onActionError(action.id, error instanceof Error ? error : new Error('Action failed'));
                                }
                              }
                            }}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors ${
                              action.variant === 'destructive' ? 'text-destructive hover:bg-destructive/10' : 'text-foreground'
                            }`}
                          >
                            {action.icon && <span className="flex-shrink-0">{renderIcon(action.icon)}</span>}
                            <span className="flex-1 text-left">{renderActionLabel(action.label)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {toolbar.actions && (
              <div className="flex gap-2">
                {toolbar.actions}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render pagination

  const renderActionLabel = (maybeLabel: React.ReactNode | ((entity?: T) => React.ReactNode)) => {
    if (typeof maybeLabel === 'function') {
      try {
        return maybeLabel(undefined);
      } catch {
        return null;
      }
    }
    return maybeLabel;
  };
  // Render icon which may be a React node or a component type
  const renderIcon = (icon: React.ReactNode | React.ComponentType | undefined) => {
    if (!icon) return null;
    if (typeof icon === 'function') {
      const IconComp = icon as React.ComponentType;
      try {
        return <IconComp />;
      } catch {
        return null;
      }
    }
    return icon;
  };
  const renderPagination = () => {
    if (!pagination) return null;

    // Handle edge case: if totalItems is 0, show 0 to 0 of 0
    if (totalItems === 0) {
      return (
        <nav 
          className="flex flex-col gap-3 sm:gap-4 px-3 sm:px-4 py-3 bg-card border-t" 
          role="navigation" 
          aria-label="Pagination"
        >
          {/* Results info - always visible */}
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            No results to display
          </div>
        </nav>
      );
    }

    // For server-side pagination, use totalItems; for client-side, use processedData.length
    const itemsForDisplay = paginationConfig ? totalItems : processedData.length;
    // Use local state for display (it updates immediately when user clicks)
    // Parent prop is used only for external syncing via useEffect above
    const startItem = ((state.page - 1) * state.pageSize) + 1;
    const endItem = Math.min(state.page * state.pageSize, itemsForDisplay);

    return (
      <nav 
        className="flex z-0 flex-col gap-3 sm:gap-4 px-3 sm:px-4 py-3 bg-card border-t" 
        role="navigation" 
        aria-label="Pagination"
      >
        {/* Results info - always visible */}
        <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          Showing <span className="font-medium text-foreground">{startItem}</span> to{' '}
          <span className="font-medium text-foreground">{endItem}</span> of{' '}
          <span className="font-medium text-foreground">{totalItems}</span> results
        </div>
        
        {/* Pagination controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Page navigation buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={state.page === 1}
              className="hidden sm:inline-flex px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium border border-input rounded-md bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Go to first page"
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(state.page - 1)}
              disabled={state.page === 1}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium border border-input rounded-md bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Go to previous page"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>
            
            <span className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-3 whitespace-nowrap">
              Page <span className="font-medium text-foreground">{state.page}</span> of{' '}
              <span className="font-medium text-foreground">{totalPages}</span>
            </span>
            
            <button
              onClick={() => handlePageChange(state.page + 1)}
              disabled={state.page >= totalPages || totalPages <= 0}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium border border-input rounded-md bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Go to next page"
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(Math.max(1, totalPages))}
              disabled={state.page >= totalPages || totalPages === 0}
              className="hidden sm:inline-flex px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium border border-input rounded-md bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Go to last page"
            >
              Last
            </button>
          </div>
          
          {/* Page size selector */}
          <select
            title='Items per page'
            aria-label='Items per page'
            value={state.pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="w-full sm:w-auto px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          >
            {getDefaultPageSizes().map(size => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>
        </div>
      </nav>
    );
  };

  // Render cell
  const renderCell = ({ column, entity, value, index }: CellRenderProps<T>) => {
    if (column.render) {
      return column.render(value, entity, index);
    }
    
    return formatCellValue(value, column, entity);
  };

  // Render table view
  const renderTableView = () => {
    return (
      <div className="relative w-full">
        <div className="overflow-x-auto overflow-y-visible -mx-4 sm:mx-0 p-2 pb-64">
          <div className="inline-block min-w-full align-middle max-w-full">
            <table className="min-w-full divide-y divide-border text-sm w-full">
            <thead className="bg-muted/50">
              <tr>
                {selectable && (
                  <th scope="col" className="px-3 sm:px-4 py-3 w-12">
                    {allowMultiSelect && (
                      <input
                        title="Select all"
                        aria-label="Select all"
                        type="checkbox"
                        checked={state.selectedIds.size === processedData.length && processedData.length > 0}
                        onChange={() => state.selectedIds.size === processedData.length ? handleDeselectAll() : handleSelectAll()}
                        className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2"
                      />
                    )}
                  </th>
                )}
                {visibleColumns.map(column => (
                  <th
                    key={String(column.key)}
                    scope="col"
                    style={{ width: column.width, textAlign: column.align }}
                    className={`px-3 sm:px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                      column.sortable && sortable ? 'cursor-pointer select-none hover:text-foreground' : ''
                    }`}
                    onClick={() => column.sortable && sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-1">
                      <span className="truncate">{column.label}</span>
                      {state.sort?.field === column.key && (
                        <span className="text-primary flex-shrink-0">
                          {state.sort.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {rowActions.length > 0 && (
                  <th scope="col" className="px-3 sm:px-4 py-3 text-right w-24">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {paginatedData.map((entity, index) => {
                const isSelected = state.selectedIds.has(entity.id);
                const rowClass = rowClassName ? rowClassName(entity, index) : '';
                const densityPadding = density === 'compact' ? 'py-2' : density === 'comfortable' ? 'py-3' : 'py-4';
                
                return (
                  <tr
                    key={entity.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-muted' : ''
                    } ${hover ? 'hover:bg-muted/50 cursor-pointer' : ''} ${
                      striped && index % 2 === 0 ? 'bg-muted/20' : ''
                    } ${rowClass}`}
                    onClick={() => handleRowClick(entity, index)}
                    onDoubleClick={() => handleRowClick(entity, index)}
                  >
                    {selectable && (
                      <td className={`px-3 sm:px-4 ${densityPadding} whitespace-nowrap`}>
                        <input
                          title="Select row"
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(entity.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2"
                        />
                      </td>
                    )}
                    {visibleColumns.map(column => {
                      const value = getColumnValue(entity, column.key);
                      return (
                        <td
                          key={String(column.key)}
                          className={`px-3 sm:px-4 ${densityPadding} whitespace-nowrap text-sm`}
                          style={{ textAlign: column.align }}
                        >
                          <div className="truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
                            {renderCell({ column, entity, value, index })}
                          </div>
                        </td>
                      );
                    })}
                    {rowActions.length > 0 && (
                      <td className={`px-3 sm:px-4 ${densityPadding} whitespace-nowrap text-right text-sm relative z-20`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <EntityActions 
                            actions={rowActions}
                            entity={entity}
                            context={actionContext}
                            mode={actions?.mode || 'buttons'}
                            position={'row'}
                            className={actions?.className || ''}
                            onActionStart={actions?.onActionStart}
                            onActionComplete={actions?.onActionComplete}
                            onActionError={actions?.onActionError}
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    );
  };  // Render card view
  const renderCardView = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4">
        {paginatedData.map((entity, index) => {
          const isSelected = state.selectedIds.has(entity.id);
          const title = getEntityTitle(entity, titleField);
          const subtitle = getEntitySubtitle(entity, subtitleField);
          const imageUrl = getEntityImageUrl(entity, imageField);
          
          return (
            <div
              key={entity.id}
              className={`bg-card rounded-lg border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              } cursor-pointer relative`}
              onClick={() => handleRowClick(entity, index)}
              onDoubleClick={() => handleRowClick(entity, index)}
            >
              {selectable && (
                <div className="absolute top-2 right-2 z-10">
                  <input
                    title="Select card"
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectRow(entity.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2"
                  />
                </div>
              )}
              
              {imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  <Image src={String(imageUrl)} alt={String(title)} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
                </div>
              )}
              
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-1">{title}</h3>
                  {subtitle && <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">{subtitle}</p>}
                </div>
                
                <div className="space-y-1.5 sm:space-y-2">
                  {visibleColumns.slice(0, 3).map(column => {
                    const value = getColumnValue(entity, column.key);
                    return (
                      <div key={String(column.key)} className="flex items-start text-xs sm:text-sm">
                        <span className="font-medium text-muted-foreground w-1/3 flex-shrink-0">{column.label}:</span>
                        <span className="text-foreground w-2/3 line-clamp-1">
                          {renderCell({ column, entity, value, index })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {rowActions.length > 0 && (
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex items-center gap-2 border-t pt-3" onClick={(e) => e.stopPropagation()}>
                  <div onClick={(e) => e.stopPropagation()}>
                    <EntityActions 
                      actions={rowActions}
                      entity={entity}
                      context={actionContext}
                      mode={actions?.mode || 'buttons'}
                      position={'row'}
                      className={actions?.className || ''}
                      onActionStart={actions?.onActionStart}
                      onActionComplete={actions?.onActionComplete}
                      onActionError={actions?.onActionError}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    return (
      <div className="divide-y">
        {paginatedData.map((entity, index) => {
          const isSelected = state.selectedIds.has(entity.id);
          const title = getEntityTitle(entity, titleField);
          const subtitle = getEntitySubtitle(entity, subtitleField);
          
          return (
            <div
              key={entity.id}
              className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 transition-colors ${
                isSelected ? 'bg-muted' : ''
              } hover:bg-muted/50 cursor-pointer`}
              onClick={() => handleRowClick(entity, index)}
              onDoubleClick={() => handleRowClick(entity, index)}
            >
              {selectable && (
                <input
                  title="Select item"
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectRow(entity.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2 flex-shrink-0"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{title}</div>
                {subtitle && <div className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</div>}
              </div>
              
              {rowActions.length > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0 ml-2 pl-2 border-l border-gray-200" onClick={(e) => e.stopPropagation()}>
                  <EntityActions 
                    actions={rowActions}
                    entity={entity}
                    context={actionContext}
                    mode={actions?.mode || 'buttons'}
                    position={'row'}
                    className={actions?.className || ''}
                    onActionStart={actions?.onActionStart}
                    onActionComplete={actions?.onActionComplete}
                    onActionError={actions?.onActionError}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render timeline view
  const renderTimelineView = () => {
    return (
      <div className="relative space-y-4 sm:space-y-6 p-3 sm:p-4">
        <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-border"></div>
        {paginatedData.map((entity, index) => {
          const title = getEntityTitle(entity, titleField);
          const subtitle = getEntitySubtitle(entity, subtitleField);
          const date = getEntityDate(entity, dateField);
          
          return (
            <div key={entity.id} className="relative pl-10 sm:pl-12">
              <div className="absolute left-3 sm:left-4.5 top-2 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-sm"></div>
              <div className="bg-card rounded-lg border shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => handleRowClick(entity, index)}
                   onDoubleClick={() => handleRowClick(entity, index)}>
                {date && (
                  <div className="text-xs font-medium text-primary mb-1.5 sm:mb-2">
                    {dfFormat(date, 'P')}
                  </div>
                )}
                <div className="text-sm font-semibold text-foreground">{title}</div>
                {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render grid view
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 p-3 sm:p-4">
        {paginatedData.map((entity, index) => {
          const isSelected = state.selectedIds.has(entity.id);
          const title = getEntityTitle(entity, titleField);
          
          return (
            <div
              key={entity.id}
              className={`bg-card rounded-lg border shadow-sm p-3 sm:p-4 transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              } cursor-pointer relative aspect-square flex items-center justify-center`}
              onClick={() => handleRowClick(entity, index)}
              onDoubleClick={() => handleRowClick(entity, index)}
            >
              {selectable && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectRow(entity.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-1.5 right-1.5 w-3 h-3 text-primary bg-background border-input rounded focus:ring-ring focus:ring-1"
                  title="Select item"
                />
              )}
              <div className="text-xs sm:text-sm font-medium text-foreground text-center line-clamp-3 px-1">
                {title}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render compact view
  const renderCompactView = () => {
    return renderTableView(); // Similar to table but with smaller styling
  };

  // Render detailed view
  const renderDetailedView = () => {
    return (
      <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
        {paginatedData.map((entity, index) => {
          const isSelected = state.selectedIds.has(entity.id);
          const title = getEntityTitle(entity, titleField);
          
          return (
            <div
              key={entity.id}
              className={`bg-card rounded-lg border shadow-sm overflow-hidden ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/50 border-b">
                {selectable && (
                  <input
                    title="Select detailed item"
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectRow(entity.id)}
                    className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2 flex-shrink-0"
                  />
                )}
                <h3 className="text-sm sm:text-base font-semibold text-foreground flex-1 truncate">{title}</h3>
              </div>
              
              <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                {visibleColumns.map(column => {
                  const value = getColumnValue(entity, column.key);
                  return (
                    <div key={String(column.key)} className="flex items-start py-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground w-1/3 flex-shrink-0">{column.label}:</label>
                      <span className="text-xs sm:text-sm text-foreground w-2/3 break-words">
                        {renderCell({ column, entity, value, index })}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {rowActions.length > 0 && (
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex items-center gap-2 border-t pt-3" onClick={(e) => e.stopPropagation()}>
                  <div onClick={(e) => e.stopPropagation()}>
                    <EntityActions 
                      actions={rowActions}
                      entity={entity}
                      context={actionContext}
                      mode={actions?.mode || 'dropdown'}
                      position={'row'}
                      className={actions?.className || ''}
                      onActionStart={actions?.onActionStart}
                      onActionComplete={actions?.onActionComplete}
                      onActionError={actions?.onActionError}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render gallery view
  const renderGalleryView = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 p-3 sm:p-4">
        {paginatedData.map((entity, index) => {
          const isSelected = state.selectedIds.has(entity.id);
          const title = getEntityTitle(entity, titleField);
          const imageUrl = getEntityImageUrl(entity, imageField);
          
          return (
            <div
              key={entity.id}
              className={`bg-card rounded-lg border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              } cursor-pointer`}
              onClick={() => handleRowClick(entity, index)}
              onDoubleClick={() => handleRowClick(entity, index)}
            >
              {imageUrl ? (
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  <Image src={String(imageUrl)} alt={String(title)} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
                </div>
              ) : (
                <div className="aspect-square w-full bg-muted flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="p-2 sm:p-3 text-center">
                <div className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">{title}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render current view
  const renderView = () => {
    switch (state.view) {
      case 'table': return renderTableView();
      case 'card': return renderCardView();
      case 'list': return renderListView();
      case 'grid': return renderGridView();
      case 'compact': return renderCompactView();
      case 'timeline': return renderTimelineView();
      case 'detailed': return renderDetailedView();
      case 'gallery': return renderGalleryView();
      default: return renderTableView();
    }
  };

  // Render empty state
  if (!loading && !error && processedData.length === 0) {
    // Determine empty state type
    const hasSearch = state.search && state.search.length > 0;
    const hasFilters = state.filters && state.filters.length > 0;
    
    // If parent provided an onCreate handler, use it for empty state CTAs.
    const createAction = () => {
      const propsWithCreate = props as unknown as { onCreate?: () => void };
      if (typeof propsWithCreate.onCreate === 'function') {
        try { propsWithCreate.onCreate(); } catch { /* swallow */ }
        return;
      }
      // No-op when not provided
    };
    
    if (hasSearch) {
      return (
        <div className={`bg-card rounded-lg border shadow-sm overflow-visible ${className}`}>
          {renderToolbar()}
          <SearchEmptyState
            searchQuery={state.search}
            onClear={() => handleSearchChange('')}
            onCreate={createAction}
          />
        </div>
      );
    }
    
    if (hasFilters) {
      return (
        <div className={`bg-card rounded-lg border shadow-sm overflow-visible ${className}`}>
          {renderToolbar()}
          <FilterEmptyState
            onClear={() => {
              setState(prev => ({ ...prev, filters: [] }));
              onFilterChange?.([]);
            }}
            onCreate={createAction}
          />
        </div>
      );
    }
    
    // If caller provided an explicit emptyMessage, show a tailored EmptyState
    if (emptyMessage) {
      return (
        <div className={`bg-card rounded-lg border shadow-sm overflow-visible ${className}`}>
          {renderToolbar()}
          <EmptyState title={emptyMessage} action={{ label: 'Create item', onClick: createAction, icon: Plus }} />
        </div>
      );
    }

    return (
      <div className={`bg-card rounded-lg border shadow-sm overflow-visible ${className}`}>
        {renderToolbar()}
        <CreateEmptyState
          entityName="item"
          onCreate={createAction}
        />
      </div>
    );
  }

  // Render error state
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred';
    const errorType = errorMessage.toLowerCase().includes('network') ? 'network' :
                     errorMessage.toLowerCase().includes('permission') ? 'permission' :
                     errorMessage.toLowerCase().includes('server') ? 'server' : 'unknown';
    
    return (
      <div className={`bg-card rounded-lg border shadow-sm overflow-visible ${className}`}>
        {renderToolbar()}
        <ErrorState
          type={errorType}
          message={errorMessage}
          error={error}
          onRetry={() => {
            // Trigger a refetch by notifying parent or calling refresh
            window.location.reload();
          }}
          showDetails={true}
        />
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg border shadow-sm overflow-visible ${className}`}>
      {renderToolbar()}
      
      {loading ? (
        <div className="p-4">
          <div className="mb-3 text-sm text-muted-foreground">Loading data...</div>
          <ListSkeleton
            count={state.pageSize}
            view={state.view}
            density={density}
            columns={visibleColumns.length}
            showAvatar={!!imageField}
          />
        </div>
      ) : (
        <div className="relative z-10">
          {renderView()}
        </div>
      )}
      
      <div>
        {renderPagination()}
      </div>

      {/* Filter Configuration Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Filter</DialogTitle>
            <DialogDescription>
              Filter by {selectedFilterField && columns.find(c => String(c.key) === selectedFilterField)?.label}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Operator selector - show different options based on field type */}
            <div className="grid gap-2">
              <Label htmlFor="filter-operator">How to filter</Label>
              <Select value={filterOperator} onValueChange={(value) => setFilterOperator(value as FilterOperator)}>
                <SelectTrigger id="filter-operator">
                  <SelectValue placeholder="Choose how to filter" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const selectedColumn = selectedFilterField ? columns.find(c => String(c.key) === selectedFilterField) : undefined;
                    const fieldType = selectedColumn?.type || 'text';
                    
                    // Boolean fields only support equals/notEquals
                    if (fieldType === 'boolean') {
                      return (
                        <>
                          <SelectItem value="equals">Is</SelectItem>
                          <SelectItem value="notEquals">Is not</SelectItem>
                          <SelectItem value="isNull">Is empty</SelectItem>
                          <SelectItem value="isNotNull">Is not empty</SelectItem>
                        </>
                      );
                    }
                    
                    // Text fields support full set of operators
                    return (
                      <>
                        <SelectItem value="contains">Contains text</SelectItem>
                        <SelectItem value="equals">Exactly matches</SelectItem>
                        <SelectItem value="startsWith">Starts with</SelectItem>
                        <SelectItem value="endsWith">Ends with</SelectItem>
                        <SelectItem value="greaterThan">Greater than</SelectItem>
                        <SelectItem value="lessThan">Less than</SelectItem>
                        <SelectItem value="isNull">Is empty</SelectItem>
                        <SelectItem value="isNotNull">Is not empty</SelectItem>
                      </>
                    );
                  })()}
                </SelectContent>
              </Select>
            </div>
            
            {filterOperator !== 'isNull' && filterOperator !== 'isNotNull' && (
              (() => {
                const selectedColumn = selectedFilterField ? columns.find(c => String(c.key) === selectedFilterField) : undefined;
                const fieldType = selectedColumn?.type || 'text';
                const columnWithOptions = selectedColumn as unknown as { filterOptions?: Array<{ label: string; value: unknown }> } | undefined;
                const options = columnWithOptions?.filterOptions;

                // Boolean field - show simple true/false select
                if (fieldType === 'boolean') {
                  const booleanOptions = options || [
                    { label: 'True', value: 'true' },
                    { label: 'False', value: 'false' },
                  ];
                  
                  return (
                    <div className="grid gap-2">
                      <Label htmlFor="filter-value">Choose value</Label>
                      <Select value={String(filterValue)} onValueChange={(v) => setFilterValue(v)}>
                        <SelectTrigger id="filter-value">
                          <SelectValue placeholder="Select true or false" />
                        </SelectTrigger>
                        <SelectContent>
                          {booleanOptions.map(opt => (
                            <SelectItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }

                // If the column provides filterOptions (for select/relation fields), render a select UI
                if (options && options.length > 0) {
                  if (filterOperator === 'in' || filterOperator === 'notIn') {
                    return (
                      <div className="grid gap-2">
                        <Label htmlFor="filter-value">Choose values</Label>
                        <select
                          id="filter-value"
                          title='filter'
                          multiple
                          value={Array.isArray(filterValue) ? (filterValue as string[]) : (filterValue ? String(filterValue).split(',') : [])}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                            setFilterValue(selected);
                          }}
                          className="w-full px-2 py-2 border border-input rounded-md bg-background text-sm"
                        >
                          {options.map(opt => (
                            <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  // Single-select for filterOptions
                  return (
                    <div className="grid gap-2">
                      <Label htmlFor="filter-value">Choose value</Label>
                      <Select value={String(filterValue)} onValueChange={(v) => setFilterValue(v)}>
                        <SelectTrigger id="filter-value">
                          <SelectValue placeholder="Select a value" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map(opt => (
                            <SelectItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }

                // Fallback to text input for generic text fields
                return (
                  <div className="grid gap-2">
                    <Label htmlFor="filter-value">Search for</Label>
                    <Input
                      id="filter-value"
                      value={Array.isArray(filterValue) ? (filterValue as string[]).join(',') : String(filterValue)}
                      onChange={(e) => setFilterValue(e.target.value)}
                      placeholder="Type what you're looking for..."
                      autoFocus
                    />
                  </div>
                );
              })()
            )}

            {filterOperator === 'between' && (
              <div className="grid gap-2">
                <Label htmlFor="filter-value2">To Value</Label>
                <Input
                  id="filter-value2"
                  value={filterValue2}
                  onChange={(e) => setFilterValue2(e.target.value)}
                  placeholder="Enter end value"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseFilterDialog}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveFilter}>
              Add Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
