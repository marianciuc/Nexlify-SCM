---

## Tech Stack Overview / Обзор технического стека

### Core Technologies / Основные технологии

- **Frontend Framework**: React 19.0.0 with TypeScript 5.7.2
- **Build Tool**: Vite 6.1.0
- **Routing**: TanStack Router v1.121.2 (File-based routing)
- **State Management**: Zustand 5.0.6
- **Data Fetching**: TanStack Query v5.83.0 (React Query)
- **Forms**: TanStack Form v1.14.1 + React Hook Form 7.60.0
- **Validation**: Zod 3.25.76
- **Styling**: TailwindCSS 4.0.6
- **UI Components**: Radix UI + Shadcn/ui
- **Icons**: Lucide React 0.476.0
- **Internationalization**: i18next 25.3.2
- **Testing**: Vitest 3.0.5
- **Code Quality**: ESLint 9.31.0 + Prettier 3.6.2

### API Integration / Интеграция API

- **HTTP Client**: openapi-fetch 0.14.0
- **Type Generation**: openapi-typescript 7.8.0
- **Authentication**: JWT with jose 6.0.12

---

## Component Architecture / Архитектура компонентов

### 1. Component Reusability / Переиспользование компонентов

**RULE**: Always check existing components before creating new ones / Всегда проверяйте существующие компоненты перед
созданием новых

#### Component Hierarchy / Иерархия компонентов

1. **Base UI Components** (`/src/components/ui/`):
    - Use Shadcn/ui components as foundation
    - Already available: Button, Card, Input, Select, Dialog, etc.
    - DO NOT create custom versions unless absolutely necessary

2. **Reusable Business Components** (`/src/components/`):
    - Create generic components that can be used across multiple features
    - Examples: `LoadingSpinner`, `ErrorBoundary`, `LanguageSwitcher`

3. **Feature-Specific Components** (`/src/components/[feature]/`):
    - Components specific to a business domain
    - Examples: `auth/`, `forms/`

4. **One-time Components**:
    - AVOID creating single-use components
    - If needed, make them generic for future reuse

#### Adding New UI Components / Добавление новых UI компонентов

```bash
# Use Shadcn CLI to add components
pnpx shadcn@latest add [component-name]
```

### 2. Component Structure / Структура компонентов

```tsx
// Component file structure example
import { ComponentProps } from 'react';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

// Props interface (if needed for internal component logic only)
interface ComponentNameProps extends ComponentProps<'div'> {
  variant?: 'default' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Brief description of what this component does
 * @param variant - Component visual variant
 * @param size - Component size
 */
export function ComponentName({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: ComponentNameProps) {
  return (
    <div
      className={cn(
        'base-classes',
        variant === 'destructive' && 'destructive-classes',
        size === 'sm' && 'small-classes',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

---

## Data Types and API Integration / Типы данных и интеграция API

### 1. Type Management / Управление типами

**CRITICAL RULE**: Never create custom interface or types for API data / Никогда не создавайте собственные интерфейсы
или типы для API данных

#### Auto-Generated Types / Автоматически генерируемые типы

- All API types MUST be auto-generated in `/src/types/api.ts`
- Use `pnpm generate:paths` command to update API types
- Generated from OpenAPI specification at `http://localhost:8888/v3/api-docs/aggregated`

#### When API Types Are Missing / Когда API типы отсутствуют

If required types don't exist in `/src/types/api.ts`:

1. **Document the requirement** in this guidelines.md file
2. **Add to the appropriate section** (Backend Tasks)
3. **Stop current work session** until backend provides the endpoint
4. **Format**:

```markdown
### Required API Endpoints / Требуемые API эндпоинты

- [BLOCKED] [HIGH] `POST /api/companies/register` - Company registration endpoint with Tax ID validation
- [BLOCKED] [HIGH] `GET /api/users/profile` - User profile data with company information
```

### 2. Type Import Patterns / Паттерны импорта типов

```tsx
// Correct way to import API types
import type { UserProfile, CompanyDetails } from '@/types/api';

// Use for internal component logic only
interface LocalComponentState {
  isLoading: boolean;
  error: string | null;
}
```

---

## Styling Guidelines / Руководство по стилизации

### 1. TailwindCSS Usage / Использование TailwindCSS

**Primary styling method**: TailwindCSS classes
**Utility**: `cn()` function for conditional classes from `/src/lib/utils`

```tsx
// Correct usage
import { cn } from '@/lib/utils';

<div
  className={cn(
    'flex items-center justify-between p-4 rounded-lg border',
    isActive && 'bg-primary text-primary-foreground',
    disabled && 'opacity-50 pointer-events-none',
    className
  )}
/>;
```

### 2. Design System / Система дизайна

