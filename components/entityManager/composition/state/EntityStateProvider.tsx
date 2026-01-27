/**
 * Entity State Provider
 * 
 * React context provider for centralized entity state management.
 */

'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { BaseEntity, FilterConfig } from '../../primitives/types';
import { 
  EntityState, 
  EntityStateAction, 
  EntityStateProviderProps,
  EntityStateContextValue 
} from './types';

/**
 * Create initial state
 */
function createInitialState<T extends BaseEntity>(
  props: EntityStateProviderProps<T>
): EntityState<T> {
  const entities = props.initialEntities || [];
  const primaryKeyField = props.primaryKeyField || 'id';
  const entitiesById = new Map(entities.map(e => [e[primaryKeyField], e]));
  
  
  return {
    entities,
    entitiesById,
    selectedIds: new Set(),
    primaryKeyField,
    page: props.initialPage || 1,
    pageSize: props.initialPageSize || 10,
    sort: props.initialSort,
    filters: props.initialFilters || [],
    search: '',
    loading: false,
    error: undefined
  };
}

/**
 * State reducer
 */
function entityStateReducer<T extends BaseEntity>(
  state: EntityState<T>,
  action: EntityStateAction<T>
): EntityState<T> {
  switch (action.type) {
    case 'SET_ENTITIES': {
      const payload = action.payload || [];
      const entitiesById = new Map(payload.map(e => [e[state.primaryKeyField], e]));
      return { ...state, entities: payload, entitiesById };
    }
    
    case 'ADD_ENTITY': {
      const entities = [...state.entities, action.payload];
      const entitiesById = new Map(state.entitiesById);
      entitiesById.set(action.payload[state.primaryKeyField], action.payload);
      return { ...state, entities, entitiesById };
    }
    
    case 'UPDATE_ENTITY': {
      const entities = state.entities.map(e => 
        e[state.primaryKeyField] === action.payload[state.primaryKeyField] ? action.payload : e
      );
      const entitiesById = new Map(state.entitiesById);
      entitiesById.set(action.payload[state.primaryKeyField], action.payload);
      return { ...state, entities, entitiesById };
    }
    
    case 'DELETE_ENTITY': {
      const entities = state.entities.filter(e => e[state.primaryKeyField] !== action.payload);
      const entitiesById = new Map(state.entitiesById);
      entitiesById.delete(action.payload);
      const selectedIds = new Set(state.selectedIds);
      selectedIds.delete(action.payload);
      return { ...state, entities, entitiesById, selectedIds };
    }
    
    case 'SET_SELECTED':
      return { ...state, selectedIds: action.payload };
    
    case 'SELECT': {
      const selectedIds = new Set(state.selectedIds);
      selectedIds.add(action.payload);
      return { ...state, selectedIds };
    }
    
    case 'DESELECT': {
      const selectedIds = new Set(state.selectedIds);
      selectedIds.delete(action.payload);
      return { ...state, selectedIds };
    }
    
    case 'SELECT_ALL': {
      const selectedIds = new Set(state.entities.map(e => e[state.primaryKeyField]));
      return { ...state, selectedIds };
    }
    
    case 'DESELECT_ALL':
      return { ...state, selectedIds: new Set() };
    
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.payload, page: 1 };
    
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    
    case 'SET_FILTERS': {
      // Deduplicate filters before setting
      const uniqueFilters = action.payload.filter(
        (filter: any, index: number, self: any[]) => 
          index === self.findIndex((f: any) => 
            f.field === filter.field && f.operator === filter.operator
          )
      );
      return { ...state, filters: uniqueFilters, page: 1 };
    }
    
    case 'ADD_FILTER': {
      const filters = [...state.filters, action.payload];
      return { ...state, filters, page: 1 };
    }
    
    case 'REMOVE_FILTER': {
      const filters = state.filters.filter(f => f.field !== action.payload);
      return { ...state, filters, page: 1 };
    }
    
    case 'SET_SEARCH':
      console.log('🔤 SET_SEARCH action:', { newSearch: action.payload, oldSearch: state.search });
      return { ...state, search: action.payload, page: 1 };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload || undefined, loading: false };
    
    case 'SET_TOTAL':
      return { ...state, total: action.payload };
    
    case 'RESET':
      return createInitialState({ initialEntities: state.entities, children: null } as any);
    
    default:
      return state;
  }
}

/**
 * Entity state context
 */
const EntityStateContext = createContext<EntityStateContextValue<any> | null>(null);

