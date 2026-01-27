/**
 * EntityView Component
 *
 * Standalone component for displaying entity details in multiple view modes.
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.EntityView = void 0;
var react_1 = require("react");
var image_1 = require("next/image");
var lucide_react_1 = require("lucide-react");
var framer_motion_1 = require("framer-motion");
var utils_1 = require("./utils");
var ViewSkeleton_1 = require("./ViewSkeleton");
/**
 * Safely render an icon which may be a string, a React element, or a component type
 */
function renderIcon(icon) {
    if (!icon)
        return null;
    // String or number
    if (typeof icon === 'string' || typeof icon === 'number')
        return react_1["default"].createElement("span", null, String(icon));
    // React element
    if (react_1["default"].isValidElement(icon))
        return icon;
    // Component type (function or class)
    try {
        var Comp = icon;
        return react_1["default"].createElement(Comp, null);
    }
    catch (e) {
        return null;
    }
}
/**
 * EntityView Component
 *
 * @example
 * ```tsx
 * const fields: ViewField<User>[] = [
 *   { key: 'id', label: 'ID', type: 'text' },
 *   { key: 'name', label: 'Name', type: 'text', showInSummary: true },
 *   { key: 'email', label: 'Email', type: 'email', copyable: true },
 *   { key: 'createdAt', label: 'Created', type: 'date' },
 * ];
 *
 * <EntityView entity={user} fields={fields} mode="detail" />
 * ```
 */