- **Color Palette**: Defined in `/src/styles.css` with CSS custom properties
- **Spacing**: Use Tailwind spacing scale (4px base unit)
- **Typography**: System font stack defined in `/src/styles.css`
- **Radius**: Consistent border radius using `--radius` custom property

### 3. Component Variants / Варианты компонентов

Use `class-variance-authority` for component variants:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

---

## Icons and Assets / Иконки и ассеты

### 1. Icon Library / Библиотека иконок

**Primary Source**: Lucide React (already installed)

```tsx
// Correct icon usage
import { Camera, ChevronRight, Settings } from 'lucide-react';

// In component
<Settings className='h-4 w-4' />;
```

### 2. Icon Guidelines / Руководство по иконкам

- **Default size**: `h-4 w-4` (16px)
- **Consistent sizing**: Use Tailwind size classes
- **Accessibility**: Always provide meaningful context

```tsx
// Good example
<Button>
  <Settings className="h-4 w-4 mr-2" />
  Settings
</Button>

// With accessibility
<Button aria-label="Open settings">
  <Settings className="h-4 w-4" />
</Button>
```

---

## Data Fetching / Получение данных

### 1. TanStack Query (React Query) / TanStack Query

**Primary method** for API calls and caching

#### Query Structure / Структура запросов

```tsx
// /src/queries/[feature].queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/service/api/apiClient';
import type { UserProfile } from '@/types/api';

// Query hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => apiClient.GET('/api/users/profile'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation hooks
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => apiClient.PUT('/api/users/profile', { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};
```

### 2. API Client / API клиент

Use `openapi-fetch` for type-safe API calls:

```tsx
// /src/service/api/apiClient.ts
import createClient from 'openapi-fetch';
import type { paths } from '@/types/api';

export const apiClient = createClient<paths>({
  baseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:8888',
});
```

---

## State Management / Управление состоянием

### 1. Local State / Локальное состояние

- **React useState**: For component-level state
- **TanStack Form**: For form state management
- **TanStack Query**: For server state

### 2. Global State / Глобальное состояние

Use **Zustand** for client-side global state:

```tsx
// /src/service/auth/auth-store.ts
import { create } from 'zustand';
import type { User } from '@/types/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  login: user => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

---

## Routing / Маршрутизация

### 1. File-based Routing / Файловая маршрутизация

Using **TanStack Router** with file-based routing in `/src/routes/`

#### Route Structure / Структура маршрутов

```
src/routes/
├── __root.tsx              # Root layout
├── index.tsx               # Home page (/)
├── about.tsx               # About page (/about)
├── auth/
│   ├── login.tsx           # /auth/login
│   └── register.tsx        # /auth/register
└── dashboard/
    ├── route.tsx           # Dashboard layout
    ├── index.tsx           # /dashboard
    └── settings/
        └── route.tsx       # /dashboard/settings
```

#### Route Component Pattern / Паттерн компонентов маршрутов

```tsx
// Route file example
import { createFileRoute } from '@tanstack/react-router';
import { DashboardComponent } from '@/components/dashboard/DashboardComponent';

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
  loader: async () => {
    // Data loading logic
    return await fetchDashboardData();
  },
});
```

---

## Internationalization / Интернационализация

### 1. i18next Setup / Настройка i18next

Translation files located in `/public/locales/[lang]/translation.json`

```tsx
// Component usage
import { useTranslation } from 'react-i18next';

export function Component() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('menu.dashboard')}</h1>
      <p>{t('common.welcome', { name: user.name })}</p>
    </div>
  );
}
```

### 2. Translation Key Structure / Структура ключей перевода

```json
{
  "menu": {
    "dashboard": "Dashboard",
    "orders": "Orders",
    "settings": "Settings"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading..."
  },
  "errors": {
    "network": "Network error occurred",
    "validation": "Please check your input"
  }
}
```

---

## Form Management / Управление формами

### 1. Form Libraries / Библиотеки форм

**Primary**: TanStack Form with Zod validation

```tsx
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      // Submit logic
    },
    validatorAdapter: zodValidator,
    validators: {
      onChange: formSchema,
    },
  });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {/* Form fields */}
    </form>
  );
}
```

---

## Error Handling / Обработка ошибок

### 1. Error Boundaries / Границы ошибок

Use the existing `ErrorBoundary` component:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <ComponentThatMightThrow />
</ErrorBoundary>;
```

### 2. API Error Handling / Обработка ошибок API

```tsx
import { toast } from 'sonner';

const { mutate, isError, error } = useMutation({
  mutationFn: apiCall,
  onError: error => {
    toast.error(error.message || 'An error occurred');
  },
  onSuccess: () => {
    toast.success('Operation completed successfully');
  },
});
```

