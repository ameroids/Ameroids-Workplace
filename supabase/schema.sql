-- ============================================================================
-- AMEORIDS — COMMAND CENTER
-- Supabase schema
--
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query) on a
-- fresh project. It creates all tables, indexes, triggers and Row Level
-- Security policies used by the app.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles — one row per authenticated user / workspace member
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  workspace_name text not null default 'Ameroids',
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- projects
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade default auth.uid(),
  name text not null,
  client text not null default 'Internal',
  description text not null default '',
  status text not null default 'Planning'
    check (status in ('Planning', 'Pending', 'In Progress', 'On Hold', 'Completed')),
  priority text not null default 'Medium'
    check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  progress int not null default 0 check (progress between 0 and 100),
  start_date date,
  due_date date,
  assigned_to text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_owner_idx on public.projects (owner_id);
create index if not exists projects_status_idx on public.projects (status);

-- ----------------------------------------------------------------------------
-- project_updates — activity timeline entries per project
-- ----------------------------------------------------------------------------
create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  text text not null,
  author text not null default 'Ammar',
  created_at timestamptz not null default now()
);

create index if not exists project_updates_project_idx on public.project_updates (project_id, created_at desc);

-- ----------------------------------------------------------------------------
-- project_notes
-- ----------------------------------------------------------------------------
create table if not exists public.project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists project_notes_project_idx on public.project_notes (project_id, created_at desc);

-- ----------------------------------------------------------------------------
-- transactions — Money Received / Money Spent / Wajebat
-- ----------------------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade default auth.uid(),
  type text not null check (type in ('Received', 'Spent', 'Wajebat')),
  amount numeric(12, 2) not null check (amount > 0),
  description text not null,
  category text not null default '',
  date date not null default current_date,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists transactions_owner_idx on public.transactions (owner_id);
create index if not exists transactions_type_idx on public.transactions (type);
create index if not exists transactions_date_idx on public.transactions (date desc);

-- ----------------------------------------------------------------------------
-- meetings
-- ----------------------------------------------------------------------------
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade default auth.uid(),
  title text not null,
  date date not null,
  time text not null default '10:00',
  participants text[] not null default '{}',
  agenda text not null default '',
  notes text not null default '',
  decisions text not null default '',
  action_items text not null default '',
  status text not null default 'Upcoming'
    check (status in ('Upcoming', 'Completed', 'Cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meetings_owner_idx on public.meetings (owner_id);
create index if not exists meetings_date_idx on public.meetings (date);

-- ----------------------------------------------------------------------------
-- meeting_notes — optional extra notes added after a meeting (in addition to
-- the single `notes` column on meetings, for a fuller audit trail)
-- ----------------------------------------------------------------------------
create table if not exists public.meeting_notes (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists meeting_notes_meeting_idx on public.meeting_notes (meeting_id, created_at desc);

-- ----------------------------------------------------------------------------
-- activity_logs — company-wide activity feed
-- ----------------------------------------------------------------------------
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade default auth.uid(),
  kind text not null check (kind in (
    'project_created', 'project_status', 'project_progress', 'project_update',
    'transaction', 'meeting_created', 'meeting_updated'
  )),
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_owner_idx on public.activity_logs (owner_id);
create index if not exists activity_logs_created_idx on public.activity_logs (created_at desc);

-- ----------------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.projects;
create trigger set_updated_at before update on public.projects
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on public.meetings;
create trigger set_updated_at before update on public.meetings
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
--
-- Simple model: every authenticated user only sees rows they own
-- (owner_id = auth.uid()), and child tables (updates/notes) are scoped
-- through their parent project/meeting's owner_id. Adjust this to a
-- shared-workspace model (e.g. a `workspace_members` table) if multiple
-- people need to share one Ameorids workspace.
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_notes enable row level security;
alter table public.transactions enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_notes enable row level security;
alter table public.activity_logs enable row level security;

create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "projects_owner" on public.projects
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "project_updates_via_project" on public.project_updates
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );

create policy "project_notes_via_project" on public.project_notes
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );

create policy "transactions_owner" on public.transactions
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "meetings_owner" on public.meetings
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "meeting_notes_via_meeting" on public.meeting_notes
  for all using (
    exists (select 1 from public.meetings m where m.id = meeting_id and m.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.meetings m where m.id = meeting_id and m.owner_id = auth.uid())
  );

create policy "activity_logs_owner" on public.activity_logs
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- Realtime
-- Enable realtime on the tables the app subscribes to (Database > Replication
-- in the Supabase dashboard, or run this if your project has the
-- supabase_realtime publication already set up):
-- ----------------------------------------------------------------------------
-- alter publication supabase_realtime add table public.projects;
-- alter publication supabase_realtime add table public.transactions;
-- alter publication supabase_realtime add table public.meetings;
-- alter publication supabase_realtime add table public.activity_logs;

-- ----------------------------------------------------------------------------
-- Auto-create a profile row whenever a new user signs up
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, workspace_name)
  values (new.id, 'Ameroids');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
