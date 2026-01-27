"use strict";
/**
 * EntityView Utility Functions
 *
 * Pure functions for view operations.
 */
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
exports.getMetadataFields = exports.getEntityImage = exports.getEntitySubtitle = exports.getEntityTitle = exports.copyToClipboard = exports.getSummaryFields = exports.sortGroups = exports.sortFields = exports.groupFields = exports.renderField = exports.formatFieldValue = exports.getFieldValue = exports.getVisibleFields = exports.isFieldVisible = void 0;
var react_1 = require("react");
var image_1 = require("next/image");
var utils_1 = require("../../primitives/utils");
/**
 * Check if field is visible
 */
function isFieldVisible(field, entity) {
    if (field.visible === undefined)
        return true;
    if (typeof field.visible === 'boolean') {
        return field.visible;
    }
    return field.visible(entity);
}
exports.isFieldVisible = isFieldVisible;
/**
 * Get visible fields
 */
function getVisibleFields(fields, entity) {
    return fields.filter(function (field) { return isFieldVisible(field, entity); });
}
exports.getVisibleFields = getVisibleFields;
/**
 * Get field value from entity
 */
function getFieldValue(entity, fieldKey) {
    return entity[fieldKey];
}
exports.getFieldValue = getFieldValue;
/**
 * Format field value based on type
 */
function formatFieldValue(value, type) {
    if (value === null || value === undefined) {
        return react_1["default"].createElement("span", { className: "null-value" }, "\u2014");
    }
    switch (type) {
        case 'date':
            if (value instanceof Date) {
                return utils_1.formatDate(value, 'YYYY-MM-DD');
            }
            if (typeof value === 'string') {
                var date = new Date(value);
                return isNaN(date.getTime()) ? value : utils_1.formatDate(date, 'YYYY-MM-DD');
            }
            return String(value);
        case 'datetime':
            if (value instanceof Date) {
                return utils_1.formatDate(value, 'YYYY-MM-DD HH:mm:ss');
            }
            if (typeof value === 'string') {
                var date = new Date(value);
                return isNaN(date.getTime()) ? value : utils_1.formatDate(date, 'YYYY-MM-DD HH:mm:ss');
            }
            return String(value);
        case 'boolean':
            return utils_1.formatBoolean(Boolean(value));
        case 'email':
            return react_1["default"].createElement("a", { href: "mailto:" + value }, String(value));
        case 'url':
            return react_1["default"].createElement("a", { href: String(value), target: "_blank", rel: "noopener noreferrer" }, String(value));
        case 'image':
            return (react_1["default"].createElement(image_1["default"], { src: String(value), alt: "Image", className: "field-image", width: 400, height: 300, style: { objectFit: 'contain', width: 'auto', height: 'auto' } }));
        case 'json':
            return react_1["default"].createElement("pre", { className: "json-value" }, JSON.stringify(value, null, 2));
            return react_1["default"].createElement("pre", { className: "json-value" }, JSON.stringify(value, null, 2));
        case 'number':
            return typeof value === 'number' ? value.toLocaleString() : String(value);
        case 'file':
            return react_1["default"].createElement("a", { href: String(value), target: "_blank", rel: "noopener noreferrer" }, "Download File");
        default:
            return String(value);
    }
}
exports.formatFieldValue = formatFieldValue;
/**
 * Render field with formatter
 */
function renderField(field, entity) {
    // Use custom render if provided
    if (field.render) {
        return field.render(entity);
    }
    var value = getFieldValue(entity, field.key);
    // Use custom formatter if provided
    if (field.formatter) {
        return field.formatter(value, entity);
    }
    // Use type-based formatting
    return formatFieldValue(value, field.type);
}
exports.renderField = renderField;
/**
 * Group fields by group ID
 */
