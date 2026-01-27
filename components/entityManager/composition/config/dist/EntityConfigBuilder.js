"use strict";
/**
 * Entity Config Builder
 *
 * Fluent API for building complete entity configurations.
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.EntityConfigBuilder = void 0;
var FieldBuilder_1 = require("./FieldBuilder");
var ColumnBuilder_1 = require("./ColumnBuilder");
var ActionBuilder_1 = require("./ActionBuilder");
var date_fns_1 = require("date-fns");
/**
 * Entity config builder class
 */
var EntityConfigBuilder = /** @class */ (function () {
    function EntityConfigBuilder(name) {
        this.config = {
            name: name,
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
    EntityConfigBuilder.prototype.pluralName = function (pluralName) {
        this.config.pluralName = pluralName;
        return this;
    };
    /**
     * Set description
     */
    EntityConfigBuilder.prototype.description = function (description) {
        this.config.description = description;
        return this;
    };
    /**
     * Add a column
     */
    EntityConfigBuilder.prototype.addColumn = function (column) {
        this.config.columns.push(column);
        return this;
    };
    /**
     * Add columns
     */
    EntityConfigBuilder.prototype.columns = function (columns) {
        this.config.columns = columns;
        return this;
    };
    /**
     * Add column with builder
     */
    EntityConfigBuilder.prototype.column = function (key, label, callback) {
        var builder = new ColumnBuilder_1.ColumnBuilder(key, label);
        var column = callback ? (callback(builder) || builder.build()) : builder.build();
        return this.addColumn(column);
    };
    /**
     * Add a field
     */
    EntityConfigBuilder.prototype.addField = function (field) {
        this.config.fields.push(field);
        return this;
    };
    /**
     * Set fields
     */
    EntityConfigBuilder.prototype.fields = function (fields) {
        this.config.fields = fields;
        return this;
    };
    /**
     * Add field with builder
     */
    EntityConfigBuilder.prototype.field = function (name, label, callback) {
        var builder = new FieldBuilder_1.FieldBuilder(name, label);
        var field = callback ? (callback(builder) || builder.build()) : builder.build();
        return this.addField(field);
    };
    /**
     * Add a view field
     */
    EntityConfigBuilder.prototype.addViewField = function (field) {
        this.config.viewFields.push(field);
        return this;
    };
    /**
     * Set view fields
     */
    EntityConfigBuilder.prototype.viewFields = function (fields) {
        this.config.viewFields = fields;
        return this;
    };
    /**
     * Add view field with builder
     */
    EntityConfigBuilder.prototype.viewField = function (name, label, callback) {
        var builder = new FieldBuilder_1.FieldBuilder(name, label);
        var field = callback ? (callback(builder) || builder.buildViewField()) : builder.buildViewField();
        return this.addViewField(field);
    };
    /**
     * Add an action
     */
    EntityConfigBuilder.prototype.addAction = function (action) {
        this.config.actions.push(action);
        return this;
    };
    /**
     * Set actions
     */
    EntityConfigBuilder.prototype.actions = function (actions) {
        this.config.actions = actions;
        return this;
    };
    /**
     * Add action with builder
     */
    EntityConfigBuilder.prototype.action = function (id, label, callback) {
        var builder = new ActionBuilder_1.ActionBuilder(id, label);
        var action = callback ? (callback(builder) || builder.build()) : builder.build();
        return this.addAction(action);
    };
    /**
     * Add export field
     */
    EntityConfigBuilder.prototype.addExportField = function (field) {
        this.config.exportFields.push(field);
        return this;
    };
    /**
     * Set export fields
     */
    EntityConfigBuilder.prototype.exportFields = function (fields) {
        this.config.exportFields = fields;
        return this;
    };
    /**
     * Set default sort
     */
    EntityConfigBuilder.prototype.defaultSort = function (field, direction) {
        if (direction === void 0) { direction = 'asc'; }
        this.config.defaultSort = { field: field, direction: direction };
        return this;
    };
    /**
     * Set default page size
     */
    EntityConfigBuilder.prototype.defaultPageSize = function (size) {
        this.config.defaultPageSize = size;
        return this;
    };
    /**
     * Set searchable fields
     */
    EntityConfigBuilder.prototype.searchable = function () {
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        this.config.searchableFields = fields;
        return this;
    };
    /**
     * Set filterable fields
     */
    EntityConfigBuilder.prototype.filterable = function () {
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        this.config.filterableFields = fields;
        return this;
    };
    /**
     * Set title field
     */
    EntityConfigBuilder.prototype.titleField = function (field) {
        this.config.titleField = field;
        return this;
    };
    /**
     * Set subtitle field
     */
    EntityConfigBuilder.prototype.subtitleField = function (field) {
        this.config.subtitleField = field;
        return this;
    };
    /**
     * Set image field
     */
    EntityConfigBuilder.prototype.imageField = function (field) {
        this.config.imageField = field;
        return this;
    };
    /**
     * Set date field
     */
    EntityConfigBuilder.prototype.dateField = function (field) {
        this.config.dateField = field;
        return this;
    };
    /**
     * Set permissions
     */
    EntityConfigBuilder.prototype.permissions = function (permissions) {
        this.config.permissions = permissions;
        return this;
    };
    /**
     * Allow all permissions
     */
    EntityConfigBuilder.prototype.allowAll = function () {
        return this.permissions({
            create: true,
            read: true,
            update: true,
            "delete": true,
            "export": true
        });
    };
    /**
     * Set read-only permissions
     */
    EntityConfigBuilder.prototype.readOnly = function () {
        return this.permissions({
            create: false,
            read: true,
            update: false,
            "delete": false,
            "export": true
        });
    };
    /**
     * Set metadata
     */
    EntityConfigBuilder.prototype.metadata = function (metadata) {
        this.config.metadata = metadata;
        return this;
    };
    /**
     * Set metadata value
     */
    EntityConfigBuilder.prototype.meta = function (key, value) {
        if (!this.config.metadata) {
            this.config.metadata = {};
        }
        this.config.metadata[key] = value;
        return this;
    };
    /**
     * Auto-generate export fields from columns
     */
    EntityConfigBuilder.prototype.autoExportFields = function () {
        this.config.exportFields = this.config.columns.map(function (col) {
            var _a;
            return ({
                key: String(col.key),
                label: typeof col.label === 'string' ? col.label : String((_a = col.label) !== null && _a !== void 0 ? _a : ''),
                formatter: col.formatter
                    ? (function (value, entity) { return col.formatter(value, entity); })
                    : undefined
            });
        });
        return this;
    };
    /**
     * Auto-generate view fields from columns
     */
    EntityConfigBuilder.prototype.autoViewFields = function () {
        this.config.viewFields = this.config.columns.map(function (col) {
            var _a;
            // Map select type to text for view fields
            var viewType = col.type === 'select' ? 'text' : col.type;
            return {
                key: String(col.key),
                label: typeof col.label === 'string' ? col.label : String((_a = col.label) !== null && _a !== void 0 ? _a : ''),
                type: viewType,
                visible: col.visible,
                order: col.order
            };
        });
        return this;
    };
    /**
     * Build the configuration
     * Transforms flat builder state to nested EntityConfig structure
     */
    EntityConfigBuilder.prototype.build = function () {
        var _a;
        var _b = this.config, columns = _b.columns, fields = _b.fields, viewFields = _b.viewFields, actions = _b.actions, exportFields = _b.exportFields, defaultSort = _b.defaultSort, defaultPageSize = _b.defaultPageSize, searchableFields = _b.searchableFields, rest = __rest(_b, ["columns", "fields", "viewFields", "actions", "exportFields", "defaultSort", "defaultPageSize", "searchableFields"]);
        // Transform flat structure to nested EntityConfig
        var entityConfig = __assign(__assign({}, rest), { label: rest.label || rest.name, labelPlural: rest.labelPlural || rest.pluralName || rest.name + "s", list: {
                columns: columns || [],
                sortConfig: defaultSort,
                paginationConfig: defaultPageSize ? { page: 1, pageSize: defaultPageSize, total: 0, totalPages: 0 } : undefined,
                searchable: ((_a = searchableFields === null || searchableFields === void 0 ? void 0 : searchableFields.length) !== null && _a !== void 0 ? _a : 0) > 0
            }, form: {
                fields: fields || []
            }, view: {
                fields: viewFields || []
            }, actions: {
                actions: actions || []
            }, exporter: {
                fields: exportFields || [],
                options: {}
            } });
        // Ensure datetime columns have a sensible default formatter so callers
        // don't need to provide manual renderers in every config.
        if (entityConfig.list && Array.isArray(entityConfig.list.columns)) {
            entityConfig.list.columns = entityConfig.list.columns.map(function (col) {
                var c = __assign({}, col);
                if (c.type === 'datetime' && !c.formatter) {
                    c.formatter = function (value) {
                        if (value === null || value === undefined || value === '')
                            return '';
                        if (value instanceof Date)
                            return date_fns_1.format(value, 'Pp');
                        try {
                            if (typeof value === 'string') {
                                var parsed_1 = date_fns_1.parseISO(value);
                                if (!isNaN(parsed_1.getTime()))
                                    return date_fns_1.format(parsed_1, 'Pp');
                            }
                            if (typeof value === 'number') {
                                var parsed_2 = new Date(value);
                                if (!isNaN(parsed_2.getTime()))
                                    return date_fns_1.format(parsed_2, 'Pp');
                            }
                            var parsed = date_fns_1.parseISO(String(value));
                            if (!isNaN(parsed.getTime()))
                                return date_fns_1.format(parsed, 'Pp');
                            return String(value);
                        }
                        catch (_a) {
                            return String(value);
                        }
                    };
                }
                if (c.type === 'date' && !c.formatter) {
                    c.formatter = function (value) {
                        if (value === null || value === undefined || value === '')
                            return '';
                        if (value instanceof Date)
                            return date_fns_1.format(value, 'P');
                        try {
                            if (typeof value === 'string') {
                                var parsed_3 = date_fns_1.parseISO(value);
                                if (!isNaN(parsed_3.getTime()))
                                    return date_fns_1.format(parsed_3, 'P');
                            }
                            if (typeof value === 'number') {
                                var parsed_4 = new Date(value);
                                if (!isNaN(parsed_4.getTime()))
                                    return date_fns_1.format(parsed_4, 'P');
                            }
                            var parsed = date_fns_1.parseISO(String(value));
                            if (!isNaN(parsed.getTime()))
                                return date_fns_1.format(parsed, 'P');
                            return String(value);
                        }
                        catch (_a) {
                            return String(value);
                        }
                    };
                }
                return c;
            });
        }
        return entityConfig;
    };
    /**
     * Create a new entity config builder
     */
    EntityConfigBuilder.create = function (name) {
        return new EntityConfigBuilder(name);
    };
    /**
     * Create config with callback
     */
    EntityConfigBuilder.build = function (name, callback) {
        var builder = new EntityConfigBuilder(name);
        var result = callback(builder);
        return result || builder.build();
    };
    /**
     * Create from existing config
     * Flattens a nested EntityConfig back to builder state
     */
    EntityConfigBuilder.from = function (config) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var builder = new EntityConfigBuilder(config.name || 'Entity');
        // Flatten the nested structure to builder state
        builder.config = {
            name: config.name || 'Entity',
            label: config.label,
            labelPlural: config.labelPlural,
            pluralName: config.pluralName || config.labelPlural,
            description: config.description,
            columns: ((_a = config.list) === null || _a === void 0 ? void 0 : _a.columns) || [],
            fields: ((_b = config.form) === null || _b === void 0 ? void 0 : _b.fields) || [],
            viewFields: ((_c = config.view) === null || _c === void 0 ? void 0 : _c.fields) || [],
            actions: ((_d = config.actions) === null || _d === void 0 ? void 0 : _d.actions) || [],
            exportFields: ((_e = config.exporter) === null || _e === void 0 ? void 0 : _e.fields) || [],
            defaultSort: (_f = config.list) === null || _f === void 0 ? void 0 : _f.sortConfig,
            defaultPageSize: (_h = (_g = config.list) === null || _g === void 0 ? void 0 : _g.paginationConfig) === null || _h === void 0 ? void 0 : _h.pageSize,
            apiEndpoint: config.apiEndpoint,
            icon: config.icon,
            permissions: config.permissions,
            metadata: config.metadata
        };
        return builder;
    };
    return EntityConfigBuilder;
}());
exports.EntityConfigBuilder = EntityConfigBuilder;
