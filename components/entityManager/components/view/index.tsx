/**
 * EntityView Component
 * 
 * Standalone component for displaying entity details in multiple view modes.
 * Works independently without orchestrator or context.
 */

'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { BaseEntity } from '../../primitives/types';
import {
  EntityViewProps,
  ViewState,
  FieldRenderProps,
} from './types';
import { ViewField, ViewTab, FieldGroup } from './types';
import { Action } from '../actions/types';
import { EntityActions } from '../actions';
import {
  getVisibleFields,
  renderField,
  groupFields,
  sortFields,
  sortGroups,
  getSummaryFields,
  copyToClipboard,
  getEntityTitle,
  getEntitySubtitle,
  getEntityImage,
  getMetadataFields,
  getFieldValue,
} from './utils';
import { ViewSkeleton } from './ViewSkeleton';

/**
 * Safely render an icon which may be a string, a React element, or a component type
 */
function renderIcon(icon: unknown): React.ReactNode {
  if (!icon) return null;
  // String or number
  if (typeof icon === 'string' || typeof icon === 'number') return <span>{String(icon)}</span>;
  // React element
  if (React.isValidElement(icon)) return icon as React.ReactNode;
  // Component type (function or class)
  try {
    const Comp = icon as React.ElementType;
    return <Comp />;
  } catch (e) {
    return null;
  }
}

/**
 * EntityView Component
 * 
 * @example
 * ```tsx
 * const fields: ViewField<User>[] = [
 *   { key: 'id', label: 'ID', type: 'text' },
 *   { key: 'name', label: 'Name', type: 'text', showInSummary: true },
 *   { key: 'email', label: 'Email', type: 'email', copyable: true },
 *   { key: 'createdAt', label: 'Created', type: 'date' },
 * ];
 * 
 * <EntityView entity={user} fields={fields} mode="detail" />
 * ```
 */