function EntityView(_a) {
    var _this = this;
    var _b;
    var entity = _a.entity, fields = _a.fields, groups = _a.groups, _c = _a.mode, mode = _c === void 0 ? 'detail' : _c, _d = _a.showMetadata, showMetadata = _d === void 0 ? true : _d, tabs = _a.tabs, titleField = _a.titleField, subtitleField = _a.subtitleField, imageField = _a.imageField, _e = _a.loading, loading = _e === void 0 ? false : _e, error = _a.error, _f = _a.className, className = _f === void 0 ? '' : _f, onCopy = _a.onCopy, actions = _a.actions;
    var _g = react_1.useState({
        activeTab: (_b = tabs === null || tabs === void 0 ? void 0 : tabs[0]) === null || _b === void 0 ? void 0 : _b.id,
        collapsedGroups: new Set()
    }), state = _g[0], setState = _g[1];
    /**
     * Toggle group collapse
     */
    var toggleGroup = react_1.useCallback(function (groupId) {
        setState(function (prev) {
            var collapsed = new Set(prev.collapsedGroups);
            if (collapsed.has(groupId)) {
                collapsed["delete"](groupId);
            }
            else {
                collapsed.add(groupId);
            }
            return __assign(__assign({}, prev), { collapsedGroups: collapsed });
        });
    }, []);
    /**
     * Handle copy to clipboard
     */
    var handleCopy = react_1.useCallback(function (field, value) { return __awaiter(_this, void 0, void 0, function () {
        var text, success;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    text = String(value);
                    return [4 /*yield*/, utils_1.copyToClipboard(text)];
                case 1:
                    success = _a.sent();
                    if (success) {
                        setState(function (prev) { return (__assign(__assign({}, prev), { copiedField: String(field) })); });
                        setTimeout(function () {
                            setState(function (prev) { return (__assign(__assign({}, prev), { copiedField: undefined })); });
                        }, 2000);
                        onCopy === null || onCopy === void 0 ? void 0 : onCopy(field, value);
                    }
                    return [2 /*return*/];
            }
        });
    }); }, [onCopy]);
    // Loading state with skeleton
    if (loading) {
        return (react_1["default"].createElement("div", { className: className },
            react_1["default"].createElement(ViewSkeleton_1.ViewSkeleton, { mode: mode === 'detail' ? 'detail' : mode === 'card' ? 'card' : mode === 'profile' ? 'profile' : 'detail', groupCount: (groups === null || groups === void 0 ? void 0 : groups.length) || 3 })));
    }
    // Enhanced error state
    if (error) {
        var errorMessage = typeof error === 'string' ? error : error.message;
        return (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-destructive/10 border border-destructive/20 rounded-lg p-6 " + className },
            react_1["default"].createElement("div", { className: "flex items-start gap-3" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-destructive flex-shrink-0 mt-0.5" }),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h3", { className: "font-semibold text-destructive mb-1" }, "Error Loading Data"),
                    react_1["default"].createElement("p", { className: "text-sm text-destructive/80" }, errorMessage)))));
    }
    // Get visible fields
    var visibleFields = utils_1.sortFields(utils_1.getVisibleFields(fields, entity));
    // Render based on mode
    switch (mode) {
        case 'card':
            return react_1["default"].createElement(CardView, { entity: entity, fields: visibleFields, titleField: titleField, subtitleField: subtitleField, imageField: imageField, actions: actions, className: className });
        case 'summary':
            return react_1["default"].createElement(SummaryView, { entity: entity, fields: utils_1.getSummaryFields(visibleFields), className: className });
        case 'timeline':
            return react_1["default"].createElement(TimelineView, { entity: entity, fields: visibleFields, showMetadata: showMetadata, className: className });
        case 'compact':
            return react_1["default"].createElement(CompactView, { entity: entity, fields: visibleFields, titleField: titleField, className: className, onCopy: handleCopy, copiedField: state.copiedField });
        case 'profile':
            return react_1["default"].createElement(ProfileView, { entity: entity, fields: visibleFields, groups: groups, titleField: titleField, subtitleField: subtitleField, imageField: imageField, actions: actions, className: className, state: state, toggleGroup: toggleGroup, onCopy: handleCopy, copiedField: state.copiedField });
        case 'split':
            return react_1["default"].createElement(SplitView, { entity: entity, fields: visibleFields, groups: groups, titleField: titleField, subtitleField: subtitleField, className: className, state: state, toggleGroup: toggleGroup, onCopy: handleCopy, copiedField: state.copiedField });
        case 'table':
            return react_1["default"].createElement(TableView, { entity: entity, fields: visibleFields, groups: groups, className: className, state: state, toggleGroup: toggleGroup, onCopy: handleCopy, copiedField: state.copiedField });
        case 'detail':
        default:
            return (react_1["default"].createElement(DetailView, { entity: entity, fields: visibleFields, groups: groups, state: state, tabs: tabs, showMetadata: showMetadata, titleField: titleField, actions: actions, className: className, onToggleGroup: toggleGroup, onCopy: handleCopy, onTabChange: function (tabId) { return setState(function (prev) { return (__assign(__assign({}, prev), { activeTab: tabId })); }); }, copiedField: state.copiedField }));
    }
}
exports.EntityView = EntityView;
/**
 * Detail View (default mode)
 */
