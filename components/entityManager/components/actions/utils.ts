/**
 * EntityActions Utility Functions
 * 
 * Pure functions for action processing and validation.
 */

import { BaseEntity } from '../../primitives/types';
import {
  Action,
  ActionDefinition,
  ActionContext,
  ActionPosition,
  FormFieldDefinition,
} from './types';

/**
 * Check if action is visible
 */
export function isActionVisible<T extends BaseEntity>(
  action: ActionDefinition<T>,
  entity?: T,
  context?: ActionContext<T>
): boolean {
  if (action.visible === undefined) return true;
  
  if (typeof action.visible === 'boolean') {
    return action.visible;
  }
  
  return action.visible(entity, context);
}

/**
 * Check if action is disabled
 */
export function isActionDisabled<T extends BaseEntity>(
  action: ActionDefinition<T>,
  entity?: T,
  context?: ActionContext<T>
): boolean {
  if (action.disabled === undefined) return false;
  
  if (typeof action.disabled === 'boolean') {
    return action.disabled;
  }
  
  return action.disabled(entity, context);
}

/**
 * Check if action can be executed
 */
export function canExecuteAction<T extends BaseEntity>(
  action: ActionDefinition<T>,
  entity?: T,
  context?: ActionContext<T>
): boolean {
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
    return (context?.selectedEntities?.length ?? 0) > 0;
  }
  
  // For non-bulk actions: Check selection requirement
  if (action.requiresSelection && !entity && (!context?.selectedEntities?.length)) {
    return false;
  }
  
  // For non-bulk actions: Check multiple selection (should not allow multiple)
  if (!action.allowMultiple && context?.selectedEntities && context.selectedEntities.length > 1) {
    return false;
  }

  // Check action-level required permissions (if defined)
  const ctxPerms: string[] = context?.permissions || [];
  if (action.permission) {
    if (!ctxPerms.includes(action.permission)) return false;
  }

  if (action.permissions && action.permissions.length > 0) {
    // Require ALL permissions to be present
    const allowed = action.permissions.every(p => ctxPerms.includes(p));
    if (!allowed) return false;
  }
  
  return true;
}

/**
 * Filter actions by position
 */
export function filterActionsByPosition<T extends BaseEntity>(
  actions: Action<T>[],
  position?: ActionPosition
): Action<T>[] {
  if (!position) return actions;
  
  return actions.filter(action => {
    // Bulk actions should never appear in row positions
    if (action.actionType === 'bulk' && (position === 'row' || position === 'dropdown' || position === 'context-menu')) {
      return false;
    }
    
    // Check if action's position matches or is unspecified
    return !action.position || action.position === position;
  });
}

/**
 * Filter visible and enabled actions
 */
export function getEnabledActions<T extends BaseEntity>(
  actions: Action<T>[],
  entity?: T,
  context?: ActionContext<T>
): Action<T>[] {
  return actions.filter(action => canExecuteAction(action, entity, context));
}

/**
 * Get action label
 */
export function getActionLabel<T extends BaseEntity>(
  action: ActionDefinition<T>
): React.ReactNode {
  if (typeof action.label === 'function') {
    try {
      return action.label();
    } catch {
      return null;
    }
  }
  return action.label;
}

/**
 * Get action tooltip
 */
export function getActionTooltip<T extends BaseEntity>(
  action: ActionDefinition<T>,
  entity?: T,
  context?: ActionContext<T>
): string | undefined {
  if (action.tooltip) return action.tooltip;
  
  // Auto-generate tooltip based on disabled state
  if (isActionDisabled(action, entity, context)) {
    if (action.requiresSelection && !entity && (!context?.selectedEntities?.length)) {
      return 'Please select an item';
    }
    if (!action.allowMultiple && context?.selectedEntities && context.selectedEntities.length > 1) {
      return 'This action can only be performed on one item';
    }
  }
  
  // Fall back to showing the label as tooltip
  const label = action.label;
  if (typeof label === 'string') return label;
  if (typeof label === 'function') {
    try {
      const result = label(entity);
      return typeof result === 'string' ? result : String(result || '');
    } catch {
      return undefined;
    }
  }
  
  return undefined;
}

/**
 * Build navigation URL
 */
export function buildNavigationUrl<T extends BaseEntity>(
  url: string | ((entity?: T, context?: ActionContext<T>) => string),
  entity?: T,
  context?: ActionContext<T>
): string {
  if (typeof url === 'string') {
    // Replace placeholders like {id}, {name}, etc.
    if (entity) {
      return url.replace(/\{(\w+)\}/g, (match, key) => {
        const value = entity[key as keyof T];
        return value !== undefined ? String(value) : match;
      });
    }
    return url;
  }
  
  return url(entity, context);
}

/**
 * Get confirm message
 */
export function getConfirmMessage<T extends BaseEntity>(
  message: string | ((entity?: T) => string),
  entity?: T
): string {
  if (typeof message === 'string') {
    return message;
  }
  return message(entity);
}

/**
 * Get initial form values
 */
export function getInitialFormValues<T extends BaseEntity>(
  initialValues: Record<string, unknown> | ((entity?: T) => Record<string, unknown>) | undefined,
  entity?: T,
  fields?: FormFieldDefinition[]
): Record<string, unknown> {
  let values: Record<string, unknown> = {};
  
  // Get from initialValues prop
  if (initialValues) {
    values = typeof initialValues === 'function' 
      ? initialValues(entity) 
      : { ...initialValues };
  }
  
  // Apply field defaults
  if (fields) {
    fields.forEach(field => {
      if (values[field.name] === undefined && field.defaultValue !== undefined) {
        values[field.name] = field.defaultValue;
      }
    });
  }
  
  // Apply entity values if editing
  if (entity) {
    fields?.forEach(field => {
      if (entity[field.name as keyof T] !== undefined) {
        values[field.name] = entity[field.name as keyof T];
      }
    });
  }
  
  return values;
}

/**
 * Validate form values
 */
export function validateFormValues(
  values: Record<string, unknown>,
  fields: FormFieldDefinition[]
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  fields.forEach(field => {
    const value = values[field.name];
    
    // Check required
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.name] = `${field.label} is required`;
      return;
    }
    
    // Run validation rules
    if (field.validation && value) {
      for (const rule of field.validation) {
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

/**
 * Get bulk confirmation message
 */
export function getBulkConfirmMessage<T = unknown>(
  message: string | ((items?: T[]) => string) | undefined,
  items: T[]
): string {
  const count = items?.length ?? 0;
  if (!message) {
    return `Are you sure you want to perform this action on ${count} item${count !== 1 ? 's' : ''}?`;
  }

  if (typeof message === 'string') {
    return message.replace('{count}', String(count));
  }

  // If message is a function, prefer passing the full items array (legacy handlers often expect that)
  try {
    return message(items);
  } catch {
    // Fallback: call with count in case handler expects a number
    return message(count as any);
  }
}

/**
 * Sort actions by position priority
 */
export function sortActionsByPriority<T extends BaseEntity>(
  actions: Action<T>[]
): Action<T>[] {
  const positionPriority: Record<string, number> = {
    'toolbar': 1,
    'row': 2,
    'dropdown': 3,
    'context-menu': 4,
  };
  
  return [...actions].sort((a, b) => {
    const priorityA = a.position ? positionPriority[a.position] || 5 : 5;
    const priorityB = b.position ? positionPriority[b.position] || 5 : 5;
    return priorityA - priorityB;
  });
}
