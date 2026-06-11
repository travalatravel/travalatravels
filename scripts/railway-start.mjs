import { execSync, spawn } from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const serverEntry = path.join(standaloneDir, "server.js");
const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);

function resolveDatabaseUrl() {
  const raw = process.env.DATABASE_URL?.trim();
  // Persistent volume mounted in Railway (e.g. /data) — always prefer it,
  // otherwise SQLite lands on the ephemeral container disk and every
  // deploy wipes bookings, users and seeded offers.
  const volume = process.env.RAILWAY_VOLUME_MOUNT_PATH?.trim();

  if (isRailway && volume) {
    const volumeUrl = `file:${volume.replace(/\/+$/, "")}/production.db`;
    if (!raw || !raw.startsWith("file:")) {
      console.warn(`Using persistent volume database → ${volumeUrl}`);
      return raw && !raw.startsWith("file:") ? raw : volumeUrl;
    }
    const filePath = raw.slice("file:".length);
    const insideVolume = filePath.startsWith(volume);
    if (!insideVolume) {
      console.warn(
        `⚠ DATABASE_URL (${raw}) points outside the mounted volume (${volume}) → using ${volumeUrl}`,
      );
      return volumeUrl;
    }
    return raw;
  }

  if (!raw) {
    const fallback = isRailway ? "file:/app/prisma/production.db" : "file:./prisma/production.db";
    console.warn(`⚠ DATABASE_URL not set → using ${fallback}`);
    return fallback;
  }

  if (!isRailway || !raw.startsWith("file:")) {
    return raw;
  }

  const filePath = raw.slice("file:".length);
  if (path.isAbsolute(filePath)) {
    return raw;
  }

  const absolute = path.join(root, filePath).replace(/\\/g, "/");
  const normalized = `file:${absolute}`;
  if (normalized !== raw) {
    console.warn(`⚠ DATABASE_URL normalized for Railway → ${normalized}`);
  }
  return normalized;
}

function ensureEnv() {
  process.env.DATABASE_URL = resolveDatabaseUrl();
  process.env.HOSTNAME = "0.0.0.0";

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

function runSeedInBackground() {
  console.log("Importing offers in background (site stays online)…");
  const child = spawn("npx", ["prisma", "db", "seed"], {
    stdio: "inherit",
    cwd: root,
    env: process.env,
  });
  child.on("exit", (code) => {
    if (code === 0) {
      console.log("Background seed complete.");
    } else {
      console.error(`Background seed failed with exit code ${code ?? "unknown"}`);
    }
  });
}

async function main() {
  ensureEnv();

  if (!fs.existsSync(serverEntry)) {
    console.error("server.js not found. Did the build run?");
    process.exit(1);
  }

  const listenPort = process.env.PORT || "3000";

  console.log("Environment OK");
  console.log(`  DATABASE_URL=${process.env.DATABASE_URL}`);
  console.log(`  APP_URL=${process.env.APP_URL}`);
  console.log(`  HOSTNAME=${process.env.HOSTNAME}`);
  console.log(`  PORT=${listenPort}`);

  console.log("Running database migrations…");
  execSync("npx prisma migrate deploy", { stdio: "inherit", cwd: root, env: process.env });

  const offerCount = await getOfferCount();
  const forceSeed = process.env.SEED_DATABASE === "true";
  const shouldSeed = forceSeed || offerCount === 0;

  if (shouldSeed && isRailway && !forceSeed) {
    console.warn(
      "Database is empty on Railway. Starting the app first; seed runs in background.",
    );
    console.warn("For a blocking first import, set SEED_DATABASE=true in Variables.");
  }

  console.log("Starting Travala app…");
  const server = spawn("node", ["server.js"], {
    stdio: "inherit",
    cwd: standaloneDir,
    env: process.env,
  });

  server.on("error", (err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

  server.on("exit", (code, signal) => {
    if (signal) {
      console.error(`Server stopped by signal: ${signal}`);
      process.exit(1);
    }
    process.exit(code ?? 0);
  });

  if (shouldSeed) {
    if (isRailway && !forceSeed) {
      runSeedInBackground();
    } else {
      console.log("Importing offers into database (3–8 minutes, please wait)…");
      execSync("npx prisma db seed", { stdio: "inherit", cwd: root, env: process.env });
      console.log("Database seed complete.");
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
