-- =====================================================================
--  Familienhub · Aufgaben & Fahrdienste
--  Einspielen NACH 01–03. Erweitert die App um "wer macht was".
-- =====================================================================

-- ---------- AUFGABEN ----------
-- Eine Aufgabe kann einem Mitglied zugewiesen sein (assignee) und ein
-- Kind betreffen (z.B. "Lina zum Schwimmen bringen").
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  title       text not null,
  kind        text not null default 'todo' check (kind in ('todo','pickup')),
  -- 'todo' = normale Aufgabe, 'pickup' = jemanden holen/bringen (Fahrdienst)
  assignee_id uuid references members(id) on delete set null,  -- wer ist zuständig
  child_id    uuid references children(id) on delete set null, -- welches Kind betrifft es
  due_date    date,                  -- wann fällig
  due_time    text,                  -- optionale Uhrzeit "HH:MM" (für Abholungen)
  location    text,                  -- z.B. "Hallenbad" bei pickup
  done        boolean not null default false,
  done_by     uuid references members(id) on delete set null,
  created_by  uuid references members(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_tasks_family on tasks(family_id, done, due_date);

-- RLS: nur eigene Familie
alter table tasks enable row level security;
create policy "tasks_all" on tasks for all
  using (family_id in (select my_family_ids()))
  with check (family_id in (select my_family_ids()));

-- Realtime für Live-Sync
alter publication supabase_realtime add table tasks;