export function EntityView<T extends BaseEntity = BaseEntity>({
  entity,
  fields,
  groups,
  mode = 'detail',
  showMetadata = true,
  tabs,
  titleField,
  subtitleField,
  imageField,
  loading = false,
  error,
  className = '',
  onCopy,
  actions,
  actionContext,
  onActionComplete,
}: EntityViewProps<T>): React.ReactElement {
  const [state, setState] = useState<ViewState>({
    activeTab: tabs?.[0]?.id,
    collapsedGroups: new Set<string>(),
  });

  /**
   * Process actions - convert Action array to React nodes or pass through
   */
  const processedActions = React.useMemo(() => {
    if (!actions) return undefined;
    
    // If actions is already a React node, return as-is
    if (React.isValidElement(actions) || typeof actions === 'string' || typeof actions === 'number') {
      return actions;
    }
    
    // If actions is an array of Action objects, render with EntityActions
    if (Array.isArray(actions) && actions.length > 0 && 'id' in actions[0]) {
      return (
        <EntityActions<T>
          actions={actions as Action<T>[]}
          entity={entity}
          context={actionContext}
          mode="buttons"
          position="row"
          onActionComplete={(actionId) => onActionComplete?.(actionId)}
        />
      );
    }
    
    return undefined;
  }, [actions, entity, actionContext, onActionComplete]);

  /**
   * Toggle group collapse
   */
  const toggleGroup = useCallback((groupId: string) => {
    setState(prev => {
      const collapsed = new Set(prev.collapsedGroups);
      if (collapsed.has(groupId)) {
        collapsed.delete(groupId);
      } else {
        collapsed.add(groupId);
      }
      return { ...prev, collapsedGroups: collapsed };
    });
  }, []);

  /**
   * Handle copy to clipboard
   */
  const handleCopy = useCallback(async (field: keyof T | string, value: unknown) => {
    const text = String(value);
    const success = await copyToClipboard(text);

    if (success) {
      setState(prev => ({ ...prev, copiedField: String(field) }));
      setTimeout(() => {
        setState(prev => ({ ...prev, copiedField: undefined }));
      }, 2000);

      onCopy?.(field, value);
    }
  }, [onCopy]);

  // Loading state with skeleton
  if (loading) {
    return (
      <div className={className}>
        <ViewSkeleton mode={mode === 'detail' ? 'detail' : mode === 'card' ? 'card' : mode === 'profile' ? 'profile' : 'detail'} groupCount={groups?.length || 3} />
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-destructive/10 border border-destructive/20 rounded-lg p-6 ${className}`}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive mb-1">Error Loading Data</h3>
            <p className="text-sm text-destructive/80">{errorMessage}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Get visible fields
  const visibleFields = sortFields(getVisibleFields(fields, entity));

  // Render based on mode
  switch (mode) {
    case 'card':
      return <CardView entity={entity} fields={visibleFields} titleField={titleField} subtitleField={subtitleField} imageField={imageField} actions={processedActions} className={className} />;

    case 'summary':
      return <SummaryView entity={entity} fields={getSummaryFields(visibleFields)} className={className} />;

    case 'timeline':
      return <TimelineView entity={entity} fields={visibleFields} showMetadata={showMetadata} className={className} />;

    case 'compact':
      return <CompactView entity={entity} fields={visibleFields} titleField={titleField} className={className} onCopy={handleCopy} copiedField={state.copiedField} />;

    case 'profile':
      return <ProfileView entity={entity} fields={visibleFields} groups={groups} titleField={titleField} subtitleField={subtitleField} imageField={imageField} actions={processedActions} className={className} state={state} toggleGroup={toggleGroup} onCopy={handleCopy} copiedField={state.copiedField} />;

    case 'split':
      return <SplitView entity={entity} fields={visibleFields} groups={groups} titleField={titleField} subtitleField={subtitleField} className={className} state={state} toggleGroup={toggleGroup} onCopy={handleCopy} copiedField={state.copiedField} />;

    case 'table':
      return <TableView entity={entity} fields={visibleFields} groups={groups} className={className} state={state} toggleGroup={toggleGroup} onCopy={handleCopy} copiedField={state.copiedField} />;

    case 'detail':
    default:
      return (
        <DetailView
          entity={entity}
          fields={visibleFields}
          groups={groups}
          state={state}
          tabs={tabs}
          showMetadata={showMetadata}
          titleField={titleField}
          actions={processedActions}
          className={className}
          onToggleGroup={toggleGroup}
          onCopy={handleCopy}
          onTabChange={(tabId: string) => setState(prev => ({ ...prev, activeTab: tabId }))}
          copiedField={state.copiedField}
        />
      );
  }
}

// Internal props used by the various sub-views
type InternalViewProps<T extends BaseEntity> = Omit<EntityViewProps<T>, 'actions'> & {
  state?: ViewState;
  /** Backwards-compatible aliases: some call sites use toggleGroup, others use onToggleGroup */
  toggleGroup?: (groupId: string) => void;
  onToggleGroup?: (groupId: string) => void;
  onTabChange?: (tabId: string) => void;
  copiedField?: string;
  /** Actions as processed React nodes only (not Action array) */
  actions?: React.ReactNode;
};

/**
 * Detail View (default mode)
 */
function DetailView<T extends BaseEntity>({
  entity,
  fields,
  groups,
  state,
  tabs,
  showMetadata,
  titleField,
  actions,
  className,
  onToggleGroup,
  onCopy,
  onTabChange,
  copiedField,
}: InternalViewProps<T>) {
  const title = getEntityTitle(entity, titleField);
  const groupedFields = groupFields(fields, groups);
  const sortedGroups = groups ? sortGroups(groups) : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`space-y-4 sm:space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 sm:pb-4 border-b">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground flex-1">{title}</h2>
        {actions && <div className="flex flex-wrap gap-2 justify-end flex-shrink-0">{actions}</div>}
      </div>

      {/* Main content - only show if no tabs, otherwise content goes in tabs */}
      {!tabs || tabs.length === 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Ungrouped fields */}
          {groupedFields.get(null) && (
            <div className="space-y-2 sm:space-y-3">
              {groupedFields.get(null)!.map(field => (
                <FieldRow key={String(field.key)} field={field} value={getFieldValue(entity, field.key)} entity={entity} onCopy={onCopy} copiedField={copiedField} />
              ))}
            </div>
          )}

          {/* Grouped fields */}
          {sortedGroups.map((group: FieldGroup) => {
            const groupFields = groupedFields.get(group.id);
            if (!groupFields || groupFields.length === 0) return null;

            const isCollapsed = state?.collapsedGroups?.has(group.id) ?? false;

            return (
              <div key={group.id} className="border rounded-lg overflow-hidden">
                <div
                  className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/50 transition-colors ${group.collapsible ? 'cursor-pointer hover:bg-muted' : ''
                    }`}
                  onClick={() => group.collapsible && onToggleGroup?.(group.id)}
                  {...(group.collapsible ? { role: 'button' as const, 'aria-expanded': (!isCollapsed ? 'true' : 'false') as 'true' | 'false' } : {})}
                >

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{renderIcon(group?.icon)} {group.label}</h3>
                    {group.description && <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>}
                  </div>
                  {group.collapsible && (
                    <svg
                      className={`w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'
                        }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 bg-card">
                    {groupFields.map(field => (
                      <FieldRow key={String(field.key)} field={field} value={getFieldValue(entity, field.key)} entity={entity} onCopy={onCopy} copiedField={copiedField} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Metadata */}
          {showMetadata && (
            <div className="border rounded-lg overflow-hidden">
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/50">
                <h3 className="text-sm font-semibold text-foreground">Metadata</h3>
              </div>
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 bg-card">
                {getMetadataFields(entity).map(({ label, value }) => (
                  <div key={label} className="flex flex-col sm:flex-row items-start">
                    <div className="w-full sm:w-1/3 text-xs sm:text-sm font-medium text-muted-foreground mb-0.5 sm:mb-0">{label}</div>
                    <div className="w-full sm:w-2/3 text-xs sm:text-sm text-foreground">{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="border-b bg-muted/50 overflow-x-auto flex min-w-max" role="tablist">
            {tabs.map((tab: ViewTab<T>) => {
              const isSelected = state?.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${isSelected
                    ? 'border-primary text-primary bg-background'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  onClick={() => onTabChange?.(tab.id)}
                  role="tab"
                  {...(isSelected ? { 'aria-selected': 'true' } : {})}
                  id={`tab-${tab.id}`}
                  aria-controls={`tabpanel-${tab.id}`}
                >
                  {tab.icon && <span className="mr-2">{tab.icon}</span>}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="ml-2 px-1.5 sm:px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                      {typeof tab.badge === 'function' ? tab.badge(entity) : tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="p-3 sm:p-4 bg-card">
            {tabs.map((tab: ViewTab<T>) => {
              if (tab.id !== state?.activeTab) return null;

              // Auto-generate content from groups if tab.content is not provided but tab.id matches a group.id
              let tabContent: React.ReactNode = null;
              if (tab.content) {
                const TabContent = tab.content as React.ComponentType<{ entity: T }> | React.ReactNode;
                tabContent = typeof TabContent === 'function' ? (() => {
                  const Component = TabContent as React.ComponentType<{ entity: T }>;
                  return <Component entity={entity} />;
                })() : TabContent;
              } else {
                // Try to find a matching group and render its fields
                const matchingGroup = groups?.find(g => g.id === tab.id);
                if (matchingGroup) {
                  const groupFields = groupedFields.get(matchingGroup.id);
                  if (groupFields && groupFields.length > 0) {
                    tabContent = (
                      <div className="space-y-2 sm:space-y-3">
                        {groupFields.map(field => (
                          <FieldRow key={String(field.key)} field={field} value={getFieldValue(entity, field.key)} entity={entity} onCopy={onCopy} copiedField={copiedField} />
                        ))}
                      </div>
                    );
                  }
                }
              }

              return (
                <div key={tab.id} role="tabpanel" id={`tabpanel-${tab.id}`} aria-labelledby={`tab-${tab.id}`}>
                  {tabContent}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Field Row Component
 */
function FieldRow<T extends BaseEntity>({ field, entity, onCopy, copiedField }: FieldRenderProps<T> & { copiedField?: string }) {
  const value = getFieldValue(entity, field.key);
  const renderedValue = renderField(field, entity);

  return (
    <div className="flex flex-col sm:flex-row items-start py-1.5 sm:py-2 gap-1 sm:gap-0">
      <div className="w-full sm:w-1/3 sm:pr-4">
        <div className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
          {field.label}
          {field.helpText && (
            <span
              className="inline-flex items-center justify-center w-3.5 h-3.5 text-xs rounded-full bg-muted text-muted-foreground cursor-help"
              title={field.helpText}
              aria-label={field.helpText}
            >
              ?
            </span>
          )}
        </div>
      </div>
      <div className="w-full sm:w-2/3 flex items-start gap-2">
        <div className="flex-1 text-xs sm:text-sm text-foreground break-words">
          {renderedValue}
        </div>
        {field.copyable && (
          <button
            className={`flex-shrink-0 p-2 sm:p-2 rounded-md transition-all min-h-[40px] min-w-[40px] flex items-center justify-center ${copiedField === String(field.key)
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary'
              }`}
            onClick={() => onCopy?.(field.key, value)}
            title={copiedField === String(field.key) ? 'Copied!' : 'Copy to clipboard'}
            aria-label={copiedField === String(field.key) ? 'Copied!' : 'Copy to clipboard'}
          >
            {copiedField === String(field.key) ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Card View
 */
function CardView<T extends BaseEntity>({ entity, fields, titleField, subtitleField, imageField, actions, className }: InternalViewProps<T>) {
  const title = getEntityTitle(entity, titleField);
  const subtitle = getEntitySubtitle(entity, subtitleField);
  const image = getEntityImage(entity, imageField);

  return (
    <div className={`bg-card rounded-lg border shadow-sm overflow-hidden ${className}`}>
      {image && (
        <div className="aspect-video w-full overflow-hidden bg-muted relative">
          <Image
            src={String(image)}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: 'cover' }}
            className="w-full h-full"
          />
        </div>
      )}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          {fields.slice(0, 5).map((field: ViewField<T>) => (
            <div key={String(field.key)} className="flex flex-col sm:flex-row items-start gap-0.5 sm:gap-0">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground w-full sm:w-1/3">{field.label}:</span>
              <span className="text-xs sm:text-sm text-foreground w-full sm:w-2/3 break-words">{renderField(field, entity)}</span>
            </div>
          ))}
        </div>
        {actions && <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t">{actions}</div>}
      </div>
    </div>
  );
}

/**
 * Summary View
 */
function SummaryView<T extends BaseEntity>({ entity, fields, className }: InternalViewProps<T>) {
  return (
    <div className={`bg-card rounded-lg border shadow-sm p-3 sm:p-4 space-y-1.5 sm:space-y-2 ${className}`}>
      {fields.map((field: ViewField<T>) => (
        <div key={String(field.key)} className="flex flex-col sm:flex-row items-start py-0.5 sm:py-1 gap-0.5 sm:gap-0">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground w-full sm:w-1/3">{field.label}:</span>
          <span className="text-xs sm:text-sm text-foreground w-full sm:w-2/3 break-words">{renderField(field, entity)}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Timeline View
 */
function TimelineView<T extends BaseEntity>({ entity, fields, showMetadata, className }: InternalViewProps<T>) {
  const events: Array<ViewField<T> | { key: string; label: string; type?: ViewField<T>['type']; value?: unknown }> = [...fields];
  if (showMetadata) {
    getMetadataFields(entity).forEach(({ label, value }) => {
      events.push({ key: label, label, type: 'date', value });
    });
  }

  return (
    <div className={`relative space-y-4 sm:space-y-6 ${className}`}>
      <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-0.5 bg-border"></div>
      {events.map((field) => (
        <div key={String(field.key)} className="relative pl-8 sm:pl-12">
          <div className="absolute left-1.5 sm:left-2.5 top-2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary border-2 border-background shadow-sm"></div>
          <div className="bg-card rounded-lg border shadow-sm p-3 sm:p-4">
            <div className="text-xs sm:text-sm font-medium text-foreground">{field.label}</div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">{renderField(field, entity)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Compact View - Minimal space usage
 */
function CompactView<T extends BaseEntity>({ entity, fields, titleField, className }: InternalViewProps<T>) {
  const title = getEntityTitle(entity, titleField);

  return (
    <div className={`bg-card rounded-lg border p-3 sm:p-4 ${className}`}>
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
        {fields.map((field: ViewField<T>) => (
          <div key={String(field.key)} className="flex items-start gap-1.5 text-xs sm:text-sm">
            <span className="font-medium text-muted-foreground whitespace-nowrap">{field.label}:</span>
            <span className="text-foreground truncate flex-1">{renderField(field, entity)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Profile View - User-centric layout with avatar
 */
function ProfileView<T extends BaseEntity>({ entity, fields, groups, titleField, subtitleField, imageField, actions, className, state, toggleGroup, onCopy, copiedField }: InternalViewProps<T>) {
  const title = getEntityTitle(entity, titleField);
  const subtitle = getEntitySubtitle(entity, subtitleField);
  const image = getEntityImage(entity, imageField);
  const groupedFields = groupFields(fields, groups);
  const sortedGroups = groups ? sortGroups(groups) : [];

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Profile Header */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={title}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-background shadow-lg object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-background shadow-lg bg-muted flex items-center justify-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
              {actions && <div className="flex gap-2 mt-3 justify-center sm:justify-start">{actions}</div>}
            </div>
          </div>
        </div>

        {/* Quick Info */}
        {groupedFields.get(null) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 border-t">
            {groupedFields.get(null)!.slice(0, 6).map(field => {
              return (
                <div key={String(field.key)} className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">{field.label}</span>
                  <span className="text-sm font-medium text-foreground mt-0.5 truncate">{renderField(field, entity)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grouped Information */}
      {sortedGroups.map((group: FieldGroup) => {
        const groupFields = groupedFields.get(group.id);
        if (!groupFields || groupFields.length === 0) return null;

        const isCollapsed = state?.collapsedGroups?.has(group.id) ?? false;

        return (
          <div key={group.id} className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div
              className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/50 transition-colors ${group.collapsible ? 'cursor-pointer hover:bg-muted' : ''
                }`}
              onClick={() => group.collapsible && toggleGroup?.(group.id)}
              {...(group.collapsible ? { role: 'button' as const, 'aria-expanded': (!isCollapsed ? 'true' : 'false') as 'true' | 'false', tabIndex: 0 } : {})}
            >
              <div>
                <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
                {group.description && <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>}
              </div>
              {group.collapsible && (
                <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
            {!isCollapsed && (
              <div className="p-3 sm:p-4 space-y-2">
                {groupFields.map(field => (
                  <FieldRow key={String(field.key)} field={field} value={getFieldValue(entity, field.key)} entity={entity} onCopy={onCopy} copiedField={copiedField} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Split View - Two column layout
 */
function SplitView<T extends BaseEntity>({ entity, fields, groups, titleField, subtitleField, className, state, toggleGroup, onCopy, copiedField }: InternalViewProps<T>) {
  const title = getEntityTitle(entity, titleField);
  const subtitle = getEntitySubtitle(entity, subtitleField);
  const groupedFields = groupFields(fields, groups);
  const sortedGroups = groups ? sortGroups(groups) : [];

  // Split groups into two columns
  const midpoint = Math.ceil(sortedGroups.length / 2);
  const leftGroups = sortedGroups.slice(0, midpoint);
  const rightGroups = sortedGroups.slice(midpoint);

  const renderGroupContent = (group: FieldGroup) => {
    const groupFields = groupedFields.get(group.id);
    if (!groupFields || groupFields.length === 0) return null;

    const isCollapsed = state?.collapsedGroups?.has(group.id) ?? false;

    return (
      <div key={group.id} className="border rounded-lg overflow-hidden">
        <div
          className={`flex items-center justify-between px-3 py-2.5 bg-muted/50 transition-colors ${group.collapsible ? 'cursor-pointer hover:bg-muted' : ''
            }`}
          onClick={() => group.collapsible && toggleGroup?.(group.id)}
        >
          <h4 className="text-sm font-semibold text-foreground">{group.label}</h4>
          {group.collapsible && (
            <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        {!isCollapsed && (
          <div className="p-3 space-y-2 bg-card">
            {groupFields.map(field => (
              <FieldRow key={String(field.key)} field={field} value={getFieldValue(entity, field.key)} entity={entity} onCopy={onCopy} copiedField={copiedField} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="bg-card rounded-lg border p-4">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          {leftGroups.map(renderGroupContent)}
        </div>
        <div className="space-y-4">
          {rightGroups.map(renderGroupContent)}
        </div>
      </div>
    </div>
  );
}

/**
 * Table View - Data in table format
 */
function TableView<T extends BaseEntity>({ entity, fields, groups, className, state, toggleGroup, onCopy, copiedField }: InternalViewProps<T>) {
  const groupedFields = groupFields(fields, groups);
  const sortedGroups = groups ? sortGroups(groups) : [];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Ungrouped fields */}
      {groupedFields.get(null) && (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <tbody className="divide-y divide-border">
                {groupedFields.get(null)!.map(field => {
                  const value = getFieldValue(entity, field.key);
                  return (
                    <tr key={String(field.key)} className="hover:bg-muted/50 transition-colors">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground w-1/3">
                        {field.label}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-foreground">
                        <div className="flex items-center justify-between gap-2">
                          <span className="break-words">{renderField(field, entity)}</span>
                          {field.copyable && (
                            <button
                              className={`flex-shrink-0 p-1 rounded transition-colors ${copiedField === String(field.key) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                              onClick={() => onCopy?.(field.key, value)}
                              title="Copy"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {copiedField === String(field.key) ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                )}
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grouped fields */}
      {sortedGroups.map((group: FieldGroup) => {
        const groupFields = groupedFields.get(group.id);
        if (!groupFields || groupFields.length === 0) return null;

        const isCollapsed = state?.collapsedGroups?.has(group.id) ?? false;

        return (
          <div key={group.id} className="bg-card rounded-lg border overflow-hidden">
            <div
              className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/50 transition-colors ${group.collapsible ? 'cursor-pointer hover:bg-muted' : ''
                }`}
              onClick={() => group.collapsible && toggleGroup?.(group.id)}
            >
              <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
              {group.collapsible && (
                <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <tbody className="divide-y divide-border">
                    {groupFields.map(field => {
                      const value = getFieldValue(entity, field.key);
                      return (
                        <tr key={String(field.key)} className="hover:bg-muted/50 transition-colors">
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground w-1/3">
                            {field.label}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-foreground">
                            <div className="flex items-center justify-between gap-2">
                              <span className="break-words">{renderField(field, entity)}</span>
                              {field.copyable && (
                                <button
                                  className={`flex-shrink-0 p-1 rounded transition-colors ${copiedField === String(field.key) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                  onClick={() => onCopy?.(field.key, value)}
                                  title="Copy"
                                >
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {copiedField === String(field.key) ? (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    ) : (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    )}
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default EntityView;
