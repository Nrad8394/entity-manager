"use strict";
/**
 * Create HTTP Client
 *
 * Factory function to create API clients with automatic authentication.
 * Uses the connectionManager's authApi for all requests.
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.createReactQueryHelpers = exports.createReactQueryHooks = exports.createHttpClient = void 0;
var client_1 = require("@/components/connectionManager/http/client");
var axios_1 = require("axios");
var react_query_1 = require("@tanstack/react-query");
/**
 * Build query params object for axios
 */
function buildQueryParams(params) {
    if (!params)
        return {};
    var queryParams = {};
    if (params.page)
        queryParams.page = params.page;
    if (params.pageSize)
        queryParams.page_size = params.pageSize;
    if (params.sortField) {
        queryParams.ordering = params.sortDirection === 'desc' ? "-" + params.sortField : params.sortField;
    }
    if (params.search)
        queryParams.search = params.search;
    // Add filters with Django field lookup syntax
    if (params.filters) {
        params.filters.forEach(function (filter) {
            var field = filter.field, operator = filter.operator, value = filter.value;
            if (value !== undefined && value !== null) {
                // Map filter operators to Django field lookups
                var filterKey = field;
                switch (operator) {
                    case 'equals':
                        filterKey = field; // exact match (default)
                        break;
                    case 'notEquals':
                        filterKey = field; // will need to handle this differently
                        break;
                    case 'contains':
                        filterKey = field + "__icontains"; // case-insensitive contains
                        break;
                    case 'startsWith':
                        filterKey = field + "__istartswith"; // case-insensitive starts with
                        break;
                    case 'endsWith':
                        filterKey = field + "__iendswith"; // case-insensitive ends with
                        break;
                    case 'greaterThan':
                        filterKey = field + "__gt";
                        break;
                    case 'greaterThanOrEqual':
                        filterKey = field + "__gte";
                        break;
                    case 'lessThan':
                        filterKey = field + "__lt";
                        break;
                    case 'lessThanOrEqual':
                        filterKey = field + "__lte";
                        break;
                    case 'in':
                        filterKey = field + "__in";
                        break;
                    case 'notIn':
                        filterKey = field; // will need to handle this differently
                        break;
                    case 'isNull':
                        filterKey = field + "__isnull";
                        queryParams[filterKey] = true;
                        return; // Skip setting value below
                    case 'isNotNull':
                        filterKey = field + "__isnull";
                        queryParams[filterKey] = false;
                        return; // Skip setting value below
                    case 'between':
                        // For between, we need two parameters
                        if (Array.isArray(value) && value.length === 2) {
                            queryParams[field + "__gte"] = value[0];
                            queryParams[field + "__lte"] = value[1];
                        }
                        return;
                    default:
                        filterKey = field; // fallback to exact match
                }
                queryParams[filterKey] = value;
            }
        });
    }
    // Add any additional params
    Object.keys(params).forEach(function (key) {
        if (!['page', 'pageSize', 'sortField', 'sortDirection', 'search', 'filters'].includes(key)) {
            var value = params[key];
            if (value !== undefined && value !== null) {
                queryParams[key] = value;
            }
        }
    });
    return queryParams;
}
/**
 * Handle axios response and convert to ApiResponse format
 */
function handleAxiosResponse(data) {
    // Django REST Framework pagination response
    if (data && typeof data === 'object' && 'results' in data) {
        var paginatedData = data;
        return {
            data: paginatedData.results,
            meta: {
                total: paginatedData.count,
                hasMore: !!paginatedData.next
            }
        };
    }
    return {
        data: data
    };
}
/**
 * Handle axios error and convert to ApiResponse format
 */
