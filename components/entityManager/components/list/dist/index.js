/**
 * EntityList Component
 *
 * Comprehensive list component with 8 view modes, search, filter, sort, and pagination.
 * Standalone component - works independently.
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.EntityList = void 0;
var react_1 = require("react");
var date_fns_1 = require("date-fns");
var image_1 = require("next/image");
var actions_1 = require("../actions");
var utils_1 = require("./utils");
var Skeleton_1 = require("./components/Skeleton");
var EmptyState_1 = require("./components/EmptyState");
var ErrorState_1 = require("./components/ErrorState");
var DensitySelector_1 = require("./components/DensitySelector");
var ViewSelector_1 = require("./components/ViewSelector");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
/**
 * EntityList component
 */
function EntityList(props) {
    var _this = this;
    var _a, _b, _c;
    var data = props.data, columns = props.columns, _d = props.view, viewProp = _d === void 0 ? 'table' : _d, _e = props.toolbar, toolbar = _e === void 0 ? {} : _e, _f = props.selectable, selectable = _f === void 0 ? false : _f, _g = props.multiSelect, multiSelect = _g === void 0 ? false : _g, selectedIdsProp = props.selectedIds, onSelectionChange = props.onSelectionChange, onRowClick = props.onRowClick, onRowDoubleClick = props.onRowDoubleClick, _h = props.pagination, pagination = _h === void 0 ? false : _h, paginationConfig = props.paginationConfig, onPaginationChange = props.onPaginationChange, _j = props.sortable, sortable = _j === void 0 ? false : _j, sortConfigProp = props.sortConfig, onSortChange = props.onSortChange, _k = props.filterable, filterable = _k === void 0 ? false : _k, filterConfigsProp = props.filterConfigs, onFilterChange = props.onFilterChange, _l = props.searchable, searchable = _l === void 0 ? false : _l, searchValueProp = props.searchValue, onSearchChange = props.onSearchChange, _m = props.searchPlaceholder, searchPlaceholder = _m === void 0 ? 'Search...' : _m, emptyMessage = props.emptyMessage, _o = props.loading, loading = _o === void 0 ? false : _o, error = props.error, actions = props.actions, _p = props.className, className = _p === void 0 ? '' : _p, rowClassName = props.rowClassName, _q = props.hover, hover = _q === void 0 ? true : _q, _r = props.striped, striped = _r === void 0 ? false : _r, titleField = props.titleField, subtitleField = props.subtitleField, imageField = props.imageField, dateField = props.dateField;
    // State
    var validPageSizes = utils_1.getDefaultPageSizes();
    var _s = react_1.useState({
        view: viewProp,
        selectedIds: selectedIdsProp || new Set(),
        page: (paginationConfig === null || paginationConfig === void 0 ? void 0 : paginationConfig.page) || 1,
        // If caller provides a pageSize via paginationConfig, respect it even if it's not in the default options
        pageSize: (_a = paginationConfig === null || paginationConfig === void 0 ? void 0 : paginationConfig.pageSize) !== null && _a !== void 0 ? _a : 10,
        sort: sortConfigProp,
        filters: filterConfigsProp || [],
        search: searchValueProp || '',
        visibleColumns: new Set(columns.map(function (c) { return String(c.key); })),
        columnWidths: new Map(),
        bulkActionsOpen: false
    }), state = _s[0], setState = _s[1];
    // Density state (separate from main state)
    var _t = react_1.useState('comfortable'), density = _t[0], setDensity = _t[1];
    // Refs to track internal updates and prevent circular syncing
    var isInternalFilterUpdate = react_1["default"].useRef(false);
    var isInternalSortUpdate = react_1["default"].useRef(false);
    var isInternalSearchUpdate = react_1["default"].useRef(false);
    // Filter dropdown state
    var _u = react_1.useState(false), filterDropdownOpen = _u[0], setFilterDropdownOpen = _u[1];
    var _v = react_1.useState(false), filterDialogOpen = _v[0], setFilterDialogOpen = _v[1];
    var _w = react_1.useState(null), selectedFilterField = _w[0], setSelectedFilterField = _w[1];
    var _x = react_1.useState('equals'), filterOperator = _x[0], setFilterOperator = _x[1];
    var _y = react_1.useState(''), filterValue = _y[0], setFilterValue = _y[1];
    var _z = react_1.useState(''), filterValue2 = _z[0], setFilterValue2 = _z[1]; // For 'between' operator
    // Filter actions by type and position
    var toolbarBulkActions = react_1.useMemo(function () {
        if (!(actions === null || actions === void 0 ? void 0 : actions.actions))
            return [];
        return actions.actions.filter(function (action) {
            return action.actionType === 'bulk' &&
                (action.position === 'toolbar' || !action.position);
        });
    }, [actions === null || actions === void 0 ? void 0 : actions.actions]);
    var toolbarNonBulkActions = react_1.useMemo(function () {
        if (!(actions === null || actions === void 0 ? void 0 : actions.actions))
            return [];
        return actions.actions.filter(function (action) {
            return action.actionType !== 'bulk' &&
                action.position === 'toolbar';
        });
    }, [actions === null || actions === void 0 ? void 0 : actions.actions]);
    var rowActions = react_1.useMemo(function () {
        if (!(actions === null || actions === void 0 ? void 0 : actions.actions))
            return [];
        return actions.actions.filter(function (action) {
            return action.actionType !== 'bulk' &&
                (action.position === 'row' || action.position === 'dropdown' || action.position === 'context-menu' || !action.position);
        });
    }, [actions === null || actions === void 0 ? void 0 : actions.actions]);
    // Get selected entities for bulk actions
    var selectedEntities = react_1.useMemo(function () {
        return data.filter(function (entity) { return state.selectedIds.has(entity.id); });
    }, [data, state.selectedIds]);
    // Create action context
    var actionContext = react_1.useMemo(function () {
        var _a, _b;
        // Only provide an action context if the caller explicitly supplied one via actions.context
        if (!actions || !actions.context)
            return undefined;
        return {
            selectedEntities: selectedEntities,
            selectedIds: state.selectedIds,
            refresh: (_a = actions.context) === null || _a === void 0 ? void 0 : _a.refresh,
            customData: (_b = actions.context) === null || _b === void 0 ? void 0 : _b.customData
        };
    }, [actions, selectedEntities, state.selectedIds]);
    // Click handling state
    var _0 = react_1.useState(null), clickTimeoutRef = _0[0], setClickTimeoutRef = _0[1];
    var _1 = react_1.useState(0), lastClickTime = _1[0], setLastClickTime = _1[1];
    var _2 = react_1.useState(0), clickCount = _2[0], setClickCount = _2[1];
    // Sync external state
    react_1["default"].useEffect(function () {
        if (selectedIdsProp) {
            setState(function (prev) { return (__assign(__assign({}, prev), { selectedIds: selectedIdsProp })); });
        }
    }, [selectedIdsProp]);
    react_1["default"].useEffect(function () {
        if (sortConfigProp && !isInternalSortUpdate.current) {
            setState(function (prev) { return (__assign(__assign({}, prev), { sort: sortConfigProp })); });
        }
        isInternalSortUpdate.current = false;
    }, [sortConfigProp]);
    react_1["default"].useEffect(function () {
        if (filterConfigsProp && !isInternalFilterUpdate.current) {
            // Deduplicate filters before setting
            var uniqueFilters_1 = filterConfigsProp.filter(function (filter, index, self) {
                return index === self.findIndex(function (f) {
                    return f.field === filter.field && f.operator === filter.operator;
                });
            });
            setState(function (prev) { return (__assign(__assign({}, prev), { filters: uniqueFilters_1 })); });
        }
        isInternalFilterUpdate.current = false;
    }, [filterConfigsProp]);
    react_1["default"].useEffect(function () {
        if (searchValueProp !== undefined && !isInternalSearchUpdate.current) {
            setState(function (prev) { return (__assign(__assign({}, prev), { search: searchValueProp })); });
        }
        isInternalSearchUpdate.current = false;
    }, [searchValueProp]);
    // Sync pagination config changes
    react_1["default"].useEffect(function () {
        if ((paginationConfig === null || paginationConfig === void 0 ? void 0 : paginationConfig.page) !== undefined && paginationConfig.page !== state.page) {
            setState(function (prev) { return (__assign(__assign({}, prev), { page: paginationConfig.page || 1 })); });
        }
    }, [paginationConfig === null || paginationConfig === void 0 ? void 0 : paginationConfig.page, state.page]);
    react_1["default"].useEffect(function () {
        if ((paginationConfig === null || paginationConfig === void 0 ? void 0 : paginationConfig.pageSize) !== undefined && paginationConfig.pageSize !== state.pageSize) {
            // Accept the provided pageSize directly and reset to page 1
            setState(function (prev) { return (__assign(__assign({}, prev), { pageSize: paginationConfig.pageSize, page: 1 })); });
        }
    }, [paginationConfig === null || paginationConfig === void 0 ? void 0 : paginationConfig.pageSize, state.pageSize]);
    // Process data
    var processedData = react_1.useMemo(function () {
        // If using server-side pagination, data is already filtered, sorted, and paginated
        if (paginationConfig) {
            return data;
        }
        var result = __spreadArrays(data);
        // Search
        if (state.search) {
            result = utils_1.searchEntities(result, state.search, columns);
        }
        // Filter
        if (state.filters.length > 0) {
            result = utils_1.filterEntities(result, state.filters);
        }
        // Sort
        if (state.sort) {
            result = utils_1.sortEntities(result, state.sort);
        }
        return result;
    }, [data, state.search, state.filters, state.sort, columns, paginationConfig]);
    // Pagination
    var totalItems = (_b = paginationConfig === null || paginationConfig === void 0 ? void 0 : paginationConfig.totalCount) !== null && _b !== void 0 ? _b : processedData.length;
    var totalPages = utils_1.getTotalPages(totalItems, state.pageSize);
    // For server-side pagination (when paginationConfig is provided), data is already paginated
    var paginatedData = paginationConfig
        ? processedData
        : pagination
            ? utils_1.paginateEntities(processedData, state.page, state.pageSize)
            : processedData;
    // Selection handlers
    var handleSelectAll = react_1.useCallback(function () {
        var allIds = new Set(processedData.map(function (e) { return e.id; }));
        setState(function (prev) { return (__assign(__assign({}, prev), { selectedIds: allIds })); });
        onSelectionChange === null || onSelectionChange === void 0 ? void 0 : onSelectionChange(allIds, processedData);
    }, [processedData, onSelectionChange]);
    var handleDeselectAll = react_1.useCallback(function () {
        var empty = new Set();
        setState(function (prev) { return (__assign(__assign({}, prev), { selectedIds: empty })); });
        onSelectionChange === null || onSelectionChange === void 0 ? void 0 : onSelectionChange(empty, []);
    }, [onSelectionChange]);
    var handleSelectRow = react_1.useCallback(function (id) {
        setState(function (prev) {
            var newSelected = new Set(prev.selectedIds);
            if (multiSelect) {
                if (newSelected.has(id)) {
                    newSelected["delete"](id);
                }
                else {
                    newSelected.add(id);
                }
            }
            else {
                newSelected.clear();
                newSelected.add(id);
            }
            var selectedEntities = data.filter(function (e) { return newSelected.has(e.id); });
            onSelectionChange === null || onSelectionChange === void 0 ? void 0 : onSelectionChange(newSelected, selectedEntities);
            return __assign(__assign({}, prev), { selectedIds: newSelected });
        });
    }, [multiSelect, onSelectionChange, data]);
    // Search handler
    var handleSearchChange = react_1.useCallback(function (value) {
        isInternalSearchUpdate.current = true;
        setState(function (prev) { return (__assign(__assign({}, prev), { search: value, page: 1 })); });
        onSearchChange === null || onSearchChange === void 0 ? void 0 : onSearchChange(value);
    }, [onSearchChange]);
    // Sort handler
    var handleSort = react_1.useCallback(function (field) {
        setState(function (prev) {
            var _a;
            var newSort = ((_a = prev.sort) === null || _a === void 0 ? void 0 : _a.field) === field && prev.sort.direction === 'asc'
                ? { field: field, direction: 'desc' }
                : { field: field, direction: 'asc' };
            isInternalSortUpdate.current = true;
            onSortChange === null || onSortChange === void 0 ? void 0 : onSortChange(newSort);
            return __assign(__assign({}, prev), { sort: newSort });
        });
    }, [onSortChange]);
    // Pagination handlers
    var handlePageChange = react_1.useCallback(function (page) {
        var _a;
        setState(function (prev) { return (__assign(__assign({}, prev), { page: page })); });
        var pageSize = (_a = paginationConfig === null || paginationConfig === void 0 ? void 0 : paginationConfig.pageSize) !== null && _a !== void 0 ? _a : state.pageSize;
        onPaginationChange === null || onPaginationChange === void 0 ? void 0 : onPaginationChange(__assign(__assign({}, (paginationConfig !== null && paginationConfig !== void 0 ? paginationConfig : {})), { page: page, pageSize: pageSize }));
    }, [paginationConfig, onPaginationChange, state.pageSize]);
    var handlePageSizeChange = react_1.useCallback(function (pageSize) {
        setState(function (prev) { return (__assign(__assign({}, prev), { pageSize: pageSize, page: 1 })); });
        onPaginationChange === null || onPaginationChange === void 0 ? void 0 : onPaginationChange(__assign(__assign({}, (paginationConfig !== null && paginationConfig !== void 0 ? paginationConfig : {})), { pageSize: pageSize, page: 1 }));
    }, [paginationConfig, onPaginationChange]);
    // View switcher
    var handleViewChange = react_1.useCallback(function (view) {
        setState(function (prev) { return (__assign(__assign({}, prev), { view: view })); });
    }, []);
    // Filter handlers
    var handleOpenFilterDialog = react_1.useCallback(function (field) {
        setSelectedFilterField(field);
        setFilterOperator('contains');
        setFilterValue('');
        setFilterValue2('');
        setFilterDialogOpen(true);
        // Close the dropdown menu to prevent double requests
        setFilterDropdownOpen(false);
    }, []);
    var handleCloseFilterDialog = react_1.useCallback(function () {
        setFilterDialogOpen(false);
        setSelectedFilterField(null);
        setFilterOperator('equals');
        setFilterValue('');
        setFilterValue2('');
    }, []);
    var handleSaveFilter = react_1.useCallback(function () {
        var _a;
        if (!selectedFilterField) {
            return;
        }
        // Determine the final value shape depending on operator
        var finalValue = '';
        if (filterOperator === 'isNull' || filterOperator === 'isNotNull') {
            finalValue = '';
        }
        else if (filterOperator === 'between') {
            finalValue = filterValue2 ? [filterValue, filterValue2] : filterValue;
        }
        else if (filterOperator === 'in' || filterOperator === 'notIn') {
            if (Array.isArray(filterValue)) {
                finalValue = filterValue;
            }
            else {
                finalValue = String(filterValue || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
            }
        }
        else {
            finalValue = Array.isArray(filterValue) ? ((_a = filterValue[0]) !== null && _a !== void 0 ? _a : '') : filterValue;
        }
        // For operators requiring a value, ensure we have one
        if (filterOperator !== 'isNull' && filterOperator !== 'isNotNull') {
            if (filterOperator === 'in' || filterOperator === 'notIn') {
                if (!Array.isArray(finalValue) || finalValue.length === 0)
                    return;
            }
            else {
                if (!String(finalValue).trim())
                    return;
            }
        }
        var newFilter = {
            field: selectedFilterField,
            operator: filterOperator,
            value: finalValue
        };
        // Set ref BEFORE setState to ensure useEffect sees it
        isInternalFilterUpdate.current = true;
        setState(function (prev) {
            // Check for duplicate filters (same field and operator)
            var isDuplicate = prev.filters.some(function (f) { return f.field === newFilter.field && f.operator === newFilter.operator; });
            if (isDuplicate) {
                return prev;
            }
            var newFilters = __spreadArrays(prev.filters, [newFilter]);
            onFilterChange === null || onFilterChange === void 0 ? void 0 : onFilterChange(newFilters);
            return __assign(__assign({}, prev), { filters: newFilters, page: 1 });
        });
        handleCloseFilterDialog();
    }, [selectedFilterField, filterOperator, filterValue, filterValue2, onFilterChange, handleCloseFilterDialog]);
    var handleEditFilter = react_1.useCallback(function (index) {
        var filter = state.filters[index];
        setSelectedFilterField(filter.field);
        setFilterOperator(filter.operator);
        if (Array.isArray(filter.value)) {
            setFilterValue(filter.value);
            setFilterValue2(String(filter.value[1] || ''));
        }
        else {
            setFilterValue(String(filter.value || ''));
            setFilterValue2('');
        }
        // Set ref BEFORE setState
        isInternalFilterUpdate.current = true;
        // Remove the old filter and notify parent
        setState(function (prev) {
            var newFilters = prev.filters.filter(function (_, i) { return i !== index; });
            onFilterChange === null || onFilterChange === void 0 ? void 0 : onFilterChange(newFilters);
            return __assign(__assign({}, prev), { filters: newFilters });
        });
        setFilterDialogOpen(true);
    }, [state.filters, onFilterChange]);
    var handleRemoveFilter = react_1.useCallback(function (index) {
        // Set ref BEFORE setState
        isInternalFilterUpdate.current = true;
        setState(function (prev) {
            var newFilters = prev.filters.filter(function (_, i) { return i !== index; });
            onFilterChange === null || onFilterChange === void 0 ? void 0 : onFilterChange(newFilters);
            return __assign(__assign({}, prev), { filters: newFilters, page: 1 });
        });
    }, [onFilterChange]);
    var handleClearFilters = react_1.useCallback(function () {
        isInternalFilterUpdate.current = true;
        setState(function (prev) { return (__assign(__assign({}, prev), { filters: [], page: 1 })); });
        onFilterChange === null || onFilterChange === void 0 ? void 0 : onFilterChange([]);
    }, [onFilterChange]);
    // Click/Double-click handler with manual timing
    var handleRowClick = react_1.useCallback(function (entity, index) {
        var now = Date.now();
        var timeDiff = now - lastClickTime;
        // If this is a double click (within 300ms of last click)
        if (timeDiff < 300 && clickCount === 1) {
            // Clear any pending single click timeout
            if (clickTimeoutRef) {
                clearTimeout(clickTimeoutRef);
                setClickTimeoutRef(null);
            }
            // Execute double click handler
            onRowDoubleClick === null || onRowDoubleClick === void 0 ? void 0 : onRowDoubleClick(entity, index);
            // Reset click tracking
            setClickCount(0);
            setLastClickTime(0);
        }
        else {
            // This is a single click - set timeout
            setClickCount(1);
            setLastClickTime(now);
            var timeout = setTimeout(function () {
                onRowClick === null || onRowClick === void 0 ? void 0 : onRowClick(entity, index);
                setClickCount(0);
                setLastClickTime(0);
                setClickTimeoutRef(null);
            }, 300); // 300ms delay for double-click detection
            setClickTimeoutRef(timeout);
        }
    }, [onRowClick, onRowDoubleClick, clickTimeoutRef, lastClickTime, clickCount]);
    // Get visible columns
    var visibleColumns = utils_1.getVisibleColumns(columns);
    // Helper function to get user-friendly operator label
    var getOperatorLabel = function (operator) {
        var labels = {
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
            'isNotNull': 'is not empty'
        };
        return labels[operator] || operator;
    };
    // Helper function to get column label
    var getColumnLabel = function (field) {
        var column = columns.find(function (col) { return String(col.key) === field; });
        return (column === null || column === void 0 ? void 0 : column.label) || field;
    };
    // Render toolbar
    var renderToolbar = function () {
        var hasToolbar = (toolbar && Object.keys(toolbar).length > 0) || searchable;
        if (!hasToolbar) {
            return null;
        }
        return (react_1["default"].createElement("div", { className: "flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 bg-card border-b" },
            state.filters.length > 0 && (react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row sm:items-center gap-2" },
                react_1["default"].createElement("span", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide" }, "Filters:"),
                react_1["default"].createElement("div", { className: "flex items-center gap-2 flex-wrap flex-1" },
                    state.filters.map(function (filter, index) {
                        var columnLabel = getColumnLabel(filter.field);
                        var operatorLabel = getOperatorLabel(filter.operator);
                        var displayValue = filter.operator === 'isNull' || filter.operator === 'isNotNull'
                            ? ''
                            : Array.isArray(filter.value)
                                ? filter.value.join(' - ')
                                : String(filter.value);
                        return (react_1["default"].createElement(badge_1.Badge, { key: index, variant: "secondary", className: "gap-2 pr-1 py-1.5 text-xs hover:bg-secondary/80 cursor-pointer group", onClick: function () { return handleEditFilter(index); } },
                            react_1["default"].createElement("span", { className: "font-medium" }, columnLabel),
                            react_1["default"].createElement("span", { className: "text-muted-foreground" }, operatorLabel),
                            displayValue && react_1["default"].createElement("span", { className: "font-semibold text-foreground" },
                                "'",
                                displayValue,
                                "'"),
                            react_1["default"].createElement("button", { onClick: function (e) {
                                    e.stopPropagation();
                                    handleRemoveFilter(index);
                                }, className: "ml-1 hover:bg-destructive/20 rounded-full p-1 transition-colors group-hover:bg-muted", "aria-label": "Remove filter", title: "Remove filter" },
                                react_1["default"].createElement(lucide_react_1.X, { className: "h-3 w-3" }))));
                    }),
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: handleClearFilters, className: "h-7 text-xs text-muted-foreground hover:text-destructive px-2" }, "Clear all")))),
            react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between" },
                react_1["default"].createElement("div", { className: "flex-1 w-full sm:max-w-md" }, ((toolbar === null || toolbar === void 0 ? void 0 : toolbar.search) || searchable) && (react_1["default"].createElement("div", { className: "relative" },
                    react_1["default"].createElement("svg", { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": "true" },
                        react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })),
                    react_1["default"].createElement("input", { type: "text", placeholder: searchPlaceholder, value: state.search, onChange: function (e) { return handleSearchChange(e.target.value); }, className: "w-full pl-10 pr-4 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow", "aria-label": "Search" })))),
                react_1["default"].createElement("div", { className: "flex gap-2 items-center flex-wrap justify-end w-full sm:w-auto" },
                    toolbar.viewSwitcher && (
                    // Match DensitySelector default presentation (dropdown) for compact toolbar
                    react_1["default"].createElement(ViewSelector_1.ViewSelector, { value: state.view, onChange: handleViewChange, variant: "dropdown", className: "" })),
                    (toolbar.filters || filterable) && (react_1["default"].createElement(dropdown_menu_1.DropdownMenu, { open: filterDropdownOpen, onOpenChange: setFilterDropdownOpen },
                        react_1["default"].createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", className: "min-h-[44px] w-full sm:w-auto" },
                                react_1["default"].createElement(lucide_react_1.Filter, { className: "h-4 w-4" }),
                                react_1["default"].createElement("span", { className: "ml-2" }, "Filter"),
                                state.filters.length > 0 && (react_1["default"].createElement(badge_1.Badge, { variant: "default", className: "ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs" }, state.filters.length)))),
                        react_1["default"].createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-[calc(100vw-2rem)] sm:w-80 max-w-md" },
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuLabel, null, "Add Filter"),
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                            react_1["default"].createElement("div", { className: "p-3 space-y-3" }, columns.filter(function (col) { return col.filterable !== false; }).length > 0 ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "What would you like to filter by?"),
                                react_1["default"].createElement("div", { className: "grid grid-cols-1 gap-2 max-h-64 overflow-y-auto" }, columns.filter(function (col) { return col.filterable !== false; }).map(function (column) { return (react_1["default"].createElement("button", { key: String(column.key), onClick: function () { return handleOpenFilterDialog(String(column.key)); }, className: "w-full text-left px-4 py-3 text-sm rounded-md hover:bg-muted transition-colors border border-transparent hover:border-muted-foreground/20" }, column.label)); })))) : (react_1["default"].createElement("div", { className: "text-sm text-muted-foreground text-center py-4" }, "No filterable columns available")))))),
                    react_1["default"].createElement(DensitySelector_1.DensitySelector, { value: density, onChange: setDensity, variant: "dropdown" }),
                    toolbarNonBulkActions.length > 0 && (react_1["default"].createElement(actions_1.EntityActions, { actions: toolbarNonBulkActions, entity: undefined, context: actionContext, mode: 'buttons', position: 'toolbar', className: (actions === null || actions === void 0 ? void 0 : actions.className) || '', onActionStart: actions === null || actions === void 0 ? void 0 : actions.onActionStart, onActionComplete: actions === null || actions === void 0 ? void 0 : actions.onActionComplete, onActionError: actions === null || actions === void 0 ? void 0 : actions.onActionError })),
                    toolbarBulkActions.length > 0 && state.selectedIds.size > 0 && (react_1["default"].createElement("div", { className: "relative inline-block" },
                        react_1["default"].createElement("button", { className: "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring", onClick: function () { return setState(function (prev) { return (__assign(__assign({}, prev), { bulkActionsOpen: !prev.bulkActionsOpen })); }); } },
                            "Bulk Actions (",
                            state.selectedIds.size,
                            ")",
                            react_1["default"].createElement("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                                react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }))),
                        state.bulkActionsOpen && (react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement("div", { className: "fixed inset-0 z-10", onClick: function () { return setState(function (prev) { return (__assign(__assign({}, prev), { bulkActionsOpen: false })); }); } }),
                            react_1["default"].createElement("div", { className: "absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md bg-card border shadow-lg" },
                                react_1["default"].createElement("div", { className: "py-1" }, toolbarBulkActions.map(function (action) { return (react_1["default"].createElement("button", { key: action.id, onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                                        var error_1;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    // Close dropdown immediately for better UX
                                                    setState(function (prev) { return (__assign(__assign({}, prev), { bulkActionsOpen: false })); });
                                                    if (actionContext && (actions === null || actions === void 0 ? void 0 : actions.onActionStart)) {
                                                        actions.onActionStart(action.id);
                                                    }
                                                    _a.label = 1;
                                                case 1:
                                                    _a.trys.push([1, 6, , 7]);
                                                    if (!(action.actionType === 'bulk' && actionContext)) return [3 /*break*/, 3];
                                                    return [4 /*yield*/, action.handler(actionContext.selectedEntities, actionContext)];
                                                case 2:
                                                    _a.sent();
                                                    _a.label = 3;
                                                case 3:
                                                    if (actions === null || actions === void 0 ? void 0 : actions.onActionComplete) {
                                                        actions.onActionComplete(action.id, { success: true });
                                                    }
                                                    if (!(actionContext === null || actionContext === void 0 ? void 0 : actionContext.refresh)) return [3 /*break*/, 5];
                                                    return [4 /*yield*/, actionContext.refresh()];
                                                case 4:
                                                    _a.sent();
                                                    _a.label = 5;
                                                case 5: return [3 /*break*/, 7];
                                                case 6:
                                                    error_1 = _a.sent();
                                                    if (actions === null || actions === void 0 ? void 0 : actions.onActionError) {
                                                        actions.onActionError(action.id, error_1 instanceof Error ? error_1 : new Error('Action failed'));
                                                    }
                                                    return [3 /*break*/, 7];
                                                case 7: return [2 /*return*/];
                                            }
                                        });
                                    }); }, className: "w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors " + (action.variant === 'destructive' ? 'text-destructive hover:bg-destructive/10' : 'text-foreground') },
                                    action.icon && react_1["default"].createElement("span", { className: "flex-shrink-0" }, renderIcon(action.icon)),
                                    react_1["default"].createElement("span", { className: "flex-1 text-left" }, renderActionLabel(action.label)))); }))))))),
                    toolbar.actions && (react_1["default"].createElement("div", { className: "flex gap-2" }, toolbar.actions))))));
    };
    // Render pagination
    var renderActionLabel = function (maybeLabel) {
        if (typeof maybeLabel === 'function') {
            try {
                return maybeLabel(undefined);
            }
            catch (_a) {
                return null;
            }
        }
        return maybeLabel;
    };
    // Render icon which may be a React node or a component type
    var renderIcon = function (icon) {
        if (!icon)
            return null;
        if (typeof icon === 'function') {
            var IconComp = icon;
            try {
                return react_1["default"].createElement(IconComp, null);
            }
            catch (_a) {
                return null;
            }
        }
        return icon;
    };
    var renderPagination = function () {
        if (!pagination)
            return null;
        var startItem = ((state.page - 1) * state.pageSize) + 1;
        var endItem = Math.min(state.page * state.pageSize, processedData.length);
        return (react_1["default"].createElement("nav", { className: "flex flex-col gap-3 sm:gap-4 px-3 sm:px-4 py-3 bg-card border-t", role: "navigation", "aria-label": "Pagination" },
            react_1["default"].createElement("div", { className: "text-xs sm:text-sm text-muted-foreground text-center sm:text-left" },
                "Showing ",
                react_1["default"].createElement("span", { className: "font-medium text-foreground" }, startItem),
                " to",
                ' ',
                react_1["default"].createElement("span", { className: "font-medium text-foreground" }, endItem),
                " of",
                ' ',
                react_1["default"].createElement("span", { className: "font-medium text-foreground" }, totalItems),
                " results"),
            react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-3" },
                react_1["default"].createElement("div", { className: "flex items-center gap-1 sm:gap-2" },
                    react_1["default"].createElement("button", { onClick: function () { return handlePageChange(1); }, disabled: state.page === 1, className: "hidden sm:inline-flex px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium border border-input rounded-md bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors", "aria-label": "Go to first page" }, "First"),
                    react_1["default"].createElement("button", { onClick: function () { return handlePageChange(state.page - 1); }, disabled: state.page === 1, className: "px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium border border-input rounded-md bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors", "aria-label": "Go to previous page" },
                        react_1["default"].createElement("span", { className: "hidden sm:inline" }, "Previous"),
                        react_1["default"].createElement("span", { className: "sm:hidden" }, "Prev")),
                    react_1["default"].createElement("span", { className: "text-xs sm:text-sm text-muted-foreground px-2 sm:px-3 whitespace-nowrap" },
                        "Page ",
                        react_1["default"].createElement("span", { className: "font-medium text-foreground" }, state.page),
                        " of",
                        ' ',
                        react_1["default"].createElement("span", { className: "font-medium text-foreground" }, totalPages)),
                    react_1["default"].createElement("button", { onClick: function () { return handlePageChange(state.page + 1); }, disabled: state.page >= totalPages, className: "px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium border border-input rounded-md bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors", "aria-label": "Go to next page" }, "Next"),
                    react_1["default"].createElement("button", { onClick: function () { return handlePageChange(totalPages); }, disabled: state.page >= totalPages, className: "hidden sm:inline-flex px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium border border-input rounded-md bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors", "aria-label": "Go to last page" }, "Last")),
                react_1["default"].createElement("select", { title: 'Items per page', "aria-label": 'Items per page', value: state.pageSize, onChange: function (e) { return handlePageSizeChange(Number(e.target.value)); }, className: "w-full sm:w-auto px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" }, utils_1.getDefaultPageSizes().map(function (size) { return (react_1["default"].createElement("option", { key: size, value: size },
                    size,
                    " per page")); })))));
    };
    // Render cell
    var renderCell = function (_a) {
        var column = _a.column, entity = _a.entity, value = _a.value, index = _a.index;
        if (column.render) {
            return column.render(value, entity, index);
        }
        return utils_1.formatCellValue(value, column, entity);
    };
    // Render table view
    var renderTableView = function () {
        return (react_1["default"].createElement("div", { className: "relative overflow-x-hidden -mx-4 sm:mx-0 p-2" },
            react_1["default"].createElement("div", { className: "inline-block min-w-full align-middle max-w-full" },
                react_1["default"].createElement("table", { className: "min-w-full divide-y divide-border text-sm w-full" },
                    react_1["default"].createElement("thead", { className: "bg-muted/50" },
                        react_1["default"].createElement("tr", null,
                            selectable && (react_1["default"].createElement("th", { scope: "col", className: "px-3 sm:px-4 py-3 w-12" }, multiSelect && (react_1["default"].createElement("input", { title: "Select all", "aria-label": "Select all", type: "checkbox", checked: state.selectedIds.size === processedData.length && processedData.length > 0, onChange: function () { return state.selectedIds.size === processedData.length ? handleDeselectAll() : handleSelectAll(); }, className: "w-4 h-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2" })))),
                            visibleColumns.map(function (column) {
                                var _a;
                                return (react_1["default"].createElement("th", { key: String(column.key), scope: "col", style: { width: column.width, textAlign: column.align }, className: "px-3 sm:px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider " + (column.sortable && sortable ? 'cursor-pointer select-none hover:text-foreground' : ''), onClick: function () { return column.sortable && sortable && handleSort(String(column.key)); } },
                                    react_1["default"].createElement("div", { className: "flex items-center gap-1" },
                                        react_1["default"].createElement("span", { className: "truncate" }, column.label),
                                        ((_a = state.sort) === null || _a === void 0 ? void 0 : _a.field) === column.key && (react_1["default"].createElement("span", { className: "text-primary flex-shrink-0" }, state.sort.direction === 'asc' ? '↑' : '↓')))));
                            }),
                            rowActions.length > 0 && (react_1["default"].createElement("th", { scope: "col", className: "px-3 sm:px-4 py-3 text-right w-24" },
                                react_1["default"].createElement("span", { className: "sr-only" }, "Actions"))))),
                    react_1["default"].createElement("tbody", { className: "bg-card divide-y divide-border" }, paginatedData.map(function (entity, index) {
                        var isSelected = state.selectedIds.has(entity.id);
                        var rowClass = rowClassName ? rowClassName(entity, index) : '';
                        var densityPadding = density === 'compact' ? 'py-2' : density === 'comfortable' ? 'py-3' : 'py-4';
                        return (react_1["default"].createElement("tr", { key: entity.id, className: "transition-colors " + (isSelected ? 'bg-muted' : '') + " " + (hover ? 'hover:bg-muted/50 cursor-pointer' : '') + " " + (striped && index % 2 === 0 ? 'bg-muted/20' : '') + " " + rowClass, onClick: function () { return handleRowClick(entity, index); }, onDoubleClick: function () { return handleRowClick(entity, index); } },
                            selectable && (react_1["default"].createElement("td", { className: "px-3 sm:px-4 " + densityPadding + " whitespace-nowrap" },
                                react_1["default"].createElement("input", { title: "Select row", type: "checkbox", checked: isSelected, onChange: function () { return handleSelectRow(entity.id); }, onClick: function (e) { return e.stopPropagation(); }, className: "w-4 h-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2" }))),
                            visibleColumns.map(function (column) {
                                var value = utils_1.getColumnValue(entity, column.key);
                                return (react_1["default"].createElement("td", { key: String(column.key), className: "px-3 sm:px-4 " + densityPadding + " whitespace-nowrap text-sm", style: { textAlign: column.align } },
                                    react_1["default"].createElement("div", { className: "truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl" }, renderCell({ column: column, entity: entity, value: value, index: index }))));
                            }),
                            rowActions.length > 0 && (react_1["default"].createElement("td", { className: "px-3 sm:px-4 " + densityPadding + " whitespace-nowrap text-right text-sm", onClick: function (e) { return e.stopPropagation(); } },
                                react_1["default"].createElement("div", { className: "flex justify-end gap-1 sm:gap-2" },
                                    react_1["default"].createElement(actions_1.EntityActions, { actions: rowActions, entity: entity, context: actionContext, mode: (actions === null || actions === void 0 ? void 0 : actions.mode) || 'buttons', position: 'row', className: (actions === null || actions === void 0 ? void 0 : actions.className) || '', onActionStart: actions === null || actions === void 0 ? void 0 : actions.onActionStart, onActionComplete: actions === null || actions === void 0 ? void 0 : actions.onActionComplete, onActionError: actions === null || actions === void 0 ? void 0 : actions.onActionError }))))));
                    }))))));
    }; // Render card view
    var renderCardView = function () {
        return (react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4" }, paginatedData.map(function (entity, index) {
            var isSelected = state.selectedIds.has(entity.id);
            var title = utils_1.getEntityTitle(entity, titleField);
            var subtitle = utils_1.getEntitySubtitle(entity, subtitleField);
            var imageUrl = utils_1.getEntityImageUrl(entity, imageField);
            return (react_1["default"].createElement("div", { key: entity.id, className: "bg-card rounded-lg border shadow-sm overflow-hidden transition-all hover:shadow-md " + (isSelected ? 'ring-2 ring-primary' : '') + " cursor-pointer relative", onClick: function () { return handleRowClick(entity, index); }, onDoubleClick: function () { return handleRowClick(entity, index); } },
                selectable && (react_1["default"].createElement("div", { className: "absolute top-2 right-2 z-10" },
                    react_1["default"].createElement("input", { title: "Select card", type: "checkbox", checked: isSelected, onChange: function () { return handleSelectRow(entity.id); }, onClick: function (e) { return e.stopPropagation(); }, className: "w-4 h-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2" }))),
                imageUrl && (react_1["default"].createElement("div", { className: "relative aspect-video w-full overflow-hidden bg-muted" },
                    react_1["default"].createElement(image_1["default"], { src: String(imageUrl), alt: String(title), fill: true, className: "object-cover", sizes: "(max-width: 640px) 100vw, 50vw" }))),
                react_1["default"].createElement("div", { className: "p-3 sm:p-4 space-y-2 sm:space-y-3" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-sm sm:text-base font-semibold text-foreground line-clamp-1" }, title),
                        subtitle && react_1["default"].createElement("p", { className: "text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1" }, subtitle)),
                    react_1["default"].createElement("div", { className: "space-y-1.5 sm:space-y-2" }, visibleColumns.slice(0, 3).map(function (column) {
                        var value = utils_1.getColumnValue(entity, column.key);
                        return (react_1["default"].createElement("div", { key: String(column.key), className: "flex items-start text-xs sm:text-sm" },
                            react_1["default"].createElement("span", { className: "font-medium text-muted-foreground w-1/3 flex-shrink-0" },
                                column.label,
                                ":"),
                            react_1["default"].createElement("span", { className: "text-foreground w-2/3 line-clamp-1" }, renderCell({ column: column, entity: entity, value: value, index: index }))));
                    }))),
                rowActions.length > 0 && (react_1["default"].createElement("div", { className: "px-3 sm:px-4 pb-3 sm:pb-4 flex items-center gap-2 border-t pt-3", onClick: function (e) { return e.stopPropagation(); } },
                    react_1["default"].createElement("div", { onClick: function (e) { return e.stopPropagation(); } },
                        react_1["default"].createElement(actions_1.EntityActions, { actions: rowActions, entity: entity, context: actionContext, mode: (actions === null || actions === void 0 ? void 0 : actions.mode) || 'buttons', position: 'row', className: (actions === null || actions === void 0 ? void 0 : actions.className) || '', onActionStart: actions === null || actions === void 0 ? void 0 : actions.onActionStart, onActionComplete: actions === null || actions === void 0 ? void 0 : actions.onActionComplete, onActionError: actions === null || actions === void 0 ? void 0 : actions.onActionError }))))));
        })));
    };
    // Render list view
    var renderListView = function () {
        return (react_1["default"].createElement("div", { className: "divide-y" }, paginatedData.map(function (entity, index) {
            var isSelected = state.selectedIds.has(entity.id);
            var title = utils_1.getEntityTitle(entity, titleField);
            var subtitle = utils_1.getEntitySubtitle(entity, subtitleField);
            return (react_1["default"].createElement("div", { key: entity.id, className: "flex items-center gap-2 sm:gap-3 p-3 sm:p-4 transition-colors " + (isSelected ? 'bg-muted' : '') + " hover:bg-muted/50 cursor-pointer", onClick: function () { return handleRowClick(entity, index); }, onDoubleClick: function () { return handleRowClick(entity, index); } },
                selectable && (react_1["default"].createElement("input", { title: "Select item", type: "checkbox", checked: isSelected, onChange: function () { return handleSelectRow(entity.id); }, onClick: function (e) { return e.stopPropagation(); }, className: "w-4 h-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2 flex-shrink-0" })),
                react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                    react_1["default"].createElement("div", { className: "text-sm font-medium text-foreground truncate" }, title),
                    subtitle && react_1["default"].createElement("div", { className: "text-xs text-muted-foreground truncate mt-0.5" }, subtitle)),
                rowActions.length > 0 && (react_1["default"].createElement("div", { className: "flex items-center gap-1 sm:gap-2 flex-shrink-0", onClick: function (e) { return e.stopPropagation(); } },
                    react_1["default"].createElement(actions_1.EntityActions, { actions: rowActions, entity: entity, context: actionContext, mode: (actions === null || actions === void 0 ? void 0 : actions.mode) || 'buttons', position: 'row', className: (actions === null || actions === void 0 ? void 0 : actions.className) || '', onActionStart: actions === null || actions === void 0 ? void 0 : actions.onActionStart, onActionComplete: actions === null || actions === void 0 ? void 0 : actions.onActionComplete, onActionError: actions === null || actions === void 0 ? void 0 : actions.onActionError })))));
        })));
    };
    // Render timeline view
    var renderTimelineView = function () {
        return (react_1["default"].createElement("div", { className: "relative space-y-4 sm:space-y-6 p-3 sm:p-4" },
            react_1["default"].createElement("div", { className: "absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-border" }),
            paginatedData.map(function (entity, index) {
                var title = utils_1.getEntityTitle(entity, titleField);
                var subtitle = utils_1.getEntitySubtitle(entity, subtitleField);
                var date = utils_1.getEntityDate(entity, dateField);
                return (react_1["default"].createElement("div", { key: entity.id, className: "relative pl-10 sm:pl-12" },
                    react_1["default"].createElement("div", { className: "absolute left-3 sm:left-4.5 top-2 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-sm" }),
                    react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer", onClick: function () { return handleRowClick(entity, index); }, onDoubleClick: function () { return handleRowClick(entity, index); } },
                        date && (react_1["default"].createElement("div", { className: "text-xs font-medium text-primary mb-1.5 sm:mb-2" }, date_fns_1.format(date, 'P'))),
                        react_1["default"].createElement("div", { className: "text-sm font-semibold text-foreground" }, title),
                        subtitle && react_1["default"].createElement("div", { className: "text-xs text-muted-foreground mt-1" }, subtitle))));
            })));
    };
    // Render grid view
    var renderGridView = function () {
        return (react_1["default"].createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 p-3 sm:p-4" }, paginatedData.map(function (entity, index) {
            var isSelected = state.selectedIds.has(entity.id);
            var title = utils_1.getEntityTitle(entity, titleField);
            return (react_1["default"].createElement("div", { key: entity.id, className: "bg-card rounded-lg border shadow-sm p-3 sm:p-4 transition-all hover:shadow-md " + (isSelected ? 'ring-2 ring-primary' : '') + " cursor-pointer relative aspect-square flex items-center justify-center", onClick: function () { return handleRowClick(entity, index); }, onDoubleClick: function () { return handleRowClick(entity, index); } },
                selectable && (react_1["default"].createElement("input", { type: "checkbox", checked: isSelected, onChange: function () { return handleSelectRow(entity.id); }, onClick: function (e) { return e.stopPropagation(); }, className: "absolute top-1.5 right-1.5 w-3 h-3 text-primary bg-background border-input rounded focus:ring-ring focus:ring-1", title: "Select item" })),
                react_1["default"].createElement("div", { className: "text-xs sm:text-sm font-medium text-foreground text-center line-clamp-3 px-1" }, title)));
        })));
    };
    // Render compact view
    var renderCompactView = function () {
        return renderTableView(); // Similar to table but with smaller styling
    };
    // Render detailed view
    var renderDetailedView = function () {
        return (react_1["default"].createElement("div", { className: "space-y-3 sm:space-y-4 p-3 sm:p-4" }, paginatedData.map(function (entity, index) {
            var isSelected = state.selectedIds.has(entity.id);
            var title = utils_1.getEntityTitle(entity, titleField);
            return (react_1["default"].createElement("div", { key: entity.id, className: "bg-card rounded-lg border shadow-sm overflow-hidden " + (isSelected ? 'ring-2 ring-primary' : '') },
                react_1["default"].createElement("div", { className: "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/50 border-b" },
                    selectable && (react_1["default"].createElement("input", { title: "Select detailed item", type: "checkbox", checked: isSelected, onChange: function () { return handleSelectRow(entity.id); }, className: "w-4 h-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2 flex-shrink-0" })),
                    react_1["default"].createElement("h3", { className: "text-sm sm:text-base font-semibold text-foreground flex-1 truncate" }, title)),
                react_1["default"].createElement("div", { className: "p-3 sm:p-4 space-y-1.5 sm:space-y-2" }, visibleColumns.map(function (column) {
                    var value = utils_1.getColumnValue(entity, column.key);
                    return (react_1["default"].createElement("div", { key: String(column.key), className: "flex items-start py-1" },
                        react_1["default"].createElement("label", { className: "text-xs sm:text-sm font-medium text-muted-foreground w-1/3 flex-shrink-0" },
                            column.label,
                            ":"),
                        react_1["default"].createElement("span", { className: "text-xs sm:text-sm text-foreground w-2/3 break-words" }, renderCell({ column: column, entity: entity, value: value, index: index }))));
                })),
                rowActions.length > 0 && (react_1["default"].createElement("div", { className: "px-3 sm:px-4 pb-3 sm:pb-4 flex items-center gap-2 border-t pt-3", onClick: function (e) { return e.stopPropagation(); } },
                    react_1["default"].createElement("div", { onClick: function (e) { return e.stopPropagation(); } },
                        react_1["default"].createElement(actions_1.EntityActions, { actions: rowActions, entity: entity, context: actionContext, mode: (actions === null || actions === void 0 ? void 0 : actions.mode) || 'dropdown', position: 'row', className: (actions === null || actions === void 0 ? void 0 : actions.className) || '', onActionStart: actions === null || actions === void 0 ? void 0 : actions.onActionStart, onActionComplete: actions === null || actions === void 0 ? void 0 : actions.onActionComplete, onActionError: actions === null || actions === void 0 ? void 0 : actions.onActionError }))))));
        })));
    };
    // Render gallery view
    var renderGalleryView = function () {
        return (react_1["default"].createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 p-3 sm:p-4" }, paginatedData.map(function (entity, index) {
            var isSelected = state.selectedIds.has(entity.id);
            var title = utils_1.getEntityTitle(entity, titleField);
            var imageUrl = utils_1.getEntityImageUrl(entity, imageField);
            return (react_1["default"].createElement("div", { key: entity.id, className: "bg-card rounded-lg border shadow-sm overflow-hidden transition-all hover:shadow-md " + (isSelected ? 'ring-2 ring-primary' : '') + " cursor-pointer", onClick: function () { return handleRowClick(entity, index); }, onDoubleClick: function () { return handleRowClick(entity, index); } },
                imageUrl ? (react_1["default"].createElement("div", { className: "relative aspect-square w-full overflow-hidden bg-muted" },
                    react_1["default"].createElement(image_1["default"], { src: String(imageUrl), alt: String(title), fill: true, className: "object-cover", sizes: "(max-width: 640px) 100vw, 33vw" }))) : (react_1["default"].createElement("div", { className: "aspect-square w-full bg-muted flex items-center justify-center" },
                    react_1["default"].createElement("svg", { className: "w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": "true" },
                        react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" })))),
                react_1["default"].createElement("div", { className: "p-2 sm:p-3 text-center" },
                    react_1["default"].createElement("div", { className: "text-xs sm:text-sm font-medium text-foreground line-clamp-2" }, title))));
        })));
    };
    // Render current view
    var renderView = function () {
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
        var hasSearch = state.search && state.search.length > 0;
        var hasFilters = state.filters && state.filters.length > 0;
        // If parent provided an onCreate handler, use it for empty state CTAs.
        var createAction = function () {
            if (typeof props.onCreate === 'function') {
                try {
                    props.onCreate();
                }
                catch ( /* swallow */_a) { /* swallow */ }
                return;
            }
            // No-op when not provided
        };
        if (hasSearch) {
            return (react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-sm overflow-hidden " + className },
                renderToolbar(),
                react_1["default"].createElement(EmptyState_1.SearchEmptyState, { searchQuery: state.search, onClear: function () { return handleSearchChange(''); }, onCreate: createAction })));
        }
        if (hasFilters) {
            return (react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-sm overflow-hidden " + className },
                renderToolbar(),
                react_1["default"].createElement(EmptyState_1.FilterEmptyState, { onClear: function () {
                        setState(function (prev) { return (__assign(__assign({}, prev), { filters: [] })); });
                        onFilterChange === null || onFilterChange === void 0 ? void 0 : onFilterChange([]);
                    }, onCreate: createAction })));
        }
        // If caller provided an explicit emptyMessage, show a tailored EmptyState
        if (emptyMessage) {
            return (react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-sm overflow-hidden " + className },
                renderToolbar(),
                react_1["default"].createElement(EmptyState_1.EmptyState, { title: emptyMessage, action: { label: 'Create item', onClick: createAction, icon: lucide_react_1.Plus } })));
        }
        return (react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-sm overflow-hidden " + className },
            renderToolbar(),
            react_1["default"].createElement(EmptyState_1.CreateEmptyState, { entityName: "item", onCreate: createAction })));
    }
    // Render error state
    if (error) {
        var errorMessage = typeof error === 'string' ? error : (error === null || error === void 0 ? void 0 : error.message) || 'An error occurred';
        var errorType = errorMessage.toLowerCase().includes('network') ? 'network' :
            errorMessage.toLowerCase().includes('permission') ? 'permission' :
                errorMessage.toLowerCase().includes('server') ? 'server' : 'unknown';
        return (react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-sm overflow-hidden " + className },
            renderToolbar(),
            react_1["default"].createElement(ErrorState_1.ErrorState, { type: errorType, message: errorMessage, error: error, onRetry: function () {
                    // Trigger a refetch by notifying parent or calling refresh
                    window.location.reload();
                }, showDetails: true })));
    }
    return (react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-sm overflow-hidden " + className },
        renderToolbar(),
        loading ? (react_1["default"].createElement("div", { className: "p-4" },
            react_1["default"].createElement("div", { className: "mb-3 text-sm text-muted-foreground" }, "Loading data..."),
            react_1["default"].createElement(Skeleton_1.ListSkeleton, { count: state.pageSize, view: state.view, density: density, columns: visibleColumns.length, showAvatar: !!imageField }))) : (react_1["default"].createElement("div", null, renderView())),
        renderPagination(),
        react_1["default"].createElement(dialog_1.Dialog, { open: filterDialogOpen, onOpenChange: setFilterDialogOpen },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "w-[calc(100vw-2rem)] sm:max-w-[425px]" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, "Add Filter"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null,
                        "Filter by ",
                        selectedFilterField && ((_c = columns.find(function (c) { return String(c.key) === selectedFilterField; })) === null || _c === void 0 ? void 0 : _c.label))),
                react_1["default"].createElement("div", { className: "grid gap-4 py-4" },
                    react_1["default"].createElement("div", { className: "grid gap-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "filter-operator" }, "How to filter"),
                        react_1["default"].createElement(select_1.Select, { value: filterOperator, onValueChange: function (value) { return setFilterOperator(value); } },
                            react_1["default"].createElement(select_1.SelectTrigger, { id: "filter-operator" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Choose how to filter" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: "contains" }, "Contains text"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "equals" }, "Exactly matches"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "startsWith" }, "Starts with"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "endsWith" }, "Ends with"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "greaterThan" }, "Greater than"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "lessThan" }, "Less than"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "isNull" }, "Is empty"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "isNotNull" }, "Is not empty")))),
                    filterOperator !== 'isNull' && filterOperator !== 'isNotNull' && ((function () {
                        var selectedColumn = selectedFilterField ? columns.find(function (c) { return String(c.key) === selectedFilterField; }) : undefined;
                        var options = (selectedColumn && selectedColumn.filterOptions);
                        // If the column provides filterOptions, render a select UI; support single and multi (for 'in' operator)
                        if (options && options.length > 0) {
                            if (filterOperator === 'in' || filterOperator === 'notIn') {
                                return (react_1["default"].createElement("div", { className: "grid gap-2" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "filter-value" }, "Choose values"),
                                    react_1["default"].createElement("select", { id: "filter-value", title: 'filter', multiple: true, value: Array.isArray(filterValue) ? filterValue : (filterValue ? String(filterValue).split(',') : []), onChange: function (e) {
                                            var selected = Array.from(e.target.selectedOptions).map(function (o) { return o.value; });
                                            setFilterValue(selected);
                                        }, className: "w-full px-2 py-2 border border-input rounded-md bg-background text-sm" }, options.map(function (opt) { return (react_1["default"].createElement("option", { key: String(opt.value), value: String(opt.value) }, opt.label)); }))));
                            }
                            // Single-select
                            return (react_1["default"].createElement("div", { className: "grid gap-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "filter-value" }, "Choose value"),
                                react_1["default"].createElement(select_1.Select, { value: String(filterValue), onValueChange: function (v) { return setFilterValue(v); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, { id: "filter-value" },
                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select a value" })),
                                    react_1["default"].createElement(select_1.SelectContent, null, options.map(function (opt) { return (react_1["default"].createElement(select_1.SelectItem, { key: String(opt.value), value: String(opt.value) }, opt.label)); })))));
                        }
                        // Fallback to text input when no options available
                        return (react_1["default"].createElement("div", { className: "grid gap-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "filter-value" }, "Search for"),
                            react_1["default"].createElement(input_1.Input, { id: "filter-value", value: Array.isArray(filterValue) ? filterValue.join(',') : String(filterValue), onChange: function (e) { return setFilterValue(e.target.value); }, placeholder: "Type what you're looking for...", autoFocus: true })));
                    })()),
                    filterOperator === 'between' && (react_1["default"].createElement("div", { className: "grid gap-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "filter-value2" }, "To Value"),
                        react_1["default"].createElement(input_1.Input, { id: "filter-value2", value: filterValue2, onChange: function (e) { return setFilterValue2(e.target.value); }, placeholder: "Enter end value" })))),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: handleCloseFilterDialog }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { type: "button", onClick: handleSaveFilter }, "Add Filter"))))));
}
exports.EntityList = EntityList;
