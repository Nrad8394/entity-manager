"use strict";
/**
 * EntityList Component Utilities
 *
 * Pure utility functions for list operations.
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.getDefaultPageSizes = exports.isGridView = exports.isImageView = exports.getEntityDate = exports.getEntityImageUrl = exports.getEntitySubtitle = exports.getEntityTitle = exports.getTotalPages = exports.paginateEntities = exports.sortEntities = exports.filterEntities = exports.searchEntities = exports.formatCellValue = exports.getColumnValue = exports.getVisibleColumns = void 0;
var date_fns_1 = require("date-fns");
/**
 * Get visible columns
 */
function getVisibleColumns(columns) {
    return columns
        .filter(function (col) { return col.visible !== false; })
        .sort(function (a, b) { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 0) - ((_b = b.order) !== null && _b !== void 0 ? _b : 0); });
}
exports.getVisibleColumns = getVisibleColumns;
/**
 * Get column value
 */
function getColumnValue(entity, columnKey) {
    // Handle nested paths (e.g., 'user.name')
    if (typeof columnKey === 'string' && columnKey.includes('.')) {
        var parts = columnKey.split('.');
        var value = entity;
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var part = parts_1[_i];
            value = value === null || value === void 0 ? void 0 : value[part];
            if (value === undefined)
                break;
        }
        return value;
    }
    return entity[columnKey];
}
exports.getColumnValue = getColumnValue;
/**
 * Format cell value
 */
