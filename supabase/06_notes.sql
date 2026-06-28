-- =====================================================================
--  Familienhub · Pinnwand (gemeinsame Notizen)
--  Einspielen NACH 01–05.
-- =====================================================================

create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  text        text not null,
  color       text not null default 'gelb' check (color in ('gelb','rosa','lila','gruen','blau')),
  pinned      boolean not null default false,   -- oben angeheftet
  created_by  uuid references members(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_notes_family on notes(family_id, pinned, created_at);

alter table notes enable row level security;
create policy "notes_all" on notes for all
  using (family_id in (select my_family_ids()))
  with check (family_id in (select my_family_ids()));

alter publication supabase_realtime add table notes;
