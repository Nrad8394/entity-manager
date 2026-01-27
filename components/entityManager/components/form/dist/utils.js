"use strict";
/**
 * EntityForm Utility Functions
 *
 * Pure functions for form operations and validation.
 */
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
exports.formatFieldValue = exports.getFieldOptions = exports.isFormDirty = exports.hasErrors = exports.transformValues = exports.sortSteps = exports.sortTabs = exports.sortSections = exports.groupFieldsBySteps = exports.groupFieldsByTabs = exports.groupFieldsBySections = exports.validateForm = exports.validateField = exports.getInitialValues = exports.sortFields = exports.getVisibleFields = exports.isFieldRequired = exports.isFieldDisabled = exports.isFieldVisible = void 0;
var utils_1 = require("../../primitives/utils");
/**
 * Check if field is visible
 */
function isFieldVisible(field, values) {
    if (field.visible === undefined)
        return true;
    if (typeof field.visible === 'boolean') {
        return field.visible;
    }
    return field.visible(values);
}
exports.isFieldVisible = isFieldVisible;
/**
 * Check if field is disabled
 */
function isFieldDisabled(field, values) {
    if (field.disabled === undefined)
        return false;
    if (typeof field.disabled === 'boolean') {
        return field.disabled;
    }
    return field.disabled(values);
}
exports.isFieldDisabled = isFieldDisabled;
/**
 * Check if field is required
 */
function isFieldRequired(field, values) {
    if (field.required === undefined)
        return false;
    if (typeof field.required === 'boolean') {
        return field.required;
    }
    return field.required(values);
}
exports.isFieldRequired = isFieldRequired;
/**
 * Get visible fields
 */
function getVisibleFields(fields, values) {
    return fields.filter(function (field) { return isFieldVisible(field, values); });
}
exports.getVisibleFields = getVisibleFields;
/**
 * Sort fields by order
 */
function sortFields(fields) {
    return __spreadArrays(fields).sort(function (a, b) {
        var _a, _b;
        var orderA = (_a = a.order) !== null && _a !== void 0 ? _a : 999;
        var orderB = (_b = b.order) !== null && _b !== void 0 ? _b : 999;
        return orderA - orderB;
    });
}
exports.sortFields = sortFields;
/**
 * Get initial form values
 */
function getInitialValues(fields, entity, initialValues) {
    var values = {};
    // Apply field defaults
    fields.forEach(function (field) {
        var fieldName = String(field.name);
        if (field.defaultValue !== undefined) {
            values[fieldName] = field.defaultValue;
        }
    });
    // Apply initial values prop
    if (initialValues) {
        Object.assign(values, initialValues);
    }
    // Apply entity values (for edit mode)
    if (entity) {
        fields.forEach(function (field) {
            var fieldName = String(field.name);
            var rawVal = entity[field.name];
            if (rawVal !== undefined) {
                // If this is a relation field and the entity provides nested objects,
                // unwrap to the configured valueField. Support both single relation
                // (object) and multirelation (array of objects).
                if ((field.type === 'relation' || field.type === 'multirelation') && field.relationConfig) {
                    try {
                        var rc_1 = field.relationConfig;
                        if (Array.isArray(rawVal)) {
                            // Map array of objects or primitives to array of id/valueField
                            values[fieldName] = rawVal.map(function (v) {
                                if (v && typeof v === 'object' && rc_1.valueField in v) {
                                    return v[rc_1.valueField];
                                }
                                return v;
                            });
                        }
                        else if (rawVal && typeof rawVal === 'object') {
                            // Single relation object -> extract valueField
                            if (rc_1.valueField in rawVal) {
                                values[fieldName] = rawVal[rc_1.valueField];
                            }
                            else {
                                // Fallback to rawVal if valueField not present
                                values[fieldName] = rawVal;
                            }
                        }
                        else {
                            // Primitive value (id) -> use as-is
                            values[fieldName] = rawVal;
                        }
                    }
                    catch (_a) {
                        values[fieldName] = rawVal;
                    }
                }
                else {
                    values[fieldName] = rawVal;
                }
            }
        });
    }
    return values;
}
exports.getInitialValues = getInitialValues;
/**
 * Validate single field
 */