function DetailView(_a) {
    var entity = _a.entity, fields = _a.fields, groups = _a.groups, state = _a.state, tabs = _a.tabs, showMetadata = _a.showMetadata, titleField = _a.titleField, actions = _a.actions, className = _a.className, onToggleGroup = _a.onToggleGroup, onCopy = _a.onCopy, onTabChange = _a.onTabChange, copiedField = _a.copiedField;
    var title = utils_1.getEntityTitle(entity, titleField);
    var groupedFields = utils_1.groupFields(fields, groups);
    var sortedGroups = groups ? utils_1.sortGroups(groups) : [];
    return (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, className: "space-y-4 sm:space-y-6 " + className },
        react_1["default"].createElement("div", { className: "flex items-start justify-between gap-3 pb-3 sm:pb-4 border-b" },
            react_1["default"].createElement("h2", { className: "text-xl sm:text-2xl font-semibold text-foreground flex-1" }, title),
            actions && react_1["default"].createElement("div", { className: "flex flex-wrap gap-2 justify-end flex-shrink-0" }, actions)),
        !tabs || tabs.length === 0 ? (react_1["default"].createElement("div", { className: "space-y-4 sm:space-y-6" },
            groupedFields.get(null) && (react_1["default"].createElement("div", { className: "space-y-2 sm:space-y-3" }, groupedFields.get(null).map(function (field) { return (react_1["default"].createElement(FieldRow, { key: String(field.key), field: field, value: utils_1.getFieldValue(entity, field.key), entity: entity, onCopy: onCopy, copiedField: copiedField })); }))),
            sortedGroups.map(function (group) {
                var _a, _b;
                var groupFields = groupedFields.get(group.id);
                if (!groupFields || groupFields.length === 0)
                    return null;
                var isCollapsed = (_b = (_a = state === null || state === void 0 ? void 0 : state.collapsedGroups) === null || _a === void 0 ? void 0 : _a.has(group.id)) !== null && _b !== void 0 ? _b : false;
                return (react_1["default"].createElement("div", { key: group.id, className: "border rounded-lg overflow-hidden" },
                    react_1["default"].createElement("div", __assign({ className: "flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/50 transition-colors " + (group.collapsible ? 'cursor-pointer hover:bg-muted' : ''), onClick: function () { return group.collapsible && (onToggleGroup === null || onToggleGroup === void 0 ? void 0 : onToggleGroup(group.id)); } }, (group.collapsible ? { role: 'button', 'aria-expanded': (!isCollapsed ? 'true' : 'false') } : {})),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "text-sm font-semibold text-foreground" },
                                renderIcon(group === null || group === void 0 ? void 0 : group.icon),
                                " ",
                                group.label),
                            group.description && react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, group.description)),
                        group.collapsible && (react_1["default"].createElement("svg", { className: "w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform " + (isCollapsed ? 'rotate-0' : 'rotate-180'), fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": "true" },
                            react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })))),
                    !isCollapsed && (react_1["default"].createElement("div", { className: "p-3 sm:p-4 space-y-2 sm:space-y-3 bg-card" }, groupFields.map(function (field) { return (react_1["default"].createElement(FieldRow, { key: String(field.key), field: field, value: utils_1.getFieldValue(entity, field.key), entity: entity, onCopy: onCopy, copiedField: copiedField })); })))));
            }),
            showMetadata && (react_1["default"].createElement("div", { className: "border rounded-lg overflow-hidden" },
                react_1["default"].createElement("div", { className: "px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/50" },
                    react_1["default"].createElement("h3", { className: "text-sm font-semibold text-foreground" }, "Metadata")),
                react_1["default"].createElement("div", { className: "p-3 sm:p-4 space-y-2 sm:space-y-3 bg-card" }, utils_1.getMetadataFields(entity).map(function (_a) {
                    var label = _a.label, value = _a.value;
                    return (react_1["default"].createElement("div", { key: label, className: "flex flex-col sm:flex-row items-start" },
                        react_1["default"].createElement("div", { className: "w-full sm:w-1/3 text-xs sm:text-sm font-medium text-muted-foreground mb-0.5 sm:mb-0" }, label),
                        react_1["default"].createElement("div", { className: "w-full sm:w-2/3 text-xs sm:text-sm text-foreground" }, String(value))));
                })))))) : null,
        tabs && tabs.length > 0 && (react_1["default"].createElement("div", { className: "border rounded-lg overflow-hidden" },
            react_1["default"].createElement("div", { className: "border-b bg-muted/50 overflow-x-auto flex min-w-max", role: "tablist" }, tabs.map(function (tab) {
                var isSelected = (state === null || state === void 0 ? void 0 : state.activeTab) === tab.id;
                return (react_1["default"].createElement("button", __assign({ key: tab.id, type: "button", className: "px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap " + (isSelected
                        ? 'border-primary text-primary bg-background'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'), onClick: function () { return onTabChange === null || onTabChange === void 0 ? void 0 : onTabChange(tab.id); }, role: "tab" }, (isSelected ? { 'aria-selected': 'true' } : {}), { id: "tab-" + tab.id, "aria-controls": "tabpanel-" + tab.id }),
                    tab.icon && react_1["default"].createElement("span", { className: "mr-2" }, tab.icon),
                    react_1["default"].createElement("span", null, tab.label),
                    tab.badge && (react_1["default"].createElement("span", { className: "ml-2 px-1.5 sm:px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary" }, typeof tab.badge === 'function' ? tab.badge(entity) : tab.badge))));
            })),
            react_1["default"].createElement("div", { className: "p-3 sm:p-4 bg-card" }, tabs.map(function (tab) {
                if (tab.id !== (state === null || state === void 0 ? void 0 : state.activeTab))
                    return null;
                // Auto-generate content from groups if tab.content is not provided but tab.id matches a group.id
                var tabContent = null;
                if (tab.content) {
                    var TabContent_1 = tab.content;
                    tabContent = typeof TabContent_1 === 'function' ? (function () {
                        var Component = TabContent_1;
                        return react_1["default"].createElement(Component, { entity: entity });
                    })() : TabContent_1;
                }
                else {
                    // Try to find a matching group and render its fields
                    var matchingGroup = groups === null || groups === void 0 ? void 0 : groups.find(function (g) { return g.id === tab.id; });
                    if (matchingGroup) {
                        var groupFields_1 = groupedFields.get(matchingGroup.id);
                        if (groupFields_1 && groupFields_1.length > 0) {
                            tabContent = (react_1["default"].createElement("div", { className: "space-y-2 sm:space-y-3" }, groupFields_1.map(function (field) { return (react_1["default"].createElement(FieldRow, { key: String(field.key), field: field, value: utils_1.getFieldValue(entity, field.key), entity: entity, onCopy: onCopy, copiedField: copiedField })); })));
                        }
                    }
                }
                return (react_1["default"].createElement("div", { key: tab.id, role: "tabpanel", id: "tabpanel-" + tab.id, "aria-labelledby": "tab-" + tab.id }, tabContent));
            }))))));
}
/**
 * Field Row Component
 */