function handleAxiosError(error) {
    // Prefer axios.isAxiosError to detect axios errors reliably
    if (axios_1["default"].isAxiosError(error)) {
        client_1.handleApiError(error);
        throw error;
    }
    // If it's a generic Error, rethrow after logging
    if (error instanceof Error) {
        console.error('Non-axios error in HTTP client:', error);
        throw error;
    }
    throw new Error('An unknown error occurred');
}
/**
 * Create HTTP API Client
 *
 * Factory function that creates a fully functional API client with authentication.
 * Supports CRUD, bulk operations and custom actions. Custom actions can now be
 * typed per-action using a mapping generic which makes `client.customAction(...)`
 * return a correctly typed `ApiResponse` for each action key.
 *
 * Examples
 * ```typescript
 * // Basic (no special action types - actions default to returning the entity type)
 * const usersApiClient = createHttpClient<User>({
 *   endpoint: '/api/v1/accounts/users/',
 * });
 *
 * // With action-specific typing: map action keys to result types
 * const rolesClient = createHttpClient<UserRole, {
 *   users: User[];            // users action returns an array of User
 *   approve: User;            // approve returns the updated User
 * }>(
 *   {
 *     endpoint: '/api/v1/accounts/user-roles/',
 *     customActions: {
 *       users: 'users/',
 *       approve: 'approve/',
 *     }
 *   }
 * );
 *
 * // Calling a typed action
 * const usersRes = await rolesClient.customAction('role-id', 'users');
 * // usersRes.data is typed as User[]
 *
 * const approveRes = await rolesClient.customAction('user-id', 'approve');
 * // approveRes.data is typed as User
 * ```
 *
 * Notes:
 * - The `Actions` generic is a mapping from action key (string literal) to the
 *   expected response type. It improves compile-time safety but cannot
 *   validate runtime responses — the axios response is cast to the declared
 *   type.
 * - The optional `config.customActions` lets you provide the endpoint suffix
 *   used for each action (e.g. 'approve/'). Keys in `customActions` should
 *   match the keys declared in the `Actions` mapping.
 */
