import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const serverEntry = path.join(standaloneDir, "server.js");

if (!fs.existsSync(serverEntry)) {
  console.error("server.js not found. Did the build run?");
  process.exit(1);
}

console.log("Running database migrations…");
execSync("npx prisma migrate deploy", { stdio: "inherit", cwd: root, env: process.env });

console.log("Starting Travala app…");
execSync("node server.js", { stdio: "inherit", cwd: standaloneDir, env: process.env });
