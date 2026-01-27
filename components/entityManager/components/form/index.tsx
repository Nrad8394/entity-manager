/**
 * EntityForm Component
 * 
 * Standalone component for creating/editing entities with comprehensive form features.
 * Works independently without orchestrator or context.
 */

'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Check, ChevronsUpDown, AlertTriangle } from 'lucide-react';
import { BaseEntity } from '../../primitives/types';
import {
  EntityFormProps,
  FormState,
  FormField,
  FieldRenderProps,
  FieldOption,
} from './types';
import {
  getInitialValues,
  validateField,
  validateForm,
  isFieldVisible,
  isFieldDisabled,
  isFieldRequired,
  sortFields,
  groupFieldsBySections,
  groupFieldsByTabs,
  groupFieldsBySteps,
  sortSections,
  sortTabs,
  sortSteps,
  transformValues,
  hasErrors,
  getFieldOptions,
  formatFieldValue,
} from './utils';
import { FileUpload } from './fields/FileUpload';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

/**
 * EntityForm Component
 * 
 * @example
 * ```tsx
 * const fields: FormField<User>[] = [
 *   { name: 'name', label: 'Name', type: 'text', required: true },
 *   { name: 'email', label: 'Email', type: 'email', required: true },
 *   { name: 'role', label: 'Role', type: 'select', options: roleOptions },
 * ];
 * 
 * <EntityForm
 *   fields={fields}
 *   mode="create"
 *   onSubmit={async (values) => {
 *     await createUser(values);
 *   }}
 * />
 * ```
 */
