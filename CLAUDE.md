# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server on port 8080
npm run build        # Production build to dist/
npm run lint         # ESLint
npm run test         # Run all tests (vitest)
npx vitest run src/components/__tests__/TripCard.test.tsx  # Run a single test
```

## Architecture

ScubaTrip is a React + Vite SPA for scuba diving trip management with Supabase as the backend (auth, database, storage).

### Dual-Role System

Two main user roles with separate route trees:
- **Divers** (`/app/*`) — browse trips, make bookings, manage profile
- **Dive Center Admin/Staff** (`/admin/*`) — manage trips, approve bookings, manage staff

Routes are protected via `ProtectedRoute` component which checks role from `AuthContext`. Role is stored in the `user_roles` table, not Supabase auth metadata.

### Data Flow

```
Pages → Services (src/services/) → Supabase client → PostgreSQL
                                  ↑
React Query (caching/refetching)  │
Zustand (i18n store only)         │
AuthContext (session, role, diveCenterId)
```

- **Services layer** (`src/services/trips.ts`, `bookings.ts`, `profiles.ts`) contains all Supabase queries. Pages don't call Supabase directly.
- **React Query** wraps service calls for caching and optimistic updates.
- **AuthContext** (`src/contexts/AuthContext.tsx`) manages session persistence with a custom storage proxy (localStorage vs sessionStorage based on "remember me").

### Database

Supabase PostgreSQL with RLS. Migrations live in `supabase/migrations/`. Key tables: `trips`, `bookings`, `dive_centers`, `diver_profiles`, `staff_members`, `user_roles`. Custom enums for `app_role`, `booking_status`, `certification_level`, `trip_status`, `trip_difficulty`.

Auto-generated types: `src/integrations/supabase/types.ts` — do not edit manually.

### UI & Styling

- shadcn/ui components in `src/components/ui/` (Radix primitives + Tailwind)
- `cn()` utility from `src/lib/utils.ts` for class merging (clsx + tailwind-merge)
- Custom color palette: `ocean`, `teal`, `coral`, `cyan-electric` defined in `tailwind.config.ts`
- Dark mode via CSS class strategy

### i18n

Custom Zustand-based i18n (`src/lib/i18n.ts`) with locale files in `src/lib/locales/` (en, es). Use `useI18n()` hook's `t()` function for translations.

### Forms

React Hook Form + Zod schemas (defined in `src/lib/schemas.ts`). Includes custom validators for future dates and E.164 phone format.

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig and vite).

## Environment

Requires `.env` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID`. See `.env.example`.

## Rules

- Never modify `.env` — it contains live production credentials
- All DB changes go in `supabase/migrations/` only — never edit the database directly
- Always include updated RLS policies when making schema changes
- Run `npm run dev` to verify locally before committing anything
- The owner is not a Git expert — always explain git commands before running them
