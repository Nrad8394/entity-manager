import { FilterConfig } from '@/components/entityManager/primitives/types/entity';

/**
 * Convert a Next.js ReadonlyURLSearchParams (or a URLSearchParams) into
 * an array of FilterConfig suitable for EntityManager initialFilters.
 *
 * Behavior:
 * - Each query param key/value becomes a filter with operator 'equals'.
 * - Returns undefined when there are no query params or on error.
 */
export function getInitialFiltersFromSearchParams(searchParams?: any): FilterConfig[] | undefined {
  try {
    if (!searchParams) return undefined;

    // Read entries from the provided object. Next.js useSearchParams returns a
    // ReadonlyURLSearchParams which implements entries(), as does URLSearchParams.
    const entries = Array.from((searchParams as any).entries?.() ?? []) as [string, string][];
    if (!entries.length) return undefined;

    return entries.map(([k, v]) => ({ field: k, operator: 'equals', value: v } as FilterConfig));
  } catch (e) {
    // Be resilient: fall back to undefined if anything unexpected happens
    return undefined;
  }
}

export default getInitialFiltersFromSearchParams;
