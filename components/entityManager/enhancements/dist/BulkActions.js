/**
 * Bulk Actions Component for Entity Manager
 * Handles multi-row operations
 */
'use client';
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
exports.commonBulkActions = exports.BulkActionsBar = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var checkbox_1 = require("@/components/ui/checkbox");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function BulkActionsBar(_a) {
    var _this = this;
    var selectedIds = _a.selectedIds, totalCount = _a.totalCount, actions = _a.actions, onClearSelection = _a.onClearSelection;
    var _b = react_1.useState(false), executing = _b[0], setExecuting = _b[1];
    var _c = react_1.useState(null), confirmAction = _c[0], setConfirmAction = _c[1];
    var handleExecute = function (action) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (action.requiresConfirmation) {
                        setConfirmAction(action);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, executeAction(action)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var executeAction = function (action) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setExecuting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, action.onExecute(selectedIds)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success('Success', {
                        description: action.label + " completed for " + selectedIds.length + " item(s)"
                    });
                    onClearSelection();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    sonner_1.toast.error('Error', {
                        description: "Failed to " + action.label.toLowerCase()
                    });
                    console.error(error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setExecuting(false);
                    setConfirmAction(null);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (selectedIds.length === 0)
        return null;
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("div", { className: "flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 mb-4" },
            react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                react_1["default"].createElement(checkbox_1.Checkbox, { checked: selectedIds.length === totalCount, onCheckedChange: onClearSelection }),
                react_1["default"].createElement("span", { className: "text-sm font-medium" },
                    selectedIds.length,
                    " of ",
                    totalCount,
                    " selected")),
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                actions.map(function (action) {
                    var Icon = action.icon || lucide_react_1.MoreHorizontal;
                    return (react_1["default"].createElement(button_1.Button, { key: action.id, size: "sm", variant: action.variant || 'outline', onClick: function () { return handleExecute(action); }, disabled: executing },
                        executing ? (react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" })) : (react_1["default"].createElement(Icon, { className: "h-4 w-4 mr-2" })),
                        action.label));
                }),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: onClearSelection }, "Clear"))),
        react_1["default"].createElement(alert_dialog_1.AlertDialog, { open: !!confirmAction, onOpenChange: function () { return setConfirmAction(null); } },
            react_1["default"].createElement(alert_dialog_1.AlertDialogContent, null,
                react_1["default"].createElement(alert_dialog_1.AlertDialogHeader, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogTitle, null, (confirmAction === null || confirmAction === void 0 ? void 0 : confirmAction.confirmationTitle) || 'Are you sure?'),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogDescription, null, (confirmAction === null || confirmAction === void 0 ? void 0 : confirmAction.confirmationDescription) ||
                        "This will " + (confirmAction === null || confirmAction === void 0 ? void 0 : confirmAction.label.toLowerCase()) + " " + selectedIds.length + " item(s). This action cannot be undone.")),
                react_1["default"].createElement(alert_dialog_1.AlertDialogFooter, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return confirmAction && executeAction(confirmAction); }, className: (confirmAction === null || confirmAction === void 0 ? void 0 : confirmAction.variant) === 'destructive'
                            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            : '' }, "Continue"))))));
}
exports.BulkActionsBar = BulkActionsBar;
// Common bulk action helpers
exports.commonBulkActions = {
    "delete": function (onDelete) { return ({
        id: 'delete',
        label: 'Delete',
        icon: lucide_react_1.Trash2,
        variant: 'destructive',
        requiresConfirmation: true,
        confirmationTitle: 'Delete items?',
        confirmationDescription: 'This action cannot be undone.',
        onExecute: onDelete,
        permission: 'delete'
    }); },
    archive: function (onArchive) { return ({
        id: 'archive',
        label: 'Archive',
        icon: lucide_react_1.Archive,
        variant: 'outline',
        requiresConfirmation: true,
        onExecute: onArchive,
        permission: 'change'
    }); },
    activate: function (onActivate) { return ({
        id: 'activate',
        label: 'Activate',
        icon: lucide_react_1.CheckCircle,
        variant: 'outline',
        onExecute: onActivate,
        permission: 'change'
    }); },
    deactivate: function (onDeactivate) { return ({
        id: 'deactivate',
        label: 'Deactivate',
        icon: lucide_react_1.XCircle,
        variant: 'outline',
        onExecute: onDeactivate,
        permission: 'change'
    }); },
    "export": function (onExport) { return ({
        id: 'export',
        label: 'Export',
        icon: lucide_react_1.Download,
        variant: 'outline',
        onExecute: onExport,
        permission: 'view'
    }); }
};