function FieldRow(_a) {
    var field = _a.field, entity = _a.entity, onCopy = _a.onCopy, copiedField = _a.copiedField;
    var value = utils_1.getFieldValue(entity, field.key);
    var renderedValue = utils_1.renderField(field, entity);
    return (react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row items-start py-1.5 sm:py-2 gap-1 sm:gap-0" },
        react_1["default"].createElement("div", { className: "w-full sm:w-1/3 sm:pr-4" },
            react_1["default"].createElement("div", { className: "text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1" },
                field.label,
                field.helpText && (react_1["default"].createElement("span", { className: "inline-flex items-center justify-center w-3.5 h-3.5 text-xs rounded-full bg-muted text-muted-foreground cursor-help", title: field.helpText, "aria-label": field.helpText }, "?")))),
        react_1["default"].createElement("div", { className: "w-full sm:w-2/3 flex items-start gap-2" },
            react_1["default"].createElement("div", { className: "flex-1 text-xs sm:text-sm text-foreground break-words" }, renderedValue),
            field.copyable && (react_1["default"].createElement("button", { className: "flex-shrink-0 p-2 sm:p-2 rounded-md transition-all min-h-[40px] min-w-[40px] flex items-center justify-center " + (copiedField === String(field.key)
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary'), onClick: function () { return onCopy === null || onCopy === void 0 ? void 0 : onCopy(field.key, value); }, title: copiedField === String(field.key) ? 'Copied!' : 'Copy to clipboard', "aria-label": copiedField === String(field.key) ? 'Copied!' : 'Copy to clipboard' }, copiedField === String(field.key) ? (react_1["default"].createElement(lucide_react_1.Check, { className: "w-4 h-4" })) : (react_1["default"].createElement(lucide_react_1.Copy, { className: "w-4 h-4" })))))));
}
/**
 * Card View
 */
function CardView(_a) {
    var entity = _a.entity, fields = _a.fields, titleField = _a.titleField, subtitleField = _a.subtitleField, imageField = _a.imageField, actions = _a.actions, className = _a.className;
    var title = utils_1.getEntityTitle(entity, titleField);
    var subtitle = utils_1.getEntitySubtitle(entity, subtitleField);
    var image = utils_1.getEntityImage(entity, imageField);
    return (react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-sm overflow-hidden " + className },
        image && (react_1["default"].createElement("div", { className: "aspect-video w-full overflow-hidden bg-muted relative" },
            react_1["default"].createElement(image_1["default"], { src: String(image), alt: title, fill: true, sizes: "(max-width: 768px) 100vw, 50vw", style: { objectFit: 'cover' }, className: "w-full h-full" }))),
        react_1["default"].createElement("div", { className: "p-4 sm:p-6 space-y-3 sm:space-y-4" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("h2", { className: "text-xl sm:text-2xl font-semibold text-foreground" }, title),
                subtitle && react_1["default"].createElement("p", { className: "text-xs sm:text-sm text-muted-foreground mt-1" }, subtitle)),
            react_1["default"].createElement("div", { className: "space-y-1.5 sm:space-y-2" }, fields.slice(0, 5).map(function (field) { return (react_1["default"].createElement("div", { key: String(field.key), className: "flex flex-col sm:flex-row items-start gap-0.5 sm:gap-0" },
                react_1["default"].createElement("span", { className: "text-xs sm:text-sm font-medium text-muted-foreground w-full sm:w-1/3" },
                    field.label,
                    ":"),
                react_1["default"].createElement("span", { className: "text-xs sm:text-sm text-foreground w-full sm:w-2/3 break-words" }, utils_1.renderField(field, entity)))); })),
            actions && react_1["default"].createElement("div", { className: "flex items-center gap-2 pt-3 sm:pt-4 border-t" }, actions))));
}
/**
 * Summary View
 */
function SummaryView(_a) {
    var entity = _a.entity, fields = _a.fields, className = _a.className;
    return (react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-sm p-3 sm:p-4 space-y-1.5 sm:space-y-2 " + className }, fields.map(function (field) { return (react_1["default"].createElement("div", { key: String(field.key), className: "flex flex-col sm:flex-row items-start py-0.5 sm:py-1 gap-0.5 sm:gap-0" },
        react_1["default"].createElement("span", { className: "text-xs sm:text-sm font-medium text-muted-foreground w-full sm:w-1/3" },
            field.label,
            ":"),
        react_1["default"].createElement("span", { className: "text-xs sm:text-sm text-foreground w-full sm:w-2/3 break-words" }, utils_1.renderField(field, entity)))); })));
}
/**
 * Timeline View
 */
