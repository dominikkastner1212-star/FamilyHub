# Familienhub 🏡

Der Organizer für eure Familie – Termine, Einkauf, Kinder-Profile, Wetter mit
Sonnenschutz-Index und Wochenstart-Check. Im verspielten Clay-Look.

## Was drin ist

- **E-Mail-Login & Registrierung** (Supabase Auth)
- **Familien-Konzept**: ein Haushalt, mehrere Mitglieder mit Rollen (Admin/Member)
- **Dashboard** mit Live-Wetter + UV-Index (Open-Meteo, kein API-Key nötig)
- **Wochenstart-Check**: zeigt automatisch, was ansteht *und was mitmuss*
  (Sonnencreme, Sportzeug, Geld …)
- **Kalender** mit Monatsansicht + Apple-Sync-Vorbereitung (CalDAV)
- **Einkaufsliste**, geteilt und abhakbar
- **Kinder-Profile** mit Allergien, Medikamenten, Ärzten/Notfallkontakten,
  Blutgruppe und hauttyp-abhängiger Sonnenschutz-Empfehlung
- **📸 Foto-zu-Termin**: Aushang/Flyer abfotografieren → Claude Haiku liest
  Datum, Uhrzeit, Ort heraus → Termin trägt sich ein (kein Abtippen mehr)
- **Clay-Design-System** als Tailwind-Tokens (warme Basis, bunte Akzente)
- Eigene Familien-Avatare als SVG (später frei konfigurierbar)

## Tech-Stack

- **Next.js 15** (App Router) – auf gepatchter, sicherer Version
- **Supabase** – Auth, Postgres-Datenbank, Row-Level-Security
- **Tailwind CSS** – Design-System
- **Open-Meteo** – Wetter & UV (kostenlos)

## Einrichtung

### 1. Abhängigkeiten installieren
```bash
npm install
```

### 2. Supabase-Projekt anlegen
1. Auf supabase.com ein kostenloses Projekt erstellen.
2. Im **SQL Editor** nacheinander einspielen:
   - `supabase/01_schema.sql` (Tabellen)
   - `supabase/02_rls.sql` (Datensicherheit / Row-Level-Security)
   - `supabase/03_realtime_invites.sql` (Live-Sync + Familien-Einladungen)
3. Unter **Project Settings → API** die URL und den `anon`-Key kopieren.
4. **Für einfaches Testen**: Unter **Authentication → Providers → Email** die
   Option „Confirm email" vorübergehend ausschalten. Dann können sich du und
   deine Freunde sofort anmelden, ohne erst eine Bestätigungsmail zu öffnen –
   wichtig, damit „Familie gründen" und „Mit Code beitreten" direkt klappen.

## So ladet ihr euch gegenseitig ein

1. Du gründest beim Registrieren eine Familie (Tab „Familie gründen").
2. Im **Kinder-Tab** unten auf „Einladungscode erstellen" tippen → du bekommst
   einen Code wie `SONNE-4827`, den du per „Code teilen" verschickst.
3. Dein Partner/Freund registriert sich, wählt „Mit Code beitreten" und gibt
   den Code ein. Ab dann seht ihr dieselben Termine, Listen und Kinder.

### 3. Umgebungsvariablen
`.env.local.example` nach `.env.local` kopieren und ausfüllen:
```bash
cp .env.local.example .env.local
```
Die Wetter-Koordinaten stehen auf Kassel – bei Bedarf anpassen.

### 4. Starten
```bash
npm run dev      # Entwicklung → http://localhost:3000
npm run build    # Produktions-Build
npm run start    # Produktion
```

## Hosting auf deinem ZimaOS-Server

Die App läuft als Node-Prozess (`npm run start`, Port 3000). Über einen
**Cloudflare Tunnel** oder Reverse Proxy nach außen freigeben. Supabase liegt
in der Cloud – nur der `anon`-Key landet im Frontend, alle Datenzugriffe sind
durch Row-Level-Security abgesichert.

## Demo-Modus

Solange noch keine echten Daten in Supabase liegen, zeigt das Dashboard
Demo-Daten (`lib/demo-data.ts`), damit man die Oberfläche sofort sieht. Diese
werden Schritt für Schritt durch echte Datenbank-Abfragen ersetzt.

## Was schon echt funktioniert

- **Login/Logout** mit E-Mail
- **Familie gründen oder per Code beitreten** – ihr nutzt es zu mehreren
- **Einladungscodes** erstellen und teilen (Kinder-Tab)
- **Einkaufsliste**: gespeichert, live synchron über alle Geräte
- **Termine**: gespeichert, inkl. der per Foto erkannten Termine
- **Kinder-Profile**: echt aus der Datenbank (Allergien, Medikamente, Kontakte)
- **Foto-zu-Termin**: speichert direkt in die Datenbank
- **Familien-Trennung** über Row-Level-Security

## Roadmap – das macht die App rund

- **Aufgaben & Wer-holt-wen** (Mental Load verteilen)
- **Mahlzeitenplan → automatische Einkaufsliste**
- **Push-Erinnerungen** (vorher pushen, nicht nur anzeigen)
- **Familien-Pinnwand / Notizen**
- Wiederkehrende Termine
- CalDAV-Sync mit Apple Kalender
- Kinder-Profile anlegen/bearbeiten direkt in der App (aktuell über DB)
- Avatar-Editor (Frisur, Hautton, Farbe pro Person)
