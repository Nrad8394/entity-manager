/**
 * Entity Manager Orchestrator
 *
 * Thin orchestrator that coordinates all components.
 * Maximum ~150 lines - all logic delegated to hooks and components.
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.EntityManager = void 0;
var react_1 = require("react");
var list_1 = require("../components/list");
var form_1 = require("../components/form");
var view_1 = require("../components/view");
var exports_1 = require("../composition/exports");
var exports_2 = require("../composition/exports");
var createHttpClient_1 = require("../composition/api/createHttpClient");
var sonner_1 = require("sonner");
var button_1 = require("@/components/ui/button");
var EntityImporter_1 = require("@/components/entityManager/components/importer/EntityImporter");
var use_permissions_1 = require("@/hooks/use-permissions");
/**
 * Build query parameters for API calls
 */
function buildQueryParams(page, pageSize, sort, search, filters) {
    var queryParams = {
        page: page,
        pageSize: pageSize
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
function getErrorMessage(error, defaultMessage) {
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
function EntityManagerContent(props) {
    var _this = this;
    var _a, _b;
    var rawConfig = props.config;
    // Normalize legacy/compact config shapes into canonical EntityManagerConfig
    var normalizedConfig = react_1["default"].useMemo(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        var raw = rawConfig;
        var base = __assign({}, raw);
        var entity = base.config || {};
        var normalizedEntity = {
            name: entity.name || entity.entityName || entity.label || 'Entity',
            primaryKeyField: entity.primaryKeyField || 'id',
            label: entity.label || entity.entityName || entity.name || 'Entity',
            labelPlural: entity.labelPlural || entity.entityNamePlural || entity.pluralName || "" + (entity.name || entity.entityName || 'Entities'),
            description: entity.description,
            apiEndpoint: entity.apiEndpoint || entity.api || undefined,
            permissions: entity.permissions,
            metadata: entity.metadata,
            icon: entity.icon
        };
        // Normalize list
        var list = (_c = (_b = (_a = entity.list) !== null && _a !== void 0 ? _a : entity.columns) !== null && _b !== void 0 ? _b : entity.listConfig) !== null && _c !== void 0 ? _c : entity.listColumns;
        if (Array.isArray(list)) {
            normalizedEntity.list = { columns: list };
        }
        else {
            normalizedEntity.list = list || { columns: [] };
        }
        // Normalize view
        var view = (_e = (_d = entity.view) !== null && _d !== void 0 ? _d : entity.viewFields) !== null && _e !== void 0 ? _e : entity.viewConfig;
        if (Array.isArray(view)) {
            normalizedEntity.view = { fields: view };
        }
        else {
            normalizedEntity.view = view || { fields: [] };
        }
        // Normalize form fields
        normalizedEntity.form = (_f = entity.form) !== null && _f !== void 0 ? _f : { fields: (_g = entity.fields) !== null && _g !== void 0 ? _g : [] };
        // Normalize actions
        var actions = (_j = (_h = entity.actions) !== null && _h !== void 0 ? _h : entity.actionConfig) !== null && _j !== void 0 ? _j : {};
        if (Array.isArray(actions)) {
            normalizedEntity.actions = { actions: actions };
        }
        else if (actions.actions || actions.row || actions.bulk) {
            normalizedEntity.actions = {
                actions: actions.actions || actions.row || [],
                bulk: actions.bulk || []
            };
        }
        else {
            normalizedEntity.actions = actions;
        }
        // Normalize exporter
        var exporter = (_l = (_k = entity.exporter) !== null && _k !== void 0 ? _k : entity["export"]) !== null && _l !== void 0 ? _l : entity.exportConfig;
        if (Array.isArray(exporter)) {
            normalizedEntity.exporter = { fields: exporter };
        }
        else {
            normalizedEntity.exporter = exporter || { fields: [] };
        }
        return __assign(__assign({}, base), { config: normalizedEntity });
    }, [rawConfig]);
    // Use normalized config in place of raw config
    var config = normalizedConfig;
    // Permissions hook (gives current user's permissions and helpers)
    var permissionsHook = use_permissions_1.usePermissions();
    // Resolve entity-level permission specs (which can be boolean, string, or string[])
    var resolvedPermissions = react_1.useMemo(function () {
        var spec = config.config.permissions || {};
        var resolve = function (v, actionKey) {
            // If unspecified, default to allow (backwards compatibility)
            if (v === undefined)
                return true;
            // If boolean: interpret `true` as "require the user's entity-level permission"
            // and `false` as explicitly denied.
            if (typeof v === 'boolean') {
                return v;
            }
            // If a string or array, treat as permission codename(s)
            if (typeof v === 'string')
                return permissionsHook.hasPermission(v);
            if (Array.isArray(v))
                return v.some(function (p) { return permissionsHook.hasPermission(p); });
            return Boolean(v);
        };
        return {
            create: resolve(spec.create, 'create'),
            read: resolve(spec.read, 'read'),
            update: resolve(spec.update, 'update'),
            "delete": resolve(spec["delete"], 'delete'),
            "export": resolve(spec["export"], 'export')
        };
    }, [config.config.permissions, permissionsHook]);
    // Use initialView/initialId from config or props (props take precedence)
    var initialViewToUse = (_a = config.initialView) !== null && _a !== void 0 ? _a : 'list';
    var initialIdToUse = config.initialId;
    var onViewChangeToUse = config.onViewChange;
    var _c = react_1.useState(initialViewToUse), view = _c[0], setView = _c[1];
    var _d = react_1.useState(initialIdToUse || null), selectedId = _d[0], setSelectedId = _d[1];
    var fetchAttempted = react_1.useRef(false);
    var initialListFetchCompleted = react_1.useRef(false);
    var state = exports_1.useEntityState();
    var mutations = exports_2.useEntityMutations();
    // Create react-query hooks bound to the provided API client when available.
    // We keep calling the factory here (it's lightweight) so hooks are available
    // to useQuery/useMutation consumers below. If no client is provided, hooks
    // will be null and we fallback to imperative client calls.
    var rq = config.apiClient ? createHttpClient_1.createReactQueryHooks(config.apiClient) : null;
    // Memoize pagination config to prevent unnecessary re-renders
    var memoizedPaginationConfig = react_1.useMemo(function () { return (__assign(__assign({}, config.config.list.paginationConfig), { page: state.state.page, pageSize: state.state.pageSize, totalCount: state.state.total })); }, [config.config.list.paginationConfig, state.state.page, state.state.pageSize, state.state.total]);
    // Build a stable queryParams object used for react-query hooks when available
    var currentQueryParams = react_1.useMemo(function () { var _a; return buildQueryParams(state.state.page, state.state.pageSize, (_a = state.state.sort) !== null && _a !== void 0 ? _a : null, state.state.search, state.state.filters); }, [state.state.page, state.state.pageSize, state.state.sort, state.state.search, state.state.filters]);
    // Helper to normalize entity id from common shapes (id, pk, uuid, slug)
    var normalizeEntity = react_1.useCallback(function (e) {
        var _a, _b, _c, _d, _e;
        if (!e)
            return e;
        var id = (_e = (_d = (_c = (_b = (_a = e.id) !== null && _a !== void 0 ? _a : e.pk) !== null && _b !== void 0 ? _b : e.uuid) !== null && _c !== void 0 ? _c : e.slug) !== null && _d !== void 0 ? _d : e.name) !== null && _e !== void 0 ? _e : e.pk_id;
        return __assign(__assign({}, e), { id: id });
    }, []);
    // Bind react-query list/get hooks at top level (hooks must be called unconditionally)
    var listQuery = rq ? rq.useList(currentQueryParams, { enabled: false }) : null;
    var getQuery = rq ? rq.useGet(selectedId !== null && selectedId !== void 0 ? selectedId : undefined, { enabled: false }) : null;
    // Watch for initialView and initialId changes from parent
    react_1.useEffect(function () {
        setView(initialViewToUse);
        if (initialViewToUse === 'list') {
            setSelectedId(null);
        }
        else if (initialIdToUse !== undefined && initialIdToUse !== null) {
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
    var fetchEntities = react_1.useCallback(function (page, pageSize, sort, search, filters) { return __awaiter(_this, void 0, void 0, function () {
        var queryParams, result, response, respAny_1, normalized, data, response_1, normalized, data, error_1, errorMessage;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!config.apiClient)
                        return [2 /*return*/];
                    state.setLoading(true);
                    queryParams = buildQueryParams(page, pageSize, sort, search, filters);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, 7, 8]);
                    if (!(rq && listQuery)) return [3 /*break*/, 3];
                    return [4 /*yield*/, listQuery.refetch()];
                case 2:
                    result = _c.sent();
                    response = result.data;
                    respAny_1 = response;
                    normalized = (function () {
                        var _a;
                        if (respAny_1 && typeof respAny_1 === 'object') {
                            if ('data' in respAny_1) {
                                // Ensure data is an array
                                var dataValue = Array.isArray(respAny_1.data) ? respAny_1.data : [];
                                return { data: dataValue, meta: respAny_1.meta };
                            }
                            if ('results' in respAny_1) {
                                var resultsValue = Array.isArray(respAny_1.results) ? respAny_1.results : [];
                                return { data: resultsValue, meta: { total: (_a = respAny_1.count) !== null && _a !== void 0 ? _a : resultsValue.length } };
                            }
                        }
                        return { data: Array.isArray(respAny_1) ? respAny_1 : [] };
                    })();
                    data = Array.isArray(normalized.data) ? normalized.data.map(normalizeEntity) : [];
                    state.setEntities(data);
                    if (((_a = normalized.meta) === null || _a === void 0 ? void 0 : _a.total) !== undefined) {
                        state.setTotal(normalized.meta.total);
                    }
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, config.apiClient.list(queryParams)];
                case 4:
                    response_1 = _c.sent();
                    normalized = (function () {
                        var _a;
                        if (response_1 && typeof response_1 === 'object') {
                            if ('data' in response_1) {
                                var dataValue = Array.isArray(response_1.data) ? response_1.data : [];
                                return { data: dataValue, meta: response_1.meta };
                            }
                            if ('results' in response_1) {
                                var resultsValue = Array.isArray(response_1.results) ? response_1.results : [];
                                return { data: resultsValue, meta: { total: (_a = response_1.count) !== null && _a !== void 0 ? _a : resultsValue.length } };
                            }
                        }
                        return { data: Array.isArray(response_1) ? response_1 : [] };
                    })();
                    data = Array.isArray(normalized.data) ? normalized.data.map(normalizeEntity) : [];
                    state.setEntities(data);
                    if (((_b = normalized.meta) === null || _b === void 0 ? void 0 : _b.total) !== undefined) {
                        state.setTotal(normalized.meta.total);
                    }
                    _c.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_1 = _c.sent();
                    errorMessage = getErrorMessage(error_1, 'Failed to load data');
                    state.setError(errorMessage);
                    return [3 /*break*/, 8];
                case 7:
                    state.setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); }, [config, state]);
    /**
     * Fetch a single entity by ID
     */
    var fetchSingleEntity = react_1.useCallback(function (id, merge) {
        if (merge === void 0) { merge = false; }
        return __awaiter(_this, void 0, void 0, function () {
            var response, entity, error_2, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!config.apiClient)
                            return [2 /*return*/];
                        state.setLoading(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, config.apiClient.get(id)];
                    case 2:
                        response = _a.sent();
                        entity = normalizeEntity(('data' in response) ? response.data : response);
                        if (merge) {
                            state.updateEntity(entity);
                        }
                        else {
                            state.setEntities([entity]);
                            state.setTotal(1);
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_2 = _a.sent();
                        errorMessage = getErrorMessage(error_2, 'Failed to load entity');
                        state.setError(errorMessage);
                        return [3 /*break*/, 5];
                    case 4:
                        state.setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }, [config.apiClient, state, normalizeEntity]);
    // Auto-fetch data on mount if API client is available
    react_1.useEffect(function () {
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
            fetchSingleEntity(initialIdToUse).then(function () {
                initialListFetchCompleted.current = true;
            });
        }
        // If starting in list mode or create mode, fetch all entities
        else if (initialViewToUse === 'list' || initialViewToUse === 'create') {
            var _a = state.state, page = _a.page, pageSize = _a.pageSize, sort = _a.sort, search = _a.search, filters = _a.filters;
            fetchEntities(page, pageSize, sort !== null && sort !== void 0 ? sort : null, search, filters).then(function () {
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
    var prevFiltersKeyRef = react_1.useRef('');
    var prevFiltersObjectRef = react_1.useRef([]);
    var stableFilters = react_1.useMemo(function () {
        var filtersJson = JSON.stringify(state.state.filters);
        // If key matches previous key, return the same object reference to avoid re-renders
        if (filtersJson === prevFiltersKeyRef.current) {
            return prevFiltersObjectRef.current;
        }
        // Otherwise return the new filters (do not mutate prevFiltersKeyRef here - update after fetch)
        return state.state.filters;
    }, [state.state.filters]);
    // Refetch data when sorting, search, or filters change (but not pagination, handled directly)
    // Track previous values to prevent unnecessary refetches
    var prevSortRef = react_1.useRef(null);
    var prevSearchRef = react_1.useRef('');
    var searchDebounceRef = react_1.useRef(null);
    react_1.useEffect(function () {
        if (!config.apiClient || view !== 'list')
            return;
        if (!initialListFetchCompleted.current)
            return;
        var _a = state.state, page = _a.page, pageSize = _a.pageSize, sort = _a.sort, search = _a.search;
        var sortKey = sort ? sort.field + "-" + sort.direction : null;
        var filtersKey = JSON.stringify(state.state.filters);
        var sortChanged = sortKey !== prevSortRef.current;
        var searchChanged = search !== prevSearchRef.current;
        var filtersChanged = filtersKey !== prevFiltersKeyRef.current;
        // If nothing changed, skip
        if (!sortChanged && !searchChanged && !filtersChanged)
            return;
        // If search changed but filters/sort did not, debounce the search to avoid rapid requests
        if (searchChanged && !sortChanged && !filtersChanged) {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
            // eslint-disable-next-line @typescript-eslint/no-implied-eval
            searchDebounceRef.current = window.setTimeout(function () {
                prevSearchRef.current = search;
                prevFiltersKeyRef.current = filtersKey;
                prevFiltersObjectRef.current = state.state.filters;
                prevSortRef.current = sortKey;
                fetchEntities(page, pageSize, sort !== null && sort !== void 0 ? sort : null, search, state.state.filters);
                searchDebounceRef.current = null;
            }, 350);
            return;
        }
        // Immediate fetch for sort or filters changes
        prevSortRef.current = sortKey;
        prevSearchRef.current = search;
        prevFiltersKeyRef.current = filtersKey;
        prevFiltersObjectRef.current = state.state.filters;
        fetchEntities(page, pageSize, sort !== null && sort !== void 0 ? sort : null, search, stableFilters);
        // Using specific state properties to prevent infinite loop - state.state changes on every update
        // eslint-disable-next-line react-hooks/exhaustive-deps
        return function () {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
                searchDebounceRef.current = null;
            }
        };
    }, [config.apiClient, view, state.state.sort, state.state.search, state.state.page, state.state.pageSize, stableFilters, fetchEntities]);
    // listen for view change and call onviewchange callback
    react_1.useEffect(function () {
        onViewChangeToUse === null || onViewChangeToUse === void 0 ? void 0 : onViewChangeToUse(view);
    }, [view, onViewChangeToUse]);
    // Get selected entity
    var selectedEntity = selectedId ? state.getEntity(selectedId) : undefined;
    // Refresh function for actions
    var refreshData = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, page, pageSize, sort, search;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!config.apiClient || view !== 'list')
                        return [2 /*return*/];
                    _a = state.state, page = _a.page, pageSize = _a.pageSize, sort = _a.sort, search = _a.search;
                    return [4 /*yield*/, fetchEntities(page, pageSize, sort !== null && sort !== void 0 ? sort : null, search, stableFilters)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [config.apiClient, view, state.state.page, state.state.pageSize, state.state.sort, state.state.search, stableFilters, fetchEntities]);
    // Memoize actions with context to prevent re-renders
    var actionsWithContext = react_1.useMemo(function () {
        if (!config.config.actions)
            return undefined;
        // Clone actions to avoid mutating original config
        var raw = config.config.actions;
        var clone = __assign({}, raw);
        // Helper to infer required entity-level permission for actions that don't declare action-level permissions
        var inferEntityRequirement = function (action) {
            // If action explicitly declares a permission, don't infer
            if (action.permission || (Array.isArray(action.permissions) && action.permissions.length > 0))
                return {};
            var id = String(action.id || '').toLowerCase();
            var label = String(action.label || '').toLowerCase();
            if (id.includes('delete') || label.includes('delete') || action.variant === 'destructive')
                return { require: 'delete' };
            if (id.includes('export') || label.includes('export'))
                return { require: 'export' };
            if (id.includes('create') || label.includes('create') || id.includes('add'))
                return { require: 'create' };
            return {};
        };
        // Filter helper applying resolved entity permissions
        var filterArray = function (arr) {
            if (!Array.isArray(arr))
                return arr;
            return arr.filter(function (a) {
                var inferred = inferEntityRequirement(a);
                if (inferred.require) {
                    return Boolean(resolvedPermissions[inferred.require]);
                }
                return true;
            });
        };
        // Support both normalized `actions.actions` and legacy { row, bulk } shapes
        var normalizedActions = Array.isArray(raw.actions) ? raw.actions : (Array.isArray(raw.row) ? raw.row : []);
        var normalizedBulk = Array.isArray(raw.bulk) ? raw.bulk : [];
        var filteredActions = filterArray(normalizedActions);
        var filteredBulk = filterArray(normalizedBulk);
        return __assign(__assign({}, raw), { actions: filteredActions, bulk: filteredBulk, context: __assign(__assign({}, raw.context), { refresh: refreshData, customData: {
                    allData: state.state.entities
                }, 
                // Permissions context: provide current user's permission codenames to action handlers
                permissions: permissionsHook.userPermissions, 
                // Also include resolved entity-level permissions for action handlers
                entityPermissions: resolvedPermissions }) });
    }, [config.config.actions, refreshData, state.state.entities, permissionsHook.userPermissions, resolvedPermissions]);
    // Importer modal state
    var _e = react_1["default"].useState(false), importerOpen = _e[0], setImporterOpen = _e[1];
    // Helper to download blob
    var downloadBlob = function (blob, filename) {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };
    // Build default toolbar actions (Import / Template / Export) when apiClient exists
    var toolbarActionsNode = react_1.useMemo(function () {
        if (!config.apiClient)
            return null;
        // Template download is handled inside the Importer modal
        var handleExport = function (format) {
            if (format === void 0) { format = 'csv'; }
            return __awaiter(_this, void 0, void 0, function () {
                var rawFields, fields, blob, baseName, fname, err_1;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 2, , 3]);
                            rawFields = (_b = (_a = config.config.exporter) === null || _a === void 0 ? void 0 : _a.fields) !== null && _b !== void 0 ? _b : undefined;
                            fields = rawFields ? rawFields.map(function (f) {
                                var _a, _b, _c, _d;
                                if (typeof f === 'string')
                                    return f;
                                if (f == null)
                                    return String(f);
                                // Prefer `key`, then `name`, then `field`
                                if (typeof f === 'object')
                                    return String((_d = (_c = (_b = (_a = f.key) !== null && _a !== void 0 ? _a : f.name) !== null && _b !== void 0 ? _b : f.field) !== null && _c !== void 0 ? _c : f.value) !== null && _d !== void 0 ? _d : JSON.stringify(f));
                                return String(f);
                            }) : undefined;
                            return [4 /*yield*/, config.apiClient.bulkExport({ fields: fields, file_format: format })];
                        case 1:
                            blob = _c.sent();
                            baseName = config.config.label || config.config.name || 'export';
                            fname = baseName + "_Export." + (format === 'csv' ? 'csv' : 'xlsx');
                            downloadBlob(blob, fname);
                            sonner_1.toast.success('Export started');
                            return [3 /*break*/, 3];
                        case 2:
                            err_1 = _c.sent();
                            sonner_1.toast.error('Export failed');
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return (react_1["default"].createElement("div", { className: "flex items-center gap-2" },
            resolvedPermissions.create && (react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setImporterOpen(true); } }, "Import")),
            resolvedPermissions["export"] && (react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleExport('csv'); } }, "Export (CSV)"))));
    }, [config.apiClient, config.config.name, config.config.exporter, resolvedPermissions, config.config.label]);
    // Handle edit
    var handleEdit = react_1.useCallback(function (entity) {
        // Respect entity-level update permission
        if (!resolvedPermissions.update) {
            sonner_1.toast.error('You do not have permission to edit this item');
            return;
        }
        setView('edit');
        setSelectedId(entity[config.config.primaryKeyField || 'id']);
        fetchSingleEntity(entity[config.config.primaryKeyField || 'id'], true);
    }, [fetchSingleEntity, resolvedPermissions]);
    // Handle view
    var handleView = react_1.useCallback(function (entity) {
        // Respect entity-level read permission
        if (!resolvedPermissions.read) {
            sonner_1.toast.error('You do not have permission to view this item');
            return;
        }
        setView('view');
        setSelectedId(entity[config.config.primaryKeyField || 'id']);
        fetchSingleEntity(entity[config.config.primaryKeyField || 'id'], true);
    }, [fetchSingleEntity, resolvedPermissions]);
    // Handle back to list
    var handleBack = react_1.useCallback(function () {
        setView('list');
        setSelectedId(null);
    }, []);
    // Handle form submit
    var handleSubmit = react_1.useCallback(function (values) { return __awaiter(_this, void 0, void 0, function () {
        var created, updated, error_3, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!(view === 'create')) return [3 /*break*/, 2];
                    return [4 /*yield*/, mutations.create(values)];
                case 1:
                    created = _a.sent();
                    state.addEntity(created);
                    sonner_1.toast.success('Created successfully');
                    return [3 /*break*/, 4];
                case 2:
                    if (!(view === 'edit' && selectedId)) return [3 /*break*/, 4];
                    return [4 /*yield*/, mutations.update(selectedId, values)];
                case 3:
                    updated = _a.sent();
                    state.updateEntity(updated);
                    sonner_1.toast.success('Updated successfully');
                    _a.label = 4;
                case 4:
                    handleBack();
                    return [3 /*break*/, 6];
                case 5:
                    error_3 = _a.sent();
                    errorMessage = getErrorMessage(error_3, 'Operation failed');
                    state.setError(errorMessage);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [view, selectedId, mutations, state, handleBack]);
    // Handle pagination change
    var handlePaginationChange = react_1.useCallback(function (paginationConfig) { return __awaiter(_this, void 0, void 0, function () {
        var newPage, newPageSize, _a, sort, search, filters;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    newPage = paginationConfig.page || 1;
                    newPageSize = paginationConfig.pageSize || 10;
                    // Update state immediately
                    state.setPage(newPage);
                    state.setPageSize(newPageSize);
                    if (!(config.apiClient && view === 'list')) return [3 /*break*/, 2];
                    _a = state.state, sort = _a.sort, search = _a.search, filters = _a.filters;
                    return [4 /*yield*/, fetchEntities(newPage, newPageSize, sort !== null && sort !== void 0 ? sort : null, search, filters)];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); }, [config.apiClient, view, state, fetchEntities]);
    // Render breadcrumbs
    var renderBreadcrumbs = function () {
        return (react_1["default"].createElement("nav", { className: "flex mb-3 sm:mb-4 text-xs sm:text-sm overflow-x-auto", "aria-label": "Breadcrumb" },
            react_1["default"].createElement("ol", { className: "inline-flex items-center space-x-1 md:space-x-2 min-w-max px-1" },
                react_1["default"].createElement("li", { className: "inline-flex items-center" },
                    react_1["default"].createElement("button", { onClick: handleBack, className: "inline-flex items-center font-medium transition-colors " + (view === 'list'
                            ? 'text-primary cursor-default'
                            : 'text-muted-foreground hover:text-primary'), disabled: view === 'list', "aria-current": view === 'list' ? 'page' : undefined }, config.config.name || 'Items')),
                view !== 'list' && (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement("li", { "aria-hidden": "true" },
                        react_1["default"].createElement("div", { className: "flex items-center" },
                            react_1["default"].createElement("svg", { className: "w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground mx-1", fill: "none", viewBox: "0 0 6 10" },
                                react_1["default"].createElement("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 9 4-4-4-4" })))),
                    react_1["default"].createElement("li", null,
                        react_1["default"].createElement("span", { className: "ml-0.5 sm:ml-1 font-medium text-primary" },
                            view === 'create' && 'Create New',
                            view === 'edit' && 'Edit',
                            view === 'view' && 'View Details')))))));
    };
    // Render list view
    if (view === 'list') {
        return (react_1["default"].createElement("div", { className: "space-y-4" },
            renderBreadcrumbs(),
            react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement(list_1.EntityList, { data: state.state.entities, columns: config.config.list.columns, view: "table", toolbar: __assign(__assign({}, (config.config.list.toolbar || {})), { actions: (react_1["default"].createElement(react_1["default"].Fragment, null, (_b = config.config.list.toolbar) === null || _b === void 0 ? void 0 :
                            _b.actions,
                            toolbarActionsNode)) }), selectable: config.config.list.selectable, multiSelect: config.config.list.multiSelect, selectedIds: state.state.selectedIds, onSelectionChange: state.setSelected, onRowClick: config.config.list.onRowClick || handleView, onRowDoubleClick: config.config.list.onRowDoubleClick || handleEdit, pagination: true, paginationConfig: memoizedPaginationConfig, onPaginationChange: handlePaginationChange, sortable: config.config.list.sortable, sortConfig: state.state.sort, onSortChange: state.setSort, filterable: config.config.list.filterable, filterConfigs: state.state.filters, onFilterChange: state.setFilters, searchable: config.config.list.searchable, searchValue: state.state.search, onSearchChange: state.setSearch, searchPlaceholder: config.config.list.searchPlaceholder, emptyMessage: config.config.list.emptyMessage, onCreate: function () {
                        // Switch to create form when user clicks create from empty state
                        setView('create');
                        setSelectedId(null);
                    }, loading: state.state.loading, error: state.state.error, actions: actionsWithContext, className: config.config.list.className, hover: config.config.list.hover, striped: config.config.list.striped, bordered: config.config.list.bordered, titleField: config.config.list.titleField, subtitleField: config.config.list.subtitleField, imageField: config.config.list.imageField, dateField: config.config.list.dateField }),
                importerOpen && (react_1["default"].createElement(EntityImporter_1["default"], { apiClient: config.apiClient, open: importerOpen, onClose: function () { return setImporterOpen(false); }, entityName: config.config.label || config.config.name, onImported: function (summary) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!summary) return [3 /*break*/, 3];
                                    // Show import result toast
                                    sonner_1.toast.success("Imported " + summary.imported + " items");
                                    if (summary.errors && summary.errors.length > 0) {
                                        sonner_1.toast.error(summary.errors.length + " errors occurred during import");
                                        // Keep importer open so user can review errors in the result step
                                        console.warn('Import errors:', summary.errors);
                                    }
                                    if (!(summary.imported > 0 && refreshData)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, refreshData()];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2: return [3 /*break*/, 4];
                                case 3:
                                    sonner_1.toast.error('Import completed with no summary');
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); } })))));
    }
    // Render form view (create/edit)
    if (view === 'create' || view === 'edit') {
        var currentMode = view === 'create' ? 'create' : 'edit';
        var formLayout = config.config.form.layout;
        var formSections = config.config.form.sections;
        var formFields = config.config.form.fields;
        return (react_1["default"].createElement("div", { className: "space-y-3 sm:space-y-4" },
            renderBreadcrumbs(),
            react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-sm p-4 sm:p-6" },
                react_1["default"].createElement(form_1.EntityForm, { fields: formFields, entity: view === 'edit' ? selectedEntity : undefined, mode: currentMode, layout: formLayout, sections: formSections, onSubmit: handleSubmit, onCancel: handleBack, onValidate: config.config.onValidate }))));
    }
    // Render detail view
    if (view === 'view') {
        if (!selectedEntity) {
            return (react_1["default"].createElement("div", { className: "space-y-3 sm:space-y-4" },
                renderBreadcrumbs(),
                react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-sm p-4 sm:p-6 text-center" },
                    react_1["default"].createElement("p", { className: "text-sm sm:text-base text-muted-foreground mb-4" }, "No entity selected"),
                    react_1["default"].createElement("button", { onClick: handleBack, className: "px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors" }, "Back to List"))));
        }
        return (react_1["default"].createElement("div", { className: "space-y-3 sm:space-y-4" },
            renderBreadcrumbs(),
            react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-sm p-4 sm:p-6" },
                react_1["default"].createElement(view_1.EntityView, { entity: selectedEntity, fields: config.config.view.fields, groups: config.config.view.groups, mode: config.config.view.mode || "detail", showMetadata: config.config.view.showMetadata, tabs: config.config.view.tabs, titleField: config.config.view.titleField, subtitleField: config.config.view.subtitleField, imageField: config.config.view.imageField, loading: state.state.loading, error: state.state.error, className: config.config.view.className, onCopy: function () {
                        sonner_1.toast.success('Successfully copied to clipboard');
                    }, actions: config.config.view.actions }))));
    }
    return null;
}
/**
 * Entity Manager Component
 */
function EntityManager(props) {
    var _a;
    var config = props.config, _b = props.className, className = _b === void 0 ? '' : _b, children = props.children;
    // Custom layout via children
    if (children) {
        return react_1["default"].createElement("div", { className: "timex " + className }, children);
    }
    // Default layout with providers
    return (react_1["default"].createElement("div", { className: "nnp-timex " + className },
        react_1["default"].createElement(exports_1.EntityStateProvider, { initialEntities: config.initialData, initialPageSize: ((_a = config.config.list.paginationConfig) === null || _a === void 0 ? void 0 : _a.pageSize) || 10, initialSort: config.config.list.sortConfig, initialFilters: config.initialFilters, primaryKeyField: config.config.primaryKeyField || 'id' }, config.apiClient ? (react_1["default"].createElement(exports_2.EntityApiProvider, { client: config.apiClient },
            react_1["default"].createElement(EntityManagerContent, __assign({}, props)))) : (react_1["default"].createElement(EntityManagerContent, __assign({}, props))))));
}
exports.EntityManager = EntityManager;