function validateField(value, field, values) {
    return __awaiter(this, void 0, Promise, function () {
        var _i, _a, rule, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Check required
                    if (field.required && (value === undefined || value === null || value === '')) {
                        return [2 /*return*/, field.label + " is required"];
                    }
                    // Skip validation if empty and not required
                    if (!value && !field.required) {
                        return [2 /*return*/, undefined];
                    }
                    if (!field.validation) return [3 /*break*/, 4];
                    _i = 0, _a = field.validation;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    rule = _a[_i];
                    return [4 /*yield*/, validateRule(value, rule, values)];
                case 2:
                    error = _b.sent();
                    if (error) {
                        return [2 /*return*/, error];
                    }
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    // Type-specific validation
                    switch (field.type) {
                        case 'email':
                            if (typeof value === 'string' && !utils_1.isValidEmail(value)) {
                                return [2 /*return*/, 'Invalid email address'];
                            }
                            break;
                        case 'url':
                            if (typeof value === 'string' && !utils_1.isValidUrl(value)) {
                                return [2 /*return*/, 'Invalid URL'];
                            }
                            break;
                        case 'number':
                        case 'range':
                            if (typeof value === 'number') {
                                if (field.min !== undefined && value < field.min) {
                                    return [2 /*return*/, "Minimum value is " + field.min];
                                }
                                if (field.max !== undefined && value > field.max) {
                                    return [2 /*return*/, "Maximum value is " + field.max];
                                }
                            }
                            break;
                        case 'text':
                        case 'textarea':
                        case 'password':
                            if (typeof value === 'string') {
                                if (field.minLength !== undefined && value.length < field.minLength) {
                                    return [2 /*return*/, "Minimum length is " + field.minLength + " characters"];
                                }
                                if (field.maxLength !== undefined && value.length > field.maxLength) {
                                    return [2 /*return*/, "Maximum length is " + field.maxLength + " characters"];
                                }
                            }
                            break;
                    }
                    return [2 /*return*/, undefined];
            }
        });
    });
}
exports.validateField = validateField;
/**
 * Validate single rule
 */
function validateRule(value, rule, values) {
    return __awaiter(this, void 0, Promise, function () {
        var _a, pattern, isValid, isValid;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = rule.type;
                    switch (_a) {
                        case 'required': return [3 /*break*/, 1];
                        case 'email': return [3 /*break*/, 2];
                        case 'url': return [3 /*break*/, 3];
                        case 'minLength': return [3 /*break*/, 4];
                        case 'maxLength': return [3 /*break*/, 5];
                        case 'min': return [3 /*break*/, 6];
                        case 'max': return [3 /*break*/, 7];
                        case 'pattern': return [3 /*break*/, 8];
                        case 'custom': return [3 /*break*/, 9];
                        case 'async': return [3 /*break*/, 12];
                    }
                    return [3 /*break*/, 15];
                case 1:
                    if (!value) {
                        return [2 /*return*/, rule.message];
                    }
                    return [3 /*break*/, 15];
                case 2:
                    if (typeof value === 'string' && !utils_1.isValidEmail(value)) {
                        return [2 /*return*/, rule.message];
                    }
                    return [3 /*break*/, 15];
                case 3:
                    if (typeof value === 'string' && !utils_1.isValidUrl(value)) {
                        return [2 /*return*/, rule.message];
                    }
                    return [3 /*break*/, 15];
                case 4:
                    if (typeof value === 'string' && rule.value && value.length < Number(rule.value)) {
                        return [2 /*return*/, rule.message];
                    }
                    return [3 /*break*/, 15];
                case 5:
                    if (typeof value === 'string' && rule.value && value.length > Number(rule.value)) {
                        return [2 /*return*/, rule.message];
                    }
                    return [3 /*break*/, 15];
                case 6:
                    if (typeof value === 'number' && rule.value && value < Number(rule.value)) {
                        return [2 /*return*/, rule.message];
                    }
                    return [3 /*break*/, 15];
                case 7:
                    if (typeof value === 'number' && rule.value && value > Number(rule.value)) {
                        return [2 /*return*/, rule.message];
                    }
                    return [3 /*break*/, 15];
                case 8:
                    if (typeof value === 'string' && rule.value) {
                        pattern = rule.value instanceof RegExp ? rule.value : new RegExp(String(rule.value));
                        if (!pattern.test(value)) {
                            return [2 /*return*/, rule.message];
                        }
                    }
                    return [3 /*break*/, 15];
                case 9:
                    if (!rule.validator) return [3 /*break*/, 11];
                    return [4 /*yield*/, rule.validator(value, values)];
                case 10:
                    isValid = _b.sent();
                    if (!isValid) {
                        return [2 /*return*/, rule.message];
                    }
                    _b.label = 11;
                case 11: return [3 /*break*/, 15];
                case 12:
                    if (!rule.validator) return [3 /*break*/, 14];
                    return [4 /*yield*/, rule.validator(value, values)];
                case 13:
                    isValid = _b.sent();
                    if (!isValid) {
                        return [2 /*return*/, rule.message];
                    }
                    _b.label = 14;
                case 14: return [3 /*break*/, 15];
                case 15: return [2 /*return*/, undefined];
            }
        });
    });
}
/**
 * Validate all fields
 */
