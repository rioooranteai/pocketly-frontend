# Pocketly Frontend - Architecture & Development Guide

**Last Updated:** 2025-09-23

## 📋 Project Overview

**Pocketly** is an AI-powered personal finance tracker application that helps users:
- 📸 Automatically extract expenses from receipt images using AI vision
- 📝 Manually log financial transactions
- 📊 View interactive dashboards with spending analytics
- 💬 Chat with an AI assistant for financial insights (RAG + NL2SQL)
- 🔍 Get automatic spending pattern analysis and recommendations

**Tech Stack:**
- **Framework**: Next.js 16.3.5 (App Router, React 19)
- **UI**: shadcn/ui + Tailwind CSS 4
- **State Management**: TanStack Query + Zustand
- **Language**: TypeScript strict mode
- **Linting**: ESLint 9
- **Backend**: Go (Gin + GORM + SQLite)

---

## 🏗️ Folder Structure

```
src/
├── app/                          # Next.js App Router (routing only)
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home/landing page
│   ├── globals.css               # Global Tailwind styles
│   ├── providers.tsx             # QueryClientProvider wrapper
│   ├── (auth)/                   # Route group for public pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── dashboard/                # Protected routes
│       ├── layout.tsx
│       └── page.tsx
│
├── components/
│   ├── ui/                       # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── shared/                   # Composite components
│       ├── navbar.tsx
│       ├── sidebar.tsx
│       └── ...
│
├── features/                     # Feature-based organization
│   ├── auth/
│   │   ├── components/           # Login/Register forms
│   │   ├── hooks/                # useLogin, useRegister, useAuth
│   │   ├── api.ts                # Auth API calls
│   │   └── types.ts              # Auth-specific types
│   ├── transactions/
│   │   ├── components/           # Transaction list, detail, form
│   │   ├── hooks/                # useCreateTransaction, useTransactions
│   │   ├── api.ts                # Transaction API calls
│   │   └── types.ts
│   ├── dashboard/
│   │   ├── components/           # Dashboard widgets, charts
│   │   ├── hooks/                # useDashboardData
│   │   └── api.ts
│   └── chatbot/
│       ├── components/           # Chat UI
│       ├── hooks/                # useChat
│       └── api.ts
│
├── hooks/                        # Global hooks (not tied to features)
│   ├── use-debounce.ts
│   ├── use-local-storage.ts
│   └── use-media-query.ts
│
├── lib/                          # Utilities & configuration
│   ├── api-client.ts             # HTTP client wrapper
│   ├── query-client.ts           # React Query configuration
│   ├── utils.ts                  # Helper functions (cn, format*)
│   └── constants.ts              # Routes, storage keys, validation
│
├── types/                        # Global type definitions
│   └── api.ts                    # Backend DTOs & API types
│
└── stores/                       # Zustand stores (client state)
    └── auth.ts                   # User auth state
```

---

## 🔌 Key Integrations & APIs

### Backend Endpoints (v1 API)

**Base URL**: `http://localhost:8080/api/v1`

#### Auth
```
POST   /register                  # Register new user
POST   /login                     # Login user → returns {name, email, token}
```

#### Transactions
```
POST   /transactions              # Create transaction
GET    /transactions              # List all user transactions
GET    /transactions/:id          # Get single transaction
PUT    /transactions/:id          # Update transaction
DELETE /transactions/:id          # Delete transaction
POST   /transactions/scan         # Upload receipt image → AI extracts items
```

#### Data Models
```typescript
User {
  id: string
  name: string
  email: string
  createdAt: string
}

Transaction {
  id: string
  description: string
  category: string
  total_amount: number
  date: string (ISO 8601)
  items: TransactionItem[]
  createdAt?: string
}

TransactionItem {
  name: string
  quantity: number
  price: number
}
```

**Auth Flow:**
- Response: `{name, email, token}`
- Token stored in localStorage (key: `pocketly_token`)
- Sent via `Authorization: Bearer <token>` header
- No refresh token — login again when expired (401)

---

## 🎨 Architecture Patterns

### 1. **Feature-Based Organization**
- Each feature lives in its own folder: `features/[feature-name]/`
- Contains: components, hooks, API calls, and feature-specific types
- Prevents mixing concerns and makes code discovery easy

### 2. **Server vs Client Components**
- **Default to Server Components** (faster, safer)
- Add `"use client"` only when you need interactivity
- Place `"use client"` as deep in tree as possible (leaf components)

### 3. **API Queries & Mutations**
- Use **TanStack Query** for server state (fetching, caching, syncing)
- Create `hooks/` in each feature folder for queries/mutations
- Example:
  ```tsx
  export const useTransactions = () => {
    return useQuery({
      queryKey: ["transactions"],
      queryFn: () => apiClient.get("/transactions"),
    });
  };
  ```

### 4. **State Management**
- **TanStack Query**: Server state (data from API, caching, refetch)
- **Zustand**: Client state (UI state, auth, preferences)
- **useState**: Local component state only

---

## 🚀 Development Tips

- Always start features in `features/` folder
- Use path aliases (@/lib, @/components, @/features)
- Keep page components thin — compose from feature components
- Use `cn()` for Tailwind class merging
- Derive types from backend models in `types/api.ts`


---

## 🎨 Design System

**Theme:** Light main app + fixed dark collapsible sidebar (not a light/dark toggle — sidebar is always dark by design).

**Reference mockups:** Coral financial dashboard (main palette) + Zarss/Dappr style dark sidebar (structure/layout).

### Color Tokens (defined in `src/app/globals.css`)

| Purpose | Tailwind class | Value |
|---|---|---|
| App background | `bg-background` | `#F2EFEA` |
| Card surface | `bg-card` | `#FFFFFF` |
| Brand/primary (CTA, active states) | `bg-primary` / `text-primary` | `#E8684A` |
| Muted text | `text-muted-foreground` | `#8C8985` |
| Border | `border-border` | `#E7E3DF` |
| Sidebar background | `bg-sidebar` | `#1C1C1E` (fixed dark) |
| Sidebar text | `text-sidebar-foreground` | `#9C9C9C` |
| Sidebar active item | `bg-sidebar-accent` | `#2A2A2C` |
| **Income (positive)** | `text-income` / `bg-income` | `#22A06B` |
| **Expense/warning (negative)** | `text-expense` / `bg-expense` | `#E5484D` |
| Chart layers | `bg-chart-1` … `bg-chart-5` | Coral → peach gradient |

**Semantic finance rule:** Always use `income`/`expense` tokens (not `primary`) for money direction indicators — e.g. `+Rp50.000` in green, `-Rp50.000` in red. `primary` (coral) is reserved for brand/CTA/neutral UI, not for signaling good/bad.

### Border Radius
Base `--radius: 1.25rem` (20px) — generous rounding, no sharp 90° corners anywhere. Use `rounded-lg`/`rounded-xl` on cards, `rounded-2xl`/`rounded-3xl` on outer containers/hero sections.

### Sidebar
- Fixed dark theme regardless of app color mode
- Collapsible: icon+label ↔ icon-only
- Active nav item: coral left-indicator or `bg-sidebar-accent` background
- Build with shadcn/ui's `Sidebar` component pattern (uses these same `--sidebar-*` tokens automatically)

