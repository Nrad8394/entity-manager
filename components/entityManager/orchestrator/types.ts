/**
 * Entity Manager Types
 * 
 * Type definitions for the orchestrator.
 */

import { BaseEntity } from '../primitives/types';
import { EntityConfig } from '../composition/config/types';
import { ApiClient } from '../composition/api/types';
import { FilterConfig } from '../primitives/types/entity';

/**
 * Entity manager configuration
 */
export interface EntityManagerConfig<T extends BaseEntity = BaseEntity> {
  /** Entity configuration */
  config: EntityConfig<T>;
  
  /** API client (optional) */
  apiClient?: ApiClient<T>;

  /** Initial view mode (default: 'list') */
  initialView?: EntityManagerView;
  
  /** Initial entity ID (for edit/view modes) */
  initialId?: string | number;
  
  /** Initial data (optional) */
  initialData?: T[];
  
  /** Initial filters (optional) */
  initialFilters?: FilterConfig[];
  
  /** Callback when view changes */
  onViewChange?: (view: EntityManagerView) => void;
  
  /** Enable features */
  features?: {
    offline?: boolean;
    realtime?: boolean;
    optimistic?: boolean;
    collaborative?: boolean;
  };
}

/**
 * Entity manager props
 */
export interface EntityManagerProps<T extends BaseEntity = BaseEntity> {
  /** Configuration */
  // Accept either canonical config or legacy/compact shapes during migration
  config: EntityManagerConfig<T> | Record<string, any>;
  
  /** Custom className */
  className?: string;
  
  /** Children (optional - for custom layouts) */
  children?: React.ReactNode;
}

/**
 * View mode for entity manager
 */
export type EntityManagerView = 'list' | 'create' | 'edit' | 'view';

/**
 * Entity manager state
 */
export interface EntityManagerState {
  /** Current view */
  view: EntityManagerView;
  
  /** Selected entity ID (for edit/view) */
  selectedId: string | number | null;
}
