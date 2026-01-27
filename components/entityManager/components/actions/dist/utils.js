"use strict";
/**
 * EntityActions Utility Functions
 *
 * Pure functions for action processing and validation.
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.sortActionsByPriority = exports.getBulkConfirmMessage = exports.validateFormValues = exports.getInitialFormValues = exports.getConfirmMessage = exports.buildNavigationUrl = exports.getActionTooltip = exports.getActionLabel = exports.getEnabledActions = exports.filterActionsByPosition = exports.canExecuteAction = exports.isActionDisabled = exports.isActionVisible = void 0;
/**
 * Check if action is visible
 */
function isActionVisible(action, entity, context) {
    if (action.visible === undefined)
        return true;
    if (typeof action.visible === 'boolean') {
        return action.visible;
    }
    return action.visible(entity, context);
}
exports.isActionVisible = isActionVisible;
/**
 * Check if action is disabled
 */
function isActionDisabled(action, entity, context) {
    if (action.disabled === undefined)
        return false;
    if (typeof action.disabled === 'boolean') {
        return action.disabled;
    }
    return action.disabled(entity, context);
}
exports.isActionDisabled = isActionDisabled;
/**
 * Check if action can be executed
 */
function canExecuteAction(action, entity, context) {
    var _a, _b, _c;
    // Check visibility
    if (!isActionVisible(action, entity, context)) {
        return false;
    }
    // Check disabled state
    if (isActionDisabled(action, entity, context)) {
        return false;
    }
    // Bulk actions should only check if there are selected entities
    if (action.actionType === 'bulk') {
        return ((_b = (_a = context === null || context === void 0 ? void 0 : context.selectedEntities) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0;
    }
    // For non-bulk actions: Check selection requirement
    if (action.requiresSelection && !entity && (!((_c = context === null || context === void 0 ? void 0 : context.selectedEntities) === null || _c === void 0 ? void 0 : _c.length))) {
        return false;
    }
    // For non-bulk actions: Check multiple selection (should not allow multiple)
    if (!action.allowMultiple && (context === null || context === void 0 ? void 0 : context.selectedEntities) && context.selectedEntities.length > 1) {
        return false;
    }
    // Check action-level required permissions (if defined)
    var ctxPerms = (context === null || context === void 0 ? void 0 : context.permissions) || [];
    if (action.permission) {
        if (!ctxPerms.includes(action.permission))
            return false;
    }
    if (action.permissions && action.permissions.length > 0) {
        // Require at least one matching permission from the action's list
        var allowed = action.permissions.some(function (p) { return ctxPerms.includes(p); });
        if (!allowed)
            return false;
    }
    return true;
}
exports.canExecuteAction = canExecuteAction;
/**
 * Filter actions by position
 */
function filterActionsByPosition(actions, position) {
    if (!position)
        return actions;
    return actions.filter(function (action) {
        // Bulk actions should never appear in row positions
        if (action.actionType === 'bulk' && (position === 'row' || position === 'dropdown' || position === 'context-menu')) {
            return false;
        }
        // Check if action's position matches or is unspecified
        return !action.position || action.position === position;
    });
}
exports.filterActionsByPosition = filterActionsByPosition;
/**
 * Filter visible and enabled actions
 */
function getEnabledActions(actions, entity, context) {
    return actions.filter(function (action) { return canExecuteAction(action, entity, context); });
}
exports.getEnabledActions = getEnabledActions;
/**
 * Get action label
 */
function getActionLabel(action) {
    if (typeof action.label === 'function') {
        try {
            return action.label();
        }
        catch (_a) {
            return null;
        }
    }
    return action.label;
}
exports.getActionLabel = getActionLabel;
/**
 * Get action tooltip
 */
function getActionTooltip(action, entity, context) {
    var _a;
    if (action.tooltip)
        return action.tooltip;
    // Auto-generate tooltip based on disabled state
    if (isActionDisabled(action, entity, context)) {
        if (action.requiresSelection && !entity && (!((_a = context === null || context === void 0 ? void 0 : context.selectedEntities) === null || _a === void 0 ? void 0 : _a.length))) {
            return 'Please select an item';
        }
        if (!action.allowMultiple && (context === null || context === void 0 ? void 0 : context.selectedEntities) && context.selectedEntities.length > 1) {
            return 'This action can only be performed on one item';
        }
    }
    // Fall back to showing the label as tooltip
    var label = action.label;
    if (typeof label === 'string')
        return label;
    if (typeof label === 'function') {
        try {
            var result = label(entity);
            return typeof result === 'string' ? result : String(result || '');
        }
        catch (_b) {
            return undefined;
        }
    }
    return undefined;
}
exports.getActionTooltip = getActionTooltip;
/**
 * Build navigation URL
 */
function buildNavigationUrl(url, entity, context) {
    if (typeof url === 'string') {
        // Replace placeholders like {id}, {name}, etc.
        if (entity) {
            return url.replace(/\{(\w+)\}/g, function (match, key) {
                var value = entity[key];
                return value !== undefined ? String(value) : match;
            });
        }
        return url;
    }
    return url(entity, context);
}
exports.buildNavigationUrl = buildNavigationUrl;
/**
 * Get confirm message
 */
function getConfirmMessage(message, entity) {
    if (typeof message === 'string') {
        return message;
    }
    return message(entity);
}
exports.getConfirmMessage = getConfirmMessage;
/**
 * Get initial form values
 */
function getInitialFormValues(initialValues, entity, fields) {
    var values = {};
    // Get from initialValues prop
    if (initialValues) {
        values = typeof initialValues === 'function'
            ? initialValues(entity)
            : __assign({}, initialValues);
    }
    // Apply field defaults
    if (fields) {
        fields.forEach(function (field) {
            if (values[field.name] === undefined && field.defaultValue !== undefined) {
                values[field.name] = field.defaultValue;
            }
        });
    }
    // Apply entity values if editing
    if (entity) {
        fields === null || fields === void 0 ? void 0 : fields.forEach(function (field) {
            if (entity[field.name] !== undefined) {
                values[field.name] = entity[field.name];
            }
        });
    }
    return values;
}
exports.getInitialFormValues = getInitialFormValues;
/**
 * Validate form values
 */
function validateFormValues(values, fields) {
    var errors = {};
    fields.forEach(function (field) {
        var value = values[field.name];
        // Check required
        if (field.required && (value === undefined || value === null || value === '')) {
            errors[field.name] = field.label + " is required";
            return;
        }
        // Run validation rules
        if (field.validation && value) {
            for (var _i = 0, _a = field.validation; _i < _a.length; _i++) {
                var rule = _a[_i];
                switch (rule.type) {
                    case 'required':
                        if (!value) {
                            errors[field.name] = rule.message;
                            return;
                        }
                        break;
                    case 'email':
                        if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                            errors[field.name] = rule.message;
                            return;
                        }
                        break;
                    case 'minLength':
                        if (typeof value === 'string' && rule.value && value.length < Number(rule.value)) {
                            errors[field.name] = rule.message;
                            return;
                        }
                        break;
                    case 'maxLength':
                        if (typeof value === 'string' && rule.value && value.length > Number(rule.value)) {
                            errors[field.name] = rule.message;
                            return;
                        }
                        break;
                    case 'pattern':
                        if (typeof value === 'string' && rule.value && !new RegExp(String(rule.value)).test(value)) {
                            errors[field.name] = rule.message;
                            return;
                        }
                        break;
                    case 'custom':
                        if (rule.validator && !rule.validator(value)) {
                            errors[field.name] = rule.message;
                            return;
                        }
                        break;
                }
            }
        }
    });
    return errors;
}
exports.validateFormValues = validateFormValues;
/**
 * Get bulk confirmation message
 */
function getBulkConfirmMessage(message, items) {
    var _a;
    var count = (_a = items === null || items === void 0 ? void 0 : items.length) !== null && _a !== void 0 ? _a : 0;
    if (!message) {
        return "Are you sure you want to perform this action on " + count + " item" + (count !== 1 ? 's' : '') + "?";
    }
    if (typeof message === 'string') {
        return message.replace('{count}', String(count));
    }
    // If message is a function, prefer passing the full items array (legacy handlers often expect that)
    try {
        return message(items);
    }
    catch (_b) {
        // Fallback: call with count in case handler expects a number
        return message(count);
    }
}
exports.getBulkConfirmMessage = getBulkConfirmMessage;
/**
 * Sort actions by position priority
 */
function sortActionsByPriority(actions) {
    var positionPriority = {
        'toolbar': 1,
        'row': 2,
        'dropdown': 3,
        'context-menu': 4
    };
    return __spreadArrays(actions).sort(function (a, b) {
        var priorityA = a.position ? positionPriority[a.position] || 5 : 5;
        var priorityB = b.position ? positionPriority[b.position] || 5 : 5;
        return priorityA - priorityB;
    });
}
exports.sortActionsByPriority = sortActionsByPriority;