/**
 * Entity state provider component
 */
export function EntityStateProvider<T extends BaseEntity = BaseEntity>(
  props: EntityStateProviderProps<T>
) {
  const [state, dispatch] = useReducer(
    entityStateReducer<T>,
    props,
    createInitialState
  );

  // Actions
  const setEntities = useCallback((entities: T[]) => {
    dispatch({ type: 'SET_ENTITIES', payload: entities });
  }, []);

  const addEntity = useCallback((entity: T) => {
    dispatch({ type: 'ADD_ENTITY', payload: entity });
  }, []);

  const updateEntity = useCallback((entity: T) => {
    dispatch({ type: 'UPDATE_ENTITY', payload: entity });
  }, []);

  const deleteEntity = useCallback((id: string | number) => {
    dispatch({ type: 'DELETE_ENTITY', payload: id });
  }, []);

  const select = useCallback((id: string | number) => {
    dispatch({ type: 'SELECT', payload: id });
  }, []);

  const deselect = useCallback((id: string | number) => {
    dispatch({ type: 'DESELECT', payload: id });
  }, []);

  const selectAll = useCallback(() => {
    dispatch({ type: 'SELECT_ALL' });
  }, []);

  const deselectAll = useCallback(() => {
    dispatch({ type: 'DESELECT_ALL' });
  }, []);

  const setSelected = useCallback((ids: Set<string | number>) => {
    dispatch({ type: 'SET_SELECTED', payload: ids });
  }, []);


  // NOTE: Some callers (older UI code) may call these setters synchronously
  // while rendering another component which can cause the React warning
  // "Cannot update a component while rendering a different component".
  // To avoid that class of bug we defer dispatching the actions to the next
  // microtask so updates never happen during another component's render
  // phase. This keeps behaviour identical but avoids the warning and makes
  // it safe for callers that inadvertently call setters during render.
  const defer = <A extends any[]>(fn: (...args: A) => void) => {
    return (...args: A) => {
      Promise.resolve().then(() => fn(...args));
    };
  };

  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: pageSize });
  }, []);

  const setSort = useCallback(defer((sort: any) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  }), []);

  const setFilters = useCallback(defer((filters: FilterConfig[]) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }), []);

  const addFilter = useCallback(defer((filter: FilterConfig) => {
    dispatch({ type: 'ADD_FILTER', payload: filter });
  }), []);

  const removeFilter = useCallback(defer((field: string) => {
    dispatch({ type: 'REMOVE_FILTER', payload: field });
  }), []);

  const setSearch = useCallback((search: string) => {
    dispatch({ type: 'SET_SEARCH', payload: search });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: Error | string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setTotal = useCallback((total: number) => {
    dispatch({ type: 'SET_TOTAL', payload: total });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Selectors
  const getEntity = useCallback((id: string | number) => {
    return state.entitiesById.get(id);
  }, [state.entitiesById]);

  const getSelected = useCallback(() => {
    return Array.from(state.selectedIds)
      .map(id => state.entitiesById.get(id))
      .filter((e): e is T => e !== undefined);
  }, [state.selectedIds, state.entitiesById]);

  // Context value
  const value = useMemo<EntityStateContextValue<T>>(() => ({
    state,
    setEntities,
    addEntity,
    updateEntity,
    deleteEntity,
    select,
    deselect,
    selectAll,
    deselectAll,
    setSelected,
    setPage,
    setPageSize,
    setSort,
    setFilters,
    addFilter,
    removeFilter,
    setSearch,
    setLoading,
    setError,
    setTotal,
    reset,
    getEntity,
    getSelected
  }), [
    state,
    setEntities,
    addEntity,
    updateEntity,
    deleteEntity,
    select,
    deselect,
    selectAll,
    deselectAll,
    setSelected,
    setPage,
    setPageSize,
    setSort,
    setFilters,
    addFilter,
    removeFilter,
    setSearch,
    setLoading,
    setError,
    setTotal,
    reset,
    getEntity,
    getSelected
  ]);

  return (
    <EntityStateContext.Provider value={value}>
      {props.children}
    </EntityStateContext.Provider>
  );
}

/**
 * Use entity state hook
 */
export function useEntityState<T extends BaseEntity = BaseEntity>(): EntityStateContextValue<T> {
  const context = useContext(EntityStateContext);
  if (!context) {
    throw new Error('useEntityState must be used within EntityStateProvider');
  }
  return context as EntityStateContextValue<T>;
}
