import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const serverEntry = path.join(standaloneDir, "server.js");

const required = ["DATABASE_URL", "JWT_SECRET", "NEXT_PUBLIC_APP_URL", "APP_URL"];
const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error("\n❌ Missing Railway environment variables:\n");
  for (const key of missing) console.error(`   - ${key}`);
  console.error(`
Add them in Railway → travalatravels service → Variables:

  DATABASE_URL=file:/data/production.db
  JWT_SECRET=your-long-random-secret
  NEXT_PUBLIC_APP_URL=https://travala.travel
  APP_URL=https://travala.travel
  NODE_ENV=production

Also add a Volume with mount path /data (Tab: Volumes).
`);
  process.exit(1);
}

if (!fs.existsSync(serverEntry)) {
  console.error("server.js not found. Did the build run?");
  process.exit(1);
}

console.log("Running database migrations…");
execSync("npx prisma migrate deploy", { stdio: "inherit", cwd: root, env: process.env });

console.log("Starting Travala app…");
execSync("node server.js", { stdio: "inherit", cwd: standaloneDir, env: process.env });