function TimelineView(_a) {
    var entity = _a.entity, fields = _a.fields, showMetadata = _a.showMetadata, className = _a.className;
    var events = __spreadArrays(fields);
    if (showMetadata) {
        utils_1.getMetadataFields(entity).forEach(function (_a) {
            var label = _a.label, value = _a.value;
            events.push({ key: label, label: label, type: 'date', value: value });
        });
    }
    return (react_1["default"].createElement("div", { className: "relative space-y-4 sm:space-y-6 " + className },
        react_1["default"].createElement("div", { className: "absolute left-3 sm:left-4 top-0 bottom-0 w-0.5 bg-border" }),
        events.map(function (field) { return (react_1["default"].createElement("div", { key: String(field.key), className: "relative pl-8 sm:pl-12" },
            react_1["default"].createElement("div", { className: "absolute left-1.5 sm:left-2.5 top-2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary border-2 border-background shadow-sm" }),
            react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-sm p-3 sm:p-4" },
                react_1["default"].createElement("div", { className: "text-xs sm:text-sm font-medium text-foreground" }, field.label),
                react_1["default"].createElement("div", { className: "text-xs sm:text-sm text-muted-foreground mt-1" }, utils_1.renderField(field, entity))))); })));
}
/**
 * Compact View - Minimal space usage
 */