function createHttpClient(config) {
    var endpoint = config.endpoint;
    return {
        // expose endpoint for react-query hook helpers
        __endpoint: endpoint,
        /**
         * List entities with pagination, filtering, and search
         */
        list: function (params) {
            return __awaiter(this, void 0, Promise, function () {
                var queryParams, response, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            queryParams = buildQueryParams(params);
                            return [4 /*yield*/, client_1.authApi.get(endpoint, { params: queryParams })];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, handleAxiosResponse(response.data)];
                        case 2:
                            error_1 = _a.sent();
                            return [2 /*return*/, handleAxiosError(error_1)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Get single entity by ID
         */
        get: function (id) {
            var _a, _b;
            return __awaiter(this, void 0, Promise, function () {
                var response, error_2, is404;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, client_1.authApi.get("" + endpoint + id + "/")];
                        case 1:
                            response = _c.sent();
                            return [2 /*return*/, handleAxiosResponse(response.data)];
                        case 2:
                            error_2 = _c.sent();
                            is404 = (axios_1["default"].isAxiosError(error_2) && ((_a = error_2.response) === null || _a === void 0 ? void 0 : _a.status) === 404)
                                || (error_2 && typeof error_2 === 'object' && 'response' in error_2 && ((_b = error_2.response) === null || _b === void 0 ? void 0 : _b.status) === 404);
                            if (is404) {
                                return [2 /*return*/, { data: undefined }];
                            }
                            return [2 /*return*/, handleAxiosError(error_2)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Create new entity
         */
        create: function (data) {
            return __awaiter(this, void 0, Promise, function () {
                var response, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, client_1.authApi.post(endpoint, data)];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, handleAxiosResponse(response.data)];
                        case 2:
                            error_3 = _a.sent();
                            return [2 /*return*/, handleAxiosError(error_3)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Update existing entity
         */
        update: function (id, data) {
            return __awaiter(this, void 0, Promise, function () {
                var response, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, client_1.authApi.patch("" + endpoint + id + "/", data)];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, handleAxiosResponse(response.data)];
                        case 2:
                            error_4 = _a.sent();
                            return [2 /*return*/, handleAxiosError(error_4)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Delete entity
         */
        "delete": function (id) {
            return __awaiter(this, void 0, Promise, function () {
                var error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, client_1.authApi["delete"]("" + endpoint + id + "/")];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { data: undefined }];
                        case 2:
                            error_5 = _a.sent();
                            return [2 /*return*/, handleAxiosError(error_5)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Bulk create entities
         */
        bulkCreate: function (dataArray) {
            return __awaiter(this, void 0, Promise, function () {
                var response, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, client_1.authApi.post(endpoint + "bulk_create/", { items: dataArray })];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, handleAxiosResponse(response.data)];
                        case 2:
                            error_6 = _a.sent();
                            return [2 /*return*/, handleAxiosError(error_6)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Bulk update entities
         */
        bulkUpdate: function (updates) {
            return __awaiter(this, void 0, Promise, function () {
                var response, error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, client_1.authApi.post(endpoint + "bulk_update/", { updates: updates })];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, handleAxiosResponse(response.data)];
                        case 2:
                            error_7 = _a.sent();
                            return [2 /*return*/, handleAxiosError(error_7)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Bulk delete entities
         */
        bulkDelete: function (ids) {
            return __awaiter(this, void 0, Promise, function () {
                var error_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, client_1.authApi.post(endpoint + "bulk_delete/", { ids: ids })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { data: undefined }];
                        case 2:
                            error_8 = _a.sent();
                            return [2 /*return*/, handleAxiosError(error_8)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Bulk import from CSV or Excel file
         */
        bulkImport: function (file) {
            return __awaiter(this, void 0, Promise, function () {
                var fd, response, error_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            fd = new FormData();
                            fd.append('file', file);
                            return [4 /*yield*/, client_1.authApi.post(endpoint + "bulk_import/", fd, { headers: { 'Content-Type': 'multipart/form-data' } })];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, handleAxiosResponse(response.data)];
                        case 2:
                            error_9 = _a.sent();
                            return [2 /*return*/, handleAxiosError(error_9)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Download a bulk import template (CSV or XLSX) as Blob
         */
        bulkImportTemplate: function (export_format) {
            return __awaiter(this, void 0, void 0, function () {
                var response, contentType, error_10;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, client_1.authApi.get(endpoint + "bulk_import_template/", { params: { export_format: export_format }, responseType: 'arraybuffer' })];
                        case 1:
                            response = _a.sent();
                            contentType = response.headers['content-type'] || 'application/octet-stream';
                            return [2 /*return*/, new Blob([response.data], { type: contentType })];
                        case 2:
                            error_10 = _a.sent();
                            return [2 /*return*/, handleAxiosError(error_10)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Export entities via backend (returns Blob)
         */
        bulkExport: function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var query, response, contentType, error_11;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            query = {};
                            if (params === null || params === void 0 ? void 0 : params.fields)
                                query.fields = params.fields.join(',');
                            if (params === null || params === void 0 ? void 0 : params.file_format)
                                query.file_format = params.file_format;
                            return [4 /*yield*/, client_1.authApi.get(endpoint + "bulk_export/", { params: query, responseType: 'arraybuffer' })];
                        case 1:
                            response = _a.sent();
                            contentType = response.headers['content-type'] || 'application/octet-stream';
                            return [2 /*return*/, new Blob([response.data], { type: contentType })];
                        case 2:
                            error_11 = _a.sent();
                            return [2 /*return*/, handleAxiosError(error_11)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Execute custom action on entity
         *
         * @example
         * ```typescript
         * // Approve user
         * await client.customAction(userId, 'approve');
         *
         * // Change role
         * await client.customAction(userId, 'change_role', { role: 'admin' });
         * ```
         */
        customAction: function (id, action, data) {
            return __awaiter(this, void 0, Promise, function () {
                var response, error_12;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, client_1.authApi.post("" + endpoint + id + "/" + String(action) + "/", data)];
                        case 1:
                            response = _a.sent();
                            // Convert response to ApiResponse typed to the action's expected type
                            return [2 /*return*/, handleAxiosResponse(response.data)];
                        case 2:
                            error_12 = _a.sent();
                            return [2 /*return*/, handleAxiosError(error_12)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
    };
}
exports.createHttpClient = createHttpClient;
/**
 * Create React Query hooks bound to a client instance.
 *
 * Usage:
 * const hooks = createReactQueryHooks(usersClient);
 * const { useList, useGet, useCreate, useUpdate, useDelete, useCustomAction } = hooks;
 */
function createReactQueryHooks(client) {
    var endpoint = client.__endpoint || 'api';
    function useList(params, options) {
        var _this = this;
        return react_query_1.useQuery(__assign({ queryKey: [endpoint, 'list', params], queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, client.list(params)];
                        case 1:
                            res = _a.sent();
                            return [2 /*return*/, res];
                    }
                });
            }); } }, (options || {})));
    }
    function useGet(id, options) {
        var _this = this;
        return react_query_1.useQuery(__assign({ queryKey: [endpoint, 'get', id], queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, client.get(id)];
                        case 1:
                            res = _a.sent();
                            return [2 /*return*/, res];
                    }
                });
            }); }, enabled: !!id }, (options || {})));
    }
    function useCreate(options) {
        var qc = react_query_1.useQueryClient();
        var restOptions = __assign({}, (options || {}));
        var originalOnSuccess = options === null || options === void 0 ? void 0 : options.onSuccess;
        return react_query_1.useMutation(__assign({ mutationFn: function (data) { return client.create(data); }, onSuccess: function (data, variables, context, mutation) {
                qc.invalidateQueries({ queryKey: [endpoint] });
                if (originalOnSuccess)
                    originalOnSuccess(data, variables, context, mutation);
            } }, restOptions));
    }
    function useUpdate(options) {
        var qc = react_query_1.useQueryClient();
        var restOptions = __assign({}, (options || {}));
        var originalOnSuccess = options === null || options === void 0 ? void 0 : options.onSuccess;
        return react_query_1.useMutation(__assign({ mutationFn: function (payload) { return client.update(payload.id, payload.data); }, onSuccess: function (data, variables, context, mutation) {
                qc.invalidateQueries({ queryKey: [endpoint] });
                if (originalOnSuccess)
                    originalOnSuccess(data, variables, context, mutation);
            } }, restOptions));
    }
    function useDelete(options) {
        var qc = react_query_1.useQueryClient();
        var restOptions = __assign({}, (options || {}));
        var originalOnSuccess = options === null || options === void 0 ? void 0 : options.onSuccess;
        return react_query_1.useMutation(__assign({ mutationFn: function (id) { return client["delete"](id); }, onSuccess: function (data, variables, context, mutation) {
                qc.invalidateQueries({ queryKey: [endpoint] });
                if (originalOnSuccess)
                    originalOnSuccess(data, variables, context, mutation);
            } }, restOptions));
    }
    function useCustomAction(action, options) {
        var qc = react_query_1.useQueryClient();
        var restOptions = __assign({}, (options || {}));
        var originalOnSuccess = options === null || options === void 0 ? void 0 : options.onSuccess;
        return react_query_1.useMutation(__assign({ mutationFn: function (payload) { return client.customAction(payload.id, action, payload.data); }, onSuccess: function (data, variables, context, mutation) {
                qc.invalidateQueries({ queryKey: [endpoint] });
                if (originalOnSuccess)
                    originalOnSuccess(data, variables, context, mutation);
            } }, restOptions));
    }
    return {
        useList: useList,
        useGet: useGet,
        useCreate: useCreate,
        useUpdate: useUpdate,
        useDelete: useDelete,
        useCustomAction: useCustomAction
    };
}
exports.createReactQueryHooks = createReactQueryHooks;
/**
 * Create imperative helpers that use the shared queryClient for fetching data
 * outside React hooks (useful in non-component code or existing async helpers).
 */
var queryClient_1 = require("@/components/connectionManager/http/queryClient");
function createReactQueryHelpers(client) {
    var endpoint = client.__endpoint || 'api';
    return {
        fetchList: function (params) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, queryClient_1.queryClient.fetchQuery({ queryKey: [endpoint, 'list', params], queryFn: function () { return client.list(params); } })];
                });
            });
        },
        fetchGet: function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, queryClient_1.queryClient.fetchQuery({ queryKey: [endpoint, 'get', id], queryFn: function () { return client.get(id); } })];
                });
            });
        },
        fetchCustom: function (id, action, data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Note: will not type the response strictly here; callers can cast
                    return [2 /*return*/, queryClient_1.queryClient.fetchQuery({ queryKey: [endpoint, 'action', id, action], queryFn: function () { return client.customAction(id, action, data); } })];
                });
            });
        }
    };
}
exports.createReactQueryHelpers = createReactQueryHelpers;
