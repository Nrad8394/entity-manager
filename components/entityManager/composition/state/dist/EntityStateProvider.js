/**
 * Entity State Provider
 *
 * React context provider for centralized entity state management.
 */
'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.useEntityState = exports.EntityStateProvider = void 0;
var react_1 = require("react");
/**
 * Create initial state
 */
function createInitialState(props) {
    var entities = props.initialEntities || [];
    var primaryKeyField = props.primaryKeyField || 'id';
    var entitiesById = new Map(entities.map(function (e) { return [e[primaryKeyField], e]; }));
    return {
        entities: entities,
        entitiesById: entitiesById,
        selectedIds: new Set(),
        primaryKeyField: primaryKeyField,
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
function entityStateReducer(state, action) {
    switch (action.type) {
        case 'SET_ENTITIES': {
            var payload = action.payload || [];
            var entitiesById = new Map(payload.map(function (e) { return [e[state.primaryKeyField], e]; }));
            return __assign(__assign({}, state), { entities: payload, entitiesById: entitiesById });
        }
        case 'ADD_ENTITY': {
            var entities = __spreadArrays(state.entities, [action.payload]);
            var entitiesById = new Map(state.entitiesById);
            entitiesById.set(action.payload[state.primaryKeyField], action.payload);
            return __assign(__assign({}, state), { entities: entities, entitiesById: entitiesById });
        }
        case 'UPDATE_ENTITY': {
            var entities = state.entities.map(function (e) {
                return e[state.primaryKeyField] === action.payload[state.primaryKeyField] ? action.payload : e;
            });
            var entitiesById = new Map(state.entitiesById);
            entitiesById.set(action.payload[state.primaryKeyField], action.payload);
            return __assign(__assign({}, state), { entities: entities, entitiesById: entitiesById });
        }
        case 'DELETE_ENTITY': {
            var entities = state.entities.filter(function (e) { return e[state.primaryKeyField] !== action.payload; });
            var entitiesById = new Map(state.entitiesById);
            entitiesById["delete"](action.payload);
            var selectedIds = new Set(state.selectedIds);
            selectedIds["delete"](action.payload);
            return __assign(__assign({}, state), { entities: entities, entitiesById: entitiesById, selectedIds: selectedIds });
        }
        case 'SET_SELECTED':
            return __assign(__assign({}, state), { selectedIds: action.payload });
        case 'SELECT': {
            var selectedIds = new Set(state.selectedIds);
            selectedIds.add(action.payload);
            return __assign(__assign({}, state), { selectedIds: selectedIds });
        }
        case 'DESELECT': {
            var selectedIds = new Set(state.selectedIds);
            selectedIds["delete"](action.payload);
            return __assign(__assign({}, state), { selectedIds: selectedIds });
        }
        case 'SELECT_ALL': {
            var selectedIds = new Set(state.entities.map(function (e) { return e[state.primaryKeyField]; }));
            return __assign(__assign({}, state), { selectedIds: selectedIds });
        }
        case 'DESELECT_ALL':
            return __assign(__assign({}, state), { selectedIds: new Set() });
        case 'SET_PAGE':
            return __assign(__assign({}, state), { page: action.payload });
        case 'SET_PAGE_SIZE':
            return __assign(__assign({}, state), { pageSize: action.payload, page: 1 });
        case 'SET_SORT':
            return __assign(__assign({}, state), { sort: action.payload });
        case 'SET_FILTERS': {
            // Deduplicate filters before setting
            var uniqueFilters = action.payload.filter(function (filter, index, self) {
                return index === self.findIndex(function (f) {
                    return f.field === filter.field && f.operator === filter.operator;
                });
            });
            return __assign(__assign({}, state), { filters: uniqueFilters, page: 1 });
        }
        case 'ADD_FILTER': {
            var filters = __spreadArrays(state.filters, [action.payload]);
            return __assign(__assign({}, state), { filters: filters, page: 1 });
        }
        case 'REMOVE_FILTER': {
            var filters = state.filters.filter(function (f) { return f.field !== action.payload; });
            return __assign(__assign({}, state), { filters: filters, page: 1 });
        }
        case 'SET_SEARCH':
            return __assign(__assign({}, state), { search: action.payload, page: 1 });
        case 'SET_LOADING':
            return __assign(__assign({}, state), { loading: action.payload });
        case 'SET_ERROR':
            return __assign(__assign({}, state), { error: action.payload || undefined, loading: false });
        case 'SET_TOTAL':
            return __assign(__assign({}, state), { total: action.payload });
        case 'RESET':
            return createInitialState({ initialEntities: state.entities, children: null });
        default:
            return state;
    }
}
/**
 * Entity state context
 */
var EntityStateContext = react_1.createContext(null);
/**
 * Entity state provider component
 */
function EntityStateProvider(props) {
    var _a = react_1.useReducer(entityStateReducer < T > , props, createInitialState), state = _a[0], dispatch = _a[1];
    // Actions
    var setEntities = react_1.useCallback(function (entities) {
        dispatch({ type: 'SET_ENTITIES', payload: entities });
    }, []);
    var addEntity = react_1.useCallback(function (entity) {
        dispatch({ type: 'ADD_ENTITY', payload: entity });
    }, []);
    var updateEntity = react_1.useCallback(function (entity) {
        dispatch({ type: 'UPDATE_ENTITY', payload: entity });
    }, []);
    var deleteEntity = react_1.useCallback(function (id) {
        dispatch({ type: 'DELETE_ENTITY', payload: id });
    }, []);
    var select = react_1.useCallback(function (id) {
        dispatch({ type: 'SELECT', payload: id });
    }, []);
    var deselect = react_1.useCallback(function (id) {
        dispatch({ type: 'DESELECT', payload: id });
    }, []);
    var selectAll = react_1.useCallback(function () {
        dispatch({ type: 'SELECT_ALL' });
    }, []);
    var deselectAll = react_1.useCallback(function () {
        dispatch({ type: 'DESELECT_ALL' });
    }, []);
    var setSelected = react_1.useCallback(function (ids) {
        dispatch({ type: 'SET_SELECTED', payload: ids });
    }, []);
    // NOTE: Some callers (older UI code) may call these setters synchronously
    // while rendering another component which can cause the React warning
    // "Cannot update a component while rendering a different component".
    // To avoid that class of bug we defer dispatching the actions to the next
    // microtask so updates never happen during another component's render
    // phase. This keeps behaviour identical but avoids the warning and makes
    // it safe for callers that inadvertently call setters during render.
    var defer = function (fn) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            Promise.resolve().then(function () { return fn.apply(void 0, args); });
        };
    };
    var setPage = react_1.useCallback(defer(function (page) {
        dispatch({ type: 'SET_PAGE', payload: page });
    }), []);
    var setPageSize = react_1.useCallback(defer(function (pageSize) {
        dispatch({ type: 'SET_PAGE_SIZE', payload: pageSize });
    }), []);
    var setSort = react_1.useCallback(defer(function (sort) {
        dispatch({ type: 'SET_SORT', payload: sort });
    }), []);
    var setFilters = react_1.useCallback(defer(function (filters) {
        dispatch({ type: 'SET_FILTERS', payload: filters });
    }), []);
    var addFilter = react_1.useCallback(defer(function (filter) {
        dispatch({ type: 'ADD_FILTER', payload: filter });
    }), []);
    var removeFilter = react_1.useCallback(defer(function (field) {
        dispatch({ type: 'REMOVE_FILTER', payload: field });
    }), []);
    var setSearch = react_1.useCallback(function (search) {
        dispatch({ type: 'SET_SEARCH', payload: search });
    }, []);
    var setLoading = react_1.useCallback(function (loading) {
        dispatch({ type: 'SET_LOADING', payload: loading });
    }, []);
    var setError = react_1.useCallback(function (error) {
        dispatch({ type: 'SET_ERROR', payload: error });
    }, []);
    var setTotal = react_1.useCallback(function (total) {
        dispatch({ type: 'SET_TOTAL', payload: total });
    }, []);
    var reset = react_1.useCallback(function () {
        dispatch({ type: 'RESET' });
    }, []);
    // Selectors
    var getEntity = react_1.useCallback(function (id) {
        return state.entitiesById.get(id);
    }, [state.entitiesById]);
    var getSelected = react_1.useCallback(function () {
        return Array.from(state.selectedIds)
            .map(function (id) { return state.entitiesById.get(id); })
            .filter(function (e) { return e !== undefined; });
    }, [state.selectedIds, state.entitiesById]);
    // Context value
    var value = react_1.useMemo(function () { return ({
        state: state,
        setEntities: setEntities,
        addEntity: addEntity,
        updateEntity: updateEntity,
        deleteEntity: deleteEntity,
        select: select,
        deselect: deselect,
        selectAll: selectAll,
        deselectAll: deselectAll,
        setSelected: setSelected,
        setPage: setPage,
        setPageSize: setPageSize,
        setSort: setSort,
        setFilters: setFilters,
        addFilter: addFilter,
        removeFilter: removeFilter,
        setSearch: setSearch,
        setLoading: setLoading,
        setError: setError,
        setTotal: setTotal,
        reset: reset,
        getEntity: getEntity,
        getSelected: getSelected
    }); }, [
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
    return (react_1["default"].createElement(EntityStateContext.Provider, { value: value }, props.children));
}
exports.EntityStateProvider = EntityStateProvider;
/**
 * Use entity state hook
 */
function useEntityState() {
    var context = react_1.useContext(EntityStateContext);
    if (!context) {
        throw new Error('useEntityState must be used within EntityStateProvider');
    }
    return context;
}
exports.useEntityState = useEntityState;