function CompactView(_a) {
    var entity = _a.entity, fields = _a.fields, titleField = _a.titleField, className = _a.className;
    var title = utils_1.getEntityTitle(entity, titleField);
    return (react_1["default"].createElement("div", { className: "bg-card rounded-lg border p-3 sm:p-4 " + className },
        react_1["default"].createElement("h3", { className: "text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3" }, title),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2" }, fields.map(function (field) { return (react_1["default"].createElement("div", { key: String(field.key), className: "flex items-start gap-1.5 text-xs sm:text-sm" },
            react_1["default"].createElement("span", { className: "font-medium text-muted-foreground whitespace-nowrap" },
                field.label,
                ":"),
            react_1["default"].createElement("span", { className: "text-foreground truncate flex-1" }, utils_1.renderField(field, entity)))); }))));
}
/**
 * Profile View - User-centric layout with avatar
 */
function ProfileView(_a) {
    var entity = _a.entity, fields = _a.fields, groups = _a.groups, titleField = _a.titleField, subtitleField = _a.subtitleField, imageField = _a.imageField, actions = _a.actions, className = _a.className, state = _a.state, toggleGroup = _a.toggleGroup, onCopy = _a.onCopy, copiedField = _a.copiedField;
    var title = utils_1.getEntityTitle(entity, titleField);
    var subtitle = utils_1.getEntitySubtitle(entity, subtitleField);
    var image = utils_1.getEntityImage(entity, imageField);
    var groupedFields = utils_1.groupFields(fields, groups);
    var sortedGroups = groups ? utils_1.sortGroups(groups) : [];
    return (react_1["default"].createElement("div", { className: "space-y-4 sm:space-y-6 " + className },
        react_1["default"].createElement("div", { className: "bg-card rounded-lg border shadow-sm overflow-hidden" },
            react_1["default"].createElement("div", { className: "bg-gradient-to-r from-primary/10 to-primary/5 px-4 sm:px-6 py-6 sm:py-8" },
                react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row items-center gap-4 sm:gap-6" },
                    image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    react_1["default"].createElement("img", { src: image, alt: title, className: "w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-background shadow-lg object-cover", loading: "lazy" })) : (react_1["default"].createElement("div", { className: "w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-background shadow-lg bg-muted flex items-center justify-center" },
                        react_1["default"].createElement("svg", { className: "w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": "true" },
                            react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" })))),
                    react_1["default"].createElement("div", { className: "flex-1 text-center sm:text-left" },
                        react_1["default"].createElement("h2", { className: "text-xl sm:text-2xl font-bold text-foreground" }, title),
                        subtitle && react_1["default"].createElement("p", { className: "text-sm text-muted-foreground mt-1" }, subtitle),
                        actions && react_1["default"].createElement("div", { className: "flex gap-2 mt-3 justify-center sm:justify-start" }, actions)))),
            groupedFields.get(null) && (react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 border-t" }, groupedFields.get(null).slice(0, 6).map(function (field) {
                return (react_1["default"].createElement("div", { key: String(field.key), className: "flex flex-col" },
                    react_1["default"].createElement("span", { className: "text-xs text-muted-foreground uppercase tracking-wide" }, field.label),
                    react_1["default"].createElement("span", { className: "text-sm font-medium text-foreground mt-0.5 truncate" }, utils_1.renderField(field, entity))));
            })))),
        sortedGroups.map(function (group) {
            var _a, _b;
            var groupFields = groupedFields.get(group.id);
            if (!groupFields || groupFields.length === 0)
                return null;
            var isCollapsed = (_b = (_a = state === null || state === void 0 ? void 0 : state.collapsedGroups) === null || _a === void 0 ? void 0 : _a.has(group.id)) !== null && _b !== void 0 ? _b : false;
            return (react_1["default"].createElement("div", { key: group.id, className: "bg-card rounded-lg border shadow-sm overflow-hidden" },
                react_1["default"].createElement("div", __assign({ className: "flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/50 transition-colors " + (group.collapsible ? 'cursor-pointer hover:bg-muted' : ''), onClick: function () { return group.collapsible && (toggleGroup === null || toggleGroup === void 0 ? void 0 : toggleGroup(group.id)); } }, (group.collapsible ? { role: 'button', 'aria-expanded': (!isCollapsed ? 'true' : 'false'), tabIndex: 0 } : {})),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-sm font-semibold text-foreground" }, group.label),
                        group.description && react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, group.description)),
                    group.collapsible && (react_1["default"].createElement("svg", { className: "w-4 h-4 transition-transform " + (isCollapsed ? 'rotate-0' : 'rotate-180'), fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                        react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })))),
                !isCollapsed && (react_1["default"].createElement("div", { className: "p-3 sm:p-4 space-y-2" }, groupFields.map(function (field) { return (react_1["default"].createElement(FieldRow, { key: String(field.key), field: field, value: utils_1.getFieldValue(entity, field.key), entity: entity, onCopy: onCopy, copiedField: copiedField })); })))));
        })));
}
/**
 * Split View - Two column layout
 */
