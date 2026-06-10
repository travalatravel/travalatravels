import { randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { hashPassword } from "./auth";
import { prisma } from "./prisma";
import type { SessionUser } from "./auth";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "travala-clone-dev-secret",
);

export async function createBookingAccessToken(bookingIds: string[]) {
  return new SignJWT({ bookingIds })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("48h")
    .sign(SECRET);
}

export async function verifyBookingAccessToken(
  token: string,
  bookingId: string,
): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const ids = payload.bookingIds;
    if (!Array.isArray(ids)) return false;
    return ids.includes(bookingId);
  } catch {
    return false;
  }
}

export async function resolveBookingUserId(
  sessionUser: SessionUser | null,
  guest: { guestFirstName: string; guestLastName: string; contactEmail: string },
): Promise<string> {
  if (sessionUser) return sessionUser.id;

  const email = guest.contactEmail.trim().toLowerCase();
  const name =
    `${guest.guestFirstName.trim()} ${guest.guestLastName.trim()}`.trim() || "Guest";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing.id;

  const created = await prisma.user.create({
    data: {
      email,
      name,
      password: await hashPassword(randomBytes(32).toString("hex")),
      role: "GUEST",
    },
  });
  return created.id;
}
