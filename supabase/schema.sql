-- Flowline sync schema
-- Run this once in your Supabase project's SQL Editor (Project -> SQL Editor -> New query -> paste -> Run).
--
-- Security model: there is no per-user login. Every row carries a `workspace_id`
-- (a random 122-bit code generated on-device). The client always filters by that
-- code, and it is the only thing that gates access to a workspace's data — the
-- same trust model as a private "anyone with the link" share. RLS below simply
-- allows the anon key to read/write; it does not (and cannot, without real auth)
-- verify that the caller "owns" the workspace_id it supplies.

create table if not exists projects (
  id text not null,
  workspace_id text not null,
  name text not null,
  description text not null default '',
  color text not null,
  icon text not null,
  status text not null,
  priority text,
  due_date date,
  sort_order double precision not null,
  archived_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (workspace_id, id)
);

create table if not exists kanban_columns (
  id text not null,
  workspace_id text not null,
  project_id text not null,
  name text not null,
  color text,
  treat_as_done boolean not null default false,
  sort_order double precision not null,
  created_at timestamptz not null,
  primary key (workspace_id, id)
);

create table if not exists tasks (
  id text not null,
  workspace_id text not null,
  project_id text,
  column_id text,
  title text not null,
  description text not null default '',
  status text not null,
  priority text,
  label_ids text[] not null default '{}',
  due_date date,
  due_time text,
  start_date date,
  time_of_day text,
  estimate_minutes int,
  completed_at timestamptz,
  recurrence jsonb,
  recurrence_root_id text,
  sort_order double precision not null,
  archived_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (workspace_id, id)
);

create table if not exists checklist_items (
  id text not null,
  workspace_id text not null,
  task_id text not null,
  title text not null,
  completed boolean not null default false,
  sort_order double precision not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (workspace_id, id)
);

create table if not exists labels (
  id text not null,
  workspace_id text not null,
  name text not null,
  color text not null,
  archived_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (workspace_id, id)
);

create table if not exists notes (
  id text not null,
  workspace_id text not null,
  title text not null,
  content text not null default '',
  project_id text,
  task_id text,
  label_ids text[] not null default '{}',
  pinned boolean not null default false,
  archived_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (workspace_id, id)
);

create table if not exists time_entries (
  id text not null,
  workspace_id text not null,
  task_id text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds int,
  is_running smallint not null default 0,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (workspace_id, id)
);

-- Indexes for the common "give me everything in my workspace" pull query.
create index if not exists projects_workspace_idx on projects (workspace_id);
create index if not exists kanban_columns_workspace_idx on kanban_columns (workspace_id);
create index if not exists tasks_workspace_idx on tasks (workspace_id);
create index if not exists checklist_items_workspace_idx on checklist_items (workspace_id);
create index if not exists labels_workspace_idx on labels (workspace_id);
create index if not exists notes_workspace_idx on notes (workspace_id);
create index if not exists time_entries_workspace_idx on time_entries (workspace_id);

-- Row Level Security: allow the anon key full access. The workspace_id code is
-- the real access boundary (enforced client-side), not this policy.
alter table projects enable row level security;
alter table kanban_columns enable row level security;
alter table tasks enable row level security;
alter table checklist_items enable row level security;
alter table labels enable row level security;
alter table notes enable row level security;
alter table time_entries enable row level security;

create policy "anon full access" on projects for all using (true) with check (true);
create policy "anon full access" on kanban_columns for all using (true) with check (true);
create policy "anon full access" on tasks for all using (true) with check (true);
create policy "anon full access" on checklist_items for all using (true) with check (true);
create policy "anon full access" on labels for all using (true) with check (true);
create policy "anon full access" on notes for all using (true) with check (true);
create policy "anon full access" on time_entries for all using (true) with check (true);

-- Realtime: let clients subscribe to live changes for instant cross-device sync.
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table kanban_columns;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table checklist_items;
alter publication supabase_realtime add table labels;
alter publication supabase_realtime add table notes;
alter publication supabase_realtime add table time_entries;