function SplitView(_a) {
    var entity = _a.entity, fields = _a.fields, groups = _a.groups, titleField = _a.titleField, subtitleField = _a.subtitleField, className = _a.className, state = _a.state, toggleGroup = _a.toggleGroup, onCopy = _a.onCopy, copiedField = _a.copiedField;
    var title = utils_1.getEntityTitle(entity, titleField);
    var subtitle = utils_1.getEntitySubtitle(entity, subtitleField);
    var groupedFields = utils_1.groupFields(fields, groups);
    var sortedGroups = groups ? utils_1.sortGroups(groups) : [];
    // Split groups into two columns
    var midpoint = Math.ceil(sortedGroups.length / 2);
    var leftGroups = sortedGroups.slice(0, midpoint);
    var rightGroups = sortedGroups.slice(midpoint);
    var renderGroupContent = function (group) {
        var _a, _b;
        var groupFields = groupedFields.get(group.id);
        if (!groupFields || groupFields.length === 0)
            return null;
        var isCollapsed = (_b = (_a = state === null || state === void 0 ? void 0 : state.collapsedGroups) === null || _a === void 0 ? void 0 : _a.has(group.id)) !== null && _b !== void 0 ? _b : false;
        return (react_1["default"].createElement("div", { key: group.id, className: "border rounded-lg overflow-hidden" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between px-3 py-2.5 bg-muted/50 transition-colors " + (group.collapsible ? 'cursor-pointer hover:bg-muted' : ''), onClick: function () { return group.collapsible && (toggleGroup === null || toggleGroup === void 0 ? void 0 : toggleGroup(group.id)); } },
                react_1["default"].createElement("h4", { className: "text-sm font-semibold text-foreground" }, group.label),
                group.collapsible && (react_1["default"].createElement("svg", { className: "w-4 h-4 transition-transform " + (isCollapsed ? 'rotate-0' : 'rotate-180'), fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                    react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })))),
            !isCollapsed && (react_1["default"].createElement("div", { className: "p-3 space-y-2 bg-card" }, groupFields.map(function (field) { return (react_1["default"].createElement(FieldRow, { key: String(field.key), field: field, value: utils_1.getFieldValue(entity, field.key), entity: entity, onCopy: onCopy, copiedField: copiedField })); })))));
    };
    return (react_1["default"].createElement("div", { className: "space-y-4 " + className },
        react_1["default"].createElement("div", { className: "bg-card rounded-lg border p-4" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold text-foreground" }, title),
            subtitle && react_1["default"].createElement("p", { className: "text-sm text-muted-foreground mt-1" }, subtitle)),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4" },
            react_1["default"].createElement("div", { className: "space-y-4" }, leftGroups.map(renderGroupContent)),
            react_1["default"].createElement("div", { className: "space-y-4" }, rightGroups.map(renderGroupContent)))));
}
/**
 * Table View - Data in table format
 */