function validateForm(values, fields) {
    return __awaiter(this, void 0, Promise, function () {
        var errors, _i, fields_1, field, fieldName, value, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    errors = {};
                    _i = 0, fields_1 = fields;
                    _a.label = 1;
                case 1:
                    if (!(_i < fields_1.length)) return [3 /*break*/, 4];
                    field = fields_1[_i];
                    if (!isFieldVisible(field, values))
                        return [3 /*break*/, 3];
                    fieldName = String(field.name);
                    value = values[field.name];
                    return [4 /*yield*/, validateField(value, field, values)];
                case 2:
                    error = _a.sent();
                    if (error) {
                        errors[fieldName] = error;
                    }
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, errors];
            }
        });
    });
}
exports.validateForm = validateForm;
/**
 * Group fields by section
 */
function groupFieldsBySections(fields, sections) {
    var grouped = new Map();
    if (!sections || sections.length === 0) {
        grouped.set(null, fields);
        return grouped;
    }
    // Initialize sections
    sections.forEach(function (section) {
        grouped.set(section.id, []);
    });
    // Add ungrouped fields
    grouped.set(null, []);
    // Assign fields to sections
    fields.forEach(function (field) {
        var sectionId = field.group || null;
        var sectionFields = grouped.get(sectionId) || [];
        sectionFields.push(field);
        grouped.set(sectionId, sectionFields);
    });
    return grouped;
}
exports.groupFieldsBySections = groupFieldsBySections;
/**
 * Group fields by tabs
 */
function groupFieldsByTabs(fields, tabs) {
    var grouped = new Map();
    tabs.forEach(function (tab) {
        var tabFields = fields.filter(function (field) { return tab.fields.includes(String(field.name)); });
        grouped.set(tab.id, tabFields);
    });
    return grouped;
}
exports.groupFieldsByTabs = groupFieldsByTabs;
/**
 * Group fields by wizard steps
 */
function groupFieldsBySteps(fields, steps) {
    var grouped = new Map();
    steps.forEach(function (step) {
        var stepFields = fields.filter(function (field) { return step.fields.includes(String(field.name)); });
        grouped.set(step.id, stepFields);
    });
    return grouped;
}
exports.groupFieldsBySteps = groupFieldsBySteps;
/**
 * Sort sections by order
 */
