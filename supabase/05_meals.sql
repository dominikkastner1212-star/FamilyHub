-- =====================================================================
--  Familienhub · Rezepte & Essensplan (Abendessen)
--  Einspielen NACH 01–04.
-- =====================================================================

-- ---------- REZEPTE ----------
-- Wiederverwendbare Gerichte mit Zutatenliste (als Textarray).
create table if not exists recipes (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  name        text not null,
  ingredients text[] not null default '{}',   -- z.B. {Nudeln, Tomaten, Basilikum}
  note        text,                            -- optionale Zubereitungsnotiz
  emoji       text default '🍽️',
  created_by  uuid references members(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_recipes_family on recipes(family_id, name);

-- ---------- ESSENSPLAN ----------
-- Ordnet einem Datum ein Rezept zu (Abendessen). Pro Tag ein Eintrag.
create table if not exists meal_plan (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  plan_date   date not null,
  recipe_id   uuid references recipes(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (family_id, plan_date)              -- ein Abendessen pro Tag
);

create index if not exists idx_mealplan_family on meal_plan(family_id, plan_date);

-- RLS
alter table recipes   enable row level security;
alter table meal_plan enable row level security;

create policy "recipes_all" on recipes for all
  using (family_id in (select my_family_ids()))
  with check (family_id in (select my_family_ids()));

create policy "mealplan_all" on meal_plan for all
  using (family_id in (select my_family_ids()))
  with check (family_id in (select my_family_ids()));

-- Realtime für Live-Sync
alter publication supabase_realtime add table recipes;
alter publication supabase_realtime add table meal_plan;