function TableView(_a) {
    var entity = _a.entity, fields = _a.fields, groups = _a.groups, className = _a.className, state = _a.state, toggleGroup = _a.toggleGroup, onCopy = _a.onCopy, copiedField = _a.copiedField;
    var groupedFields = utils_1.groupFields(fields, groups);
    var sortedGroups = groups ? utils_1.sortGroups(groups) : [];
    return (react_1["default"].createElement("div", { className: "space-y-4 " + className },
        groupedFields.get(null) && (react_1["default"].createElement("div", { className: "bg-card rounded-lg border overflow-hidden" },
            react_1["default"].createElement("div", { className: "overflow-x-auto" },
                react_1["default"].createElement("table", { className: "min-w-full divide-y divide-border" },
                    react_1["default"].createElement("tbody", { className: "divide-y divide-border" }, groupedFields.get(null).map(function (field) {
                        var value = utils_1.getFieldValue(entity, field.key);
                        return (react_1["default"].createElement("tr", { key: String(field.key), className: "hover:bg-muted/50 transition-colors" },
                            react_1["default"].createElement("td", { className: "px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground w-1/3" }, field.label),
                            react_1["default"].createElement("td", { className: "px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-foreground" },
                                react_1["default"].createElement("div", { className: "flex items-center justify-between gap-2" },
                                    react_1["default"].createElement("span", { className: "break-words" }, utils_1.renderField(field, entity)),
                                    field.copyable && (react_1["default"].createElement("button", { className: "flex-shrink-0 p-1 rounded transition-colors " + (copiedField === String(field.key) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'), onClick: function () { return onCopy === null || onCopy === void 0 ? void 0 : onCopy(field.key, value); }, title: "Copy" },
                                        react_1["default"].createElement("svg", { className: "w-3 h-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, copiedField === String(field.key) ? (react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" })) : (react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" })))))))));
                    })))))),
        sortedGroups.map(function (group) {
            var _a, _b;
            var groupFields = groupedFields.get(group.id);
            if (!groupFields || groupFields.length === 0)
                return null;
            var isCollapsed = (_b = (_a = state === null || state === void 0 ? void 0 : state.collapsedGroups) === null || _a === void 0 ? void 0 : _a.has(group.id)) !== null && _b !== void 0 ? _b : false;
            return (react_1["default"].createElement("div", { key: group.id, className: "bg-card rounded-lg border overflow-hidden" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/50 transition-colors " + (group.collapsible ? 'cursor-pointer hover:bg-muted' : ''), onClick: function () { return group.collapsible && (toggleGroup === null || toggleGroup === void 0 ? void 0 : toggleGroup(group.id)); } },
                    react_1["default"].createElement("h3", { className: "text-sm font-semibold text-foreground" }, group.label),
                    group.collapsible && (react_1["default"].createElement("svg", { className: "w-4 h-4 transition-transform " + (isCollapsed ? 'rotate-0' : 'rotate-180'), fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                        react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })))),
                !isCollapsed && (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                    react_1["default"].createElement("table", { className: "min-w-full divide-y divide-border" },
                        react_1["default"].createElement("tbody", { className: "divide-y divide-border" }, groupFields.map(function (field) {
                            var value = utils_1.getFieldValue(entity, field.key);
                            return (react_1["default"].createElement("tr", { key: String(field.key), className: "hover:bg-muted/50 transition-colors" },
                                react_1["default"].createElement("td", { className: "px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground w-1/3" }, field.label),
                                react_1["default"].createElement("td", { className: "px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-foreground" },
                                    react_1["default"].createElement("div", { className: "flex items-center justify-between gap-2" },
                                        react_1["default"].createElement("span", { className: "break-words" }, utils_1.renderField(field, entity)),
                                        field.copyable && (react_1["default"].createElement("button", { className: "flex-shrink-0 p-1 rounded transition-colors " + (copiedField === String(field.key) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'), onClick: function () { return onCopy === null || onCopy === void 0 ? void 0 : onCopy(field.key, value); }, title: "Copy" },
                                            react_1["default"].createElement("svg", { className: "w-3 h-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, copiedField === String(field.key) ? (react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" })) : (react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" })))))))));
                        })))))));
        })));
}
exports["default"] = EntityView;
