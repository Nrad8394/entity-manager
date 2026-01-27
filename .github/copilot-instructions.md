# Entity Manager - Copilot Instructions

## Architecture Overview

This is a **Next.js 16 + Django REST** app using a modular **Entity Manager** system for CRUD operations. The Entity Manager has a 5-layer architecture:
1. **Primitives** - Zero-dependency types/hooks (`components/entityManager/primitives/`)
2. **Components** - Standalone UI: List, Form, View, Actions, Exporter
3. **Composition** - Builders, state, API integration (`components/entityManager/composition/`)
4. **Features** - Domain modules (`components/features/{module}/`)
5. **Orchestration** - Thin coordinator (`components/entityManager/orchestrator/`)

## Feature Implementation Pattern

Use `components/features/accounts/users/` as the **canonical reference** for all new features:

```
components/features/{module}/{entity}/
├── api/
│   └── client.ts        # createHttpClient<EntityType>() wrapper
├── config/
│   ├── index.tsx        # EntityConfig export (combines all configs)
│   ├── fields.tsx       # FormField[] definitions with validation
│   ├── list.tsx         # EntityListConfig with columns
│   ├── view.tsx         # EntityViewConfig with display fields
│   ├── actions.tsx      # EntityActionsConfig (row/bulk actions)
│   ├── form.tsx         # EntityFormConfig (layout, sections)
│   └── export.tsx       # EntityExporterConfig
└── types.tsx            # Entity type extending BaseEntity

app/dashboard/({route-group})/{entity}/
├── page.tsx             # Main list page with EntityManager
└── [id]/
    ├── page.tsx         # View detail page
    └── edit/
        └── page.tsx     # Edit form page
```

## Key Patterns

### 1. API Client Creation
Always use `createHttpClient` from entityManager - it handles auth, CSRF, pagination automatically:

```typescript
// components/features/{module}/{entity}/api/client.ts
import { createHttpClient } from '@/components/entityManager';
import { MyEntity } from '../../types';

export const myEntityApiClient = createHttpClient<MyEntity, {
  custom_action: MyEntity;  // Map action names to return types
}>({
  endpoint: '/api/v1/{module}/{entity}/',
});
```

### 2. Entity Config Structure
The main config in `config/index.tsx` must include all sub-configs:

```typescript
export const entityConfig: EntityConfig<MyEntity> = {
  name: 'entity',
  label: 'Entity',
  labelPlural: 'Entities',
  list: EntityListConfig,
  form: EntityFormConfig,
  view: EntityViewConfig,
  actions: EntityActionsConfig,
  exporter: EntityExporterConfig,
  apiEndpoint: '/api/v1/module/entities/',
  onValidate: async (values) => { /* return errors object */ },
};
```

### 3. Page Component Pattern
Pages use `EntityManager` with `usePageActions` for header buttons:

```typescript
'use client';
import { EntityManager } from '@/components/entityManager';
import { entityConfig } from '@/components/features/.../config';
import { entityApiClient } from '@/components/features/.../api/client';
import { usePageActions } from '../../layout';

export default function EntitiesPage() {
  const { setPageActions } = usePageActions();
  const [initialView, setInitialView] = useState<EntityManagerView>('list');

  useEffect(() => {
    setPageActions(<Button onClick={() => setInitialView('create')}>Add</Button>);
    return () => setPageActions(null);
  }, [setPageActions]);

  return (
    <EntityManager
      config={{
        config: entityConfig,
        apiClient: entityApiClient,
        initialView,
        onViewChange: (view) => setInitialView(view),
        features: { offline: false, realtime: false, optimistic: true },
      }}
    />
  );
}
```

### 4. Field Configuration - All 21+ Field Types

```typescript
// Basic fields
{ name: 'title', type: 'text', required: true }
{ name: 'count', type: 'number', min: 0, max: 100 }
{ name: 'email', type: 'email', validation: [{ type: 'email' }] }
{ name: 'password', type: 'password', visible: (values) => !values.id }  // Create only
{ name: 'website', type: 'url' }
{ name: 'phone', type: 'tel' }
{ name: 'bio', type: 'textarea', rows: 4 }

// Selection fields
{ name: 'status', type: 'select', options: [{ label: 'Active', value: 'active' }] }
{ name: 'tags', type: 'multiselect', options: [...] }
{ name: 'priority', type: 'radio', options: [...] }
{ name: 'features', type: 'checkbox' }  // Single checkbox
{ name: 'is_active', type: 'switch' }
{ name: 'is_verified', type: 'boolean' }

// Date/Time fields
{ name: 'start_date', type: 'date' }
{ name: 'created_at', type: 'datetime' }
{ name: 'start_time', type: 'time' }

// File fields
{ name: 'document', type: 'file', accept: '.pdf,.doc' }
{ name: 'avatar', type: 'image', maxSize: 5000000 }

// Special fields
{ name: 'theme', type: 'color' }
{ name: 'progress', type: 'range', min: 0, max: 100 }
{ name: 'metadata', type: 'json' }

// Relation fields (foreign keys) - use for Django FK/M2M
{
  name: 'role_name',
  type: 'relation',
  relationConfig: {
    entity: 'UserRole',
    displayField: 'description',
    valueField: 'name',
    fetchOptions: async (search) => {
      const response = await relatedApiClient.list({ search });
      return getListData(response);
    },
  },
}

// Custom component (when standard types don't fit)
{ name: 'permissions', type: 'custom', component: PermissionSelector }
```

