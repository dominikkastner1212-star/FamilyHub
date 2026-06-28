-- =====================================================================
--  Familienhub · Realtime + Einladungen
--  Einspielen NACH 01_schema.sql und 02_rls.sql.
-- =====================================================================

-- ---------- 1) Realtime für Live-Sync aktivieren ----------
-- Damit Einkauf & Termine sich sofort bei allen Mitgliedern aktualisieren.
alter publication supabase_realtime add table shopping_items;
alter publication supabase_realtime add table events;

-- ---------- 2) Einladungen ----------
-- Eltern können andere per Code in ihre Familie einladen.
create table if not exists invitations (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  code        text not null unique,        -- z.B. "SONNE-4827"
  created_by  uuid not null references members(id) on delete cascade,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  used        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_invitations_code on invitations(code) where used = false;

alter table invitations enable row level security;

-- Mitglieder einer Familie dürfen deren Einladungen sehen und erstellen
create policy "invitations_select" on invitations for select
  using (family_id in (select my_family_ids()));
create policy "invitations_insert" on invitations for insert
  with check (family_id in (select my_family_ids()));

-- ---------- 3) Einladung einlösen ----------
-- Nimmt einen Code, fügt den aktuellen Nutzer der Familie hinzu.
-- SECURITY DEFINER, weil der Einladende sonst keine fremde Mitgliedschaft anlegen dürfte.
create or replace function redeem_invitation(invite_code text, member_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inv invitations%rowtype;
  new_member_id uuid;
begin
  select * into inv from invitations
    where code = invite_code and used = false and expires_at > now()
    limit 1;

  if not found then
    raise exception 'Einladungscode ungültig oder abgelaufen';
  end if;

  -- schon Mitglied?
  if exists (select 1 from members where family_id = inv.family_id and user_id = auth.uid()) then
    raise exception 'Du bist bereits Mitglied dieser Familie';
  end if;

  insert into members (family_id, user_id, display_name, role)
    values (inv.family_id, auth.uid(), coalesce(member_name, 'Mitglied'), 'member')
    returning id into new_member_id;

  update invitations set used = true where id = inv.id;

  return inv.family_id;
end;
$$;

-- ---------- 4) Einladungs-Code erzeugen ----------
-- Erstellt einen lesbaren Code für die Familie des aktuellen Nutzers.
create or replace function create_invitation()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  my_member members%rowtype;
  words text[] := array['SONNE','MOND','STERN','BLUME','WOLKE','HERZ','BAUM','VOGEL'];
  new_code text;
begin
  -- Mitgliedschaft des aktuellen Nutzers holen (erste Familie)
  select * into my_member from members where user_id = auth.uid() limit 1;
  if not found then
    raise exception 'Du gehörst noch keiner Familie an';
  end if;

  -- Code aus zufälligem Wort + 4 Ziffern, bis er eindeutig ist
  loop
    new_code := words[1 + floor(random() * array_length(words,1))::int]
                || '-' || lpad(floor(random()*10000)::text, 4, '0');
    exit when not exists (select 1 from invitations where code = new_code and used = false);
  end loop;

  insert into invitations (family_id, code, created_by)
    values (my_member.family_id, new_code, my_member.id);

  return new_code;
end;
$$;
