/**
 * EntityList Component Utilities
 * 
 * Pure utility functions for list operations.
 */

import { BaseEntity, FilterConfig, SortConfig } from '../../primitives/types';
import { Column, ListView } from './types';
import { format, parseISO } from 'date-fns';

/**
 * Get visible columns
 */
export function getVisibleColumns<T extends BaseEntity>(
  columns: Column<T>[]
): Column<T>[] {
  return columns
    .filter(col => col.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Get column value
 */
export function getColumnValue<T extends BaseEntity>(
  entity: T,
  columnKey: keyof T | string
): unknown {
  // Handle nested paths (e.g., 'user.name')
  if (typeof columnKey === 'string' && columnKey.includes('.')) {
    const parts = columnKey.split('.');
    let value: any = entity;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    return value;
  }
  
  return entity[columnKey as keyof T];
}

/**
 * Format cell value
 */
export function formatCellValue<T extends BaseEntity>(
  value: unknown,
  column: Column<T>,
  entity: T
): string | number {
  // Use custom formatter if provided
  if (column.formatter) {
    return column.formatter(value, entity);
  }
  
  // Type-based formatting
  if (column.type === 'datetime') {
    // Render full date + time in a consistent format using date-fns
    if (value instanceof Date) {
      return format(value, 'Pp');
    }
    if (typeof value === 'string' && value) {
      try {
        const parsed = parseISO(value);
        if (!isNaN(parsed.getTime())) return format(parsed, 'Pp');
      } catch {
        // fallthrough
      }
      const asNumber = Number(value);
      if (!Number.isNaN(asNumber)) {
        const parsed = new Date(asNumber);
        if (!isNaN(parsed.getTime())) return format(parsed, 'Pp');
      }
      return value;
    }
    if (typeof value === 'number') {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) return format(parsed, 'Pp');
      return String(value);
    }
    return '';
  }

  if (column.type === 'date') {
    if (value instanceof Date) {
      return format(value, 'P');
    }
    if (typeof value === 'string' && value) {
      try {
        const parsed = parseISO(value);
        if (!isNaN(parsed.getTime())) return format(parsed, 'P');
      } catch {
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

/**
 * Filter entities based on search
 */
export function searchEntities<T extends BaseEntity>(
  entities: T[],
  searchValue: string,
  columns: Column<T>[]
): T[] {
  if (!searchValue.trim()) {
    return entities;
  }
  
  const searchLower = searchValue.toLowerCase();
  
  return entities.filter(entity => {
    // Search across all visible columns
    return columns.some(column => {
      const value = getColumnValue(entity, column.key);
      const formattedValue = formatCellValue(value, column, entity);
      return String(formattedValue).toLowerCase().includes(searchLower);
    });
  });
}

/**
 * Filter entities based on filters
 */
export function filterEntities<T extends BaseEntity>(
  entities: T[],
  filters: FilterConfig[]
): T[] {
  if (filters.length === 0) {
    return entities;
  }
  
  return entities.filter(entity => {
    return filters.every(filter => {
      const value = getColumnValue(entity, filter.field);
      
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
            const numValue = Number(value);
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

/**
 * Sort entities
 */
export function sortEntities<T extends BaseEntity>(
  entities: T[],
  sortConfig?: SortConfig
): T[] {
  if (!sortConfig || !sortConfig.field) {
    return entities;
  }
  
  return [...entities].sort((a, b) => {
    const aValue = getColumnValue(a, sortConfig.field);
    const bValue = getColumnValue(b, sortConfig.field);
    
    // Handle null/undefined
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    // Compare values
    let comparison = 0;
    if (aValue < bValue) comparison = -1;
    if (aValue > bValue) comparison = 1;
    
    // Apply direction
    return sortConfig.direction === 'desc' ? -comparison : comparison;
  });
}

/**
 * Paginate entities
 */
export function paginateEntities<T extends BaseEntity>(
  entities: T[],
  page: number,
  pageSize: number
): T[] {
  // Protect against invalid inputs
  if (pageSize <= 0 || page <= 0) {
    return entities.slice(0, Math.max(pageSize, 1));
  }
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return entities.slice(start, end);
}

/**
 * Get total pages
 */
export function getTotalPages(totalItems: number, pageSize: number): number {
  // Protect against invalid pageSize
  if (pageSize <= 0) {
    return totalItems > 0 ? 1 : 0;
  }
  return Math.ceil(totalItems / pageSize);
}

/**
 * Get entity title
 */
export function getEntityTitle<T extends BaseEntity>(
  entity: T,
  titleField?: keyof T | string
): string {
  if (titleField) {
    const value = getColumnValue(entity, titleField);
    return String(value || '');
  }
  
  // Try common title fields
  const titleCandidates = ['name', 'title', 'label', 'displayName', 'id'];
  for (const candidate of titleCandidates) {
    if (candidate in entity) {
      const value = entity[candidate as keyof T];
      if (value) return String(value);
    }
  }
  
  return 'Untitled';
}

/**
 * Get entity subtitle
 */
export function getEntitySubtitle<T extends BaseEntity>(
  entity: T,
  subtitleField?: keyof T | string
): string {
  if (subtitleField) {
    const value = getColumnValue(entity, subtitleField);
    return String(value || '');
  }
  
  // Try common subtitle fields
  const subtitleCandidates = ['description', 'subtitle', 'summary', 'type'];
  for (const candidate of subtitleCandidates) {
    if (candidate in entity) {
      const value = entity[candidate as keyof T];
      if (value) return String(value);
    }
  }
  
  return '';
}

/**
 * Get entity image URL
 */
export function getEntityImageUrl<T extends BaseEntity>(
  entity: T,
  imageField?: keyof T | string
): string | null {
  if (imageField) {
    const value = getColumnValue(entity, imageField);
    return String(value || '');
  }
  
  // Try common image fields
  const imageCandidates = ['image', 'imageUrl', 'thumbnail', 'avatar', 'photo'];
  for (const candidate of imageCandidates) {
    if (candidate in entity) {
      const value = entity[candidate as keyof T];
      if (value) return String(value);
    }
  }
  
  return null;
}

/**
 * Get entity date
 */
export function getEntityDate<T extends BaseEntity>(
  entity: T,
  dateField?: keyof T | string
): Date | null {
  if (dateField) {
    const value = getColumnValue(entity, dateField);
    if ((value as any) instanceof Date) return value as Date;
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
  }
  
  // Try common date fields
  const dateCandidates = ['date', 'createdAt', 'updatedAt', 'timestamp'];
  for (const candidate of dateCandidates) {
    if (candidate in entity) {
      const value = entity[candidate as keyof T];
      if ((value as any) instanceof Date) return value as Date;
      if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) return date;
      }
    }
  }
  
  return null;
}

/**
 * Check if view supports images
 */
export function isImageView(view: ListView): boolean {
  return view === 'gallery' || view === 'card';
}

/**
 * Check if view is grid-based
 */
export function isGridView(view: ListView): boolean {
  return view === 'grid' || view === 'card' || view === 'gallery';
}

/**
 * Get default page sizes
 */
export function getDefaultPageSizes(): number[] {
  return [10, 25, 50, 100];
}