### 5. Actions Pattern
Actions use `actionType`: `immediate`, `confirm`, `form`, `modal`, `navigation`, `bulk`, `download`, `custom`:

```typescript
{
  id: 'approve',
  actionType: 'confirm',
  position: 'row',
  visible: (entity) => !entity?.is_approved,
  onConfirm: async (entity, context) => {
    await apiActions.approve(entity.id);
    await context?.refresh();
  },
}
```

### 6. List View Modes
EntityList supports 8 view modes: `table`, `card`, `list`, `grid`, `compact`, `timeline`, `detailed`, `gallery`

```typescript
export const EntityListConfig: EntityListConfig<MyEntity> = {
  columns: [...],
  view: 'table',  // Default view mode
  toolbar: {
    search: true,
    filters: true,
    viewSwitcher: true,  // Allow users to switch modes
    columnSelector: true,
    refresh: true,
    export: true,
  },
  selectable: true,
};
```

## Custom Components Pattern

**When EntityManager standard fields don't fit**, create custom components. See `components/features/accounts/permissions/` as reference:

```
components/features/{module}/{entity}/
├── CustomComponent.tsx   # Your custom UI component
├── client.ts             # API client with custom actions
├── index.tsx             # Exports
└── types.tsx             # Types
```

Example: `PermissionSelector` handles complex permission grouping that can't be done with standard `multiselect`:

```typescript
// In fields config, use type: 'custom'
{
  name: 'permissions',
  type: 'custom',
  component: PermissionSelector,
  componentProps: {
    mode: 'select',
    onSelectionChange: (permissions) => { /* handle */ },
  },
}
```

**When to create custom components:**
- Complex nested/grouped data (like permissions by app)
- Custom validation/interaction logic
- Specialized visualizations
- Multi-step selection workflows

## Route Groups Pattern

Dashboard uses Next.js **route groups** `(groupname)` to organize related entities without affecting URL:

```
app/dashboard/
├── (accounts)/           # User management - URL: /dashboard/users
│   ├── users/
│   ├── roles/
│   └── profiles/
├── (academics)/          # Academic entities - URL: /dashboard/subjects
│   ├── subjects/
│   ├── classes/
│   └── grades/
├── (scheduling)/         # Timetable related - URL: /dashboard/timetable
│   └── timetable/
└── (institution)/        # School setup - URL: /dashboard/schools
    └── schools/
```

**When to create a new route group:**
- New domain/module with 2+ related entities
- Different access control requirements
- Separate navigation section needed

**When to add to existing group:**
- Entity logically belongs to that domain
- Shares types/utilities with group entities

## Django Backend Integration

### API Structure (in `django_starter_template_backend/`)

```
apps/{module}/
├── models.py        # Django models with UUID primary keys
├── serializers.py   # Separate List/Detail/Create/Update serializers
├── views.py         # ViewSets extending BaseModelViewSet
├── urls.py          # Router registration
└── services.py      # Business logic (UserService, RoleService, etc.)
```

### URL Pattern
All APIs follow: `/api/v1/{app_name}/{resource}/`

```python
# urls.py example
router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'user-roles', views.UserRoleViewSet, basename='user-role')
```

### Serializer Pattern
Use separate serializers per action:

```python
def get_serializer_class(self):
    if self.action == 'list': return UserListSerializer
    elif self.action == 'retrieve': return UserDetailSerializer
    elif self.action == 'create': return UserCreateSerializer
    elif self.action in ['update', 'partial_update']: return UserUpdateSerializer
    return UserDetailSerializer
```

### Custom Actions
Define custom endpoints with `@action` decorator:

```python
@action(detail=True, methods=['post'])
def approve(self, request, pk=None):
    user = self.get_object()
    success = UserService.approve_user(user, request.user)
    return Response({'message': 'User approved'})
```

Frontend calls via: `apiClient.customAction(id, 'approve', { data })`

### Filter/Search/Ordering
Configure in ViewSet:

```python
search_fields = ['email', 'first_name', 'last_name']
ordering_fields = ['created_at', 'email', 'is_active']
ordering = ['-created_at']  # Default ordering
```

Frontend uses Django field lookups: `__icontains`, `__gte`, `__lte`, `__in`, `__isnull`

## Development Commands

```bash
# Frontend (entity-manager/)
npm run dev          # Start Next.js dev server (Turbopack)
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
npm run test         # Run Vitest tests

# Backend (django_starter_template_backend/django_starter_template/)
py manage.py runserver    # Start Django dev server
py manage.py migrate      # Apply migrations
py manage.py makemigrations {app_name}  # Create migrations
```

## Types Location

- Shared entity types: `components/features/{module}/types.tsx`
- EntityManager types: `components/entityManager/primitives/types.ts`
- Config types: `components/entityManager/composition/config/types.ts`

## UI Components

Uses **shadcn/ui** components from `components/ui/`. Icons from `lucide-react`.
