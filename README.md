# Ameorids — Command Center

A single internal dashboard for managing Ameorids' projects, accounts (finances), meetings and activity — built as a modern React + Supabase SaaS-style product, with a fully working LocalStorage demo mode so it runs with zero configuration.

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router
- Lucide icons
- Supabase (`@supabase/supabase-js`) for auth, database and realtime — with a LocalStorage fallback for demo/dev use
- No Node/Express backend — the frontend talks to Supabase directly

## Quick start (demo mode — no setup required)

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`). The app boots straight into **Demo Mode**: all data (projects, transactions, meetings, activity) lives in your browser's LocalStorage and comes pre-seeded with realistic Ameorids sample data. Nothing to configure, nothing to sign up for.

You can reset the demo data at any time from **Settings → Data connection → Reset demo data**.

## Connecting a real Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates all tables (`profiles`, `projects`, `project_updates`, `project_notes`, `transactions`, `meetings`, `meeting_notes`, `activity_logs`), indexes, `updated_at` triggers, and Row Level Security policies.
3. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
4. Copy `.env.example` to `.env` and fill in the two values:

   ```bash
   cp .env.example .env
   ```

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Restart `npm run dev`. The app automatically detects the credentials and switches from LocalStorage to Supabase — no code changes needed. The sidebar's connection indicator will read **"Supabase connected"**.
6. (Optional) Enable **Authentication** in Supabase (Email/Password or a provider of your choice). The data layer already scopes every row to `owner_id = auth.uid()` via RLS, so once a user signs in, `auth.uid()` will populate correctly on inserts. Wiring up a login screen is a small addition on top of `lib/supabase.ts` — the client is already configured with `persistSession` and `autoRefreshToken`.
7. (Optional) Enable **Realtime** on `projects`, `transactions`, `meetings`, and `activity_logs` under **Database → Replication** so changes made elsewhere (another tab, teammate, or the API) appear without a manual refresh — the app already subscribes to these tables in `lib/db.ts` whenever Supabase is configured.

Never put your Supabase **service role** key in frontend code — only the `anon` key belongs in `.env`.

## Project structure

```
src/
  components/
    layout/       Sidebar, Header, AppShell
    ui/           StatCard, Badge, Modal, Drawer, EmptyState, Skeleton, ProgressBar, ConfirmDialog, Field
    projects/     ProjectTable, ProjectDrawer (details), ProjectFormDrawer (create/edit)
    accounts/     TransactionTable, TransactionFormModal
    meetings/     MeetingCard, MeetingDrawer (details), MeetingFormDrawer (create/edit)
    activity/     ActivityTimeline
    search/       GlobalSearch (Cmd/Ctrl+K command palette)
    notifications/ NotificationsDropdown
  pages/
    Dashboard.tsx  Projects.tsx  Accounts.tsx  Meetings.tsx  Activity.tsx  Settings.tsx
  lib/
    supabase.ts     Supabase client + isSupabaseConfigured flag
    storage.ts       LocalStorage demo data layer (CRUD + local pub/sub)
    db.ts            Unified data-access layer used by all hooks — picks Supabase or LocalStorage
    calculations.ts  Finance & dashboard derived-value helpers (no hard-coded stats)
    sampleData.ts    Realistic seed data for demo mode
    format.ts        ₹ currency, date, and relative-time formatting helpers
  hooks/
    useProjects, useTransactions, useMeetings, useActivity, useNotifications, useToast
  types.ts          Shared TypeScript types for the whole data model
```

Every page and hook talks only to `lib/db.ts`, which is the single place that decides whether to call Supabase or LocalStorage. This is what makes switching backends a config change, not a rewrite.

## Core modules

- **Overview** — KPI cards (active/completed projects, money received, available balance, Wajebat, next meeting), a "needs attention" list, and a recent-activity feed.
- **Projects** — filterable/searchable table (cards on mobile), a details drawer with an update timeline and notes, and a create/edit drawer.
- **Accounts** — Ameorids' internal money tracker: Money Received, Money Spent, and **Wajebat** are tracked as distinct transaction types. Available balance is always computed as `Received − Spent − Wajebat`, never hard-coded.
- **Meetings** — upcoming meetings are visually prioritized; a details drawer supports agenda, notes (editable after the fact), decisions, and action items.
- **Activity** — a chronological, company-wide feed generated automatically whenever a project, transaction, or meeting changes.
- **Global search** (`⌘K` / `Ctrl+K`) — searches projects, transactions, meetings, and project notes/updates at once.
- **Settings** — workspace name, currency (fixed to INR), notification toggle, and the current data-connection status.

## Design system

Dark, deep-navy interface with a violet accent, glass surfaces, thin borders, and restrained motion — tokens live in `tailwind.config.js` (`base` and `violet` color scales) and `src/index.css` (`.card`, `.glass` utilities).

## Building for production

```bash
npm run build
npm run preview
```

`npm run build` type-checks the whole project (`tsc -b`) before bundling with Vite, so a broken type will fail the build rather than ship silently.
