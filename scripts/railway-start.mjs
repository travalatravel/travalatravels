import { execSync } from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const serverEntry = path.join(standaloneDir, "server.js");

function ensureEnv() {
  if (!process.env.DATABASE_URL?.trim()) {
    process.env.DATABASE_URL = "file:./prisma/production.db";
    console.warn("⚠ DATABASE_URL not set → using file:./prisma/production.db");
  }

  if (!process.env.JWT_SECRET?.trim()) {
    process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");
    console.warn("⚠ JWT_SECRET not set → using ephemeral secret (set in Railway Variables!)");
  }

  if (!process.env.NEXT_PUBLIC_APP_URL?.trim()) {
    const domain = process.env.RAILWAY_PUBLIC_DOMAIN;
    if (domain) {
      process.env.NEXT_PUBLIC_APP_URL = `https://${domain}`;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = "https://travala.travel";
    }
    console.warn(`⚠ NEXT_PUBLIC_APP_URL not set → using ${process.env.NEXT_PUBLIC_APP_URL}`);
  }

  if (!process.env.APP_URL?.trim()) {
    process.env.APP_URL = process.env.NEXT_PUBLIC_APP_URL;
  }

  if (!process.env.NODE_ENV?.trim()) {
    process.env.NODE_ENV = "production";
  }
}

async function getOfferCount() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    return await prisma.offer.count();
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  ensureEnv();

  if (!fs.existsSync(serverEntry)) {
    console.error("server.js not found. Did the build run?");
    process.exit(1);
  }

  console.log("Environment OK");
  console.log(`  DATABASE_URL=${process.env.DATABASE_URL}`);
  console.log(`  APP_URL=${process.env.APP_URL}`);
  console.log(`  PORT=${process.env.PORT || "3000"}`);

  console.log("Running database migrations…");
  execSync("npx prisma migrate deploy", { stdio: "inherit", cwd: root, env: process.env });

  const shouldSeed =
    process.env.SEED_DATABASE === "true" || (await getOfferCount()) === 0;

  if (shouldSeed) {
    console.log("Importing offers into database (3–8 minutes, please wait)…");
    execSync("npx prisma db seed", { stdio: "inherit", cwd: root, env: process.env });
    console.log("Database seed complete.");
  }

  console.log("Starting Travala app…");
  execSync("node server.js", { stdio: "inherit", cwd: standaloneDir, env: process.env });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