---

## Testing Guidelines / Руководство по тестированию

### 1. Testing Setup / Настройка тестирования

- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **DOM Environment**: jsdom

### 2. Test Structure / Структура тестов

```tsx
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ComponentName } from './ComponentName';

test('renders component correctly', () => {
  render(<ComponentName />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

---

## Code Quality / Качество кода

### 1. ESLint and Prettier / ESLint и Prettier

- **ESLint**: Configured with TypeScript, React, and import rules
- **Prettier**: Code formatting with specific rules
- **Husky**: Pre-commit hooks for code quality

### 2. Import Organization / Организация импортов

```tsx
// External libraries (React, third-party)
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// Internal modules (with line break)
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/service/auth/auth-store';
import type { User } from '@/types/api';
```

### 3. Comments / Комментарии

**RULE**: Comments MUST be written in English only / Комментарии ДОЛЖНЫ быть написаны только на английском

```tsx
/**
 * Main dashboard component that displays user overview and quick actions
 * Handles authentication state and redirects unauthorized users
 */
export function Dashboard() {
  // Initialize auth state and check permissions
  const { user, isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  return (
    // Component JSX
  );
}
```

#### Comment Guidelines / Руководство по комментариям

- **Function/Class comments**: Use JSDoc format above functions and classes
- **Inline comments**: Brief explanations for complex logic
- **TODO comments**: Include ticket/issue reference when possible
- **Language**: English only, regardless of team nationality

---

## Performance Guidelines / Руководство по производительности

### 1. Component Optimization / Оптимизация компонентов

```tsx
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  return <ComplexVisualization data={data} onUpdate={onUpdate} />;
});

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return expensiveDataProcessing(rawData);
}, [rawData]);

// Use useCallback for event handlers
const handleUpdate = useCallback(
  (id: string) => {
    updateItem(id);
  },
  [updateItem]
);
```

### 2. Bundle Optimization / Оптимизация бандла

- **Lazy loading**: Use dynamic imports for routes
- **Tree shaking**: Import only needed functions
- **Code splitting**: Automatic with Vite

---

## Security Guidelines / Руководство по безопасности

### 1. Authentication / Аутентификация

```tsx
// JWT handling with jose library
import { jwtVerify } from 'jose';

// Secure token storage (use cookies, not localStorage)
import Cookies from 'js-cookie';

const token = Cookies.get('authToken');
```

### 2. Input Validation / Валидация ввода

```tsx
// Always validate inputs with Zod
const userInputSchema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150),
});

// Sanitize before display
const sanitizedContent = DOMPurify.sanitize(userContent);
```

---

## File Organization / Организация файлов

### 1. Directory Structure / Структура директорий

```
src/
├── components/           # Reusable components
│   ├── ui/              # Base UI components (Shadcn)
│   ├── auth/            # Authentication components
│   └── forms/           # Form components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── queries/             # TanStack Query hooks
├── routes/              # File-based routing
├── service/             # Business logic and API
│   ├── api/            # API clients
│   └── auth/           # Authentication logic
├── types/               # TypeScript type definitions
└── styles.css          # Global styles
```

### 2. File Naming / Именование файлов

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useUserData.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types**: kebab-case (`user-profile.types.ts`)

---

## Development Workflow / Рабочий процесс разработки

### 1. Development Commands / Команды разработки

```bash
# Development server
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix

# Formatting
pnpm format
pnpm format:check

# Testing
pnpm test

# Build
pnpm build
```

### 2. Pre-commit Checklist / Чек-лист перед коммитом

1. ✅ All TypeScript errors resolved
2. ✅ ESLint warnings addressed
3. ✅ Code formatted with Prettier
4. ✅ Tests passing
5. ✅ No console.log statements
6. ✅ Comments in English only
7. ✅ API types up to date

---

## Common Patterns / Общие паттерны

### 1. Loading States / Состояния загрузки

```tsx
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function DataComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

### 2. Form Patterns / Паттерны форм

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export function StandardForm() {
  return (
    <Form>
      <FormField
        name='email'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <Input {...field} type='email' />
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type='submit'>Submit</Button>
    </Form>
  );
}
```

### 3. Modal Patterns / Паттерны модальных окон

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ModalExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Modal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
        </DialogHeader>
        {/* Modal content */}
      </DialogContent>
    </Dialog>
  );
}
```

---

**This document serves as the primary reference for all development work on this project. Any deviation from these
guidelines must be discussed and approved by the team lead.**

**Данный документ служит основным справочником для всех работ по разработке этого проекта. Любые отклонения от этих
рекомендаций должны быть обсуждены и одобрены руководителем команды.**

---
