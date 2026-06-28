-- =====================================================================
--  Familienhub · Row-Level-Security (RLS)
--  Einspielen NACH 01_schema.sql.
--
--  Grundprinzip: Niemand sieht Daten einer fremden Familie.
--  Eine Hilfsfunktion liefert die Familien-IDs des eingeloggten Nutzers,
--  jede Tabelle prüft dagegen.
-- =====================================================================

-- Hilfsfunktion: Zu welchen Familien gehört der aktuelle Nutzer?
-- SECURITY DEFINER, damit sie members lesen darf, ohne sich selbst zu blockieren.
create or replace function my_family_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select family_id from members where user_id = auth.uid()
$$;

-- RLS auf allen Tabellen einschalten
alter table families         enable row level security;
alter table members          enable row level security;
alter table children         enable row level security;
alter table child_allergies  enable row level security;
alter table child_medications enable row level security;
alter table child_contacts   enable row level security;
alter table events           enable row level security;
alter table shopping_items   enable row level security;

-- ---------- FAMILIES ----------
-- Sehen: Mitglieder der Familie, oder der Ersteller (auch bevor sein
-- members-Eintrag existiert – nötig, weil insert().select() die neue
-- Zeile sofort zurückliest und dafür schon sichtbar sein muss).
create policy "families_select" on families for select
  using (id in (select my_family_ids()) or created_by = auth.uid());
-- Erstellen: jeder eingeloggte Nutzer darf eine Familie gründen.
create policy "families_insert" on families for insert
  with check (created_by = auth.uid());
-- Ändern/Löschen: nur Admins der Familie.
create policy "families_update" on families for update
  using (id in (select family_id from members where user_id = auth.uid() and role = 'admin'));

-- ---------- MEMBERS ----------
create policy "members_select" on members for select
  using (family_id in (select my_family_ids()));
-- Sich selbst als Mitglied eintragen (z.B. beim Familie-Gründen / Einladung annehmen).
create policy "members_insert" on members for insert
  with check (user_id = auth.uid() or family_id in (
    select family_id from members where user_id = auth.uid() and role = 'admin'));
create policy "members_update" on members for update
  using (family_id in (select family_id from members where user_id = auth.uid() and role = 'admin'));

-- ---------- Generische Policy für alle familien-gebundenen Tabellen ----------
-- children
create policy "children_all" on children for all
  using (family_id in (select my_family_ids()))
  with check (family_id in (select my_family_ids()));
-- allergien
create policy "allergies_all" on child_allergies for all
  using (family_id in (select my_family_ids()))
  with check (family_id in (select my_family_ids()));
-- medikamente
create policy "medications_all" on child_medications for all
  using (family_id in (select my_family_ids()))
  with check (family_id in (select my_family_ids()));
-- kontakte
create policy "contacts_all" on child_contacts for all
  using (family_id in (select my_family_ids()))
  with check (family_id in (select my_family_ids()));
-- termine
create policy "events_all" on events for all
  using (family_id in (select my_family_ids()))
  with check (family_id in (select my_family_ids()));
-- einkauf
create policy "shopping_all" on shopping_items for all
  using (family_id in (select my_family_ids()))
  with check (family_id in (select my_family_ids()));