function groupFields(fields, groups) {
    var grouped = new Map();
    if (!groups || groups.length === 0) {
        // No groups - return all fields in default group
        grouped.set(null, fields);
        return grouped;
    }
    // Initialize groups
    groups.forEach(function (group) {
        grouped.set(group.id, []);
    });
    // Add ungrouped fields
    grouped.set(null, []);
    // Populate inline field definitions declared inside groups (some configs declare fields inline in group.fields)
    groups.forEach(function (group) {
        var target = grouped.get(group.id) || [];
        group.fields.forEach(function (f) {
            if (typeof f !== 'string') {
                // inline field definition
                var inlineField = f;
                target.push(inlineField);
            }
        });
        grouped.set(group.id, target);
    });
    // Assign fields to groups
    fields.forEach(function (field) {
        // Prefer explicit field.group
        var groupId = field.group || null;
        // If no explicit group, attempt to find a group that lists this field key
        if (!groupId && groups && groups.length > 0) {
            for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
                var g = groups_1[_i];
                if (!g || !g.fields)
                    continue;
                // g.fields may contain strings (field keys) or inline field defs
                var contains = g.fields.some(function (f) {
                    if (typeof f === 'string')
                        return String(f) === String(field.key);
                    // inline field object
                    var inline = f;
                    return (inline === null || inline === void 0 ? void 0 : inline.key) && String(inline.key) === String(field.key);
                });
                if (contains) {
                    groupId = g.id;
                    break;
                }
            }
        }
        var groupFields = grouped.get(groupId) || [];
        groupFields.push(field);
        grouped.set(groupId, groupFields);
    });
    // Remove empty groups
    groups.forEach(function (group) {
        var groupFields = grouped.get(group.id);
        if (!groupFields || groupFields.length === 0) {
            grouped["delete"](group.id);
        }
    });
    return grouped;
}
exports.groupFields = groupFields;
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
 * Sort groups by order
 */
function sortGroups(groups) {
    return __spreadArrays(groups).sort(function (a, b) {
        var _a, _b;
        var orderA = (_a = a.order) !== null && _a !== void 0 ? _a : 999;
        var orderB = (_b = b.order) !== null && _b !== void 0 ? _b : 999;
        return orderA - orderB;
    });
}
exports.sortGroups = sortGroups;
/**
 * Get summary fields
 */
function getSummaryFields(fields) {
    return fields.filter(function (field) { return field.showInSummary !== false; });
}
exports.getSummaryFields = getSummaryFields;
/**
 * Copy to clipboard
 */
function copyToClipboard(text) {
    return __awaiter(this, void 0, Promise, function () {
        var textArea, success, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    if (!navigator.clipboard) return [3 /*break*/, 2];
                    return [4 /*yield*/, navigator.clipboard.writeText(text)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, true];
                case 2:
                    textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    success = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return [2 /*return*/, success];
                case 3: return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.copyToClipboard = copyToClipboard;
/**
 * Get entity title
 */
function getEntityTitle(entity, titleField) {
    if (!titleField) {
        // Try common title fields
        var commonTitleFields = ['name', 'title', 'label', 'id'];
        for (var _i = 0, commonTitleFields_1 = commonTitleFields; _i < commonTitleFields_1.length; _i++) {
            var field = commonTitleFields_1[_i];
            var value_1 = entity[field];
            if (value_1) {
                return String(value_1);
            }
        }
        return 'Entity';
    }
    var value = entity[titleField];
    return value ? String(value) : 'Entity';
}
exports.getEntityTitle = getEntityTitle;
/**
 * Get entity subtitle
 */
function getEntitySubtitle(entity, subtitleField) {
    if (!subtitleField)
        return undefined;
    var value = entity[subtitleField];
    return value ? String(value) : undefined;
}
exports.getEntitySubtitle = getEntitySubtitle;
/**
 * Get entity image
 */
function getEntityImage(entity, imageField) {
    if (!imageField)
        return undefined;
    var value = entity[imageField];
    return value ? String(value) : undefined;
}
exports.getEntityImage = getEntityImage;
/**
 * Get metadata fields
 */
function getMetadataFields(entity) {
    var metadata = [];
    var e = entity;
    if (e.created_at) {
        metadata.push({ label: 'Created', value: utils_1.formatDate(e.created_at, 'YYYY-MM-DD HH:mm:ss') });
    }
    if (e.updated_at) {
        metadata.push({ label: 'Updated', value: utils_1.formatDate(e.updated_at, 'YYYY-MM-DD HH:mm:ss') });
    }
    if (e.created_by) {
        metadata.push({ label: 'Created By', value: e.created_by });
    }
    if (e.updated_by) {
        metadata.push({ label: 'Updated By', value: e.updated_by });
    }
    return metadata;
}
exports.getMetadataFields = getMetadataFields;
