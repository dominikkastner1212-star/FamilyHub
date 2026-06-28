# 🚂 Familienhub auf Railway deployen

Schritt-für-Schritt-Anleitung, um die App live ins Netz zu bringen.

## Was du brauchst

- Einen GitHub-Account (das Projekt landet dort)
- Einen Railway-Account (railway.app – Login per GitHub)
- Dein fertiges Supabase-Projekt (URL + anon-Key)
- Einen Anthropic API-Key für die Foto-Funktion (console.anthropic.com)

---

## Schritt 1 – Projekt auf GitHub legen

Im Projektordner:

```bash
git init
git add .
git commit -m "Familienhub initial"
```

Dann auf GitHub ein neues, **privates** Repository anlegen (z.B. `familienhub`)
und pushen:

```bash
git remote add origin https://github.com/DEIN-NAME/familienhub.git
git branch -M main
git push -u origin main
```

> Wichtig: Die Datei `.env.local` ist durch `.gitignore` ausgeschlossen und
> landet **nicht** auf GitHub. Deine Keys bleiben geheim. Genau so soll es sein.

---

## Schritt 2 – Railway-Projekt erstellen

1. Auf railway.app einloggen → **New Project**.
2. **Deploy from GitHub repo** wählen → dein `familienhub`-Repo auswählen.
3. Railway erkennt Next.js automatisch (über die `railway.json` und Nixpacks)
   und startet den ersten Build. Der wird erstmal fehlschlagen oder leer sein,
   weil noch die Umgebungsvariablen fehlen – das ist normal.

---

## Schritt 3 – Umgebungsvariablen setzen

Im Railway-Projekt → **Variables** → folgende Einträge anlegen
(Werte aus deinem Supabase-Dashboard und Anthropic-Account):

```
NEXT_PUBLIC_SUPABASE_URL      = https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = dein-anon-key
NEXT_PUBLIC_WEATHER_LAT       = 51.3127
NEXT_PUBLIC_WEATHER_LON       = 9.4797
NEXT_PUBLIC_WEATHER_CITY      = Kassel
ANTHROPIC_API_KEY             = sk-ant-dein-key
```

Den `PORT` setzt Railway automatisch – den musst du **nicht** selbst anlegen.
Die App liest ihn über das Start-Script (`next start -p ${PORT}`).

Nach dem Speichern startet Railway automatisch einen neuen Build.

---

## Schritt 4 – Öffentliche Adresse aktivieren

1. Im Projekt → **Settings** → **Networking** → **Generate Domain**.
2. Railway gibt dir eine URL wie `familienhub-production.up.railway.app`.
3. Diese URL ist deine Live-App. Fertig.

> Eigene Domain (z.B. `familienhub.de`) geht später auch unter Settings →
> Custom Domain.

---

## Schritt 5 – Supabase: erlaubte URLs ergänzen

Damit der Login von der Railway-Adresse aus funktioniert:

1. Im Supabase-Dashboard → **Authentication** → **URL Configuration**.
2. Bei **Site URL** und **Redirect URLs** deine Railway-Adresse eintragen
   (`https://familienhub-production.up.railway.app`).

---

## Updates später einspielen

Einfach Änderungen committen und pushen:

```bash
git add .
git commit -m "Was ich geändert habe"
git push
```

Railway baut und deployt automatisch neu. Kein manueller Schritt nötig.

---

## Kosten im Blick

- **Railway**: kostenloses Startguthaben, danach nutzungsbasiert
  (eine kleine App wie diese liegt meist im Bereich weniger Euro im Monat).
- **Supabase**: kostenloser Tarif reicht für eine Familie locker.
- **Anthropic API**: Pay-as-you-go, nur die Foto-Funktion verbraucht etwas –
  rund 0,2–0,3 Cent pro abfotografiertem Aushang. Ohne Nutzung: 0 €.

---

## Wenn der Build fehlschlägt

- **„Missing Supabase URL"**: Variablen nicht gesetzt → Schritt 3 prüfen.
- **Login leitet nicht weiter**: Redirect-URL in Supabase fehlt → Schritt 5.
- **Foto-Funktion meldet „nicht eingerichtet"**: `ANTHROPIC_API_KEY` fehlt
  oder ist falsch → Schritt 3 prüfen.
