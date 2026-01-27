/**
 * Entity Config Builder
 * 
 * Fluent API for building complete entity configurations.
 */

import { BaseEntity } from '../../primitives/types';
import { EntityConfig, EntityConfigBuilderState, BuilderCallback, EntityActionsConfig, EntityExporterConfig } from './types';
import { FieldBuilder } from './FieldBuilder';
import { ColumnBuilder } from './ColumnBuilder';
import { ActionBuilder } from './ActionBuilder';
import { Column } from '../../components/list/types';
import { FormField } from '../../components/form/types';
import { ViewField } from '../../components/view/types';
import { Action } from '../../components/actions/types';
import { ExportField } from '../../components/exporter/types';
import { format, parseISO } from 'date-fns';

/**
 * Entity config builder class
 */
export class EntityConfigBuilder<T extends BaseEntity = BaseEntity> {
  private config: EntityConfigBuilderState<T>;

  constructor(name: string) {
    this.config = {
      name,
      columns: [],
      fields: [],
      viewFields: [],
      actions: [],
      exportFields: []
    };
  }

  /**
   * Set plural name
   */
  pluralName(pluralName: string): this {
    this.config.pluralName = pluralName;
    return this;
  }

  /**
   * Set description
   */
  description(description: string): this {
    this.config.description = description;
    return this;
  }

  /**
   * Add a column
   */
  addColumn(column: Column<T>): this {
    this.config.columns!.push(column);
    return this;
  }

  /**
   * Add columns
   */
  columns(columns: Column<T>[]): this {
    this.config.columns = columns;
    return this;
  }

  /**
   * Add column with builder
   */
  column(
    key: keyof T | string,
    label: string,
    callback?: BuilderCallback<Column<T>, ColumnBuilder<T>>
  ): this {
    const builder = new ColumnBuilder<T>(key, label);
    const column = callback ? (callback(builder) || builder.build()) : builder.build();
    return this.addColumn(column);
  }

  /**
   * Add a field
   */
  addField(field: FormField<T>): this {
    this.config.fields!.push(field);
    return this;
  }

  /**
   * Set fields
   */
  fields(fields: FormField<T>[]): this {
    this.config.fields = fields;
    return this;
  }

  /**
   * Add field with builder
   */
  field(
    name: string,
    label: string,
    callback?: BuilderCallback<FormField<T>, FieldBuilder<T>>
  ): this {
    const builder = new FieldBuilder<T>(name, label);
    const field = callback ? (callback(builder) || builder.build()) : builder.build();
    return this.addField(field);
  }

  /**
   * Add a view field
   */
  addViewField(field: ViewField<T>): this {
    this.config.viewFields!.push(field);
    return this;
  }

  /**
   * Set view fields
   */
  viewFields(fields: ViewField<T>[]): this {
    this.config.viewFields = fields;
    return this;
  }

  /**
   * Add view field with builder
   */
  viewField(
    name: string,
    label: string,
    callback?: BuilderCallback<ViewField<T>, FieldBuilder<T>>
  ): this {
    const builder = new FieldBuilder<T>(name, label);
    const field = callback ? (callback(builder) || builder.buildViewField()) : builder.buildViewField();
    return this.addViewField(field);
  }

  /**
   * Add an action
   */
  addAction(action: Action<T>): this {
    this.config.actions!.push(action);
    return this;
  }

  /**
   * Set actions
   */
  actions(actions: Action<T>[]): this {
    this.config.actions = actions;
    return this;
  }

  /**
   * Add action with builder
   */
  action(
    id: string,
    label: string,
    callback?: BuilderCallback<Action<T>, ActionBuilder<T>>
  ): this {
    const builder = new ActionBuilder<T>(id, label);
    const action = callback ? (callback(builder) || builder.build()) : builder.build();
    return this.addAction(action);
  }

  /**
   * Add export field
   */
  addExportField(field: ExportField): this {
    this.config.exportFields!.push(field);
    return this;
  }

  /**
   * Set export fields
   */
  exportFields(fields: ExportField[]): this {
    this.config.exportFields = fields;
    return this;
  }

  /**
   * Set default sort
   */
  defaultSort(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.config.defaultSort = { field, direction };
    return this;
  }

  /**
   * Set default page size
   */
  defaultPageSize(size: number): this {
    this.config.defaultPageSize = size;
    return this;
  }

  /**
   * Set searchable fields
   */
  searchable(...fields: string[]): this {
    this.config.searchableFields = fields;
    return this;
  }

  /**
   * Set filterable fields
   */
  filterable(...fields: string[]): this {
    this.config.filterableFields = fields;
    return this;
  }

  /**
   * Set title field
   */
  titleField(field: string): this {
    this.config.titleField = field;
    return this;
  }

  /**
   * Set subtitle field
   */
  subtitleField(field: string): this {
    this.config.subtitleField = field;
    return this;
  }

  /**
   * Set image field
   */
  imageField(field: string): this {
    this.config.imageField = field;
    return this;
  }

  /**
   * Set date field
   */
  dateField(field: string): this {
    this.config.dateField = field;
    return this;
  }

  /**
   * Set permissions
   */
  permissions(permissions: EntityConfig['permissions']): this {
    this.config.permissions = permissions;
    return this;
  }

  /**
   * Allow all permissions
   */
  allowAll(): this {
    return this.permissions({
      create: true,
      read: true,
      update: true,
      delete: true,
      export: true
    });
  }

  /**
   * Set read-only permissions
   */
  readOnly(): this {
    return this.permissions({
      create: false,
      read: true,
      update: false,
      delete: false,
      export: true
    });
  }

  /**
   * Set metadata
   */
  metadata(metadata: Record<string, unknown>): this {
    this.config.metadata = metadata;
    return this;
  }

