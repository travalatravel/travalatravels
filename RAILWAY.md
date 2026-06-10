# Travala auf Railway + Dynadot

Schritt-für-Schritt: App auf Railway hosten, Domain bei Dynadot verbinden.

---

## Teil 1 — Code auf GitHub (einmalig)

Railway deployt am einfachsten aus GitHub.

Repo: [github.com/travalatravel/travalatravels](https://github.com/travalatravel/travalatravels)

Im Projektordner `travala-clone`:

```bash
git remote add origin https://github.com/travalatravel/travalatravels.git
git branch -M main
git add .
git commit -m "Initial deploy"
git push -u origin main
```

---

## Teil 2 — Railway Projekt erstellen

1. Gehe zu [railway.app](https://railway.app) → **Login** (mit GitHub)
2. **New Project** → **Deploy from GitHub repo**
3. Repo `travalatravel/travalatravels` auswählen
4. Railway startet automatisch den ersten Build (dauert 3–8 Min.)

> **Crashed mit `DATABASE_URL not found`?** → Du hast Schritt 3 + 4 unten noch nicht gemacht. Variables müssen am **Service** `travalatravels` gesetzt werden, nicht nur im Projekt.

---

## Teil 3 — Persistent Volume für die Datenbank

SQLite braucht einen festen Speicher (sonst gehen Buchungen bei jedem Deploy verloren).

1. In Railway: dein Service anklicken
2. Tab **Volumes** → **Add Volume**
3. Mount Path: `/data`
4. Größe: **1 GB** reicht am Anfang

---

## Teil 4 — Umgebungsvariablen setzen

Im Service → **Variables** → diese Werte eintragen:

| Variable | Wert |
|----------|------|
| `DATABASE_URL` | `file:/data/production.db` (mit Volume) **oder** `file:./prisma/production.db` |
| `JWT_SECRET` | Langer Zufallsstring (mind. 32 Zeichen) |
| `NEXT_PUBLIC_APP_URL` | `https://travala.travel` |
| `APP_URL` | `https://travala.travel` |
| `NODE_ENV` | `production` |

**Nicht setzen:** `PORT` — Railway vergibt den Port automatisch. Wenn du `PORT=3000` manuell setzt, kann die Seite mit „Application failed to respond“ abbrechen.

**JWT_SECRET generieren** (lokal in PowerShell):
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | % {[char]$_})
```

Nach dem Speichern deployt Railway neu.

### Öffentliche URL erzeugen (wichtig!)

Wenn oben **„Unexposed service“** steht:

1. Service → **Settings** → **Networking**
2. **Generate Domain** klicken (z.B. `travalatravels-production.up.railway.app`)
3. Damit ist die Seite erreichbar, auch bevor Dynadot DNS fertig ist

---

## Teil 5 — Domain in Railway verbinden

1. Service → **Settings** → **Networking** → **Custom Domain**
2. Eintragen: `travala.travel`
3. Optional auch: `www.travala.travel`
4. Railway zeigt dir die **DNS-Einträge** — diese brauchst du gleich bei Dynadot

Die Railway-URL (`*.up.railway.app`) kannst du zum Testen nutzen, bevor DNS propagiert ist.

---

## Teil 6 — DNS bei Dynadot

1. Login auf [dynadot.com](https://www.dynadot.com)
2. **My Domains** → `travala.travel` → **DNS Settings**

### Für www (empfohlen zuerst)

| Typ | Host | Wert |
|-----|------|------|
| CNAME | `www` | Den Wert den Railway anzeigt (z.B. `xxxx.up.railway.app`) |

### Für Root-Domain (@)

Dynadot unterstützt je nach Account unterschiedliche Optionen:

- **ALIAS / ANAME** auf den Railway-Host (wenn verfügbar), oder
- **A-Record** auf die IP die Railway angibt, oder
- **Domain-Weiterleitung**: `@` → `https://www.travala.travel`

Railway zeigt dir im Domain-Setup genau, was du eintragen musst.

3. **Speichern** — DNS braucht oft **15 Min. bis 48 Std.** (meist unter 1 Stunde)

---

## Teil 7 — Testen

1. Railway-Deploy muss **grün / Success** sein
2. Öffne die Railway-URL → Startseite sollte laden
3. Danach `https://travala.travel` testen
4. Admin: `https://travala.travel/admin/login` → Passwort beim ersten Mal setzen

---

## Teil 8 — Hotels / Offers importieren (optional)

Die lokale DB wird nicht automatisch mit hochgeladen. Auf Railway startest du mit leerer DB (Migrations laufen automatisch).

**Option A — Nur Demo-Daten:**
Railway → Service → **Shell** (oder lokal mit Railway CLI):
```bash
npx prisma db seed
```

**Option B — Voller Offer-Import** (dauert länger):
```bash
npm run import:offers
npx prisma db seed
```

**Option C — Lokale DB hochladen** (wenn du schon alles importiert hast):
1. Lokale Datei: `prisma/dev.db`
2. Umbenennen zu `production.db`
3. Per Railway CLI ins Volume kopieren (fortgeschritten)

---

## Kosten (Hobby Plan)

- **$5/Monat** Minimum
- Enthält **$5 Nutzungsguthaben**
- Für eine kleine Next.js-App mit wenig Traffic: meist **~$5–8/Monat** gesamt

Unter **Usage** im Railway-Dashboard siehst du den Verbrauch.

---

## cPanel

**Nicht mehr nötig** für die Website. Du kannst es kündigen, wenn du es nur dafür hattest.

Dynadot = nur noch Domain + DNS.

---

## Updates deployen

```bash
git add .
git commit -m "Update"
git push
```

Railway baut und deployt automatisch neu.

---

## Probleme?

| Problem | Lösung |
|---------|--------|
| Build schlägt fehl | Railway → Deployments → Logs lesen |
| **Application failed to respond** | `PORT` aus Variables **löschen**. Domain neu generieren. In Deploy-Logs nach `PORT=...` schauen — dieser Port muss in Networking eingetragen sein |
| `*.railway.internal` im Browser | **Falsch** — nur intern. Nutze `*.up.railway.app` oder `travala.travel` |
| Seite lädt nicht | DNS noch nicht propagiert — Railway-URL direkt testen |
| 500 Error | Variables prüfen, besonders `DATABASE_URL` und Volume `/data` |
| Keine Hotels | Console: `npx prisma db seed` (oder `SEED_DATABASE=true` setzen) |
| Admin geht nicht | `/admin/login` — neues Passwort setzen |