export function EntityForm<T extends BaseEntity = BaseEntity>({
  fields,
  mode = 'create',
  layout = 'vertical',
  initialValues,
  entity,
  sections,
  tabs,
  steps,
  onSubmit,
  onCancel,
  onChange,
  onValidate,
  submitText = mode === 'create' ? 'Create' : 'Save',
  cancelText = 'Cancel',
  showCancel = true,
  showReset = false,
  resetOnSubmit = false,
  loading = false,
  disabled = false,
  className = '',
  validateOnChange = false,
  validateOnBlur = true,
}: EntityFormProps<T>): React.ReactElement {
  const [state, setState] = useState<FormState<T>>(() => {
    const initialVals = getInitialValues(fields, entity, initialValues);
    return {
      values: initialVals,
      errors: {},
      touched: new Set<string>(),
      dirty: new Set<string>(),
      submitting: false,
      submitError: undefined,
      currentStep: 0,
      currentTab: tabs?.[0]?.id || sections?.[0]?.id,
      currentTabIndex: 0,
      collapsedSections: new Set<string>(),
    };
  });

  // Store onChange in a ref to avoid infinite loops from prop changes
  const onChangeRef = useRef(onChange);
  
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  /**
   * Set field value
   */
  const setFieldValue = useCallback((fieldName: string, value: unknown) => {
    setState(prev => {
      const newValues = { ...prev.values, [fieldName]: value };
      const newDirty = new Set(prev.dirty);
      newDirty.add(fieldName);

      // Validate on change if enabled
      if (validateOnChange) {
        const field = fields.find(f => String(f.name) === fieldName);
        if (field) {
          validateField(value, field, newValues as Record<string, unknown>).then(error => {
            setState(s => ({
              ...s,
              errors: error
                ? { ...s.errors, [fieldName]: error }
                : Object.fromEntries(Object.entries(s.errors).filter(([k]) => k !== fieldName)),
            }));
          });
        }
      }

      // Notify parent immediately with new values (use setTimeout to defer until after setState completes)
      setTimeout(() => {
        onChangeRef.current?.(newValues as T);
      }, 0);

      return {
        ...prev,
        values: newValues,
        dirty: newDirty,
      };
    });
  }, [validateOnChange, fields]);

  /**
   * Set field touched
   */
  const setFieldTouched = useCallback((fieldName: string) => {
    setState(prev => {
      const newTouched = new Set(prev.touched);
      newTouched.add(fieldName);

      // Validate on blur if enabled
      if (validateOnBlur) {
        const field = fields.find(f => String(f.name) === fieldName);
        if (field) {
          const value = prev.values[field.name as keyof T];
          validateField(value, field, prev.values as Record<string, unknown>).then(error => {
            setState(s => ({
              ...s,
              errors: error
                ? { ...s.errors, [fieldName]: error }
                : Object.fromEntries(Object.entries(s.errors).filter(([k]) => k !== fieldName)),
            }));
          });
        }
      }

      return { ...prev, touched: newTouched };
    });
  }, [validateOnBlur, fields]);

  // Sync form values when `entity` or `initialValues` props change (useful when entity is loaded asynchronously)
  useEffect(() => {
    // Only update when an entity is provided (edit mode) or when explicit initialValues change.
    if (!entity && !initialValues) return;

    const newVals = getInitialValues(fields, entity, initialValues);
    // Avoid updating state if values are identical to prevent unnecessary re-renders
    try {
      const prevVals = state.values as Record<string, unknown>;
      const prevJson = JSON.stringify(prevVals || {});
      const newJson = JSON.stringify(newVals || {});
      if (prevJson === newJson) return;
    } catch {
      // If serialization fails for some reason, fall back to always updating
    }

    setState(prev => ({
      ...prev,
      values: newVals,
      // reset errors/touched/dirtiness when loading new entity to avoid showing stale validation
      errors: {},
      touched: new Set<string>(),
      dirty: new Set<string>(),
    }));
  }, [entity, initialValues, fields]);

  /**
   * Validate entire form
   */
  const validateFormAsync = useCallback(async (): Promise<boolean> => {
    const visibleFields = fields.filter(f => isFieldVisible(f, state.values));
    let errors = await validateForm(state.values, visibleFields);

    // Run custom validation
    if (onValidate) {
      const customErrors = await onValidate(state.values);
      errors = { ...errors, ...customErrors };
    }

    setState(prev => ({ ...prev, errors }));
    return !hasErrors(errors);
  }, [fields, state.values, onValidate]);

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = new Set(fields.map(f => String(f.name)));
    setState(prev => ({ ...prev, touched: allTouched, submitError: undefined }));

    // Validate form
    const isValid = await validateFormAsync();
    if (!isValid) {
      // For tabs layout, switch to the tab with errors
      if (layout === 'tabs' && sections && onValidate) {
        const allErrors = await onValidate(state.values);
        if (allErrors && Object.keys(allErrors).length > 0) {
          const sortedSections = sortSections(sections);
          const tabWithErrors = sortedSections.findIndex(section =>
            section.fields.some(fieldName => allErrors[fieldName])
          );
          if (tabWithErrors !== -1) {
            setState(prev => ({ ...prev, currentTabIndex: tabWithErrors }));
          }
        }
      }
      return;
    }

    try {
      setState(prev => ({ ...prev, submitting: true, submitError: undefined }));

      // Transform values
      const transformedValues = transformValues(state.values, fields);

      await onSubmit(transformedValues);

      // Reset form if resetOnSubmit is true
      if (resetOnSubmit) {
        const resetValues = getInitialValues(fields, undefined, initialValues);
        setState(prev => ({
          ...prev,
          values: resetValues,
          errors: {},
          touched: new Set(),
          dirty: new Set(),
          submitting: false,
          submitError: undefined,
        }));
      } else {
        setState(prev => ({ ...prev, submitting: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        submitting: false,
        submitError: error instanceof Error ? error.message : 'An error occurred during submission'
      }));
    }
  }, [fields, validateFormAsync, onSubmit, resetOnSubmit, initialValues, layout, sections, onValidate]);

  /**
   * Handle reset
   */
  const handleReset = useCallback(() => {
    const resetValues = getInitialValues(fields, entity, initialValues);
    setState(prev => ({
      ...prev,
      values: resetValues,
      errors: {},
      touched: new Set(),
      dirty: new Set(),
    }));
  }, [fields, entity, initialValues]);

  /**
   * Toggle section collapse
   */
  const toggleSection = useCallback((sectionId: string) => {
    setState(prev => {
      const collapsed = new Set(prev.collapsedSections);
      if (collapsed.has(sectionId)) {
        collapsed.delete(sectionId);
      } else {
        collapsed.add(sectionId);
      }
      return { ...prev, collapsedSections: collapsed };
    });
  }, []);

  // Render based on layout
  const renderLayout = () => {
    switch (layout) {
      case 'tabs':
        // Use tabs if provided, otherwise convert sections to tabs
        return tabs ? <TabsLayout /> : sections ? <SectionsAsTabsLayout /> : <VerticalLayout />;

      case 'wizard':
        return steps ? <WizardLayout /> : <VerticalLayout />;

      case 'grid':
        return <GridLayout />;

      case 'horizontal':
        return <HorizontalLayout />;

      case 'vertical':
      default:
        return <VerticalLayout />;
    }
  };

  /**
   * Vertical Layout
   */
  const VerticalLayout = () => {
    const visibleFields = sortFields(fields.filter(f => isFieldVisible(f, state.values)));
    const groupedFields = groupFieldsBySections(visibleFields, sections);
    const sortedSections = sections ? sortSections(sections) : [];

    return (
      <div className="space-y-4">
        {/* Ungrouped fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupedFields.get(null)?.map(field => {
            // Parse width to determine grid column span
            let colSpan = 'col-span-1';
            if (field.width) {
              const widthStr = String(field.width);
              if (widthStr.includes('%')) {
                const percent = parseInt(widthStr);
                if (percent >= 50) colSpan = 'md:col-span-2';
              }
            }
            return (
              <div key={String(field.name)} className={colSpan}>
                <FormFieldComponent field={field} />
              </div>
            );
          })}
        </div>

        {/* Sectioned fields */}
        {sortedSections.map(section => {
          const sectionFields = groupedFields.get(section.id) || [];
          if (sectionFields.length === 0) return null;

          const isCollapsed = state.collapsedSections.has(section.id);

          return (
            <div key={section.id} className="border rounded-lg overflow-hidden bg-card shadow-sm">
              <div
                className={`flex items-center justify-between px-4 py-3 bg-muted/30 border-b ${section.collapsible ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
                onClick={() => section.collapsible && toggleSection(section.id)}
                onKeyDown={(e) => section.collapsible && (e.key === 'Enter' || e.key === ' ') && toggleSection(section.id)}
                tabIndex={section.collapsible ? 0 : undefined}
              >
                <div className="flex items-center gap-2 flex-1">
                  {section.icon && <span className="text-muted-foreground">{section.icon}</span>}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{section.label}</h3>
                    {section.description && <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>}
                  </div>
                </div>
                {section.collapsible && (
                  <svg
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
              {!isCollapsed && (
                <div className="p-4 bg-card">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sectionFields.map(field => {
                      // Parse width to determine grid column span
                      let colSpan = 'col-span-1';
                      if (field.width) {
                        const widthStr = String(field.width);
                        if (widthStr.includes('%')) {
                          const percent = parseInt(widthStr);
                          if (percent >= 50) colSpan = 'md:col-span-2';
                        }
                      }
                      return (
                        <div key={String(field.name)} className={colSpan}>
                          <FormFieldComponent field={field} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Horizontal Layout
   */
  const HorizontalLayout = () => {
    const visibleFields = sortFields(fields.filter(f => isFieldVisible(f, state.values)));

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleFields.map(field => {
          // Parse width to determine grid column span
          let colSpan = 'col-span-1';
          if (field.width) {
            const widthStr = String(field.width);
            if (widthStr.includes('%')) {
              const percent = parseInt(widthStr);
              if (percent >= 75) colSpan = 'sm:col-span-2 lg:col-span-3 xl:col-span-4';
              else if (percent >= 50) colSpan = 'sm:col-span-2';
              else if (percent >= 25) colSpan = 'sm:col-span-1';
            }
          }
          return (
            <div key={String(field.name)} className={colSpan}>
              <FormFieldComponent field={field} />
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Grid Layout
   */
  const GridLayout = () => {
    const visibleFields = sortFields(fields.filter(f => isFieldVisible(f, state.values)));

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleFields.map(field => {
          // Parse width to determine grid column span
          let colSpan = 'col-span-1';
          if (field.width) {
            const widthStr = String(field.width);
            if (widthStr.includes('%')) {
              const percent = parseInt(widthStr);
              if (percent >= 75) colSpan = 'md:col-span-2 lg:col-span-4';
              else if (percent >= 50) colSpan = 'md:col-span-2';
              else if (percent >= 25) colSpan = 'md:col-span-1';
            } else {
              const numWidth = parseInt(widthStr);
              colSpan = `md:col-span-${Math.min(numWidth, 2)} lg:col-span-${Math.min(numWidth, 4)}`;
            }
          }

          return (
            <div key={String(field.name)} className={colSpan}>
              <FormFieldComponent field={field} />
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Tabs Layout
   */
  const TabsLayout = () => {
    if (!tabs) return null;

    const sortedTabs = sortTabs(tabs);
    const groupedFields = groupFieldsByTabs(fields, sortedTabs);

    // Compute tab error status directly
    const tabErrorStatus: Record<string, boolean> = {};
    sortedTabs.forEach(tab => {
      const tabFields = groupedFields.get(tab.id) || [];
      const hasTabErrors = tabFields.some(field => state.errors[String(field.name)]);
      tabErrorStatus[tab.id] = hasTabErrors;
    });

    return (
      <div className="space-y-4">
        <div className="border-b border-border overflow-x-auto" role="tablist">
          <div className="flex space-x-1 min-w-max px-1">
            {sortedTabs.map(tab => {
              const hasErrors = tabErrorStatus[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition-all whitespace-nowrap border-b-2 relative ${state.currentTab === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
                    } ${hasErrors ? 'text-destructive' : ''}`}
                  onClick={() => setState(prev => ({ ...prev, currentTab: tab.id }))}
                  role="tab"
                >
                  {tab.icon && <span className="text-base">{tab.icon}</span>}
                  {tab.label}
                  {hasErrors && (
                    <AlertTriangle className="w-4 h-4 text-destructive ml-1 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="min-h-[300px]">
          {sortedTabs.map(tab => {
            if (tab.id !== state.currentTab) return null;

            const tabFields = groupedFields.get(tab.id) || [];
            return (
              <div key={tab.id} role="tabpanel">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tabFields.map(field => {
                    // Parse width to determine grid column span
                    let colSpan = 'col-span-1';
                    if (field.width) {
                      const widthStr = String(field.width);
                      if (widthStr.includes('%')) {
                        const percent = parseInt(widthStr);
                        if (percent >= 50) colSpan = 'md:col-span-2';
                      }
                    }
                    return (
                      <div key={String(field.name)} className={colSpan}>
                        <FormFieldComponent field={field} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Sections as Tabs Layout
   * Uses sections prop to render as tabs
   */
  const SectionsAsTabsLayout = () => {
    if (!sections) return null;

    const sortedSections = sortSections(sections);
    const visibleFields = fields.filter(f => isFieldVisible(f, state.values));
    const groupedFields = groupFieldsBySections(visibleFields, sections);

    // If there are ungrouped fields, add them to the first section
    const ungroupedFields = groupedFields.get(null) || [];
    if (ungroupedFields.length > 0 && sortedSections.length > 0) {
      const firstSectionId = sortedSections[0].id;
      const firstSectionFields = groupedFields.get(firstSectionId) || [];
      groupedFields.set(firstSectionId, [...firstSectionFields, ...ungroupedFields]);
      groupedFields.delete(null);
    }

    const currentTabIndex = state.currentTabIndex || 0;

    const goToNextTab = async () => {
      // clear error state
      setState(prev => ({ ...prev, errors: {} }));
      // Validate fields in current tab
      const currentSection = sortedSections[currentTabIndex];
      const tabFields = groupedFields.get(currentSection.id) || [];
      const tabErrors = await validateForm(state.values, tabFields);

      if (hasErrors(tabErrors)) {
        setState(prev => ({ ...prev, errors: { ...prev.errors, ...tabErrors } }));
        return;
      }

      if (currentTabIndex < sortedSections.length - 1) {
        setState(prev => ({ ...prev, currentTabIndex: currentTabIndex + 1 }));
      }
    };

    const goToPreviousTab = () => {
      if (currentTabIndex > 0) {
        setState(prev => ({ ...prev, currentTabIndex: currentTabIndex - 1 }));
      }
    };

    return (
      <div className="space-y-4">
        <div className="border-b border-border overflow-x-auto" role="tablist">
          <div className="flex space-x-1 min-w-max px-1">
            {sortedSections.map((section, index) => {
              const hasErrors = section.fields.some(fieldName => state.errors[fieldName]);
              return (
                <button
                  key={section.id}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition-all whitespace-nowrap border-b-2 ${index === currentTabIndex
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
                    } ${hasErrors ? 'text-destructive' : ''}`}
                  onClick={() => setState(prev => ({ ...prev, currentTabIndex: index }))}
                  role="tab"
                >
                  {hasErrors && <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />}
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="min-h-[300px]">
          {sortedSections.map((section, index) => {
            if (index !== currentTabIndex) return null;

            const sectionFields = groupedFields.get(section.id) || [];
            return (
              <div key={section.id} className="space-y-4" role="tabpanel">
                {section.description && (
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sectionFields.map(field => {
                    // Parse width to determine grid column span
                    let colSpan = 'col-span-1';
                    if (field.width) {
                      const widthStr = String(field.width);
                      if (widthStr.includes('%')) {
                        const percent = parseInt(widthStr);
                        if (percent >= 50) colSpan = 'md:col-span-2';
                      }
                    }
                    return (
                      <div key={String(field.name)} className={colSpan}>
                        <FormFieldComponent field={field} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <button
            type="button"
            onClick={goToPreviousTab}
            disabled={currentTabIndex === 0}
            className="px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-input rounded-md hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          {currentTabIndex < sortedSections.length - 1 ? (
            <button
              type="button"
              onClick={goToNextTab}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              {submitText}
            </button>
          )}
        </div>
      </div>
    );
  };

  /**
   * Wizard Layout
   */
  const WizardLayout = () => {
    if (!steps) return null;

    const sortedSteps = sortSteps(steps);
    const groupedFields = groupFieldsBySteps(fields, sortedSteps);
    const currentStepIndex = state.currentStep || 0;
    const currentStepData = sortedSteps[currentStepIndex];
    const stepFields = groupedFields.get(currentStepData.id) || [];

    const goToNextStep = async () => {
      // Validate fields in current step (including required fields)
      const stepErrors = await validateForm(state.values, stepFields);

      // Run custom step validation if provided
      let customErrors: Record<string, string> = {};
      if (currentStepData.validate) {
        customErrors = await currentStepData.validate(state.values as Record<string, unknown>);
      }

      // Combine all errors
      const allErrors = { ...stepErrors, ...customErrors };

      if (hasErrors(allErrors)) {
        setState(prev => ({ ...prev, errors: { ...prev.errors, ...allErrors } }));
        return;
      }

      if (currentStepIndex < sortedSteps.length - 1) {
        setState(prev => ({ ...prev, currentStep: currentStepIndex + 1 }));
      }
    };

    const goToPreviousStep = () => {
      if (currentStepIndex > 0) {
        setState(prev => ({ ...prev, currentStep: currentStepIndex - 1 }));
      }
    };

    return (
      <div className="space-y-6">
        {/* Step indicator */}
        <div className="relative">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {sortedSteps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1 min-w-0">
                <div className={`flex flex-col items-center flex-1 ${index > 0 ? 'ml-2' : ''}`}>
                  <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all ${index === currentStepIndex
                    ? 'border-primary bg-primary text-primary-foreground'
                    : index < currentStepIndex
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-muted-foreground/30 bg-background text-muted-foreground'
                    }`}>
                    <span className="text-sm font-semibold">{index + 1}</span>
                  </div>
                  <span className={`mt-2 text-xs sm:text-sm font-medium text-center line-clamp-2 ${index === currentStepIndex ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                    {step.label}
                  </span>
                </div>
                {index < sortedSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 sm:mx-2 ${index < currentStepIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[300px]">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">{currentStepData.label}</h3>
            {currentStepData.description && (
              <p className="text-sm text-muted-foreground mt-1">{currentStepData.description}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stepFields.map(field => {
              // Parse width to determine grid column span
              let colSpan = 'col-span-1';
              if (field.width) {
                const widthStr = String(field.width);
                if (widthStr.includes('%')) {
                  const percent = parseInt(widthStr);
                  if (percent >= 50) colSpan = 'md:col-span-2';
                }
              }
              return (
                <div key={String(field.name)} className={colSpan}>
                  <FormFieldComponent field={field} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-input rounded-md hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          {currentStepIndex < sortedSteps.length - 1 ? (
            <button
              type="button"
              onClick={goToNextStep}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              {submitText}
            </button>
          )}
        </div>
      </div>
    );
  };

  /**
   * Form Field Component
   */
  const FormFieldComponent = React.memo(({ field }: { field: FormField<T> }) => {
    const fieldName = String(field.name);
    const value = state.values[field.name as keyof T];
    const error = state.errors[fieldName];
    const touched = state.touched.has(fieldName);
    const fieldDisabled = disabled || loading || state.submitting || isFieldDisabled(field, state.values);

    const fieldProps: FieldRenderProps<T> = useMemo(() => ({
      field: {
        ...field,
        name: fieldName, // Ensure name is string
      } as FormField<T> & { name: string },
      value,
      error,
      touched,
      onChange: (newValue: unknown) => setFieldValue(fieldName, newValue),
      onBlur: () => setFieldTouched(fieldName),
      disabled: fieldDisabled,
      mode,
      validateOnChange,
      formValues: state.values,
    }), [field, value, error, touched, fieldDisabled, fieldName]);

    // Custom renderer
    if (field.render) {
      return <>{field.render(fieldProps)}</>;
    }

    // View mode
    if (mode === 'view') {
      return (
        <div className="form-field view-mode">
          <label>{field.label}</label>
          <div className="field-value">{formatFieldValue(value, field)}</div>
        </div>
      );
    }

    // Cast to a permissive generic to avoid incompatible 'field.name' key-type mismatch between generics
    return <DefaultFieldRenderer {...(fieldProps as unknown as FieldRenderProps<BaseEntity>)} />;
  });

  FormFieldComponent.displayName = 'FormFieldComponent';

  /**
   * Render
   */
  const isSubmitDisabled = disabled || loading || state.submitting;

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`} noValidate>
      {state.submitError && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md" role="alert">
          <p className="text-sm font-medium">{state.submitError}</p>
        </div>
      )}
      {renderLayout()}

      {layout !== 'tabs' && (
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={state.submitting}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-input rounded-md hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelText}
            </button>
          )}

          {showReset && (
            <button
              type="button"
              onClick={handleReset}
              disabled={state.submitting}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-input rounded-md hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {state.submitting && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {state.submitting ? 'Submitting...' : submitText}
          </button>
        </div>
      )}
    </form>
  );
}

/**
 * Default Field Renderer
 */
const DefaultFieldRenderer = React.memo(<T extends BaseEntity>({
  field,
  value,
  error,
  touched,
  onChange,
  onBlur,
  disabled,
  validateOnChange,
  formValues,
}: FieldRenderProps<T>) => {
  const [options, setOptions] = useState<Array<{ label: string; value: string | number | boolean; disabled?: boolean }>>([]);

  useEffect(() => {
    if ((field.type === 'select' && !field.searchable) || field.type === 'multiselect' || field.type === 'radio') {
      getFieldOptions(field, {} as Partial<T>, undefined).then(setOptions);
    }
  }, [field]);

  // State for searchable select
  const isSearchableSelect = field.type === 'select' && field.searchable;
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState<FieldOption[]>([]);
  const loadedInitialRef = useRef(false);

  // Debounce search query for searchable select
  useEffect(() => {
    if (isSearchableSelect) {
      const timer = setTimeout(() => {
        setDebouncedQuery(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSearchableSelect, searchQuery]);

  // Load options for searchable select
  useEffect(() => {
    if (isSearchableSelect && ((open && !loadedInitialRef.current) || debouncedQuery)) {
      const loadOptions = async () => {
        try {
          const opts = await getFieldOptions(field, formValues, debouncedQuery);
          // Filter options based on search query
          const filtered = debouncedQuery
            ? opts.filter(opt =>
              opt.label.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
              String(opt.value).toLowerCase().includes(debouncedQuery.toLowerCase())
            )
            : opts;
          setSearchOptions(filtered);
          if (!loadedInitialRef.current) loadedInitialRef.current = true;
        } catch {
          setSearchOptions([]);
        }
      };
      loadOptions();
    }
  }, [isSearchableSelect, open, debouncedQuery, field, formValues]);

  // State for relations
  const [relationOpen, setRelationOpen] = useState(false);
  const [relationSearch, setRelationSearch] = useState('');
  const [relationOptions, setRelationOptions] = useState<Record<string, unknown>[]>([]);
  const [relationLoading, setRelationLoading] = useState(false);
  const [relationError, setRelationError] = useState<string | null>(null);
  const relationLoadedRef = useRef(false);
  const [debouncedRelationSearch, setDebouncedRelationSearch] = useState('');

  // State for multi relations
  const [multiRelationOpen, setMultiRelationOpen] = useState(false);
  const [multiRelationSearch, setMultiRelationSearch] = useState('');
  const [multiRelationOptions, setMultiRelationOptions] = useState<Record<string, unknown>[]>([]);
  const [multiRelationLoading, setMultiRelationLoading] = useState(false);
  const [multiRelationError, setMultiRelationError] = useState<string | null>(null);
  const multiRelationLoadedRef = useRef(false);
  const [debouncedMultiRelationSearch, setDebouncedMultiRelationSearch] = useState('');
  // Local selected ids for multirelation to allow optimistic UI updates
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(() => {
    if (Array.isArray(value)) return value.map(v => String(v));
    if (typeof value === 'string') return value.includes(',') ? value.split(',').map(s => s.trim()).filter(Boolean) : (value ? [value] : []);
    if (value === null || value === undefined) return [];
    return [String(value)];
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [modalItems, setModalItems] = useState<Record<string, unknown>[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Debounce for relation search
  useEffect(() => {
    if (field.type === 'relation') {
      const timer = setTimeout(() => {
        setDebouncedRelationSearch(relationSearch);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [field.type, relationSearch]);

  // Debounce for multi relation search
  useEffect(() => {
    if (field.type === 'multirelation') {
      const timer = setTimeout(() => {
        setDebouncedMultiRelationSearch(multiRelationSearch);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [field.type, multiRelationSearch]);

  // Load initial options for relation if value exists
  useEffect(() => {
    if (field.type === 'relation' && field.relationConfig && value && !relationLoadedRef.current) {
      const loadInitialOptions = async () => {
        setRelationLoading(true);
        try {
          const cfg = field.relationConfig as NonNullable<typeof field.relationConfig>;
          const entities = await cfg.fetchOptions('');
          let opts = entities as unknown as Record<string, unknown>[];

          // If the currently selected value is not among the options, try to fetch it directly
          const selectedId = String(value);
          const found = opts.some(ent => String(ent[cfg.valueField]) === selectedId);
          if (!found) {
            if (cfg.fetchById) {
              const single = await cfg.fetchById(selectedId);
              if (single) opts = [single as unknown as Record<string, unknown>, ...opts];
            } else {
              // Fallback: try fetching via fetchOptions using the id as search term
              try {
                const bySearch = await cfg.fetchOptions(selectedId);
                if (Array.isArray(bySearch) && bySearch.length > 0) {
                  opts = [...(bySearch as unknown as Record<string, unknown>[]), ...opts];
                }
              } catch {
                // ignore
              }
            }
          }

          setRelationOptions(opts);
          relationLoadedRef.current = true;
        } catch (err) {
          setRelationError(err instanceof Error ? err.message : 'Failed to load options');
        } finally {
          setRelationLoading(false);
        }
      };
      loadInitialOptions();
    }
  }, [field, field.relationConfig, value]);

  // Load relation options when open or search changes
  useEffect(() => {
    if (field.type === 'relation' && field.relationConfig && ((relationOpen && !relationLoadedRef.current) || debouncedRelationSearch)) {
      const loadRelationOptions = async () => {
        setRelationLoading(true);
        setRelationError(null);
        try {
          const cfg = field.relationConfig as NonNullable<typeof field.relationConfig>;
          const entities = await cfg.fetchOptions(debouncedRelationSearch);
          console.log('Fetched relation options:', { 
            count: entities.length, 
            displayField: cfg.displayField,
            valueField: cfg.valueField,
            firstItem: entities[0],
            allItems: entities 
          });
          setRelationOptions(entities as unknown as Record<string, unknown>[]);
          if (!relationLoadedRef.current) relationLoadedRef.current = true;
        } catch (err) {
          setRelationError(err instanceof Error ? err.message : 'Failed to load options');
          setRelationOptions([]);
        } finally {
          setRelationLoading(false);
        }
      };
      loadRelationOptions();
    }
  }, [field, relationOpen, debouncedRelationSearch]);

  // Load multi relation options
  useEffect(() => {
    if (field.type === 'multirelation' && field.relationConfig && ((multiRelationOpen && !multiRelationLoadedRef.current) || debouncedMultiRelationSearch)) {
      const loadMultiRelationOptions = async () => {
        setMultiRelationLoading(true);
        setMultiRelationError(null);
        try {
          const cfg = field.relationConfig as NonNullable<typeof field.relationConfig>;
          const entities = await cfg.fetchOptions(debouncedMultiRelationSearch);
          let opts = entities as unknown as Record<string, unknown>[];

          // If there are already selected ids that are not in the fetched options,
          // attempt to fetch them directly and prepend so selected chips render.
          const selectedIds = localSelectedIds;
          const missing = selectedIds.filter(id => !opts.some(ent => String(ent[cfg.valueField]) === String(id)));
          if (missing.length > 0) {
            if (cfg.fetchByIds) {
              try {
                const fetched = await cfg.fetchByIds(missing);
                opts = [...(fetched as unknown as Record<string, unknown>[]), ...opts];
              } catch {
                // ignore
              }
            } else if (cfg.fetchById) {
              try {
                const fetched: Record<string, unknown>[] = [];
                for (const id of missing) {
                  const single = await cfg.fetchById(String(id));
                  if (single) fetched.push(single as unknown as Record<string, unknown>);
                }
                if (fetched.length > 0) opts = [...fetched, ...opts];
              } catch {
                // ignore
              }
            } else {
              // Last resort: try to fetch each missing id via search
              try {
                for (const id of missing) {
                  const bySearch = await cfg.fetchOptions(String(id));
                  if (Array.isArray(bySearch) && bySearch.length > 0) {
                    opts = [...(bySearch as unknown as Record<string, unknown>[]), ...opts];
                  }
                }
              } catch {
                // ignore
              }
            }
          }

          setMultiRelationOptions(opts);
          if (!multiRelationLoadedRef.current) multiRelationLoadedRef.current = true;
        } catch (err) {
          setMultiRelationError(err instanceof Error ? err.message : 'Failed to load options');
          setMultiRelationOptions([]);
        } finally {
          setMultiRelationLoading(false);
        }
      };
      loadMultiRelationOptions();
    }
  }, [field, multiRelationOpen, debouncedMultiRelationSearch, localSelectedIds]);

  // Sync localSelectedIds when incoming value changes
  useEffect(() => {
    const normalize = (val: unknown): string[] => {
      if (Array.isArray(val)) return val.map(v => String(v));
      if (typeof val === 'string') return val.includes(',') ? val.split(',').map(s => s.trim()).filter(Boolean) : (val ? [val] : []);
      if (val === null || val === undefined) return [];
      return [String(val)];
    };
    setLocalSelectedIds(normalize(value));
  }, [value]);

  // Load initial options for multirelation when value contains selected ids but options not yet loaded
  useEffect(() => {
    if (field.type === 'multirelation' && field.relationConfig && localSelectedIds.length > 0 && !multiRelationLoadedRef.current) {
      const loadSelectedMultiOptions = async () => {
        setMultiRelationLoading(true);
        setMultiRelationError(null);
        try {
          const cfg = field.relationConfig as NonNullable<typeof field.relationConfig>;
          let opts: Record<string, unknown>[] = [];

          if (cfg.fetchByIds) {
            const fetched = await cfg.fetchByIds(localSelectedIds);
            opts = fetched as unknown as Record<string, unknown>[];
          } else if (cfg.fetchById) {
            const fetched: Record<string, unknown>[] = [];
            for (const id of localSelectedIds) {
              const single = await cfg.fetchById(String(id));
              if (single) fetched.push(single as unknown as Record<string, unknown>);
            }
            opts = fetched;
          } else {
            // Best-effort: call fetchOptions with empty search and also attempt searching by ids
            const base = await cfg.fetchOptions('');
            opts = base as unknown as Record<string, unknown>[];
            for (const id of localSelectedIds) {
              try {
                const bySearch = await cfg.fetchOptions(String(id));
                if (Array.isArray(bySearch) && bySearch.length > 0) {
                  // Only add items that aren't already in opts to avoid duplicates
                  const newItems = (bySearch as unknown as Record<string, unknown>[]).filter(
                    item => !opts.some(existing => String(existing[cfg.valueField]) === String(item[cfg.valueField]))
                  );
                  if (newItems.length > 0) {
                    opts = [...newItems, ...opts];
                  }
                }
              } catch {
                // ignore
              }
            }
          }

          setMultiRelationOptions(opts);
          multiRelationLoadedRef.current = true;
        } catch (err) {
          setMultiRelationError(err instanceof Error ? err.message : 'Failed to load options');
        } finally {
          setMultiRelationLoading(false);
        }
      };
      loadSelectedMultiOptions();
    }
  }, [field, field.relationConfig, localSelectedIds]);

  // Show errors immediately if validateOnChange is true, otherwise wait for touch
  const showError = validateOnChange ? !!error : (touched && !!error);
  const errorId = `${String(field.name)}-error`;

  const commonProps = {
    id: String(field.name),
    name: String(field.name),
    disabled,
    required: isFieldRequired(field, formValues),
    'aria-invalid': showError ? ('true' as const) : undefined,
    'aria-describedby': showError ? errorId : undefined,
    autoComplete: field.type === 'email' ? 'email' : field.type === 'password' ? 'current-password' : 'off',
  };

  const renderInput = () => {
    const inputClasses = "w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed";
    const errorClasses = showError ? "border-destructive focus:ring-destructive" : "";

    // Format date values for input fields
    const getDateValue = (val: unknown): string => {
      if (!val) return '';
      if (typeof val === 'string') {
        try {
          // Convert ISO string to YYYY-MM-DD format for date input
          const date = new Date(val);
          return date.toISOString().slice(0, 10);
        } catch {
          return String(val);
        }
      }
      if (val instanceof Date) {
        return val.toISOString().slice(0, 10);
      }
      return String(val);
    };

    const getDateTimeValue = (val: unknown): string => {
      if (!val) return '';
      if (typeof val === 'string') {
        try {
          // Convert ISO string to datetime-local format
          const date = new Date(val);
          return date.toISOString().slice(0, 16);
        } catch {
          return String(val);
        }
      }
      if (val instanceof Date) {
        return val.toISOString().slice(0, 16);
      }
      return String(val);
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            defaultValue={String(value || '')}
            onBlur={(e) => {
              onChange(e.target.value);
              onBlur();
            }}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            className={`${inputClasses} ${errorClasses}`}
            {...commonProps}
          />
        );

      case 'select':
        if (field.searchable) {
          // Searchable combobox
          const selectedOption = searchOptions.find(opt => String(opt.value) === String(value));

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={`${inputClasses} ${errorClasses} justify-between`}
                  disabled={disabled}
                >
                  {selectedOption ? selectedOption.label : "Select..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {searchOptions.map((option) => (
                        <CommandItem
                          key={String(option.value)}
                          value={String(option.value)}
                          onSelect={() => {
                            onChange(option.value);
                            setOpen(false);
                            setSearchQuery('');
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${String(value) === String(option.value) ? "opacity-100" : "opacity-0"
                              }`}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          );
        } else {
          // Regular select
          return (
            <select
              value={String(value || '')}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              className={`${inputClasses} ${errorClasses}`}
              {...commonProps}
            >
              <option value="">Select...</option>
              {options.map(opt => (
                <option key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        } case 'checkbox':
      case 'switch':
        return (
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            {...commonProps}
          />
        );

      case 'file':
      case 'image':
        return (
          <FileUpload
            value={value as File | string | null}
            onChange={(file) => onChange(file)}
            onBlur={onBlur}
            accept={field.accept}
            multiple={field.multiple}
            disabled={disabled}
            maxSize={field.maxSize}
            showPreview={field.type === 'image'}
            error={touched && error ? error : undefined}
            helpText={field.helpText}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={getDateValue(value)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={`${inputClasses} ${errorClasses}`}
            {...commonProps}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={getDateTimeValue(value)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={`${inputClasses} ${errorClasses}`}
            {...commonProps}
          />
        );

      case 'time':
        return (
          <input
            type="time"
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={`${inputClasses} ${errorClasses}`}
            {...commonProps}
          />
        );

      case 'relation': {
        // Single relation field - select one related entity
        if (!field.relationConfig) {
          return <div className="text-destructive text-sm">Relation config is required</div>;
        }

        const relationConfig = field.relationConfig;

        // Find selected option
        const selectedEntity = relationOptions.find(
          (entity) => String(entity[relationConfig.valueField]) === String(value)
        );

        return (
          <Popover open={relationOpen} onOpenChange={setRelationOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={`${inputClasses} ${errorClasses} justify-between`}
                disabled={disabled}
              >
                {selectedEntity
                  ? String(selectedEntity[relationConfig.displayField])
                  : field.placeholder || "Select..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput
                  placeholder={`Search ${relationConfig.entity}...`}
                  value={relationSearch}
                  onValueChange={setRelationSearch}
                />
                <CommandList>
                  {relationLoading && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Loading...
                    </div>
                  )}
                  {relationError && (
                    <div className="py-6 text-center text-sm text-destructive">
                      {relationError}
                    </div>
                  )}
                  {!relationLoading && !relationError && relationOptions.length === 0 && (
                    <CommandEmpty>No results found.</CommandEmpty>
                  )}
                  {!relationLoading && !relationError && relationOptions.length > 0 && (
                    <CommandGroup>
                      {relationOptions.map((entity) => {
                        const entityValue = String(entity[relationConfig.valueField]);
                        const entityLabel = String(entity[relationConfig.displayField]);
                        const isSelected = String(value) === entityValue;                        
                        return (
                          <CommandItem
                            key={entityLabel}
                            value={entityLabel}
                            onSelect={() => {
                              onChange(entity[relationConfig.valueField]);
                              setRelationOpen(false);
                              setRelationSearch('');
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${isSelected ? "opacity-100" : "opacity-0"}`}
                            />
                            {entityLabel}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      }

      case 'multirelation': {
        // Multi-relation field - select multiple related entities
        if (!field.relationConfig) {
          return <div className="text-destructive text-sm">Relation config is required</div>;
        }

        const relationConfig = field.relationConfig;

        // Normalize incoming value to array of string ids (localSelectedIds) is used for immediate UI updates
        const selectedIds = localSelectedIds;

        // Find selected entities from loaded options (will show detailed chips for any that are already loaded)
        const selectedEntities = multiRelationOptions.filter((entity) =>
          selectedIds.includes(String(entity[relationConfig.valueField]))
        );

        // Helper to emit change to parent (as string[])
        const emitChange = (ids: string[]) => {
          onChange(ids);
        };

        // Handle selection toggle (optimistic update)
        const toggleSelection = (entityValue: unknown) => {
          const valStr = String(entityValue);
          const exists = selectedIds.includes(valStr);
          const newIds = exists ? selectedIds.filter((v) => v !== valStr) : [...selectedIds, valStr];

          // Check max selections
          if (relationConfig.maxSelections && newIds.length > relationConfig.maxSelections) {
            return;
          }

          // Update local state immediately for instant UI feedback
          setLocalSelectedIds(newIds);
          emitChange(newIds);
        };

        // Handle remove (optimistic)
        const removeSelection = (entityValue: unknown) => {
          const valStr = String(entityValue);
          const newIds = selectedIds.filter((v) => v !== valStr);
          setLocalSelectedIds(newIds);
          emitChange(newIds);
        };

        return (
          <div className="space-y-2">
            {/* Selected items as chips or compact summary when many selected */}
            {localSelectedIds.length > 0 && (
              localSelectedIds.length > 10 ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">{localSelectedIds.length} {field.label}</div>
                  <Button variant="ghost" size="sm" onClick={async () => {
                    setViewModalOpen(true);
                    setModalLoading(true);
                    try {
                      const cfg = relationConfig as NonNullable<typeof relationConfig>;
                      const items = await cfg.fetchOptions('');
                      setModalItems(items as Record<string, unknown>[]);
                    } catch {
                      setModalItems([]);
                    } finally {
                      setModalLoading(false);
                    }
                  }}>View</Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedEntities.map((entity) => {
                    const entityValue = entity[relationConfig.valueField];
                    const entityLabel = String(entity[relationConfig.displayField]);
                    return (
                      <span
                        key={String(entityValue)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
                      >
                        {entityLabel}
                        <button
                          type="button"
                          onClick={() => removeSelection(entityValue)}
                          disabled={disabled}
                          className="hover:text-destructive disabled:opacity-50"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )
            )}

            {/* Combobox for adding more */}
            <Popover open={multiRelationOpen} onOpenChange={setMultiRelationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={`${inputClasses} ${errorClasses} justify-between`}
                  disabled={disabled || (relationConfig.maxSelections ? localSelectedIds.length >= relationConfig.maxSelections : false)}
                >
                  {field.placeholder || "Select..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput
                    placeholder={`Search ${relationConfig.entity}...`}
                    value={multiRelationSearch}
                    onValueChange={setMultiRelationSearch}
                  />
                  <CommandList>
                    {multiRelationLoading && (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        Loading...
                      </div>
                    )}
                    {multiRelationError && (
                      <div className="py-6 text-center text-sm text-destructive">
                        {multiRelationError}
                      </div>
                    )}
                    {!multiRelationLoading && !multiRelationError && multiRelationOptions.length === 0 && (
                      <CommandEmpty>No results found.</CommandEmpty>
                    )}
                    {!multiRelationLoading && !multiRelationError && multiRelationOptions.length > 0 && (
                      <CommandGroup>
                                {multiRelationOptions
                                  .filter((entity) => !localSelectedIds.includes(String(entity[relationConfig.valueField])))
                                  .map((entity) => {
                                  const entityValue = entity[relationConfig.valueField];
                                  const entityLabel = String(entity[relationConfig.displayField]);
                          return (
                            <CommandItem
                              key={String(entityLabel)}
                              value={String(entityLabel)}
                              onSelect={() => toggleSelection(entityValue)}
                            >
                              <Check
                                className="mr-2 h-4 w-4 opacity-0"
                              />
                              {entityLabel}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

              {/* Max selections hint */}
              {relationConfig.maxSelections && (
                <p className="text-xs text-muted-foreground">
                  {localSelectedIds.length} / {relationConfig.maxSelections} selected
                </p>
              )}

              {/* Modal to view selected items or browse related entities */}
              {viewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
                  <div className="fixed inset-0 bg-black/40" onClick={() => setViewModalOpen(false)} />
                  <div className="relative bg-background rounded-md shadow-lg max-w-3xl w-full max-h-[80vh] overflow-auto p-4 z-10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium">{field.label}</h3>
                      <div>
                        <Button variant="ghost" size="sm" onClick={() => setViewModalOpen(false)}>Close</Button>
                      </div>
                    </div>
                    {modalLoading ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : (
                      <div className="space-y-2">
                        {modalItems.length === 0 && (
                          <div className="text-sm text-muted-foreground">No items available</div>
                        )}
                        {modalItems.map((it) => (
                          <div key={String(it[relationConfig.valueField])} className="py-2 border-b last:border-b-0">
                            <div className="text-sm">{String(it[relationConfig.displayField])}</div>
                            <div className="text-xs text-muted-foreground">ID: {String(it[relationConfig.valueField])}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        );
      }

      case 'custom':
        if (!field.customComponent) {
          return <div className="text-destructive text-sm">Custom component is required for custom field type</div>;
        }
        const CustomComponent = field.customComponent;
        return (
          <CustomComponent
            value={value}
            onChange={onChange}
            disabled={disabled}
            error={touched && error ? error : undefined}
            placeholder={field.placeholder}
            helpText={field.helpText}
          />
        );

      default:
        return (
          <>
            <input
              type={field.type}
              defaultValue={String(value || '')}
              onBlur={(e) => {
                onChange(e.target.value);
                onBlur();
              }}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
              className={`${inputClasses} ${errorClasses}`}
              {...commonProps}
            />
            {field.type === 'password' && (
              <input
                type="text"
                name="username"
                autoComplete="username"
                style={{ display: 'none' }}
                aria-hidden="true"
              />
            )}
          </>
        );
    }
  };

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={String(field.name)}
        className="block text-sm font-medium text-foreground"
      >
        {field.label}
        {isFieldRequired(field, formValues) && <span className="text-destructive ml-1" aria-label="required" title="Required field">*</span>}
      </label>
      {renderInput()}
      {field.helpText && !showError && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      {showError && (
        <p className="text-xs text-destructive flex items-center gap-1" id={errorId} >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
});

DefaultFieldRenderer.displayName = 'DefaultFieldRenderer';

export default EntityForm;
