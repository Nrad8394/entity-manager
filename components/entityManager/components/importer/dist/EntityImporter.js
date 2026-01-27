"use client";
"use strict";
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
exports.EntityImporter = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var sonner_1 = require("sonner");
function EntityImporter(_a) {
    var _this = this;
    var apiClient = _a.apiClient, open = _a.open, onClose = _a.onClose, onImported = _a.onImported;
    var _b = react_1.useState(null), file = _b[0], setFile = _b[1];
    var _c = react_1.useState(false), loading = _c[0], setLoading = _c[1];
    var _d = react_1.useState(null), result = _d[0], setResult = _d[1];
    var _e = react_1.useState(null), error = _e[0], setError = _e[1];
    var handleFileChange = function (e) {
        var f = e.target.files && e.target.files[0];
        setFile(f || null);
    };
    var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, hasData, isSummary, raw, summary, err_1, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!apiClient || !apiClient.bulkImport)
                        return [2 /*return*/];
                    if (!file)
                        return [2 /*return*/, setError('Please select a file to import')];
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, apiClient.bulkImport(file)];
                case 2:
                    res = _a.sent();
                    hasData = function (obj) {
                        return typeof obj === 'object' && obj !== null && 'data' in obj;
                    };
                    isSummary = function (obj) {
                        return typeof obj === 'object' && obj !== null && ('imported' in obj || 'errors' in obj);
                    };
                    raw = res;
                    summary = null;
                    if (hasData(raw)) {
                        summary = raw.data;
                    }
                    else if (isSummary(raw)) {
                        summary = raw;
                    }
                    setResult(summary !== null && summary !== void 0 ? summary : null);
                    onImported === null || onImported === void 0 ? void 0 : onImported(summary !== null && summary !== void 0 ? summary : null);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    message = err_1 instanceof Error ? err_1.message : String(err_1 !== null && err_1 !== void 0 ? err_1 : 'Import failed');
                    setError(message || 'Import failed');
                    onImported === null || onImported === void 0 ? void 0 : onImported(null);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDownloadTemplate = function (format) { return __awaiter(_this, void 0, void 0, function () {
        var blob, ext, fname, url, a, err_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!apiClient || !apiClient.bulkImportTemplate) {
                        sonner_1.toast.error('No API client available to download template');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, apiClient.bulkImportTemplate(format)];
                case 2:
                    blob = _b.sent();
                    ext = format === 'csv' ? 'csv' : 'xlsx';
                    fname = (((_a = apiClient.__endpoint) === null || _a === void 0 ? void 0 : _a.replace(/\//g, '_')) || 'template') + "." + ext;
                    url = window.URL.createObjectURL(blob);
                    a = document.createElement('a');
                    a.href = url;
                    a.download = fname;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                    sonner_1.toast.success('Template downloaded');
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _b.sent();
                    sonner_1.toast.error('Failed to download template');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement(dialog_1.Dialog, { open: open, onOpenChange: function (v) { if (!v)
            onClose(); } },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-lg" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null, "Import data"),
                react_1["default"].createElement(dialog_1.DialogDescription, null, "Upload a CSV or Excel (.xlsx) file following the provided template.")),
            react_1["default"].createElement("div", { className: "space-y-3" },
                react_1["default"].createElement("input", { type: "file", accept: ".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel", onChange: handleFileChange }),
                error && react_1["default"].createElement("p", { className: "text-xs text-destructive" }, error),
                result && (react_1["default"].createElement("div", { className: "text-sm text-foreground" },
                    react_1["default"].createElement("div", null,
                        "Imported: ",
                        react_1["default"].createElement("strong", null, result.imported)),
                    result.errors && result.errors.length > 0 && (react_1["default"].createElement("div", { className: "mt-2 text-xs text-muted-foreground" },
                        react_1["default"].createElement("div", { className: "font-medium" }, "Errors:"),
                        react_1["default"].createElement("ul", { className: "list-disc ml-4" }, result.errors.map(function (e, i) { return react_1["default"].createElement("li", { key: i }, e); }))))))),
            react_1["default"].createElement("div", { className: "flex gap-2 mt-4" },
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDownloadTemplate('csv'); }, disabled: !apiClient }, "Download Template (CSV)"),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDownloadTemplate('xlsx'); }, disabled: !apiClient }, "Download Template (XLSX)")),
            react_1["default"].createElement(dialog_1.DialogFooter, null,
                react_1["default"].createElement("div", { className: "flex items-center justify-end gap-2 w-full" },
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: onClose, disabled: loading }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleSubmit, disabled: loading || !file }, loading ? 'Importing...' : 'Import'))))));
}
exports.EntityImporter = EntityImporter;
exports["default"] = EntityImporter;
