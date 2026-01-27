"use strict";
exports.__esModule = true;
exports.getInitialFiltersFromSearchParams = void 0;
/**
 * Convert a Next.js ReadonlyURLSearchParams (or a URLSearchParams) into
 * an array of FilterConfig suitable for EntityManager initialFilters.
 *
 * Behavior:
 * - Each query param key/value becomes a filter with operator 'equals'.
 * - Returns undefined when there are no query params or on error.
 */
function getInitialFiltersFromSearchParams(searchParams) {
    var _a, _b, _c;
    try {
        if (!searchParams)
            return undefined;
        // Read entries from the provided object. Next.js useSearchParams returns a
        // ReadonlyURLSearchParams which implements entries(), as does URLSearchParams.
        var entries = Array.from((_c = (_b = (_a = searchParams).entries) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : []);
        if (!entries.length)
            return undefined;
        return entries.map(function (_a) {
            var k = _a[0], v = _a[1];
            return ({ field: k, operator: 'equals', value: v });
        });
    }
    catch (e) {
        // Be resilient: fall back to undefined if anything unexpected happens
        return undefined;
    }
}
exports.getInitialFiltersFromSearchParams = getInitialFiltersFromSearchParams;
exports["default"] = getInitialFiltersFromSearchParams;
