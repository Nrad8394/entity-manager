/**
 * List Empty State
 * 
 * Friendly empty state display for lists with no data.
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Database, FileQuestion, Search, Filter, Plus, Inbox, Package } from 'lucide-react';

export interface EmptyStateProps {
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Icon to display */
  icon?: React.ComponentType<{ className?: string }>;
  /** Primary action */
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  /** Secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Reason for empty state */
  reason?: 'no-data' | 'no-results' | 'no-access' | 'error' | 'filtered';
  /** Custom className */
  className?: string;
}

/**
 * Empty state content based on reason
 */
const emptyStateContent: Record<
  NonNullable<EmptyStateProps['reason']>,
  {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }
> = {
  'no-data': {
    icon: Inbox,
    title: 'No data',
    description: 'Get started by creating your first item.',
  },
  'no-results': {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria.',
  },
  'no-access': {
    icon: FileQuestion,
    title: 'Access restricted',
    description: "You don't have permission to view these items.",
  },
  'error': {
    icon: Database,
    title: 'Unable to load data',
    description: 'There was an error loading the data. Please try again.',
  },
  'filtered': {
    icon: Filter,
    title: 'No matching items',
    description: 'No items match your current filters. Try adjusting them.',
  },
};

/**
 * Empty state component
 */
export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  secondaryAction,
  reason = 'no-data',
  className,
}: EmptyStateProps) {
  // Get default content based on reason
  const defaultContent = emptyStateContent[reason];
  const DefaultIcon = Icon || defaultContent.icon;
  const displayTitle = title || defaultContent.title;
  const displayDescription = description || defaultContent.description;
  const ActionIcon = action?.icon;

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {/* Icon */}
      <div className="mb-4 rounded-full bg-muted p-6">
        <DefaultIcon className="h-12 w-12 text-muted-foreground" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{displayTitle}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-md mb-6">{displayDescription}</p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button onClick={action.onClick} size="default">
              {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline" size="default">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact empty state (for smaller spaces)
 */
export function CompactEmptyState({
  title = 'No items',
  description,
  action,
  className,
}: Omit<EmptyStateProps, 'icon' | 'reason' | 'secondaryAction'>) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-8 px-4 text-center', className)}>
      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      {description && <p className="text-xs text-muted-foreground/80 mb-4">{description}</p>}
      {action && (
        <Button onClick={action.onClick} size="sm" variant="outline">
          {action.icon && <action.icon className="h-3.5 w-3.5 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * Search empty state
 */
export function SearchEmptyState({
  searchQuery,
  onClear,
  onCreate,
  className,
}: {
  searchQuery: string;
  onClear: () => void;
  onCreate?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      reason="no-results"
      title="No results found"
      description={`No items match "${searchQuery}". Try a different search term.`}
      icon={Search}
      action={
        onCreate
          ? {
              label: 'Create new item',
              onClick: onCreate,
              icon: Plus,
            }
          : undefined
      }
      secondaryAction={{
        label: 'Clear search',
        onClick: onClear,
      }}
      className={className}
    />
  );
}

/**
 * Filter empty state
 */
export function FilterEmptyState({
  onClear,
  onCreate,
  className,
}: {
  onClear: () => void;
  onCreate?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      reason="filtered"
      icon={Filter}
      action={
        onCreate
          ? {
              label: 'Create new item',
              onClick: onCreate,
              icon: Plus,
            }
          : undefined
      }
      secondaryAction={{
        label: 'Clear filters',
        onClick: onClear,
      }}
      className={className}
    />
  );
}

/**
 * Create prompt empty state
 */
export function CreateEmptyState({
  entityName = 'item',
  onCreate,
  className,
}: {
  entityName?: string;
  onCreate: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      reason="no-data"
      title={`No data`}
      description={`Get started by creating your first ${entityName}.`}
      icon={Package}
      action={{
        label: `Create ${entityName}`,
        onClick: onCreate,
        icon: Plus,
      }}
      className={className}
    />
  );
}