  /**
   * Set metadata value
   */
  meta(key: string, value: unknown): this {
    if (!this.config.metadata) {
      this.config.metadata = {};
    }
    this.config.metadata[key] = value;
    return this;
  }

  /**
   * Auto-generate export fields from columns
   */
  autoExportFields(): this {
    this.config.exportFields = this.config.columns!.map<ExportField<T>>(col => ({
      key: String(col.key),
      label: typeof col.label === 'string' ? col.label : String(col.label ?? ''),
      formatter: col.formatter
        ? ((value: unknown, entity: T) => col.formatter!(value, entity))
        : undefined
    }));
    return this;
  }

  /**
   * Auto-generate view fields from columns
   */
  autoViewFields(): this {
    this.config.viewFields = this.config.columns!.map<ViewField<T>>(col => {
      // Map select type to text for view fields
      const viewType = col.type === 'select' ? 'text' : col.type;
      return {
        key: String(col.key),
        label: typeof col.label === 'string' ? col.label : String(col.label ?? ''),
        type: viewType as ViewField<T>['type'],
        visible: col.visible,
        order: col.order
      };
    });
    return this;
  }

  /**
   * Build the configuration
   * Transforms flat builder state to nested EntityConfig structure
   */
  build(): EntityConfig<T> {
    const { 
      columns, 
      fields, 
      viewFields, 
      actions, 
      exportFields,
      defaultSort,
      defaultPageSize,
      searchableFields,
      ...rest 
    } = this.config;
    
    // Transform flat structure to nested EntityConfig
    const entityConfig: EntityConfig<T> = {
      ...rest,
      label: rest.label || rest.name,
      labelPlural: rest.labelPlural || rest.pluralName || `${rest.name}s`,
      list: {
        columns: columns || [],
        sortConfig: defaultSort,
        paginationConfig: defaultPageSize ? { page: 1, pageSize: defaultPageSize, total: 0, totalPages: 0 } : undefined,
        searchable: (searchableFields?.length ?? 0) > 0,
      },
      form: {
        fields: fields || [],
      },
      view: {
        fields: viewFields || [],
      },
      actions: {
        actions: actions || [],
      } as EntityActionsConfig<T>,
      exporter: {
        fields: exportFields as ExportField[] || [],
        options: {},
      } as EntityExporterConfig<T>,
    } as EntityConfig<T>;
    // Ensure datetime columns have a sensible default formatter so callers
    // don't need to provide manual renderers in every config.
    if (entityConfig.list && Array.isArray(entityConfig.list.columns)) {
      entityConfig.list.columns = entityConfig.list.columns.map(col => {
        const c = { ...col } as Column<T>;
        if (c.type === 'datetime' && !c.formatter) {
          c.formatter = (value: unknown) => {
            if (value === null || value === undefined || value === '') return '';
            if (value instanceof Date) return format(value, 'Pp');
            try {
              if (typeof value === 'string') {
                const parsed = parseISO(value);
                if (!isNaN(parsed.getTime())) return format(parsed, 'Pp');
              }
              if (typeof value === 'number') {
                const parsed = new Date(value);
                if (!isNaN(parsed.getTime())) return format(parsed, 'Pp');
              }
              const parsed = parseISO(String(value));
              if (!isNaN(parsed.getTime())) return format(parsed, 'Pp');
              return String(value);
            } catch {
              return String(value);
            }
          };
        }
        if (c.type === 'date' && !c.formatter) {
          c.formatter = (value: unknown) => {
            if (value === null || value === undefined || value === '') return '';
            if (value instanceof Date) return format(value, 'P');
            try {
              if (typeof value === 'string') {
                const parsed = parseISO(value);
                if (!isNaN(parsed.getTime())) return format(parsed, 'P');
              }
              if (typeof value === 'number') {
                const parsed = new Date(value);
                if (!isNaN(parsed.getTime())) return format(parsed, 'P');
              }
              const parsed = parseISO(String(value));
              if (!isNaN(parsed.getTime())) return format(parsed, 'P');
              return String(value);
            } catch {
              return String(value);
            }
          };
        }
        return c;
      });
    }

    return entityConfig;
  }

  /**
   * Create a new entity config builder
   */
  static create<T extends BaseEntity = BaseEntity>(name: string): EntityConfigBuilder<T> {
    return new EntityConfigBuilder<T>(name);
  }

  /**
   * Create config with callback
   */
  static build<T extends BaseEntity = BaseEntity>(
    name: string,
    callback: BuilderCallback<EntityConfig<T>, EntityConfigBuilder<T>>
  ): EntityConfig<T> {
    const builder = new EntityConfigBuilder<T>(name);
    const result = callback(builder);
    return result || builder.build();
  }

  /**
   * Create from existing config
   * Flattens a nested EntityConfig back to builder state
   */
  static from<T extends BaseEntity = BaseEntity>(config: Partial<EntityConfig<T>>): EntityConfigBuilder<T> {
    const builder = new EntityConfigBuilder<T>(config.name || 'Entity');
    
    // Flatten the nested structure to builder state
    builder.config = {
      name: config.name || 'Entity',
      label: config.label,
      labelPlural: config.labelPlural,
      pluralName: config.pluralName || config.labelPlural,
      description: config.description,
      columns: config.list?.columns || [],
      fields: config.form?.fields || [],
      viewFields: config.view?.fields || [],
      actions: config.actions?.actions || [],
      exportFields: config.exporter?.fields || [],
      defaultSort: config.list?.sortConfig,
      defaultPageSize: config.list?.paginationConfig?.pageSize,
      apiEndpoint: config.apiEndpoint,
      icon: config.icon,
      permissions: config.permissions,
      metadata: config.metadata,
    };
    
    return builder;
  }
}
