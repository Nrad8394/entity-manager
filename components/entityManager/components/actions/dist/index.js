/**
 * EntityActions Component
 *
 * Standalone component for rendering entity actions with support for 8 action types.
 * Works independently without orchestrator or context.
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
exports.EntityActions = void 0;
var react_1 = require("react");
var utils_1 = require("./utils");
/**
 * EntityActions Component
 *
 * @example
 * ```tsx
 * const actions: Action<User>[] = [
 *   {
 *     id: 'edit',
 *     label: 'Edit',
 *     actionType: 'navigation',
 *     url: '/users/{id}/edit',
 *   },
 *   {
 *     id: 'delete',
 *     label: 'Delete',
 *     actionType: 'confirm',
 *     confirmMessage: 'Delete this user?',
 *     onConfirm: async (user) => {
 *       await deleteUser(user.id);
 *     },
 *   },
 * ];
 *
 * <EntityActions actions={actions} entity={user} />
 * ```
 */
function EntityActions(_a) {
    var _this = this;
    var actions = _a.actions, entity = _a.entity, context = _a.context, _b = _a.mode, mode = _b === void 0 ? 'buttons' : _b, position = _a.position, _c = _a.className, className = _c === void 0 ? '' : _c, onActionStart = _a.onActionStart, onActionComplete = _a.onActionComplete, onActionError = _a.onActionError;
    var _d = react_1.useState({
        loading: false,
        modalOpen: false,
        dropdownOpen: false,
        overflowOpen: false
    }), state = _d[0], setState = _d[1];
    // Helper to coerce an action label/confirmText (which may be a function or ReactNode)
    var getActionLabelString = function (maybeLabel, fallback) {
        // If explicit string provided
        if (typeof maybeLabel === 'string')
            return maybeLabel;
        // If it's a function, call it
        if (typeof maybeLabel === 'function') {
            try {
                var v = maybeLabel(entity);
                return typeof v === 'string' ? v : String(v !== null && v !== void 0 ? v : '');
            }
            catch (_a) {
                return String(fallback !== null && fallback !== void 0 ? fallback : '');
            }
        }
        // Fallback ReactNode or other
        if (maybeLabel !== undefined && maybeLabel !== null)
            return String(maybeLabel);
        if (typeof fallback === 'function') {
            try {
                var v = fallback(entity);
                return typeof v === 'string' ? v : String(v !== null && v !== void 0 ? v : '');
            }
            catch (_b) {
                return '';
            }
        }
        return String(fallback !== null && fallback !== void 0 ? fallback : '');
    };
    var renderActionLabel = function (maybeLabel) {
        if (typeof maybeLabel === 'function') {
            try {
                return maybeLabel(entity);
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
        // If it's a component type (function/class), instantiate it
        if (typeof icon === 'function') {
            var IconComp = icon;
            try {
                return react_1["default"].createElement(IconComp, null);
            }
            catch (_a) {
                return null;
            }
        }
        // Otherwise assume it's already a React node
        return icon;
    };
    /**
     * Handle immediate action
     */
    var handleImmediateAction = react_1.useCallback(function (action) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, action.handler(entity, context)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [entity, context]);
    /**
     * Handle confirm action
     */
    var handleConfirmAction = react_1.useCallback(function (action) { return __awaiter(_this, void 0, void 0, function () {
        var titleText, confirmText, cancelText;
        var _this = this;
        return __generator(this, function (_a) {
            titleText = getActionLabelString(action.confirmText, action.label);
            confirmText = getActionLabelString(action.confirmText, 'Confirm') || 'Confirm';
            cancelText = getActionLabelString(action.cancelText, 'Cancel') || 'Cancel';
            setState(function (prev) { return (__assign(__assign({}, prev), { modalOpen: true, modalContent: (react_1["default"].createElement(ConfirmDialog, { title: titleText, message: utils_1.getConfirmMessage(action.confirmMessage, entity), confirmText: confirmText, cancelText: cancelText, onConfirm: function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setState(function (prev) { return (__assign(__assign({}, prev), { modalOpen: false, modalContent: undefined })); });
                                    return [4 /*yield*/, action.onConfirm(entity, context)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }, onCancel: function () {
                        var _a;
                        setState(function (prev) { return (__assign(__assign({}, prev), { modalOpen: false, modalContent: undefined })); });
                        (_a = action.onCancel) === null || _a === void 0 ? void 0 : _a.call(action);
                    } })) })); });
            return [2 /*return*/];
        });
    }); }, [entity, context]);
    /**
     * Handle form action
     */
    var handleFormAction = react_1.useCallback(function (action) {
        var initialValues = utils_1.getInitialFormValues(action.initialValues, entity, action.fields);
        setState(function (prev) { return (__assign(__assign({}, prev), { modalOpen: true, modalContent: (react_1["default"].createElement(FormModal, { title: action.formTitle, fields: action.fields, initialValues: initialValues, submitText: action.submitText, onSubmit: function (values) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, action.onSubmit(values, entity, context)];
                            case 1:
                                _a.sent();
                                setState(function (prev) { return (__assign(__assign({}, prev), { modalOpen: false, modalContent: undefined })); });
                                return [2 /*return*/];
                        }
                    });
                }); }, onCancel: function () {
                    var _a;
                    (_a = action.onCancel) === null || _a === void 0 ? void 0 : _a.call(action);
                    setState(function (prev) { return (__assign(__assign({}, prev), { modalOpen: false, modalContent: undefined })); });
                } })) })); });
    }, [entity, context]);
    /**
     * Handle modal action
     */
    var handleModalAction = react_1.useCallback(function (action) {
        var ModalContent = action.content;
        setState(function (prev) { return (__assign(__assign({}, prev), { modalOpen: true, modalContent: (react_1["default"].createElement(ModalContent, { entity: entity, context: context, onClose: function () {
                    var _a;
                    (_a = action.onClose) === null || _a === void 0 ? void 0 : _a.call(action);
                    setState(function (prev) { return (__assign(__assign({}, prev), { modalOpen: false, modalContent: undefined })); });
                } })) })); });
    }, [entity, context]);
    /**
     * Handle navigation action
     */
    var handleNavigationAction = react_1.useCallback(function (action) { return __awaiter(_this, void 0, void 0, function () {
        var canNavigate, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!action.beforeNavigate) return [3 /*break*/, 2];
                    return [4 /*yield*/, action.beforeNavigate(entity, context)];
                case 1:
                    canNavigate = _a.sent();
                    if (!canNavigate)
                        return [2 /*return*/];
                    _a.label = 2;
                case 2:
                    if (!action.url)
                        return [2 /*return*/]; // nothing to navigate to
                    url = utils_1.buildNavigationUrl(action.url, entity, context);
                    if (!url)
                        return [2 /*return*/];
                    if (action.newTab) {
                        window.open(url, '_blank');
                    }
                    else {
                        window.location.href = url;
                    }
                    return [2 /*return*/];
            }
        });
    }); }, [entity, context]);
    /**
     * Handle bulk action
     */
    var handleBulkAction = react_1.useCallback(function (action) { return __awaiter(_this, void 0, void 0, function () {
        var entities, message, confirmed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    entities = (context === null || context === void 0 ? void 0 : context.selectedEntities) || [];
                    if (entities.length === 0) {
                        throw new Error('No items selected');
                    }
                    if (action.maxItems && entities.length > action.maxItems) {
                        throw new Error("Maximum " + action.maxItems + " items allowed");
                    }
                    // Confirm bulk operation
                    if (action.confirmBulk) {
                        message = utils_1.getBulkConfirmMessage(action.confirmMessage, entities);
                        confirmed = window.confirm(message);
                        if (!confirmed)
                            return [2 /*return*/];
                    }
                    return [4 /*yield*/, action.handler(entities, context)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [context]);
    /**
     * Handle download action
     */
    var handleDownloadAction = react_1.useCallback(function (action) { return __awaiter(_this, void 0, void 0, function () {
        var url, link, filename;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!action.downloadUrl) return [3 /*break*/, 1];
                    url = typeof action.downloadUrl === 'string'
                        ? action.downloadUrl
                        : action.downloadUrl(entity);
                    link = document.createElement('a');
                    link.href = url;
                    if (action.filename) {
                        filename = typeof action.filename === 'string'
                            ? action.filename
                            : action.filename(entity);
                        link.download = filename;
                    }
                    link.click();
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, action.handler(entity, context)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); }, [entity, context]);
    /**
     * Handle custom action
     */
    var handleCustomAction = react_1.useCallback(function (action) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!action.handler) return [3 /*break*/, 2];
                    return [4 /*yield*/, action.handler(entity, context)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); }, [entity, context]);
    /**
   * Execute action based on type
   */
    var executeAction = react_1.useCallback(function (action) { return __awaiter(_this, void 0, void 0, function () {
        var result, _a, error_1, errorObj_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!utils_1.canExecuteAction(action, entity, context)) {
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 16, 17, 18]);
                    setState(function (prev) { return (__assign(__assign({}, prev), { loading: true, executing: action.id })); });
                    onActionStart === null || onActionStart === void 0 ? void 0 : onActionStart(action.id);
                    result = { success: true };
                    _a = action.actionType;
                    switch (_a) {
                        case 'immediate': return [3 /*break*/, 2];
                        case 'confirm': return [3 /*break*/, 4];
                        case 'form': return [3 /*break*/, 6];
                        case 'modal': return [3 /*break*/, 7];
                        case 'navigation': return [3 /*break*/, 8];
                        case 'bulk': return [3 /*break*/, 9];
                        case 'download': return [3 /*break*/, 11];
                        case 'custom': return [3 /*break*/, 13];
                    }
                    return [3 /*break*/, 15];
                case 2: return [4 /*yield*/, handleImmediateAction(action)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 4: return [4 /*yield*/, handleConfirmAction(action)];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 6:
                    handleFormAction(action);
                    return [3 /*break*/, 15];
                case 7:
                    handleModalAction(action);
                    return [3 /*break*/, 15];
                case 8:
                    handleNavigationAction(action);
                    return [3 /*break*/, 15];
                case 9: return [4 /*yield*/, handleBulkAction(action)];
                case 10:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 11: return [4 /*yield*/, handleDownloadAction(action)];
                case 12:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 13: return [4 /*yield*/, handleCustomAction(action)];
                case 14:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 15:
                    onActionComplete === null || onActionComplete === void 0 ? void 0 : onActionComplete(action.id, result);
                    return [3 /*break*/, 18];
                case 16:
                    error_1 = _b.sent();
                    errorObj_1 = error_1 instanceof Error ? error_1 : new Error('Action failed');
                    setState(function (prev) { return (__assign(__assign({}, prev), { error: errorObj_1 })); });
                    onActionError === null || onActionError === void 0 ? void 0 : onActionError(action.id, errorObj_1);
                    onActionComplete === null || onActionComplete === void 0 ? void 0 : onActionComplete(action.id, { success: false, error: errorObj_1 });
                    return [3 /*break*/, 18];
                case 17:
                    setState(function (prev) { return (__assign(__assign({}, prev), { loading: false, executing: undefined })); });
                    return [7 /*endfinally*/];
                case 18: return [2 /*return*/];
            }
        });
    }); }, [entity, context, onActionStart, onActionComplete, onActionError, handleBulkAction, handleConfirmAction, handleCustomAction, handleDownloadAction, handleFormAction, handleImmediateAction, handleModalAction, handleNavigationAction]);
    // Filter actions
    var filteredActions = utils_1.filterActionsByPosition(actions, position);
    var enabledActions = utils_1.getEnabledActions(filteredActions, entity, context);
    // Determine max visible actions based on mode and context
    var getMaxVisibleActions = function () {
        if (position === 'row')
            return 2; // In table rows, show 2 actions + more (show Edit/Delete)
        if (position === 'toolbar')
            return 3; // In toolbar, show 3 actions + more
        return 2; // Default: show 2 actions + more
    };
    var maxVisible = getMaxVisibleActions();
    var visibleActions = enabledActions.slice(0, maxVisible);
    var overflowActions = enabledActions.slice(maxVisible);
    var hasOverflow = overflowActions.length > 0;
    // Get button variant classes
    var getButtonClasses = function (variant, isExecuting) {
        var baseClasses = 'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
        var variantClasses = {
            primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            outline: 'border border-input bg-background hover:bg-muted hover:text-foreground',
            ghost: 'hover:bg-muted hover:text-foreground',
            link: 'text-primary underline-offset-4 hover:underline'
        };
        var selectedVariant = variantClasses[variant] || variantClasses.ghost;
        return baseClasses + " " + selectedVariant + " " + (isExecuting ? 'opacity-70' : '');
    };
    // Render based on mode
    if (mode === 'dropdown') {
        return (react_1["default"].createElement("div", { className: "relative inline-block " + className },
            react_1["default"].createElement("button", { className: "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring", onClick: function () { return setState(function (prev) { return (__assign(__assign({}, prev), { dropdownOpen: !prev.dropdownOpen })); }); } },
                "Actions",
                react_1["default"].createElement("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                    react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }))),
            state.dropdownOpen && (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { className: "fixed inset-0 z-10", onClick: function () { return setState(function (prev) { return (__assign(__assign({}, prev), { dropdownOpen: false })); }); } }),
                react_1["default"].createElement("div", { className: "absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md bg-card border shadow-lg" },
                    react_1["default"].createElement("div", { className: "py-1" }, enabledActions.map(function (action) { return (react_1["default"].createElement("button", { key: action.id, onClick: function () {
                            executeAction(action);
                            setState(function (prev) { return (__assign(__assign({}, prev), { dropdownOpen: false })); });
                        }, disabled: state.loading && state.executing === action.id, title: utils_1.getActionTooltip(action, entity, context), className: "w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed " + (action.variant === 'destructive' ? 'hover:bg-destructive hover:text-destructive-foreground' : '') },
                        action.icon && react_1["default"].createElement("span", { className: "flex-shrink-0" }, renderIcon(action.icon)),
                        react_1["default"].createElement("span", { className: "flex-1 text-left" }, renderActionLabel(action.label)),
                        state.loading && state.executing === action.id && (react_1["default"].createElement("svg", { className: "animate-spin h-4 w-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
                            react_1["default"].createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                            react_1["default"].createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" }))))); }))))),
            state.modalOpen && state.modalContent));
    }
    // Default: buttons mode with overflow menu
    return (react_1["default"].createElement("div", { className: "inline-flex items-center gap-1 " + className },
        visibleActions.map(function (action) {
            if (action.actionType === 'custom' && action.component) {
                var Comp = action.component;
                return react_1["default"].createElement(Comp, { key: action.id, entity: entity, context: context });
            }
            return (react_1["default"].createElement("button", { key: action.id, onClick: function () { return executeAction(action); }, disabled: state.loading && state.executing === action.id, title: utils_1.getActionTooltip(action, entity, context), "aria-label": getActionLabelString(action.label, action.id), className: getButtonClasses(action.variant, state.loading && state.executing === action.id) },
                action.icon && react_1["default"].createElement("span", { className: "flex-shrink-0" }, renderIcon(action.icon)),
                position !== 'row' && react_1["default"].createElement("span", null, renderActionLabel(action.label)),
                state.loading && state.executing === action.id && (react_1["default"].createElement("svg", { className: "animate-spin h-3 w-3", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
                    react_1["default"].createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                    react_1["default"].createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })))));
        }),
        hasOverflow && (react_1["default"].createElement("div", { className: "relative" },
            react_1["default"].createElement("button", { className: "inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring", onClick: function () { return setState(function (prev) { return (__assign(__assign({}, prev), { overflowOpen: !prev.overflowOpen })); }); }, title: "More actions" },
                react_1["default"].createElement("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 24 24" },
                    react_1["default"].createElement("path", { d: "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" }))),
            state.overflowOpen && (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { className: "fixed inset-0 z-10", onClick: function () { return setState(function (prev) { return (__assign(__assign({}, prev), { overflowOpen: false })); }); } }),
                react_1["default"].createElement("div", { className: "absolute right-0 z-20 mt-1 w-48 origin-top-right rounded-md bg-card border shadow-lg" },
                    react_1["default"].createElement("div", { className: "py-1" }, overflowActions.map(function (action) { return (react_1["default"].createElement("button", { key: action.id, onClick: function () {
                            executeAction(action);
                            setState(function (prev) { return (__assign(__assign({}, prev), { overflowOpen: false })); });
                        }, disabled: state.loading && state.executing === action.id, title: utils_1.getActionTooltip(action, entity, context), className: "w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed " + (action.variant === 'destructive' ? 'hover:bg-destructive hover:text-destructive-foreground' : '') },
                        action.icon && react_1["default"].createElement("span", { className: "flex-shrink-0" }, renderIcon(action.icon)),
                        react_1["default"].createElement("span", { className: "flex-1 text-left" }, renderActionLabel(action.label)),
                        state.loading && state.executing === action.id && (react_1["default"].createElement("svg", { className: "animate-spin h-3 w-3", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
                            react_1["default"].createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                            react_1["default"].createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" }))))); }))))))),
        state.modalOpen && state.modalContent));
}
exports.EntityActions = EntityActions;
/**
 * Confirmation Dialog Component
 */
function ConfirmDialog(_a) {
    var _this = this;
    var title = _a.title, message = _a.message, confirmText = _a.confirmText, cancelText = _a.cancelText, onConfirm = _a.onConfirm, onCancel = _a.onCancel;
    var _b = react_1.useState(false), confirming = _b[0], setConfirming = _b[1];
    var handleConfirm = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, , 2, 3]);
                    setConfirming(true);
                    return [4 /*yield*/, onConfirm()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    setConfirming(false);
                    return [7 /*endfinally*/];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" },
        react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-lg max-w-lg w-full mx-4 p-6 space-y-4 text-center" },
            react_1["default"].createElement("h2", { className: "text-lg font-semibold text-foreground text-center" }, title),
            react_1["default"].createElement("p", { className: "text-sm text-muted-foreground break-words whitespace-normal text-center" }, message),
            react_1["default"].createElement("div", { className: "flex items-center justify-center gap-3 pt-2" },
                react_1["default"].createElement("button", { onClick: onCancel, disabled: confirming, className: "px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted transition-colors disabled:opacity-50" }, cancelText),
                react_1["default"].createElement("button", { onClick: handleConfirm, disabled: confirming, className: "px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2" },
                    confirming && (react_1["default"].createElement("svg", { className: "animate-spin h-4 w-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
                        react_1["default"].createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                        react_1["default"].createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" }))),
                    confirming ? 'Processing...' : confirmText)))));
}
/**
 * Form Modal Component
 */
function FormModal(_a) {
    var _this = this;
    var title = _a.title, fields = _a.fields, initialValues = _a.initialValues, _b = _a.submitText, submitText = _b === void 0 ? 'Submit' : _b, onSubmit = _a.onSubmit, onCancel = _a.onCancel;
    var _c = react_1.useState(initialValues), values = _c[0], setValues = _c[1];
    var _d = react_1.useState({}), errors = _d[0], setErrors = _d[1];
    var _e = react_1.useState(false), submitting = _e[0], setSubmitting = _e[1];
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var validationErrors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    validationErrors = utils_1.validateFormValues(values, fields);
                    if (Object.keys(validationErrors).length > 0) {
                        setErrors(validationErrors);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    setSubmitting(true);
                    return [4 /*yield*/, onSubmit(values)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setSubmitting(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" },
        react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-lg max-w-lg w-full mx-4 p-6" },
            react_1["default"].createElement("h2", { className: "text-lg font-semibold text-foreground mb-4" }, title),
            react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
                fields.map(function (field) { return (react_1["default"].createElement("div", { key: field.name, className: "space-y-1.5" },
                    react_1["default"].createElement("label", { htmlFor: field.name, className: "text-sm font-medium text-foreground" },
                        field.label,
                        field.required && react_1["default"].createElement("span", { className: "text-destructive ml-1" }, "*")),
                    react_1["default"].createElement("input", { id: field.name, type: field.type, value: String(values[field.name] || ''), onChange: function (e) { return setValues(function (prev) {
                            var _a;
                            return (__assign(__assign({}, prev), (_a = {}, _a[field.name] = e.target.value, _a)));
                        }); }, placeholder: field.placeholder, disabled: field.disabled || submitting, className: "w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed" }),
                    errors[field.name] && (react_1["default"].createElement("p", { className: "text-xs text-destructive" }, errors[field.name])),
                    field.helpText && (react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, field.helpText)))); }),
                react_1["default"].createElement("div", { className: "flex items-center justify-end gap-3 pt-4 border-t" },
                    react_1["default"].createElement("button", { type: "button", onClick: onCancel, disabled: submitting, className: "px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted transition-colors disabled:opacity-50" }, "Cancel"),
                    react_1["default"].createElement("button", { type: "submit", disabled: submitting, className: "px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2" },
                        submitting && (react_1["default"].createElement("svg", { className: "animate-spin h-4 w-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
                            react_1["default"].createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                            react_1["default"].createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" }))),
                        submitting ? 'Submitting...' : submitText))))));
}
exports["default"] = EntityActions;
