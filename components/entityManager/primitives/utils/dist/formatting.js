"use strict";
/**
 * Formatting Utilities
 *
 * Pure formatting functions with zero dependencies.
 *
 * @module primitives/utils/formatting
 */
exports.__esModule = true;
exports.formatArray = exports.formatBoolean = exports.formatRelativeTime = exports.snakeToTitle = exports.camelToTitle = exports.titleCase = exports.capitalize = exports.truncate = exports.formatPhoneNumber = exports.formatFileSize = exports.formatNumber = exports.formatPercentage = exports.formatCurrency = exports.formatDate = void 0;
/**
 * Format a date to string
 */
var date_fns_1 = require("date-fns");
function formatDate(date, format) {
    if (format === void 0) { format = 'YYYY-MM-DD'; }
    // Convert common moment-style tokens to date-fns tokens
    var tokenMap = {
        'YYYY': 'yyyy',
        'DD': 'dd',
        'HH': 'HH',
        'mm': 'mm',
        'ss': 'ss',
        'MM': 'MM'
    };
    var dfFormatStr = format;
    Object.keys(tokenMap).forEach(function (k) {
        dfFormatStr = dfFormatStr.replace(k, tokenMap[k]);
    });
    var d;
    if (date instanceof Date)
        d = date;
    else if (typeof date === 'number')
        d = new Date(date);
    else {
        try {
            d = date_fns_1.parseISO(String(date));
            if (!date_fns_1.isValid(d))
                d = new Date(String(date));
        }
        catch (_a) {
            d = new Date(String(date));
        }
    }
    if (!date_fns_1.isValid(d))
        return '';
    try {
        return date_fns_1.format(d, dfFormatStr);
    }
    catch (_b) {
        // Fallback to ISO
        return d.toISOString();
    }
}
exports.formatDate = formatDate;
/**
 * Format a number to currency
 */
function formatCurrency(value, currency, locale) {
    if (currency === void 0) { currency = 'USD'; }
    if (locale === void 0) { locale = 'en-US'; }
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(value);
    }
    catch (_a) {
        return currency + " " + value.toFixed(2);
    }
}
exports.formatCurrency = formatCurrency;
/**
 * Format a number to percentage
 */
function formatPercentage(value, decimals) {
    if (decimals === void 0) { decimals = 0; }
    return value.toFixed(decimals) + "%";
}
exports.formatPercentage = formatPercentage;
/**
 * Format a number with thousand separators
 */
function formatNumber(value, decimals, locale) {
    if (decimals === void 0) { decimals = 0; }
    if (locale === void 0) { locale = 'en-US'; }
    try {
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    }
    catch (_a) {
        return value.toFixed(decimals);
    }
}
exports.formatNumber = formatNumber;
/**
 * Format file size
 */
function formatFileSize(bytes) {
    var units = ['B', 'KB', 'MB', 'GB', 'TB'];
    var size = bytes;
    var unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return size.toFixed(2) + " " + units[unitIndex];
}
exports.formatFileSize = formatFileSize;
/**
 * Format phone number
 */
function formatPhoneNumber(phone, format) {
    if (format === void 0) { format = '(XXX) XXX-XXXX'; }
    var digits = phone.replace(/\D/g, '');
    var formatted = format;
    var digitIndex = 0;
    for (var i = 0; i < formatted.length; i++) {
        if (formatted[i] === 'X' && digitIndex < digits.length) {
            formatted = formatted.substring(0, i) + digits[digitIndex] + formatted.substring(i + 1);
            digitIndex++;
        }
    }
    return formatted;
}
exports.formatPhoneNumber = formatPhoneNumber;
/**
 * Truncate text to specified length
 */
function truncate(text, maxLength, suffix) {
    if (suffix === void 0) { suffix = '...'; }
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
}
exports.truncate = truncate;
/**
 * Capitalize first letter
 */
function capitalize(text) {
    if (!text)
        return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
exports.capitalize = capitalize;
/**
 * Title case
 */
function titleCase(text) {
    if (!text)
        return '';
    return text
        .split(' ')
        .map(function (word) { return capitalize(word); })
        .join(' ');
}
exports.titleCase = titleCase;
/**
 * Camel case to title case
 */
function camelToTitle(text) {
    if (!text)
        return '';
    return text
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, function (str) { return str.toUpperCase(); })
        .trim();
}
exports.camelToTitle = camelToTitle;
/**
 * Snake case to title case
 */
function snakeToTitle(text) {
    if (!text)
        return '';
    return text
        .split('_')
        .map(function (word) { return capitalize(word); })
        .join(' ');
}
exports.snakeToTitle = snakeToTitle;
/**
 * Format relative time
 */
function formatRelativeTime(date) {
    try {
        var d = typeof date === 'string' ? date_fns_1.parseISO(date) : (date instanceof Date ? date : new Date(date));
        if (!date_fns_1.isValid(d))
            return '';
        return date_fns_1.formatDistanceToNow(d, { addSuffix: true });
    }
    catch (_a) {
        return '';
    }
}
exports.formatRelativeTime = formatRelativeTime;
/**
 * Format boolean to Yes/No
 */
function formatBoolean(value, trueText, falseText) {
    if (trueText === void 0) { trueText = 'Yes'; }
    if (falseText === void 0) { falseText = 'No'; }
    return value ? trueText : falseText;
}
exports.formatBoolean = formatBoolean;
/**
 * Format array to comma-separated string
 */
function formatArray(arr, maxItems, separator) {
    if (separator === void 0) { separator = ', '; }
    if (!arr || arr.length === 0)
        return '';
    var items = maxItems ? arr.slice(0, maxItems) : arr;
    var formatted = items.map(function (item) { return String(item); }).join(separator);
    if (maxItems && arr.length > maxItems) {
        return formatted + " (+" + (arr.length - maxItems) + " more)";
    }
    return formatted;
}
exports.formatArray = formatArray;
