/**
 * Formatting Utilities
 * 
 * Pure formatting functions with zero dependencies.
 * 
 * @module primitives/utils/formatting
 */

/**
 * Format a date to string
 */
import { format as dfFormat, parseISO, isValid, formatDistanceToNow } from 'date-fns';

export function formatDate(
  date: Date | string | number,
  format: string = 'YYYY-MM-DD'
): string {
  // Convert common moment-style tokens to date-fns tokens
  const tokenMap: Record<string, string> = {
    'YYYY': 'yyyy',
    'DD': 'dd',
    'HH': 'HH',
    'mm': 'mm',
    'ss': 'ss',
    'MM': 'MM'
  };

  let dfFormatStr = format;
  Object.keys(tokenMap).forEach(k => {
    dfFormatStr = dfFormatStr.replace(k, tokenMap[k]);
  });

  let d: Date;
  if (date instanceof Date) d = date;
  else if (typeof date === 'number') d = new Date(date);
  else {
    try {
      d = parseISO(String(date));
      if (!isValid(d)) d = new Date(String(date));
    } catch {
      d = new Date(String(date));
    }
  }

  if (!isValid(d)) return '';
  try {
    return dfFormat(d, dfFormatStr);
  } catch {
    // Fallback to ISO
    return d.toISOString();
  }
}

/**
 * Format a number to currency
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

/**
 * Format a number to percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 0
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(
  value: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return value.toFixed(decimals);
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(
  phone: string,
  format: string = '(XXX) XXX-XXXX'
): string {
  const digits = phone.replace(/\D/g, '');
  let formatted = format;
  let digitIndex = 0;

  for (let i = 0; i < formatted.length; i++) {
    if (formatted[i] === 'X' && digitIndex < digits.length) {
      formatted = formatted.substring(0, i) + digits[digitIndex] + formatted.substring(i + 1);
      digitIndex++;
    }
  }

  return formatted;
}

/**
 * Truncate text to specified length
 */
export function truncate(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Title case
 */
export function titleCase(text: string): string {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Camel case to title case
 */
export function camelToTitle(text: string): string {
  if (!text) return '';
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Snake case to title case
 */
export function snakeToTitle(text: string): string {
  if (!text) return '';
  return text
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: Date | string | number): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : (date instanceof Date ? date : new Date(date));
    if (!isValid(d)) return '';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '';
  }
}

/**
 * Format boolean to Yes/No
 */
export function formatBoolean(value: boolean, trueText: string = 'Yes', falseText: string = 'No'): string {
  return value ? trueText : falseText;
}

/**
 * Format array to comma-separated string
 */
export function formatArray(arr: unknown[], maxItems?: number, separator: string = ', '): string {
  if (!arr || arr.length === 0) return '';
  
  const items = maxItems ? arr.slice(0, maxItems) : arr;
  const formatted = items.map(item => String(item)).join(separator);
  
  if (maxItems && arr.length > maxItems) {
    return `${formatted} (+${arr.length - maxItems} more)`;
  }
  
  return formatted;
}
