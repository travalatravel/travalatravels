import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { hashPassword, verifyPassword } from "./auth";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "travala-clone-dev-secret"
);
const COOKIE_NAME = "travala_admin_session";
const SETTINGS_ID = "default";
const MIN_PASSWORD_LENGTH = 8;

export type AdminSession = {
  authenticated: true;
  label: string;
};

async function getOrCreateSettings() {
  let settings = await prisma.adminSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (!settings) {
    settings = await prisma.adminSettings.create({ data: { id: SETTINGS_ID } });
  }
  return settings;
}

export async function isAdminPasswordConfigured() {
  const settings = await getOrCreateSettings();
  return !!settings.passwordHash;
}

export async function setupAdminPassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const settings = await getOrCreateSettings();
  if (settings.passwordHash) {
    throw new Error("Admin password is already configured");
  }

  const passwordHash = await hashPassword(password);
  await prisma.adminSettings.update({
    where: { id: SETTINGS_ID },
    data: { passwordHash },
  });

  return createAdminToken();
}

export async function loginAdmin(password: string) {
  const settings = await getOrCreateSettings();
  if (!settings.passwordHash) {
    throw new Error("Admin password not configured yet");
  }
  if (!(await verifyPassword(password, settings.passwordHash))) {
    throw new Error("Invalid password");
  }
  return createAdminToken();
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const settings = await getOrCreateSettings();
  if (!settings.passwordHash) {
    throw new Error("Admin password not configured");
  }
  if (!(await verifyPassword(currentPassword, settings.passwordHash))) {
    throw new Error("Current password is incorrect");
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.adminSettings.update({
    where: { id: SETTINGS_ID },
    data: { passwordHash },
  });
}

async function createAdminToken() {
  return new SignJWT({ typ: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET);
}

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.typ === "admin" && payload.sub === "admin";
  } catch {
    return false;
  }
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

function readAdminCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match?.[1] ?? null;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !(await verifyAdminToken(token))) return null;
  const configured = await isAdminPasswordConfigured();
  if (!configured) return null;
  return { authenticated: true, label: "Admin" };
}

export async function getAdminSessionFromRequest(
  request: Request
): Promise<AdminSession | null> {
  const token = readAdminCookie(request.headers.get("cookie"));
  if (!token || !(await verifyAdminToken(token))) return null;
  const configured = await isAdminPasswordConfigured();
  if (!configured) return null;
  return { authenticated: true, label: "Admin" };
}
