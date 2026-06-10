import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();
const deployDir = path.join(root, "deploy");

function copyDir(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.cpSync(src, dest, { recursive: true, force: true, dereference: true });
}

console.log("Building production app…\n");
execSync("npm run build", { stdio: "inherit", cwd: root });

if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir, { recursive: true });

const standalone = path.join(root, ".next", "standalone");
if (!fs.existsSync(standalone)) {
  console.error("Missing .next/standalone — build failed?");
  process.exit(1);
}

copyDir(standalone, deployDir);
copyDir(path.join(root, ".next", "static"), path.join(deployDir, ".next", "static"));
copyDir(path.join(root, "public"), path.join(deployDir, "public"));
copyDir(path.join(root, "prisma"), path.join(deployDir, "prisma"));

if (fs.existsSync(path.join(root, "data"))) {
  copyDir(path.join(root, "data"), path.join(deployDir, "data"));
}

const localDb = path.join(root, "prisma", "dev.db");
if (fs.existsSync(localDb)) {
  fs.copyFileSync(localDb, path.join(deployDir, "prisma", "production.db"));
  console.log("Included prisma/production.db from local dev database.");
}

fs.copyFileSync(path.join(root, ".env.example"), path.join(deployDir, ".env.example"));

const shippedEnv = path.join(deployDir, ".env");
if (fs.existsSync(shippedEnv)) {
  fs.unlinkSync(shippedEnv);
  console.log("Removed bundled .env — create .env on the server from .env.example");
}

const readme = `# Travala — Webhoster Deployment

## Voraussetzungen (wichtig!)

Diese App ist **keine statische Website**. Du brauchst einen Hoster mit:
- **Node.js 20 oder höher**
- **npm** (oder du lädst node_modules mit hoch — bereits im Paket)
- Schreibrechte für die SQLite-Datenbank

Reines FTP-Webhosting **ohne Node.js funktioniert nicht**.

## Upload

Lade den gesamten Inhalt dieses \`deploy/\`-Ordners auf deinen Server hoch, z.B. nach:
\`/var/www/travala.travel/\`

## .env auf dem Server anlegen

Kopiere \`.env.example\` nach \`.env\` und passe an:

\`\`\`
DATABASE_URL="file:./prisma/production.db"
JWT_SECRET="ein-langer-zufaelliger-string-min-32-zeichen"
NEXT_PUBLIC_APP_URL="https://travala.travel"
APP_URL="https://travala.travel"
PORT=3000
\`\`\`

## Starten

Im Server-Verzeichnis (dort wo server.js liegt):

\`\`\`bash
# Falls frische DB ohne production.db:
npx prisma migrate deploy

# App starten
node server.js
\`\`\`

Oder mit PM2 (empfohlen):
\`\`\`bash
npm install -g pm2
pm2 start server.js --name travala
pm2 save
pm2 startup
\`\`\`

## Reverse Proxy (Nginx)

Deine Domain muss auf Port 3000 (oder PORT aus .env) zeigen:

\`\`\`nginx
location / {
  proxy_pass http://127.0.0.1:3000;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
\`\`\`

## Admin

1. https://deine-domain.com/admin/login
2. Beim ersten Besuch Admin-Passwort setzen

## Hinweise

- \`prisma/production.db\` enthält deine lokale DB (Offers, Wallets, etc.)
- Für leeren Start: production.db löschen, dann \`npx prisma migrate deploy\` und optional \`npx prisma db seed\`
- Nach Updates erneut \`npm run build:deploy\` lokal und Ordner hochladen
`;

fs.writeFileSync(path.join(deployDir, "DEPLOY.md"), readme, "utf8");

function dirSize(dir: string): number {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) total += dirSize(p);
    else total += fs.statSync(p).size;
  }
  return total;
}

const mb = dirSize(deployDir) / 1024 / 1024;
console.log(`\nDeploy package ready: ${deployDir}`);
console.log(`Approx. size: ${mb.toFixed(1)} MB`);
console.log("Upload the entire 'deploy' folder to your Node.js web host.");