function formatCellValue(value, column, entity) {
    // Use custom formatter if provided
    if (column.formatter) {
        return column.formatter(value, entity);
    }
    // Type-based formatting
    if (column.type === 'datetime') {
        // Render full date + time in a consistent format using date-fns
        if (value instanceof Date) {
            return date_fns_1.format(value, 'Pp');
        }
        if (typeof value === 'string' && value) {
            try {
                var parsed = date_fns_1.parseISO(value);
                if (!isNaN(parsed.getTime()))
                    return date_fns_1.format(parsed, 'Pp');
            }
            catch (_a) {
                // fallthrough
            }
            var asNumber = Number(value);
            if (!Number.isNaN(asNumber)) {
                var parsed = new Date(asNumber);
                if (!isNaN(parsed.getTime()))
                    return date_fns_1.format(parsed, 'Pp');
            }
            return value;
        }
        if (typeof value === 'number') {
            var parsed = new Date(value);
            if (!isNaN(parsed.getTime()))
                return date_fns_1.format(parsed, 'Pp');
            return String(value);
        }
        return '';
    }
    if (column.type === 'date') {
        if (value instanceof Date) {
            return date_fns_1.format(value, 'P');
        }
        if (typeof value === 'string' && value) {
            try {
                var parsed = date_fns_1.parseISO(value);
                if (!isNaN(parsed.getTime()))
                    return date_fns_1.format(parsed, 'P');
            }
            catch (_b) {
                // fallthrough
            }
            return value;
        }
        return '';
    }
    if (column.type === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    if (column.type === 'number' && typeof value === 'number') {
        return value.toLocaleString();
    }
    // Default
    if (value === null || value === undefined) {
        return '';
    }
    return String(value);
}
exports.formatCellValue = formatCellValue;
/**
 * Filter entities based on search
 */
function searchEntities(entities, searchValue, columns) {
    if (!searchValue.trim()) {
        return entities;
    }
    var searchLower = searchValue.toLowerCase();
    return entities.filter(function (entity) {
        // Search across all visible columns
        return columns.some(function (column) {
            var value = getColumnValue(entity, column.key);
            var formattedValue = formatCellValue(value, column, entity);
            return String(formattedValue).toLowerCase().includes(searchLower);
        });
    });
}
exports.searchEntities = searchEntities;
/**
 * Filter entities based on filters
 */
function filterEntities(entities, filters) {
    if (filters.length === 0) {
        return entities;
    }
    return entities.filter(function (entity) {
        return filters.every(function (filter) {
            var value = getColumnValue(entity, filter.field);
            switch (filter.operator) {
                case 'equals':
                    return value === filter.value;
                case 'notEquals':
                    return value !== filter.value;
                case 'contains':
                    return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
                case 'notContains':
                    return !String(value).toLowerCase().includes(String(filter.value).toLowerCase());
                case 'startsWith':
                    return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
                case 'endsWith':
                    return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
                case 'greaterThan':
                    return Number(value) > Number(filter.value);
                case 'lessThan':
                    return Number(value) < Number(filter.value);
                case 'greaterThanOrEqual':
                    return Number(value) >= Number(filter.value);
                case 'lessThanOrEqual':
                    return Number(value) <= Number(filter.value);
                case 'between':
                    if (Array.isArray(filter.value) && filter.value.length === 2) {
                        var numValue = Number(value);
                        return numValue >= Number(filter.value[0]) && numValue <= Number(filter.value[1]);
                    }
                    return false;
                case 'in':
                    return Array.isArray(filter.value) && filter.value.includes(value);
                case 'notIn':
                    return Array.isArray(filter.value) && !filter.value.includes(value);
                case 'isNull':
                    return value === null || value === undefined;
                case 'isNotNull':
                    return value !== null && value !== undefined;
                default:
                    return true;
            }
        });
    });
}
exports.filterEntities = filterEntities;
/**
 * Sort entities
 */
function sortEntities(entities, sortConfig) {
    if (!sortConfig || !sortConfig.field) {
        return entities;
    }
    return __spreadArrays(entities).sort(function (a, b) {
        var aValue = getColumnValue(a, sortConfig.field);
        var bValue = getColumnValue(b, sortConfig.field);
        // Handle null/undefined
        if (aValue === null || aValue === undefined)
            return 1;
        if (bValue === null || bValue === undefined)
            return -1;
        // Compare values
        var comparison = 0;
        if (aValue < bValue)
            comparison = -1;
        if (aValue > bValue)
            comparison = 1;
        // Apply direction
        return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
}
exports.sortEntities = sortEntities;
/**
 * Paginate entities
 */
function paginateEntities(entities, page, pageSize) {
    var start = (page - 1) * pageSize;
    var end = start + pageSize;
    return entities.slice(start, end);
}
exports.paginateEntities = paginateEntities;
/**
 * Get total pages
 */
function getTotalPages(totalItems, pageSize) {
    return Math.ceil(totalItems / pageSize);
}
exports.getTotalPages = getTotalPages;
/**
 * Get entity title
 */
function getEntityTitle(entity, titleField) {
    if (titleField) {
        var value = getColumnValue(entity, titleField);
        return String(value || '');
    }
    // Try common title fields
    var titleCandidates = ['name', 'title', 'label', 'displayName', 'id'];
    for (var _i = 0, titleCandidates_1 = titleCandidates; _i < titleCandidates_1.length; _i++) {
        var candidate = titleCandidates_1[_i];
        if (candidate in entity) {
            var value = entity[candidate];
            if (value)
                return String(value);
        }
    }
    return 'Untitled';
}
exports.getEntityTitle = getEntityTitle;
/**
 * Get entity subtitle
 */
function getEntitySubtitle(entity, subtitleField) {
    if (subtitleField) {
        var value = getColumnValue(entity, subtitleField);
        return String(value || '');
    }
    // Try common subtitle fields
    var subtitleCandidates = ['description', 'subtitle', 'summary', 'type'];
    for (var _i = 0, subtitleCandidates_1 = subtitleCandidates; _i < subtitleCandidates_1.length; _i++) {
        var candidate = subtitleCandidates_1[_i];
        if (candidate in entity) {
            var value = entity[candidate];
            if (value)
                return String(value);
        }
    }
    return '';
}
exports.getEntitySubtitle = getEntitySubtitle;
/**
 * Get entity image URL
 */
function getEntityImageUrl(entity, imageField) {
    if (imageField) {
        var value = getColumnValue(entity, imageField);
        return String(value || '');
    }
    // Try common image fields
    var imageCandidates = ['image', 'imageUrl', 'thumbnail', 'avatar', 'photo'];
    for (var _i = 0, imageCandidates_1 = imageCandidates; _i < imageCandidates_1.length; _i++) {
        var candidate = imageCandidates_1[_i];
        if (candidate in entity) {
            var value = entity[candidate];
            if (value)
                return String(value);
        }
    }
    return null;
}
exports.getEntityImageUrl = getEntityImageUrl;
/**
 * Get entity date
 */
function getEntityDate(entity, dateField) {
    if (dateField) {
        var value = getColumnValue(entity, dateField);
        if (value instanceof Date)
            return value;
        if (typeof value === 'string' || typeof value === 'number') {
            var date = new Date(value);
            return isNaN(date.getTime()) ? null : date;
        }
    }
    // Try common date fields
    var dateCandidates = ['date', 'createdAt', 'updatedAt', 'timestamp'];
    for (var _i = 0, dateCandidates_1 = dateCandidates; _i < dateCandidates_1.length; _i++) {
        var candidate = dateCandidates_1[_i];
        if (candidate in entity) {
            var value = entity[candidate];
            if (value instanceof Date)
                return value;
            if (typeof value === 'string' || typeof value === 'number') {
                var date = new Date(value);
                if (!isNaN(date.getTime()))
                    return date;
            }
        }
    }
    return null;
}
exports.getEntityDate = getEntityDate;
/**
 * Check if view supports images
 */
function isImageView(view) {
    return view === 'gallery' || view === 'card';
}
exports.isImageView = isImageView;
/**
 * Check if view is grid-based
 */
function isGridView(view) {
    return view === 'grid' || view === 'card' || view === 'gallery';
}
exports.isGridView = isGridView;
/**
 * Get default page sizes
 */
function getDefaultPageSizes() {
    return [10, 25, 50, 100];
}
exports.getDefaultPageSizes = getDefaultPageSizes;
