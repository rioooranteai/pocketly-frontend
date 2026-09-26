# Pocketly Frontend - Architecture & Development Guide

**Last Updated:** 2026-09-24

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
│   ├── page.tsx                  # Redirects to /login
│   ├── globals.css               # Design tokens + global styles
│   ├── providers.tsx             # QueryClientProvider (getQueryClient)
│   ├── (auth)/                   # Public pages: login, register
│   │   └── layout.tsx
│   └── (app)/                    # Protected pages (AuthGuard + Sidebar)
│       ├── layout.tsx
│       ├── dashboard/page.tsx
│       └── transactions/page.tsx
│
├── components/
│   ├── ui/                       # Base UI primitives (shadcn/ui style)
│   │   ├── button.tsx            # Variants: default, primary, destructive, …
│   │   ├── input.tsx, password-input.tsx, field-error.tsx
│   │   ├── label.tsx
│   │   ├── dialog.tsx
│   │   └── sheet.tsx             # Side panel (Radix Dialog docked to an edge)
│   └── shared/                   # App-wide composite components
│       ├── auth-guard.tsx
│       ├── confirm-dialog.tsx
│       ├── mobile-nav.tsx        # Top bar + sidebar drawer below md
│       ├── sidebar.tsx           # variant: rail (desktop) | drawer (mobile)
│       └── sidebar-nav-item.tsx
│
├── features/                     # Feature-based organization
│   ├── auth/
│   │   ├── components/           # Login/Register forms, auth visual panel
│   │   ├── hooks/                # useLogin, useRegister, useLogout
│   │   └── api.ts
│   ├── transactions/
│   │   ├── components/           # View, toolbar, grouped list, detail
│   │   │                         # sheet, add modal + steps, fields form
│   │   ├── hooks/                # Queries/mutations, useReceiptFile
│   │   ├── api.ts
│   │   ├── categories.ts         # Label/icon/color per category + fallback
│   │   ├── list-utils.ts         # Month filter, search, day groups
│   │   ├── query-keys.ts         # transactionKeys factory
│   │   ├── schemas.ts            # zod form validation
│   │   ├── types.ts              # Form-side types
│   │   └── utils.ts              # Form <-> API payload mapping
│   └── dashboard/
│       ├── components/           # Widgets, general → specific (see
│       │                         # dashboard-view.tsx for the grid order)
│       ├── hooks/                # useDashboard
│       ├── api.ts                # Dummy data until GET /dashboard ships
│       ├── mock-data.ts          # Seeded, self-consistent dummy data
│       ├── query-keys.ts         # dashboardKeys factory
│       └── utils.ts              # Chart helpers (calendar, heat levels)
│
├── lib/                          # Utilities & configuration
│   ├── api-client.ts             # HTTP client, ApiError, getErrorMessage
│   ├── query-client.ts           # getQueryClient (per-request on server)
│   ├── utils.ts                  # cn, format*, toDateInputValue
│   └── constants.ts              # Routes, storage keys, validation
│
├── mocks/                        # Dummy API (MSW) for dev without backend
│   ├── handlers.ts               # Mirrors the backend endpoints
│   ├── seed.ts, db.ts            # Seed data + sessionStorage-backed store
│   └── browser.ts
│
├── types/
│   └── api.ts                    # Backend DTOs & API types
│
└── stores/                       # Zustand stores (client state)
    ├── auth.ts                   # Token + user (persisted: pocketly_auth)
    └── ui-store.ts               # Sidebar collapse (persisted: pocketly_ui)
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

> Source of truth: the backend's `docs/api-contract.md`. `src/types/api.ts`
> mirrors it; when they disagree, the contract wins.

```typescript
AuthResponse {            // /register, /login — NOT wrapped in `data`
  name: string
  email: string
  token: string           // JWT, valid 12 hours, no refresh
}

Transaction {             // wrapped as {data} or {message, data}
  id: string (UUID)
  description: string
  category: Category      // server-assigned, never sent by the FE
  total_amount: number    // server-computed, never sent by the FE
  date: string            // full RFC 3339 with offset; bare dates rejected
  items: TransactionItem[]
}

TransactionItem {         // no id
  name: string
  quantity: number        // integer >= 0
  price: number           // >= 0
}

Category = "food" | "transportation" | "shopping" | "bills"
         | "entertainment" | "health" | "others" | "uncategorized"
```