function sortSections(sections) {
    return __spreadArrays(sections).sort(function (a, b) {
        var _a, _b;
        var orderA = (_a = a.order) !== null && _a !== void 0 ? _a : 999;
        var orderB = (_b = b.order) !== null && _b !== void 0 ? _b : 999;
        return orderA - orderB;
    });
}
exports.sortSections = sortSections;
/**
 * Sort tabs by order
 */
function sortTabs(tabs) {
    return __spreadArrays(tabs).sort(function (a, b) {
        var _a, _b;
        var orderA = (_a = a.order) !== null && _a !== void 0 ? _a : 999;
        var orderB = (_b = b.order) !== null && _b !== void 0 ? _b : 999;
        return orderA - orderB;
    });
}
exports.sortTabs = sortTabs;
/**
 * Sort wizard steps by order
 */
function sortSteps(steps) {
    return __spreadArrays(steps).sort(function (a, b) {
        var _a, _b;
        var orderA = (_a = a.order) !== null && _a !== void 0 ? _a : 999;
        var orderB = (_b = b.order) !== null && _b !== void 0 ? _b : 999;
        return orderA - orderB;
    });
}
exports.sortSteps = sortSteps;
/**
 * Transform form values before submit
 */
function transformValues(values, fields) {
    var transformed = __assign({}, values);
    fields.forEach(function (field) {
        var fieldName = String(field.name);
        var value = transformed[fieldName];
        if (field.transform && value !== undefined) {
            transformed[fieldName] = field.transform(value);
        }
    });
    return transformed;
}
exports.transformValues = transformValues;
/**
 * Check if form has errors
 */
function hasErrors(errors) {
    return Object.keys(errors).length > 0;
}
exports.hasErrors = hasErrors;
/**
 * Check if form is dirty
 */
function isFormDirty(values, initialValues) {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
}
exports.isFormDirty = isFormDirty;
/**
 * Get field options
 */
function getFieldOptions(field, values, query) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!field.options)
                        return [2 /*return*/, []];
                    if (!(typeof field.options === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, field.options(values, query)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [2 /*return*/, field.options];
            }
        });
    });
}
exports.getFieldOptions = getFieldOptions;
/**
 * Format field value for display
 */
function formatFieldValue(value, field) {
    if (value === null || value === undefined)
        return '';
    switch (field.type) {
        case 'date':
            if (value instanceof Date) {
                return value.toLocaleDateString();
            }
            if (typeof value === 'string' && value) {
                try {
                    return new Date(value).toLocaleDateString();
                }
                catch (_a) {
                    return value;
                }
            }
            return String(value);
        case 'datetime':
            if (value instanceof Date) {
                return value.toLocaleString();
            }
            if (typeof value === 'string' && value) {
                try {
                    return new Date(value).toLocaleString();
                }
                catch (_b) {
                    return value;
                }
            }
            return String(value);
        case 'time':
            if (value instanceof Date) {
                return value.toLocaleTimeString();
            }
            if (typeof value === 'string' && value) {
                try {
                    return new Date(value).toLocaleTimeString();
                }
                catch (_c) {
                    return value;
                }
            }
            return String(value);
        case 'checkbox':
        case 'switch':
            return value ? 'Yes' : 'No';
        case 'multiselect':
            if (Array.isArray(value)) {
                return value.join(', ');
            }
            return String(value);
        case 'relation':
            // For relation fields, the value might be an object with the display field
            // or just the ID. If it's an object, extract the display field value.
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                // Try to find a common display field
                var displayValue = value.name || value.label || value.title;
                if (displayValue)
                    return String(displayValue);
            }
            return value ? String(value) : '';
        case 'multirelation':
            // For multirelation, value should be an array
            if (Array.isArray(value)) {
                return value.map(function (item) {
                    if (item && typeof item === 'object') {
                        // Try to find a common display field
                        var displayValue = item.name || item.label || item.title;
                        if (displayValue)
                            return String(displayValue);
                    }
                    return String(item);
                }).join(', ');
            }
            return value ? String(value) : '';
        default:
            return String(value);
    }
}
exports.formatFieldValue = formatFieldValue;
