# Pocketly Frontend Development Guidelines

## Project Context

**Pocketly** is an AI-powered personal finance tracker with:

- Receipt scanning (OpenAI Vision)
- Manual expense tracking
- AI chatbot (RAG + NL2SQL)
- Spending analytics & pattern detection

**Tech Stack:**

- Next.js 16.3.5 + React 19 + TypeScript
- shadcn/ui + Tailwind CSS 4
- TanStack Query + Zustand
- ESLint 9

## Backend API

**Base URL:** `http://localhost:8080/api/v1`

### Key Endpoints

- `POST /register` → `{name, email, token}`
- `POST /login` → `{name, email, token}`
- `POST /transactions` → Create expense (manual or from scan)
- `GET /transactions` → List all user expenses
- `POST /transactions/scan` → Upload receipt image (multipart)
- `PUT /transactions/:id` → Update expense
- `DELETE /transactions/:id` → Delete expense

**Auth:** Bearer token in `Authorization` header, stored in localStorage

## Folder Organization

Read `docs/ARCHITECTURE.md` before starting work. Key principle:

- **Features live in `src/features/[feature-name]/`** with components, hooks, API, types
- **No mixing concerns** — organized by domain, not by file type
- **App router is for routing only** — compose components from features

## Development Workflow

1. **Environment:** Create `.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`
2. **Install:** `npm install` (dependencies already in package.json)
3. **Run:** `npm run dev` → http://localhost:3000
4. **Lint:** `npm run lint`
5. **Format:** `npm run format` (Prettier; `format:check` runs in CI)
6. **Test:** `npm test` (Vitest unit/component), `npm run test:e2e` (Playwright, dummy-data mode)

A husky pre-commit hook runs ESLint + Prettier on staged files. CI (`.github/workflows/ci.yml`, currently disabled — manual trigger only) runs format check, lint, typecheck, tests, build and e2e.

## Coding Standards

✅ **Always:**

- Use TypeScript strict mode (no `any`)
- Create types in `types/api.ts` matching backend
- Use path aliases (@/lib, @/components, @/features)
- Use `cn()` for Tailwind class merging
- Organize features in `features/` folder
- Create hooks for API queries/mutations
- Use Zustand for client state, TanStack Query for server state

❌ **Never:**

- Relative imports (use `@/` instead)
- Inline styles (use Tailwind)
- Props drilling (use composition or context)
- Direct API calls outside apiClient wrapper

## Common Tasks

### Add Feature

```
src/features/[name]/
├── components/
├── hooks/
├── api.ts
└── types.ts
```

### Create Query Hook

```tsx
export const useMyData = () => {
  return useQuery({
    queryKey: ["my-data"],
    queryFn: () => apiClient.get("/endpoint"),
  });
};
```

### Create Mutation Hook

```tsx
export const useCreateItem = () => {
  return useMutation({
    mutationFn: (data) => apiClient.post("/items", data),
  });
};
```

## Important Notes

- **Backend is NOT yet mature** — expect API changes (team will notify)
- **No refresh token flow** — user logs in again on token expiry (401 response)
- **Categorization may fail** — fallback is "uncategorized", never block on it
- **Image processing via OpenAI** — backend handles, FE just uploads via multipart

## File Rules

- Prefer **Server Components** by default, add `"use client"` only when needed
- Keep components <200 lines
- Use meaningful filenames (kebab-case)
- Comment complex logic, not obvious code

## Questions?

Refer to docs/ARCHITECTURE.md for detailed patterns. Ask team for backend changes.
