/**
 * EntityForm Component
 *
 * Standalone component for creating/editing entities with comprehensive form features.
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
exports.EntityForm = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("./utils");
var FileUpload_1 = require("./fields/FileUpload");
var button_1 = require("@/components/ui/button");
var popover_1 = require("@/components/ui/popover");
var command_1 = require("@/components/ui/command");
/**
 * EntityForm Component
 *
 * @example
 * ```tsx
 * const fields: FormField<User>[] = [
 *   { name: 'name', label: 'Name', type: 'text', required: true },
 *   { name: 'email', label: 'Email', type: 'email', required: true },
 *   { name: 'role', label: 'Role', type: 'select', options: roleOptions },
 * ];
 *
 * <EntityForm
 *   fields={fields}
 *   mode="create"
 *   onSubmit={async (values) => {
 *     await createUser(values);
 *   }}
 * />
 * ```
 */
function EntityForm(_a) {
    var _this = this;
    var fields = _a.fields, _b = _a.mode, mode = _b === void 0 ? 'create' : _b, _c = _a.layout, layout = _c === void 0 ? 'vertical' : _c, initialValues = _a.initialValues, entity = _a.entity, sections = _a.sections, tabs = _a.tabs, steps = _a.steps, onSubmit = _a.onSubmit, onCancel = _a.onCancel, onChange = _a.onChange, onValidate = _a.onValidate, _d = _a.submitText, submitText = _d === void 0 ? mode === 'create' ? 'Create' : 'Save' : _d, _e = _a.cancelText, cancelText = _e === void 0 ? 'Cancel' : _e, _f = _a.showCancel, showCancel = _f === void 0 ? true : _f, _g = _a.showReset, showReset = _g === void 0 ? false : _g, _h = _a.resetOnSubmit, resetOnSubmit = _h === void 0 ? false : _h, _j = _a.loading, loading = _j === void 0 ? false : _j, _k = _a.disabled, disabled = _k === void 0 ? false : _k, _l = _a.className, className = _l === void 0 ? '' : _l, _m = _a.validateOnChange, validateOnChange = _m === void 0 ? false : _m, _o = _a.validateOnBlur, validateOnBlur = _o === void 0 ? true : _o;
    var _p = react_1.useState(function () {
        var _a, _b;
        var initialVals = utils_1.getInitialValues(fields, entity, initialValues);
        return {
            values: initialVals,
            errors: {},
            touched: new Set(),
            dirty: new Set(),
            submitting: false,
            submitError: undefined,
            currentStep: 0,
            currentTab: ((_a = tabs === null || tabs === void 0 ? void 0 : tabs[0]) === null || _a === void 0 ? void 0 : _a.id) || ((_b = sections === null || sections === void 0 ? void 0 : sections[0]) === null || _b === void 0 ? void 0 : _b.id),
            currentTabIndex: 0,
            collapsedSections: new Set()
        };
    }), state = _p[0], setState = _p[1];
    /**
     * Set field value
     */
    var setFieldValue = react_1.useCallback(function (fieldName, value) {
        setState(function (prev) {
            var _a;
            var newValues = __assign(__assign({}, prev.values), (_a = {}, _a[fieldName] = value, _a));
            var newDirty = new Set(prev.dirty);
            newDirty.add(fieldName);
            onChange === null || onChange === void 0 ? void 0 : onChange(newValues);
            // Validate on change if enabled
            if (validateOnChange) {
                var field = fields.find(function (f) { return String(f.name) === fieldName; });
                if (field) {
                    utils_1.validateField(value, field, newValues).then(function (error) {
                        setState(function (s) {
                            var _a;
                            return (__assign(__assign({}, s), { errors: error
                                    ? __assign(__assign({}, s.errors), (_a = {}, _a[fieldName] = error, _a)) : Object.fromEntries(Object.entries(s.errors).filter(function (_a) {
                                    var k = _a[0];
                                    return k !== fieldName;
                                })) }));
                        });
                    });
                }
            }
            return __assign(__assign({}, prev), { values: newValues, dirty: newDirty });
        });
    }, [onChange, validateOnChange, fields]);
    /**
     * Set field touched
     */
    var setFieldTouched = react_1.useCallback(function (fieldName) {
        setState(function (prev) {
            var newTouched = new Set(prev.touched);
            newTouched.add(fieldName);
            // Validate on blur if enabled
            if (validateOnBlur) {
                var field = fields.find(function (f) { return String(f.name) === fieldName; });
                if (field) {
                    var value = prev.values[field.name];
                    utils_1.validateField(value, field, prev.values).then(function (error) {
                        setState(function (s) {
                            var _a;
                            return (__assign(__assign({}, s), { errors: error
                                    ? __assign(__assign({}, s.errors), (_a = {}, _a[fieldName] = error, _a)) : Object.fromEntries(Object.entries(s.errors).filter(function (_a) {
                                    var k = _a[0];
                                    return k !== fieldName;
                                })) }));
                        });
                    });
                }
            }
            return __assign(__assign({}, prev), { touched: newTouched });
        });
    }, [validateOnBlur, fields]);
    // Sync form values when `entity` or `initialValues` props change (useful when entity is loaded asynchronously)
    react_1.useEffect(function () {
        // Only update when an entity is provided (edit mode) or when explicit initialValues change.
        if (!entity && !initialValues)
            return;
        var newVals = utils_1.getInitialValues(fields, entity, initialValues);
        // Avoid updating state if values are identical to prevent unnecessary re-renders
        try {
            var prevVals = state.values;
            var prevJson = JSON.stringify(prevVals || {});
            var newJson = JSON.stringify(newVals || {});
            if (prevJson === newJson)
                return;
        }
        catch (e) {
            // If serialization fails for some reason, fall back to always updating
        }
        setState(function (prev) { return (__assign(__assign({}, prev), { values: newVals, 
            // reset errors/touched/dirtiness when loading new entity to avoid showing stale validation
            errors: {}, touched: new Set(), dirty: new Set() })); });
    }, [entity, initialValues, fields]);
    /**
     * Validate entire form
     */
    var validateFormAsync = react_1.useCallback(function () { return __awaiter(_this, void 0, Promise, function () {
        var visibleFields, errors, customErrors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    visibleFields = fields.filter(function (f) { return utils_1.isFieldVisible(f, state.values); });
                    return [4 /*yield*/, utils_1.validateForm(state.values, visibleFields)];
                case 1:
                    errors = _a.sent();
                    if (!onValidate) return [3 /*break*/, 3];
                    return [4 /*yield*/, onValidate(state.values)];
                case 2:
                    customErrors = _a.sent();
                    errors = __assign(__assign({}, errors), customErrors);
                    _a.label = 3;
                case 3:
                    setState(function (prev) { return (__assign(__assign({}, prev), { errors: errors })); });
                    return [2 /*return*/, !utils_1.hasErrors(errors)];
            }
        });
    }); }, [fields, state.values, onValidate]);
    /**
     * Handle form submit
     */
    var handleSubmit = react_1.useCallback(function (e) { return __awaiter(_this, void 0, void 0, function () {
        var allTouched, isValid, allErrors_1, sortedSections, tabWithErrors_1, transformedValues, resetValues_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    allTouched = new Set(fields.map(function (f) { return String(f.name); }));
                    setState(function (prev) { return (__assign(__assign({}, prev), { touched: allTouched, submitError: undefined })); });
                    return [4 /*yield*/, validateFormAsync()];
                case 1:
                    isValid = _a.sent();
                    if (!!isValid) return [3 /*break*/, 4];
                    if (!(layout === 'tabs' && sections && onValidate)) return [3 /*break*/, 3];
                    return [4 /*yield*/, onValidate(state.values)];
                case 2:
                    allErrors_1 = _a.sent();
                    if (allErrors_1 && Object.keys(allErrors_1).length > 0) {
                        sortedSections = utils_1.sortSections(sections);
                        tabWithErrors_1 = sortedSections.findIndex(function (section) {
                            return section.fields.some(function (fieldName) { return allErrors_1[fieldName]; });
                        });
                        if (tabWithErrors_1 !== -1) {
                            setState(function (prev) { return (__assign(__assign({}, prev), { currentTabIndex: tabWithErrors_1 })); });
                        }
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/];
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    setState(function (prev) { return (__assign(__assign({}, prev), { submitting: true, submitError: undefined })); });
                    transformedValues = utils_1.transformValues(state.values, fields);
                    return [4 /*yield*/, onSubmit(transformedValues)];
                case 5:
                    _a.sent();
                    // Reset form if resetOnSubmit is true
                    if (resetOnSubmit) {
                        resetValues_1 = utils_1.getInitialValues(fields, undefined, initialValues);
                        setState(function (prev) { return (__assign(__assign({}, prev), { values: resetValues_1, errors: {}, touched: new Set(), dirty: new Set(), submitting: false, submitError: undefined })); });
                    }
                    else {
                        setState(function (prev) { return (__assign(__assign({}, prev), { submitting: false })); });
                    }
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    setState(function (prev) { return (__assign(__assign({}, prev), { submitting: false, submitError: error_1 instanceof Error ? error_1.message : 'An error occurred during submission' })); });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [fields, state.values, validateFormAsync, onSubmit, resetOnSubmit, initialValues, layout, sections, onValidate]);
    /**
     * Handle reset
     */
    var handleReset = react_1.useCallback(function () {
        var resetValues = utils_1.getInitialValues(fields, entity, initialValues);
        setState(function (prev) { return (__assign(__assign({}, prev), { values: resetValues, errors: {}, touched: new Set(), dirty: new Set() })); });
    }, [fields, entity, initialValues]);
    /**
     * Toggle section collapse
     */
    var toggleSection = react_1.useCallback(function (sectionId) {
        setState(function (prev) {
            var collapsed = new Set(prev.collapsedSections);
            if (collapsed.has(sectionId)) {
                collapsed["delete"](sectionId);
            }
            else {
                collapsed.add(sectionId);
            }
            return __assign(__assign({}, prev), { collapsedSections: collapsed });
        });
    }, []);
    // Render based on layout
    var renderLayout = function () {
        switch (layout) {
            case 'tabs':
                // Use tabs if provided, otherwise convert sections to tabs
                return tabs ? react_1["default"].createElement(TabsLayout, null) : sections ? react_1["default"].createElement(SectionsAsTabsLayout, null) : react_1["default"].createElement(VerticalLayout, null);
            case 'wizard':
                return steps ? react_1["default"].createElement(WizardLayout, null) : react_1["default"].createElement(VerticalLayout, null);
            case 'grid':
                return react_1["default"].createElement(GridLayout, null);
            case 'horizontal':
                return react_1["default"].createElement(HorizontalLayout, null);
            case 'vertical':
            default:
                return react_1["default"].createElement(VerticalLayout, null);
        }
    };
    /**
     * Vertical Layout
     */
    var VerticalLayout = function () {
        var _a;
        var visibleFields = utils_1.sortFields(fields.filter(function (f) { return utils_1.isFieldVisible(f, state.values); }));
        var groupedFields = utils_1.groupFieldsBySections(visibleFields, sections);
        var sortedSections = sections ? utils_1.sortSections(sections) : [];
        return (react_1["default"].createElement("div", { className: "space-y-4" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, (_a = groupedFields.get(null)) === null || _a === void 0 ? void 0 : _a.map(function (field) {
                // Parse width to determine grid column span
                var colSpan = 'col-span-1';
                if (field.width) {
                    var widthStr = String(field.width);
                    if (widthStr.includes('%')) {
                        var percent = parseInt(widthStr);
                        if (percent >= 50)
                            colSpan = 'md:col-span-2';
                    }
                }
                return (react_1["default"].createElement("div", { key: String(field.name), className: colSpan },
                    react_1["default"].createElement(FormFieldComponent, { field: field })));
            })),
            sortedSections.map(function (section) {
                var sectionFields = groupedFields.get(section.id) || [];
                if (sectionFields.length === 0)
                    return null;
                var isCollapsed = state.collapsedSections.has(section.id);
                return (react_1["default"].createElement("div", { key: section.id, className: "border rounded-lg overflow-hidden bg-card shadow-sm" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between px-4 py-3 bg-muted/30 border-b " + (section.collapsible ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''), onClick: function () { return section.collapsible && toggleSection(section.id); }, onKeyDown: function (e) { return section.collapsible && (e.key === 'Enter' || e.key === ' ') && toggleSection(section.id); }, tabIndex: section.collapsible ? 0 : undefined },
                        react_1["default"].createElement("div", { className: "flex items-center gap-2 flex-1" },
                            section.icon && react_1["default"].createElement("span", { className: "text-muted-foreground" }, section.icon),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("h3", { className: "text-sm font-semibold text-foreground" }, section.label),
                                section.description && react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, section.description))),
                        section.collapsible && (react_1["default"].createElement("svg", { className: "w-5 h-5 text-muted-foreground transition-transform duration-200 " + (isCollapsed ? '-rotate-90' : ''), fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                            react_1["default"].createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })))),
                    !isCollapsed && (react_1["default"].createElement("div", { className: "p-4 bg-card" },
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, sectionFields.map(function (field) {
                            // Parse width to determine grid column span
                            var colSpan = 'col-span-1';
                            if (field.width) {
                                var widthStr = String(field.width);
                                if (widthStr.includes('%')) {
                                    var percent = parseInt(widthStr);
                                    if (percent >= 50)
                                        colSpan = 'md:col-span-2';
                                }
                            }
                            return (react_1["default"].createElement("div", { key: String(field.name), className: colSpan },
                                react_1["default"].createElement(FormFieldComponent, { field: field })));
                        }))))));
            })));
    };
    /**
     * Horizontal Layout
     */
    var HorizontalLayout = function () {
        var visibleFields = utils_1.sortFields(fields.filter(function (f) { return utils_1.isFieldVisible(f, state.values); }));
        return (react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" }, visibleFields.map(function (field) {
            // Parse width to determine grid column span
            var colSpan = 'col-span-1';
            if (field.width) {
                var widthStr = String(field.width);
                if (widthStr.includes('%')) {
                    var percent = parseInt(widthStr);
                    if (percent >= 75)
                        colSpan = 'sm:col-span-2 lg:col-span-3 xl:col-span-4';
                    else if (percent >= 50)
                        colSpan = 'sm:col-span-2';
                    else if (percent >= 25)
                        colSpan = 'sm:col-span-1';
                }
            }
            return (react_1["default"].createElement("div", { key: String(field.name), className: colSpan },
                react_1["default"].createElement(FormFieldComponent, { field: field })));
        })));
    };
    /**
     * Grid Layout
     */
    var GridLayout = function () {
        var visibleFields = utils_1.sortFields(fields.filter(function (f) { return utils_1.isFieldVisible(f, state.values); }));
        return (react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, visibleFields.map(function (field) {
            // Parse width to determine grid column span
            var colSpan = 'col-span-1';
            if (field.width) {
                var widthStr = String(field.width);
                if (widthStr.includes('%')) {
                    var percent = parseInt(widthStr);
                    if (percent >= 75)
                        colSpan = 'md:col-span-2 lg:col-span-4';
                    else if (percent >= 50)
                        colSpan = 'md:col-span-2';
                    else if (percent >= 25)
                        colSpan = 'md:col-span-1';
                }
                else {
                    var numWidth = parseInt(widthStr);
                    colSpan = "md:col-span-" + Math.min(numWidth, 2) + " lg:col-span-" + Math.min(numWidth, 4);
                }
            }
            return (react_1["default"].createElement("div", { key: String(field.name), className: colSpan },
                react_1["default"].createElement(FormFieldComponent, { field: field })));
        })));
    };
    /**
     * Tabs Layout
     */
    var TabsLayout = function () {
        if (!tabs)
            return null;
        var sortedTabs = utils_1.sortTabs(tabs);
        var groupedFields = utils_1.groupFieldsByTabs(fields, sortedTabs);
        return (react_1["default"].createElement("div", { className: "space-y-4" },
            react_1["default"].createElement("div", { className: "border-b border-border overflow-x-auto", role: "tablist" },
                react_1["default"].createElement("div", { className: "flex space-x-1 min-w-max px-1" }, sortedTabs.map(function (tab) { return (react_1["default"].createElement("button", { key: tab.id, type: "button", className: "flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition-all whitespace-nowrap border-b-2 " + (state.currentTab === tab.id
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'), onClick: function () { return setState(function (prev) { return (__assign(__assign({}, prev), { currentTab: tab.id })); }); }, role: "tab" },
                    tab.icon && react_1["default"].createElement("span", { className: "text-base" }, tab.icon),
                    tab.label)); }))),
            react_1["default"].createElement("div", { className: "min-h-[300px]" }, sortedTabs.map(function (tab) {
                if (tab.id !== state.currentTab)
                    return null;
                var tabFields = groupedFields.get(tab.id) || [];
                return (react_1["default"].createElement("div", { key: tab.id, role: "tabpanel" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, tabFields.map(function (field) {
                        // Parse width to determine grid column span
                        var colSpan = 'col-span-1';
                        if (field.width) {
                            var widthStr = String(field.width);
                            if (widthStr.includes('%')) {
                                var percent = parseInt(widthStr);
                                if (percent >= 50)
                                    colSpan = 'md:col-span-2';
                            }
                        }
                        return (react_1["default"].createElement("div", { key: String(field.name), className: colSpan },
                            react_1["default"].createElement(FormFieldComponent, { field: field })));
                    }))));
            }))));
    };
    /**
     * Sections as Tabs Layout
     * Uses sections prop to render as tabs
     */
    var SectionsAsTabsLayout = function () {
        if (!sections)
            return null;
        var sortedSections = utils_1.sortSections(sections);
        var visibleFields = fields.filter(function (f) { return utils_1.isFieldVisible(f, state.values); });
        var groupedFields = utils_1.groupFieldsBySections(visibleFields, sections);
        // If there are ungrouped fields, add them to the first section
        var ungroupedFields = groupedFields.get(null) || [];
        if (ungroupedFields.length > 0 && sortedSections.length > 0) {
            var firstSectionId = sortedSections[0].id;
            var firstSectionFields = groupedFields.get(firstSectionId) || [];
            groupedFields.set(firstSectionId, __spreadArrays(firstSectionFields, ungroupedFields));
            groupedFields["delete"](null);
        }
        var currentTabIndex = state.currentTabIndex || 0;
        var goToNextTab = function () { return __awaiter(_this, void 0, void 0, function () {
            var currentSection, tabFields, tabErrors;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // clear error state
                        setState(function (prev) { return (__assign(__assign({}, prev), { errors: {} })); });
                        currentSection = sortedSections[currentTabIndex];
                        tabFields = groupedFields.get(currentSection.id) || [];
                        return [4 /*yield*/, utils_1.validateForm(state.values, tabFields)];
                    case 1:
                        tabErrors = _a.sent();
                        if (utils_1.hasErrors(tabErrors)) {
                            setState(function (prev) { return (__assign(__assign({}, prev), { errors: __assign(__assign({}, prev.errors), tabErrors) })); });
                            return [2 /*return*/];
                        }
                        if (currentTabIndex < sortedSections.length - 1) {
                            setState(function (prev) { return (__assign(__assign({}, prev), { currentTabIndex: currentTabIndex + 1 })); });
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        var goToPreviousTab = function () {
            if (currentTabIndex > 0) {
                setState(function (prev) { return (__assign(__assign({}, prev), { currentTabIndex: currentTabIndex - 1 })); });
            }
        };
        return (react_1["default"].createElement("div", { className: "space-y-4" },
            react_1["default"].createElement("div", { className: "border-b border-border overflow-x-auto", role: "tablist" },
                react_1["default"].createElement("div", { className: "flex space-x-1 min-w-max px-1" }, sortedSections.map(function (section, index) {
                    var hasErrors = section.fields.some(function (fieldName) { return state.errors[fieldName]; });
                    return (react_1["default"].createElement("button", { key: section.id, type: "button", className: "px-4 py-2.5 font-medium text-sm transition-all whitespace-nowrap border-b-2 " + (index === currentTabIndex
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'), onClick: function () { return setState(function (prev) { return (__assign(__assign({}, prev), { currentTabIndex: index })); }); }, role: "tab" },
                        hasErrors && react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "w-4 h-4 text-destructive mr-1" }),
                        section.label));
                }))),
            react_1["default"].createElement("div", { className: "min-h-[300px]" }, sortedSections.map(function (section, index) {
                if (index !== currentTabIndex)
                    return null;
                var sectionFields = groupedFields.get(section.id) || [];
                return (react_1["default"].createElement("div", { key: section.id, className: "space-y-4", role: "tabpanel" },
                    section.description && (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, section.description)),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, sectionFields.map(function (field) {
                        // Parse width to determine grid column span
                        var colSpan = 'col-span-1';
                        if (field.width) {
                            var widthStr = String(field.width);
                            if (widthStr.includes('%')) {
                                var percent = parseInt(widthStr);
                                if (percent >= 50)
                                    colSpan = 'md:col-span-2';
                            }
                        }
                        return (react_1["default"].createElement("div", { key: String(field.name), className: colSpan },
                            react_1["default"].createElement(FormFieldComponent, { field: field })));
                    }))));
            })),
            react_1["default"].createElement("div", { className: "flex items-center justify-between pt-4 border-t" },
                react_1["default"].createElement("button", { type: "button", onClick: goToPreviousTab, disabled: currentTabIndex === 0, className: "px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-input rounded-md hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors" }, "Previous"),
                currentTabIndex < sortedSections.length - 1 ? (react_1["default"].createElement("button", { type: "button", onClick: goToNextTab, className: "px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors" }, "Next")) : (react_1["default"].createElement("button", { type: "submit", className: "px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors" }, submitText)))));
    };
    /**
     * Wizard Layout
     */
    var WizardLayout = function () {
        if (!steps)
            return null;
        var sortedSteps = utils_1.sortSteps(steps);
        var groupedFields = utils_1.groupFieldsBySteps(fields, sortedSteps);
        var currentStepIndex = state.currentStep || 0;
        var currentStepData = sortedSteps[currentStepIndex];
        var stepFields = groupedFields.get(currentStepData.id) || [];
        var goToNextStep = function () { return __awaiter(_this, void 0, void 0, function () {
            var stepErrors, customErrors, allErrors;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.validateForm(state.values, stepFields)];
                    case 1:
                        stepErrors = _a.sent();
                        customErrors = {};
                        if (!currentStepData.validate) return [3 /*break*/, 3];
                        return [4 /*yield*/, currentStepData.validate(state.values)];
                    case 2:
                        customErrors = _a.sent();
                        _a.label = 3;
                    case 3:
                        allErrors = __assign(__assign({}, stepErrors), customErrors);
                        if (utils_1.hasErrors(allErrors)) {
                            setState(function (prev) { return (__assign(__assign({}, prev), { errors: __assign(__assign({}, prev.errors), allErrors) })); });
                            return [2 /*return*/];
                        }
                        if (currentStepIndex < sortedSteps.length - 1) {
                            setState(function (prev) { return (__assign(__assign({}, prev), { currentStep: currentStepIndex + 1 })); });
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        var goToPreviousStep = function () {
            if (currentStepIndex > 0) {
                setState(function (prev) { return (__assign(__assign({}, prev), { currentStep: currentStepIndex - 1 })); });
            }
        };
        return (react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "relative" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between overflow-x-auto pb-2" }, sortedSteps.map(function (step, index) { return (react_1["default"].createElement("div", { key: step.id, className: "flex items-center flex-1 min-w-0" },
                    react_1["default"].createElement("div", { className: "flex flex-col items-center flex-1 " + (index > 0 ? 'ml-2' : '') },
                        react_1["default"].createElement("div", { className: "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all " + (index === currentStepIndex
                                ? 'border-primary bg-primary text-primary-foreground'
                                : index < currentStepIndex
                                    ? 'border-primary bg-primary/20 text-primary'
                                    : 'border-muted-foreground/30 bg-background text-muted-foreground') },
                            react_1["default"].createElement("span", { className: "text-sm font-semibold" }, index + 1)),
                        react_1["default"].createElement("span", { className: "mt-2 text-xs sm:text-sm font-medium text-center line-clamp-2 " + (index === currentStepIndex ? 'text-primary' : 'text-muted-foreground') }, step.label)),
                    index < sortedSteps.length - 1 && (react_1["default"].createElement("div", { className: "flex-1 h-0.5 mx-1 sm:mx-2 " + (index < currentStepIndex ? 'bg-primary' : 'bg-muted-foreground/30') })))); }))),
            react_1["default"].createElement("div", { className: "min-h-[300px]" },
                react_1["default"].createElement("div", { className: "mb-4" },
                    react_1["default"].createElement("h3", { className: "text-lg font-semibold text-foreground" }, currentStepData.label),
                    currentStepData.description && (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground mt-1" }, currentStepData.description))),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, stepFields.map(function (field) {
                    // Parse width to determine grid column span
                    var colSpan = 'col-span-1';
                    if (field.width) {
                        var widthStr = String(field.width);
                        if (widthStr.includes('%')) {
                            var percent = parseInt(widthStr);
                            if (percent >= 50)
                                colSpan = 'md:col-span-2';
                        }
                    }
                    return (react_1["default"].createElement("div", { key: String(field.name), className: colSpan },
                        react_1["default"].createElement(FormFieldComponent, { field: field })));
                }))),
            react_1["default"].createElement("div", { className: "flex items-center justify-between pt-4 border-t" },
                react_1["default"].createElement("button", { type: "button", onClick: goToPreviousStep, disabled: currentStepIndex === 0, className: "px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-input rounded-md hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors" }, "Previous"),
                currentStepIndex < sortedSteps.length - 1 ? (react_1["default"].createElement("button", { type: "button", onClick: goToNextStep, className: "px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors" }, "Next")) : (react_1["default"].createElement("button", { type: "submit", className: "px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors" }, submitText)))));
    };
    /**
     * Form Field Component
     */
    var FormFieldComponent = react_1["default"].memo(function (_a) {
        var field = _a.field;
        var fieldName = String(field.name);
        var value = state.values[field.name];
        var error = state.errors[fieldName];
        var touched = state.touched.has(fieldName);
        var fieldDisabled = disabled || loading || state.submitting || utils_1.isFieldDisabled(field, state.values);
        var fieldProps = react_1.useMemo(function () { return ({
            field: __assign(__assign({}, field), { name: fieldName }),
            value: value,
            error: error,
            touched: touched,
            onChange: function (newValue) { return setFieldValue(fieldName, newValue); },
            onBlur: function () { return setFieldTouched(fieldName); },
            disabled: fieldDisabled,
            mode: mode,
            validateOnChange: validateOnChange,
            formValues: state.values
        }); }, [field, value, error, touched, fieldDisabled, fieldName]);
        // Custom renderer
        if (field.render) {
            return react_1["default"].createElement(react_1["default"].Fragment, null, field.render(fieldProps));
        }
        // View mode
        if (mode === 'view') {
            return (react_1["default"].createElement("div", { className: "form-field view-mode" },
                react_1["default"].createElement("label", null, field.label),
                react_1["default"].createElement("div", { className: "field-value" }, utils_1.formatFieldValue(value, field))));
        }
        // Cast to a permissive generic to avoid incompatible 'field.name' key-type mismatch between generics
        return react_1["default"].createElement(DefaultFieldRenderer, __assign({}, fieldProps));
    });
    FormFieldComponent.displayName = 'FormFieldComponent';
    /**
     * Render
     */
    var isSubmitDisabled = disabled || loading || state.submitting;
    return (react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6 " + className, noValidate: true },
        state.submitError && (react_1["default"].createElement("div", { className: "bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md", role: "alert" },
            react_1["default"].createElement("p", { className: "text-sm font-medium" }, state.submitError))),
        renderLayout(),
        layout !== 'tabs' && (react_1["default"].createElement("div", { className: "flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t" },
            showCancel && (react_1["default"].createElement("button", { type: "button", onClick: onCancel, disabled: state.submitting, className: "w-full sm:w-auto px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-input rounded-md hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors" }, cancelText)),
            showReset && (react_1["default"].createElement("button", { type: "button", onClick: handleReset, disabled: state.submitting, className: "w-full sm:w-auto px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-input rounded-md hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors" }, "Reset")),
            react_1["default"].createElement("button", { type: "submit", disabled: isSubmitDisabled, className: "w-full sm:w-auto px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2" },
                state.submitting && (react_1["default"].createElement("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" })),
                state.submitting ? 'Submitting...' : submitText)))));
}
exports.EntityForm = EntityForm;
/**
 * Default Field Renderer
 */
