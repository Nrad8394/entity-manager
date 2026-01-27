"use strict";
/**
 * Lightweight runtime helper to fetch option lists for foreign-key filter fields.
 *
 * This file implements a conservative mapping from common FK field names to
 * API endpoints used in this project. It attempts to fetch a small list of
 * objects and map them to { label, value } pairs for use in filter dropdowns.
 */
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
exports.FK_FIELDS = exports.getFilterOptionsForField = void 0;
var FK_FIELD_ENDPOINT_MAP = {
    // institution
    department: '/api/v1/institution/departments/',
    programme: '/api/v1/institution/programmes/',
    'class_group': '/api/v1/institution/class-groups/',
    academic_year: '/api/v1/institution/academic-years/',
    intake: '/api/v1/institution/intakes/',
    unit: '/api/v1/institution/units/',
    // accounts
    trainer: '/api/v1/accounts/users/',
    user: '/api/v1/accounts/users/',
    role: '/api/v1/accounts/roles/',
    // logx
    timetable: '/api/v1/logx/timetables/',
    room: '/api/v1/logx/rooms/'
};
function fetchJson(url) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(url, { credentials: 'same-origin' })];
                case 1:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error("Failed to fetch " + url + ": " + res.status);
                    return [2 /*return*/, res.json()];
            }
        });
    });
}
function pickLabel(item) {
    if (!item)
        return '';
    var candidates = ['name', 'display_name', 'title', 'code', 'full_name', 'email', 'username'];
    for (var _i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
        var c = candidates_1[_i];
        if (item[c])
            return String(item[c]);
    }
    // fall back to id
    if (item.id !== undefined)
        return String(item.id);
    return JSON.stringify(item);
}
function getFilterOptionsForField(field, limit) {
    if (limit === void 0) { limit = 200; }
    return __awaiter(this, void 0, Promise, function () {
        var endpoint, url, body, items, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = FK_FIELD_ENDPOINT_MAP[field];
                    if (!endpoint)
                        return [2 /*return*/, []];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    url = endpoint + "?limit=" + limit;
                    return [4 /*yield*/, fetchJson(url)];
                case 2:
                    body = _a.sent();
                    items = Array.isArray(body) ? body : (body.results || body.items || []);
                    return [2 /*return*/, items.slice(0, limit).map(function (it) { var _a, _b, _c, _d; return ({ value: (_d = (_c = (_b = (_a = it.id) !== null && _a !== void 0 ? _a : it.pk) !== null && _b !== void 0 ? _b : it.uuid) !== null && _c !== void 0 ? _c : it.name) !== null && _d !== void 0 ? _d : it.code, label: pickLabel(it) }); })];
                case 3:
                    err_1 = _a.sent();
                    // Silent failure - return empty list to avoid UI breakage
                    // console.debug('getFilterOptionsForField error', field, err);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getFilterOptionsForField = getFilterOptionsForField;
exports.FK_FIELDS = Object.keys(FK_FIELD_ENDPOINT_MAP);
exports["default"] = getFilterOptionsForField;