Errors are `{ "error": string }` (unknown routes: plain-text 404). DELETE
answers 204 with no body. Receipt uploads are capped at 5MB and rate-limited
(429 + `Retry-After`).

**Auth Flow:**

- Response: `{name, email, token}`
- Token held in the Zustand auth store, persisted to localStorage (key: `pocketly_auth`)
- Sent via `Authorization: Bearer <token>` header
- No refresh token — on a 401 `apiClient` clears the session + query cache and AuthGuard sends the user to /login

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
- Build query keys with a per-feature factory (`query-keys.ts`), never inline arrays
- Pass TanStack Query's `signal` through so requests cancel on unmount
- Example:
  ```tsx
  export function useTransactions() {
    return useQuery({
      queryKey: transactionKeys.lists(),
      queryFn: ({ signal }) => transactionsApi.list(signal),
    });
  }
  ```
- Show API errors with `getErrorMessage(error, fallback)` from `@/lib/api-client`

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

### Mode data dummy (tanpa backend)

Set `NEXT_PUBLIC_API_MOCKING=enabled` di `.env.local`, lalu `npm run dev`.
MSW mencegat request di level network, jadi kode aplikasi tidak berubah.
Hanya aktif di development; badge "Mode data dummy" tampil di bawah layar.

- Login: email/password apa saja. Password `salah` → error login.
- Register dengan email `sudah@…` → error "Email sudah terdaftar".
- Scan: upload gambar apa saja (±2,5 detik). Nama file berisi `gagal` → error scan.
- Data tersimpan di sessionStorage; `pocketlyMock.reset()` di console lalu reload untuk data awal.

---

## 🎨 Design System

**Theme:** Light main app + fixed dark collapsible sidebar (not a light/dark toggle — sidebar is always dark by design).

**Reference mockups:** Coral financial dashboard (main palette) + Zarss/Dappr style dark sidebar (structure/layout).

### Color Tokens (defined in `src/app/globals.css`)

| Purpose                            | Tailwind class                | Value                  |
| ---------------------------------- | ----------------------------- | ---------------------- |
| App background                     | `bg-background`               | `#F2EFEA`              |
| Card surface                       | `bg-card`                     | `#FFFFFF`              |
| Brand/primary (CTA, active states) | `bg-primary` / `text-primary` | `#E8684A`              |
| Muted text                         | `text-muted-foreground`       | `#8C8985`              |
| Border                             | `border-border`               | `#E7E3DF`              |
| Sidebar background                 | `bg-sidebar`                  | `#1C1C1E` (fixed dark) |
| Sidebar text                       | `text-sidebar-foreground`     | `#9C9C9C`              |
| Sidebar active item                | `bg-sidebar-accent`           | `#2A2A2C`              |
| **Income (positive)**              | `text-income` / `bg-income`   | `#22A06B`              |
| **Expense/warning (negative)**     | `text-expense` / `bg-expense` | `#E5484D`              |
| Chart layers                       | `bg-chart-1` … `bg-chart-5`   | Coral → peach gradient |
| Magnitude ramp (calendar, bars)    | `bg-heat-0` … `bg-heat-4`     | Empty → dark coral     |

**Semantic finance rule:** Always use `income`/`expense` tokens (not `primary`) for money direction indicators — e.g. `+Rp50.000` in green, `-Rp50.000` in red. `primary` (coral) is reserved for brand/CTA/neutral UI, not for signaling good/bad.

### Charts

Recharts for axis charts (area, bar); plain HTML/SVG for the rest. Rules:
one series = one color (`primary`), emphasis = one bar in `primary` and
the rest in `heat-1`, magnitude = the `heat-*` ramp (validated: monotone
lightness, light end ≥ 2:1 on white). Text never takes the series color.
Every chart has an `sr-only` table twin. Runtime widths (progress bars)
use SVG `width` attributes, not inline styles.

### Border Radius

Base `--radius: 1.25rem` (20px) — generous rounding, no sharp 90° corners anywhere. Use `rounded-lg`/`rounded-xl` on cards, `rounded-2xl`/`rounded-3xl` on outer containers/hero sections.

### Sidebar

- Fixed dark theme regardless of app color mode
- Collapsible: icon+label ↔ icon-only
- Active nav item: coral left-indicator or `bg-sidebar-accent` background
- Build with shadcn/ui's `Sidebar` component pattern (uses these same `--sidebar-*` tokens automatically)