var DefaultFieldRenderer = react_1["default"].memo(function (_a) {
    var field = _a.field, value = _a.value, error = _a.error, touched = _a.touched, onChange = _a.onChange, onBlur = _a.onBlur, disabled = _a.disabled, validateOnChange = _a.validateOnChange, formValues = _a.formValues;
    var _b = react_1.useState([]), options = _b[0], setOptions = _b[1];
    react_1.useEffect(function () {
        if ((field.type === 'select' && !field.searchable) || field.type === 'multiselect' || field.type === 'radio') {
            utils_1.getFieldOptions(field, {}, undefined).then(setOptions);
        }
    }, [field]);
    // State for searchable select
    var isSearchableSelect = field.type === 'select' && field.searchable;
    var _c = react_1.useState(false), open = _c[0], setOpen = _c[1];
    var _d = react_1.useState(''), searchQuery = _d[0], setSearchQuery = _d[1];
    var _e = react_1.useState(''), debouncedQuery = _e[0], setDebouncedQuery = _e[1];
    var _f = react_1.useState([]), searchOptions = _f[0], setSearchOptions = _f[1];
    var loadedInitialRef = react_1.useRef(false);
    // Debounce search query for searchable select
    react_1.useEffect(function () {
        if (isSearchableSelect) {
            var timer_1 = setTimeout(function () {
                setDebouncedQuery(searchQuery);
            }, 300);
            return function () { return clearTimeout(timer_1); };
        }
    }, [isSearchableSelect, searchQuery]);
    // Load options for searchable select
    react_1.useEffect(function () {
        if (isSearchableSelect && ((open && !loadedInitialRef.current) || debouncedQuery)) {
            var loadOptions = function () { return __awaiter(void 0, void 0, void 0, function () {
                var opts, filtered, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, utils_1.getFieldOptions(field, formValues, debouncedQuery)];
                        case 1:
                            opts = _b.sent();
                            filtered = debouncedQuery
                                ? opts.filter(function (opt) {
                                    return opt.label.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
                                        String(opt.value).toLowerCase().includes(debouncedQuery.toLowerCase());
                                })
                                : opts;
                            setSearchOptions(filtered);
                            if (!loadedInitialRef.current)
                                loadedInitialRef.current = true;
                            return [3 /*break*/, 3];
                        case 2:
                            _a = _b.sent();
                            setSearchOptions([]);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); };
            loadOptions();
        }
    }, [isSearchableSelect, open, debouncedQuery, field, formValues]);
    // State for relations
    var _g = react_1.useState(false), relationOpen = _g[0], setRelationOpen = _g[1];
    var _h = react_1.useState(''), relationSearch = _h[0], setRelationSearch = _h[1];
    var _j = react_1.useState([]), relationOptions = _j[0], setRelationOptions = _j[1];
    var _k = react_1.useState(false), relationLoading = _k[0], setRelationLoading = _k[1];
    var _l = react_1.useState(null), relationError = _l[0], setRelationError = _l[1];
    var relationLoadedRef = react_1.useRef(false);
    var _m = react_1.useState(''), debouncedRelationSearch = _m[0], setDebouncedRelationSearch = _m[1];
    // State for multi relations
    var _o = react_1.useState(false), multiRelationOpen = _o[0], setMultiRelationOpen = _o[1];
    var _p = react_1.useState(''), multiRelationSearch = _p[0], setMultiRelationSearch = _p[1];
    var _q = react_1.useState([]), multiRelationOptions = _q[0], setMultiRelationOptions = _q[1];
    var _r = react_1.useState(false), multiRelationLoading = _r[0], setMultiRelationLoading = _r[1];
    var _s = react_1.useState(null), multiRelationError = _s[0], setMultiRelationError = _s[1];
    var multiRelationLoadedRef = react_1.useRef(false);
    var _t = react_1.useState(''), debouncedMultiRelationSearch = _t[0], setDebouncedMultiRelationSearch = _t[1];
    // Local selected ids for multirelation to allow optimistic UI updates
    var _u = react_1.useState(function () {
        if (Array.isArray(value))
            return value.map(function (v) { return String(v); });
        if (typeof value === 'string')
            return value.includes(',') ? value.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : (value ? [value] : []);
        if (value === null || value === undefined)
            return [];
        return [String(value)];
    }), localSelectedIds = _u[0], setLocalSelectedIds = _u[1];
    var _v = react_1.useState(false), viewModalOpen = _v[0], setViewModalOpen = _v[1];
    var _w = react_1.useState([]), modalItems = _w[0], setModalItems = _w[1];
    var _x = react_1.useState(false), modalLoading = _x[0], setModalLoading = _x[1];
    // Debounce for relation search
    react_1.useEffect(function () {
        if (field.type === 'relation') {
            var timer_2 = setTimeout(function () {
                setDebouncedRelationSearch(relationSearch);
            }, 300);
            return function () { return clearTimeout(timer_2); };
        }
    }, [field.type, relationSearch]);
    // Debounce for multi relation search
    react_1.useEffect(function () {
        if (field.type === 'multirelation') {
            var timer_3 = setTimeout(function () {
                setDebouncedMultiRelationSearch(multiRelationSearch);
            }, 300);
            return function () { return clearTimeout(timer_3); };
        }
    }, [field.type, multiRelationSearch]);
    // Load initial options for relation if value exists
    react_1.useEffect(function () {
        if (field.type === 'relation' && field.relationConfig && value && !relationLoadedRef.current) {
            var loadInitialOptions = function () { return __awaiter(void 0, void 0, void 0, function () {
                var cfg_1, entities, opts, selectedId_1, found, single, bySearch, e_1, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setRelationLoading(true);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 8, 9, 10]);
                            cfg_1 = field.relationConfig;
                            return [4 /*yield*/, cfg_1.fetchOptions('')];
                        case 2:
                            entities = _a.sent();
                            opts = entities;
                            selectedId_1 = String(value);
                            found = opts.some(function (ent) { return String(ent[cfg_1.valueField]) === selectedId_1; });
                            if (!!found) return [3 /*break*/, 7];
                            if (!cfg_1.fetchById) return [3 /*break*/, 4];
                            return [4 /*yield*/, cfg_1.fetchById(selectedId_1)];
                        case 3:
                            single = _a.sent();
                            if (single)
                                opts = __spreadArrays([single], opts);
                            return [3 /*break*/, 7];
                        case 4:
                            _a.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, cfg_1.fetchOptions(selectedId_1)];
                        case 5:
                            bySearch = _a.sent();
                            if (Array.isArray(bySearch) && bySearch.length > 0) {
                                opts = __spreadArrays(bySearch, opts);
                            }
                            return [3 /*break*/, 7];
                        case 6:
                            e_1 = _a.sent();
                            return [3 /*break*/, 7];
                        case 7:
                            setRelationOptions(opts);
                            relationLoadedRef.current = true;
                            return [3 /*break*/, 10];
                        case 8:
                            err_1 = _a.sent();
                            setRelationError(err_1 instanceof Error ? err_1.message : 'Failed to load options');
                            return [3 /*break*/, 10];
                        case 9:
                            setRelationLoading(false);
                            return [7 /*endfinally*/];
                        case 10: return [2 /*return*/];
                    }
                });
            }); };
            loadInitialOptions();
        }
    }, [field, field.relationConfig, value]);
    // Load relation options when open or search changes
    react_1.useEffect(function () {
        if (field.type === 'relation' && field.relationConfig && ((relationOpen && !relationLoadedRef.current) || debouncedRelationSearch)) {
            var loadRelationOptions = function () { return __awaiter(void 0, void 0, void 0, function () {
                var cfg, entities, err_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setRelationLoading(true);
                            setRelationError(null);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, 4, 5]);
                            cfg = field.relationConfig;
                            return [4 /*yield*/, cfg.fetchOptions(debouncedRelationSearch)];
                        case 2:
                            entities = _a.sent();
                            setRelationOptions(entities);
                            if (!relationLoadedRef.current)
                                relationLoadedRef.current = true;
                            return [3 /*break*/, 5];
                        case 3:
                            err_2 = _a.sent();
                            setRelationError(err_2 instanceof Error ? err_2.message : 'Failed to load options');
                            setRelationOptions([]);
                            return [3 /*break*/, 5];
                        case 4:
                            setRelationLoading(false);
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            }); };
            loadRelationOptions();
        }
    }, [field, relationOpen, debouncedRelationSearch]);
    // Load multi relation options
    react_1.useEffect(function () {
        if (field.type === 'multirelation' && field.relationConfig && ((multiRelationOpen && !multiRelationLoadedRef.current) || debouncedMultiRelationSearch)) {
            var loadMultiRelationOptions = function () { return __awaiter(void 0, void 0, void 0, function () {
                var cfg_2, entities, opts_1, selectedIds, missing, fetched, e_2, fetched, _i, missing_1, id, single, e_3, _a, missing_2, id, bySearch, e_4, err_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            setMultiRelationLoading(true);
                            setMultiRelationError(null);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 22, 23, 24]);
                            cfg_2 = field.relationConfig;
                            return [4 /*yield*/, cfg_2.fetchOptions(debouncedMultiRelationSearch)];
                        case 2:
                            entities = _b.sent();
                            opts_1 = entities;
                            selectedIds = localSelectedIds;
                            missing = selectedIds.filter(function (id) { return !opts_1.some(function (ent) { return String(ent[cfg_2.valueField]) === String(id); }); });
                            if (!(missing.length > 0)) return [3 /*break*/, 21];
                            if (!cfg_2.fetchByIds) return [3 /*break*/, 7];
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, cfg_2.fetchByIds(missing)];
                        case 4:
                            fetched = _b.sent();
                            opts_1 = __spreadArrays(fetched, opts_1);
                            return [3 /*break*/, 6];
                        case 5:
                            e_2 = _b.sent();
                            return [3 /*break*/, 6];
                        case 6: return [3 /*break*/, 21];
                        case 7:
                            if (!cfg_2.fetchById) return [3 /*break*/, 15];
                            _b.label = 8;
                        case 8:
                            _b.trys.push([8, 13, , 14]);
                            fetched = [];
                            _i = 0, missing_1 = missing;
                            _b.label = 9;
                        case 9:
                            if (!(_i < missing_1.length)) return [3 /*break*/, 12];
                            id = missing_1[_i];
                            return [4 /*yield*/, cfg_2.fetchById(String(id))];
                        case 10:
                            single = _b.sent();
                            if (single)
                                fetched.push(single);
                            _b.label = 11;
                        case 11:
                            _i++;
                            return [3 /*break*/, 9];
                        case 12:
                            if (fetched.length > 0)
                                opts_1 = __spreadArrays(fetched, opts_1);
                            return [3 /*break*/, 14];
                        case 13:
                            e_3 = _b.sent();
                            return [3 /*break*/, 14];
                        case 14: return [3 /*break*/, 21];
                        case 15:
                            _b.trys.push([15, 20, , 21]);
                            _a = 0, missing_2 = missing;
                            _b.label = 16;
                        case 16:
                            if (!(_a < missing_2.length)) return [3 /*break*/, 19];
                            id = missing_2[_a];
                            return [4 /*yield*/, cfg_2.fetchOptions(String(id))];
                        case 17:
                            bySearch = _b.sent();
                            if (Array.isArray(bySearch) && bySearch.length > 0) {
                                opts_1 = __spreadArrays(bySearch, opts_1);
                            }
                            _b.label = 18;
                        case 18:
                            _a++;
                            return [3 /*break*/, 16];
                        case 19: return [3 /*break*/, 21];
                        case 20:
                            e_4 = _b.sent();
                            return [3 /*break*/, 21];
                        case 21:
                            setMultiRelationOptions(opts_1);
                            if (!multiRelationLoadedRef.current)
                                multiRelationLoadedRef.current = true;
                            return [3 /*break*/, 24];
                        case 22:
                            err_3 = _b.sent();
                            setMultiRelationError(err_3 instanceof Error ? err_3.message : 'Failed to load options');
                            setMultiRelationOptions([]);
                            return [3 /*break*/, 24];
                        case 23:
                            setMultiRelationLoading(false);
                            return [7 /*endfinally*/];
                        case 24: return [2 /*return*/];
                    }
                });
            }); };
            loadMultiRelationOptions();
        }
    }, [field, multiRelationOpen, debouncedMultiRelationSearch]);
    // Sync localSelectedIds when incoming value changes
    react_1.useEffect(function () {
        var normalize = function (val) {
            if (Array.isArray(val))
                return val.map(function (v) { return String(v); });
            if (typeof val === 'string')
                return val.includes(',') ? val.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : (val ? [val] : []);
            if (val === null || val === undefined)
                return [];
            return [String(val)];
        };
        setLocalSelectedIds(normalize(value));
    }, [value]);
    // Load initial options for multirelation when value contains selected ids but options not yet loaded
    react_1.useEffect(function () {
        if (field.type === 'multirelation' && field.relationConfig && localSelectedIds.length > 0 && !multiRelationLoadedRef.current) {
            var loadSelectedMultiOptions = function () { return __awaiter(void 0, void 0, void 0, function () {
                var cfg_3, opts_2, fetched, fetched, _i, localSelectedIds_1, id, single, base, _a, localSelectedIds_2, id, bySearch, newItems, e_5, err_4;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            setMultiRelationLoading(true);
                            setMultiRelationError(null);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 16, 17, 18]);
                            cfg_3 = field.relationConfig;
                            opts_2 = [];
                            if (!cfg_3.fetchByIds) return [3 /*break*/, 3];
                            return [4 /*yield*/, cfg_3.fetchByIds(localSelectedIds)];
                        case 2:
                            fetched = _b.sent();
                            opts_2 = fetched;
                            return [3 /*break*/, 15];
                        case 3:
                            if (!cfg_3.fetchById) return [3 /*break*/, 8];
                            fetched = [];
                            _i = 0, localSelectedIds_1 = localSelectedIds;
                            _b.label = 4;
                        case 4:
                            if (!(_i < localSelectedIds_1.length)) return [3 /*break*/, 7];
                            id = localSelectedIds_1[_i];
                            return [4 /*yield*/, cfg_3.fetchById(String(id))];
                        case 5:
                            single = _b.sent();
                            if (single)
                                fetched.push(single);
                            _b.label = 6;
                        case 6:
                            _i++;
                            return [3 /*break*/, 4];
                        case 7:
                            opts_2 = fetched;
                            return [3 /*break*/, 15];
                        case 8: return [4 /*yield*/, cfg_3.fetchOptions('')];
                        case 9:
                            base = _b.sent();
                            opts_2 = base;
                            _a = 0, localSelectedIds_2 = localSelectedIds;
                            _b.label = 10;
                        case 10:
                            if (!(_a < localSelectedIds_2.length)) return [3 /*break*/, 15];
                            id = localSelectedIds_2[_a];
                            _b.label = 11;
                        case 11:
                            _b.trys.push([11, 13, , 14]);
                            return [4 /*yield*/, cfg_3.fetchOptions(String(id))];
                        case 12:
                            bySearch = _b.sent();
                            if (Array.isArray(bySearch) && bySearch.length > 0) {
                                newItems = bySearch.filter(function (item) { return !opts_2.some(function (existing) { return String(existing[cfg_3.valueField]) === String(item[cfg_3.valueField]); }); });
                                if (newItems.length > 0) {
                                    opts_2 = __spreadArrays(newItems, opts_2);
                                }
                            }
                            return [3 /*break*/, 14];
                        case 13:
                            e_5 = _b.sent();
                            return [3 /*break*/, 14];
                        case 14:
                            _a++;
                            return [3 /*break*/, 10];
                        case 15:
                            setMultiRelationOptions(opts_2);
                            multiRelationLoadedRef.current = true;
                            return [3 /*break*/, 18];
                        case 16:
                            err_4 = _b.sent();
                            setMultiRelationError(err_4 instanceof Error ? err_4.message : 'Failed to load options');
                            return [3 /*break*/, 18];
                        case 17:
                            setMultiRelationLoading(false);
                            return [7 /*endfinally*/];
                        case 18: return [2 /*return*/];
                    }
                });
            }); };
            loadSelectedMultiOptions();
        }
    }, [field, field.relationConfig, localSelectedIds]);
    // Show errors immediately if validateOnChange is true, otherwise wait for touch
    var showError = validateOnChange ? !!error : (touched && !!error);
    var errorId = String(field.name) + "-error";
    var commonProps = {
        id: String(field.name),
        name: String(field.name),
        disabled: disabled,
        required: utils_1.isFieldRequired(field, formValues),
        'aria-invalid': showError ? 'true' : undefined,
        'aria-describedby': showError ? errorId : undefined,
        autoComplete: field.type === 'email' ? 'email' : field.type === 'password' ? 'current-password' : 'off'
    };
    var renderInput = function () {
        var inputClasses = "w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed";
        var errorClasses = showError ? "border-destructive focus:ring-destructive" : "";
        // Format date values for input fields
        var getDateValue = function (val) {
            if (!val)
                return '';
            if (typeof val === 'string') {
                try {
                    // Convert ISO string to YYYY-MM-DD format for date input
                    var date = new Date(val);
                    return date.toISOString().slice(0, 10);
                }
                catch (_a) {
                    return String(val);
                }
            }
            if (val instanceof Date) {
                return val.toISOString().slice(0, 10);
            }
            return String(val);
        };
        var getDateTimeValue = function (val) {
            if (!val)
                return '';
            if (typeof val === 'string') {
                try {
                    // Convert ISO string to datetime-local format
                    var date = new Date(val);
                    return date.toISOString().slice(0, 16);
                }
                catch (_a) {
                    return String(val);
                }
            }
            if (val instanceof Date) {
                return val.toISOString().slice(0, 16);
            }
            return String(val);
        };
        switch (field.type) {
            case 'textarea':
                return (react_1["default"].createElement("textarea", __assign({ defaultValue: String(value || ''), onBlur: function (e) {
                        onChange(e.target.value);
                        onBlur();
                    }, placeholder: field.placeholder, rows: field.rows || 3, className: inputClasses + " " + errorClasses }, commonProps)));
            case 'select':
                if (field.searchable) {
                    // Searchable combobox
                    var selectedOption = searchOptions.find(function (opt) { return String(opt.value) === String(value); });
                    return (react_1["default"].createElement(popover_1.Popover, { open: open, onOpenChange: setOpen },
                        react_1["default"].createElement(popover_1.PopoverTrigger, { asChild: true },
                            react_1["default"].createElement(button_1.Button, { variant: "outline", role: "combobox", className: inputClasses + " " + errorClasses + " justify-between", disabled: disabled },
                                selectedOption ? selectedOption.label : "Select...",
                                react_1["default"].createElement(lucide_react_1.ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" }))),
                        react_1["default"].createElement(popover_1.PopoverContent, { className: "w-[--radix-popover-trigger-width] p-0" },
                            react_1["default"].createElement(command_1.Command, null,
                                react_1["default"].createElement(command_1.CommandInput, { placeholder: "Search...", value: searchQuery, onValueChange: setSearchQuery }),
                                react_1["default"].createElement(command_1.CommandList, null,
                                    react_1["default"].createElement(command_1.CommandEmpty, null, "No results found."),
                                    react_1["default"].createElement(command_1.CommandGroup, null, searchOptions.map(function (option) { return (react_1["default"].createElement(command_1.CommandItem, { key: String(option.value), value: String(option.value), onSelect: function () {
                                            onChange(option.value);
                                            setOpen(false);
                                            setSearchQuery('');
                                        } },
                                        react_1["default"].createElement(lucide_react_1.Check, { className: "mr-2 h-4 w-4 " + (String(value) === String(option.value) ? "opacity-100" : "opacity-0") }),
                                        option.label)); })))))));
                }
                else {
                    // Regular select
                    return (react_1["default"].createElement("select", __assign({ value: String(value || ''), onChange: function (e) { return onChange(e.target.value); }, onBlur: onBlur, className: inputClasses + " " + errorClasses }, commonProps),
                        react_1["default"].createElement("option", { value: "" }, "Select..."),
                        options.map(function (opt) { return (react_1["default"].createElement("option", { key: String(opt.value), value: String(opt.value), disabled: opt.disabled }, opt.label)); })));
                }
            case 'checkbox':
            case 'switch':
                return (react_1["default"].createElement("input", __assign({ type: "checkbox", checked: Boolean(value), onChange: function (e) { return onChange(e.target.checked); }, className: "w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed" }, commonProps)));
            case 'file':
            case 'image':
                return (react_1["default"].createElement(FileUpload_1.FileUpload, { value: value, onChange: function (file) { return onChange(file); }, onBlur: onBlur, accept: field.accept, multiple: field.multiple, disabled: disabled, maxSize: field.maxSize, showPreview: field.type === 'image', error: touched && error ? error : undefined, helpText: field.helpText }));
            case 'date':
                return (react_1["default"].createElement("input", __assign({ type: "date", value: getDateValue(value), onChange: function (e) { return onChange(e.target.value); }, placeholder: field.placeholder, className: inputClasses + " " + errorClasses }, commonProps)));
            case 'datetime':
                return (react_1["default"].createElement("input", __assign({ type: "datetime-local", value: getDateTimeValue(value), onChange: function (e) { return onChange(e.target.value); }, placeholder: field.placeholder, className: inputClasses + " " + errorClasses }, commonProps)));
            case 'time':
                return (react_1["default"].createElement("input", __assign({ type: "time", value: String(value || ''), onChange: function (e) { return onChange(e.target.value); }, placeholder: field.placeholder, className: inputClasses + " " + errorClasses }, commonProps)));
            case 'relation': {
                // Single relation field - select one related entity
                if (!field.relationConfig) {
                    return react_1["default"].createElement("div", { className: "text-destructive text-sm" }, "Relation config is required");
                }
                var relationConfig_1 = field.relationConfig;
                // Find selected option
                var selectedEntity = relationOptions.find(function (entity) { return String(entity[relationConfig_1.valueField]) === String(value); });
                return (react_1["default"].createElement(popover_1.Popover, { open: relationOpen, onOpenChange: setRelationOpen },
                    react_1["default"].createElement(popover_1.PopoverTrigger, { asChild: true },
                        react_1["default"].createElement(button_1.Button, { variant: "outline", role: "combobox", className: inputClasses + " " + errorClasses + " justify-between", disabled: disabled },
                            selectedEntity
                                ? String(selectedEntity[relationConfig_1.displayField])
                                : field.placeholder || "Select...",
                            react_1["default"].createElement(lucide_react_1.ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" }))),
                    react_1["default"].createElement(popover_1.PopoverContent, { className: "w-[--radix-popover-trigger-width] p-0" },
                        react_1["default"].createElement(command_1.Command, null,
                            react_1["default"].createElement(command_1.CommandInput, { placeholder: "Search " + relationConfig_1.entity + "...", value: relationSearch, onValueChange: setRelationSearch }),
                            react_1["default"].createElement(command_1.CommandList, null,
                                relationLoading && (react_1["default"].createElement("div", { className: "py-6 text-center text-sm text-muted-foreground" }, "Loading...")),
                                relationError && (react_1["default"].createElement("div", { className: "py-6 text-center text-sm text-destructive" }, relationError)),
                                !relationLoading && !relationError && relationOptions.length === 0 && (react_1["default"].createElement(command_1.CommandEmpty, null, "No results found.")),
                                !relationLoading && !relationError && relationOptions.length > 0 && (react_1["default"].createElement(command_1.CommandGroup, null, relationOptions.map(function (entity) {
                                    var entityValue = String(entity[relationConfig_1.valueField]);
                                    var entityLabel = String(entity[relationConfig_1.displayField]);
                                    return (react_1["default"].createElement(command_1.CommandItem, { key: entityValue, value: entityValue, onSelect: function () {
                                            onChange(entity[relationConfig_1.valueField]);
                                            setRelationOpen(false);
                                            setRelationSearch('');
                                        } },
                                        react_1["default"].createElement(lucide_react_1.Check, { className: "mr-2 h-4 w-4 " + (String(value) === entityValue ? "opacity-100" : "opacity-0") }),
                                        entityLabel));
                                }))))))));
            }
            case 'multirelation': {
                // Multi-relation field - select multiple related entities
                if (!field.relationConfig) {
                    return react_1["default"].createElement("div", { className: "text-destructive text-sm" }, "Relation config is required");
                }
                var relationConfig_2 = field.relationConfig;
                // Normalize incoming value to array of string ids (localSelectedIds) is used for immediate UI updates
                var selectedIds_1 = localSelectedIds;
                // Find selected entities from loaded options (will show detailed chips for any that are already loaded)
                var selectedEntities = multiRelationOptions.filter(function (entity) {
                    return selectedIds_1.includes(String(entity[relationConfig_2.valueField]));
                });
                // Helper to emit change to parent (as string[])
                var emitChange_1 = function (ids) {
                    onChange(ids);
                };
                // Handle selection toggle (optimistic update)
                var toggleSelection_1 = function (entityValue) {
                    var valStr = String(entityValue);
                    var exists = selectedIds_1.includes(valStr);
                    var newIds = exists ? selectedIds_1.filter(function (v) { return v !== valStr; }) : __spreadArrays(selectedIds_1, [valStr]);
                    // Check max selections
                    if (relationConfig_2.maxSelections && newIds.length > relationConfig_2.maxSelections) {
                        return;
                    }
                    // Update local state immediately for instant UI feedback
                    setLocalSelectedIds(newIds);
                    emitChange_1(newIds);
                };
                // Handle remove (optimistic)
                var removeSelection_1 = function (entityValue) {
                    var valStr = String(entityValue);
                    var newIds = selectedIds_1.filter(function (v) { return v !== valStr; });
                    setLocalSelectedIds(newIds);
                    emitChange_1(newIds);
                };
                return (react_1["default"].createElement("div", { className: "space-y-2" },
                    localSelectedIds.length > 0 && (localSelectedIds.length > 10 ? (react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                        react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" },
                            localSelectedIds.length,
                            " ",
                            field.label),
                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                var cfg, items, err_5;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            setViewModalOpen(true);
                                            setModalLoading(true);
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, 4, 5]);
                                            cfg = relationConfig_2;
                                            return [4 /*yield*/, cfg.fetchOptions('')];
                                        case 2:
                                            items = _a.sent();
                                            setModalItems(items);
                                            return [3 /*break*/, 5];
                                        case 3:
                                            err_5 = _a.sent();
                                            setModalItems([]);
                                            return [3 /*break*/, 5];
                                        case 4:
                                            setModalLoading(false);
                                            return [7 /*endfinally*/];
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            }); } }, "View"))) : (react_1["default"].createElement("div", { className: "flex flex-wrap gap-1.5" }, selectedEntities.map(function (entity) {
                        var entityValue = entity[relationConfig_2.valueField];
                        var entityLabel = String(entity[relationConfig_2.displayField]);
                        return (react_1["default"].createElement("span", { key: String(entityValue), className: "inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md" },
                            entityLabel,
                            react_1["default"].createElement("button", { type: "button", onClick: function () { return removeSelection_1(entityValue); }, disabled: disabled, className: "hover:text-destructive disabled:opacity-50" }, "\u00D7")));
                    })))),
                    react_1["default"].createElement(popover_1.Popover, { open: multiRelationOpen, onOpenChange: setMultiRelationOpen },
                        react_1["default"].createElement(popover_1.PopoverTrigger, { asChild: true },
                            react_1["default"].createElement(button_1.Button, { variant: "outline", role: "combobox", className: inputClasses + " " + errorClasses + " justify-between", disabled: disabled || (relationConfig_2.maxSelections ? localSelectedIds.length >= relationConfig_2.maxSelections : false) },
                                field.placeholder || "Select...",
                                react_1["default"].createElement(lucide_react_1.ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" }))),
                        react_1["default"].createElement(popover_1.PopoverContent, { className: "w-[--radix-popover-trigger-width] p-0" },
                            react_1["default"].createElement(command_1.Command, null,
                                react_1["default"].createElement(command_1.CommandInput, { placeholder: "Search " + relationConfig_2.entity + "...", value: multiRelationSearch, onValueChange: setMultiRelationSearch }),
                                react_1["default"].createElement(command_1.CommandList, null,
                                    multiRelationLoading && (react_1["default"].createElement("div", { className: "py-6 text-center text-sm text-muted-foreground" }, "Loading...")),
                                    multiRelationError && (react_1["default"].createElement("div", { className: "py-6 text-center text-sm text-destructive" }, multiRelationError)),
                                    !multiRelationLoading && !multiRelationError && multiRelationOptions.length === 0 && (react_1["default"].createElement(command_1.CommandEmpty, null, "No results found.")),
                                    !multiRelationLoading && !multiRelationError && multiRelationOptions.length > 0 && (react_1["default"].createElement(command_1.CommandGroup, null, multiRelationOptions
                                        .filter(function (entity) { return !localSelectedIds.includes(String(entity[relationConfig_2.valueField])); })
                                        .map(function (entity) {
                                        var entityValue = entity[relationConfig_2.valueField];
                                        var entityLabel = String(entity[relationConfig_2.displayField]);
                                        return (react_1["default"].createElement(command_1.CommandItem, { key: String(entityValue), value: String(entityValue), onSelect: function () { return toggleSelection_1(entityValue); } },
                                            react_1["default"].createElement(lucide_react_1.Check, { className: "mr-2 h-4 w-4 opacity-0" }),
                                            entityLabel));
                                    }))))))),
                    relationConfig_2.maxSelections && (react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                        localSelectedIds.length,
                        " / ",
                        relationConfig_2.maxSelections,
                        " selected")),
                    viewModalOpen && (react_1["default"].createElement("div", { className: "fixed inset-0 z-50 flex items-start justify-center p-6" },
                        react_1["default"].createElement("div", { className: "fixed inset-0 bg-black/40", onClick: function () { return setViewModalOpen(false); } }),
                        react_1["default"].createElement("div", { className: "relative bg-background rounded-md shadow-lg max-w-3xl w-full max-h-[80vh] overflow-auto p-4 z-10" },
                            react_1["default"].createElement("div", { className: "flex items-center justify-between mb-3" },
                                react_1["default"].createElement("h3", { className: "text-lg font-medium" }, field.label),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setViewModalOpen(false); } }, "Close"))),
                            modalLoading ? (react_1["default"].createElement("div", { className: "py-6 text-center text-sm text-muted-foreground" }, "Loading...")) : (react_1["default"].createElement("div", { className: "space-y-2" },
                                modalItems.length === 0 && (react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "No items available")),
                                modalItems.map(function (it) { return (react_1["default"].createElement("div", { key: String(it[relationConfig_2.valueField]), className: "py-2 border-b last:border-b-0" },
                                    react_1["default"].createElement("div", { className: "text-sm" }, String(it[relationConfig_2.displayField])),
                                    react_1["default"].createElement("div", { className: "text-xs text-muted-foreground" },
                                        "ID: ",
                                        String(it[relationConfig_2.valueField])))); }))))))));
            }
            default:
                return (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement("input", __assign({ type: field.type, defaultValue: String(value || ''), onBlur: function (e) {
                            onChange(e.target.value);
                            onBlur();
                        }, placeholder: field.placeholder, min: field.min, max: field.max, step: field.step, className: inputClasses + " " + errorClasses }, commonProps)),
                    field.type === 'password' && (react_1["default"].createElement("input", { type: "text", name: "username", autoComplete: "username", style: { display: 'none' }, "aria-hidden": "true" }))));
        }
    };
    return (react_1["default"].createElement("div", { className: "space-y-1.5" },
        react_1["default"].createElement("label", { htmlFor: String(field.name), className: "block text-sm font-medium text-foreground" },
            field.label,
            utils_1.isFieldRequired(field, formValues) && react_1["default"].createElement("span", { className: "text-destructive ml-1", "aria-label": "required", title: "Required field" }, "*")),
        renderInput(),
        field.helpText && !showError && (react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, field.helpText)),
        showError && (react_1["default"].createElement("p", { className: "text-xs text-destructive flex items-center gap-1", id: errorId },
            react_1["default"].createElement("span", { "aria-hidden": "true" }, "\u26A0"),
            error))));
});
DefaultFieldRenderer.displayName = 'DefaultFieldRenderer';
exports["default"] = EntityForm;
