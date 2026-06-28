-- =====================================================================
--  Familienhub · Datenbank-Schema
--  Einspielen im Supabase Dashboard unter: SQL Editor > New Query
--  Reihenfolge beachten – Tabellen bauen aufeinander auf.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) FAMILIEN (Haushalte)
--    Jede Familie ist ein abgeschlossener Raum. Alle Daten hängen daran.
-- ---------------------------------------------------------------------
create table if not exists families (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2) MITGLIEDER
--    Verbindet eingeloggte Nutzer (Eltern) mit einer Familie + Rolle.
--    Rolle 'admin' = darf alles, 'member' = eingeschränkt.
-- ---------------------------------------------------------------------
create table if not exists members (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role        text not null default 'member' check (role in ('admin','member')),
  -- Avatar-Konfiguration (später frei anpassbar): Hautton, Frisur, Farbe ...
  avatar      jsonb not null default '{"char":"papa","skin":"#EFC09A"}',
  color       text not null default '#F4A84A',
  created_at  timestamptz not null default now(),
  unique (family_id, user_id)
);

-- ---------------------------------------------------------------------
-- 3) KINDER
--    Kinder sind KEINE Login-Nutzer, sondern Profile innerhalb der Familie.
-- ---------------------------------------------------------------------
create table if not exists children (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  name        text not null,
  birth_date  date,
  -- Hauttyp 1-6 (Fitzpatrick) steuert die UV-/Sonnenschutz-Empfehlung
  skin_type   int check (skin_type between 1 and 6),
  blood_type  text,                 -- z.B. 'A+', '0-'
  avatar      jsonb not null default '{"char":"lina","skin":"#FBC9B0"}',
  color       text not null default '#F47B6B',
  notes       text,                 -- freie Notizen
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4) ALLERGIEN  (mehrere pro Kind)
-- ---------------------------------------------------------------------
create table if not exists child_allergies (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references children(id) on delete cascade,
  family_id   uuid not null references families(id) on delete cascade,
  allergen    text not null,        -- z.B. 'Erdnüsse'
  severity    text not null default 'mild' check (severity in ('mild','moderat','schwer')),
  reaction    text,                 -- z.B. 'Hautausschlag, Atemnot'
  emergency_med text,               -- z.B. 'Adrenalin-Pen in der Wickeltasche'
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5) MEDIKAMENTE  (mehrere pro Kind)
-- ---------------------------------------------------------------------
create table if not exists child_medications (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references children(id) on delete cascade,
  family_id   uuid not null references families(id) on delete cascade,
  name        text not null,        -- z.B. 'Ibuprofen-Saft'
  dosage      text,                 -- z.B. '5 ml bei Fieber'
  schedule    text,                 -- z.B. 'morgens & abends'
  notes       text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6) ÄRZTE / NOTFALLKONTAKTE  (mehrere pro Kind)
-- ---------------------------------------------------------------------
create table if not exists child_contacts (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references children(id) on delete cascade,
  family_id   uuid not null references families(id) on delete cascade,
  kind        text not null default 'arzt' check (kind in ('arzt','notfall','sonstige')),
  label       text not null,        -- z.B. 'Kinderarzt Dr. Sommer'
  phone       text,
  address     text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7) TERMINE
--    family_id = Pflicht. child_id = optional (Termin kann ein Kind betreffen).
--    member_id = optional (wer ist zuständig / fährt).
-- ---------------------------------------------------------------------
create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  child_id    uuid references children(id) on delete set null,
  member_id   uuid references members(id) on delete set null,
  title       text not null,
  category    text not null default 'allgemein',  -- sport, arzt, schule, geburtstag ...
  icon        text default '📌',
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  location    text,
  -- Was muss mitgenommen werden? (Wochenstart-Check)
  bring_items text[] default '{}',  -- z.B. {Sonnencreme, Sportzeug, 5€}
  -- Sync-Herkunft: 'local' oder 'apple' (CalDAV)
  source      text not null default 'local' check (source in ('local','apple')),
  external_id text,                 -- ID aus dem Apple-Kalender für Abgleich
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 8) EINKAUFSLISTE
-- ---------------------------------------------------------------------
create table if not exists shopping_items (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  label       text not null,
  category    text not null default 'sonstiges' check (category in ('lebensmittel','drogerie','sonstiges')),
  done        boolean not null default false,
  added_by    uuid references members(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Indizes für schnelle Abfragen je Familie
-- ---------------------------------------------------------------------
create index if not exists idx_members_family   on members(family_id);
create index if not exists idx_children_family   on children(family_id);
create index if not exists idx_events_family     on events(family_id, starts_at);
create index if not exists idx_shopping_family   on shopping_items(family_id, done);
create index if not exists idx_allergies_child   on child_allergies(child_id);
create index if not exists idx_medications_child on child_medications(child_id);
create index if not exists idx_contacts_child    on child_contacts(child_id);
