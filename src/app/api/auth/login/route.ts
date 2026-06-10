import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createToken, hashPassword, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().min(1),
  password: z.string().optional(),
});

function normalizeEmail(raw: string) {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return `guest-${Date.now()}@guest.travala.local`;
  if (trimmed.includes("@")) return trimmed;
  return `${trimmed.replace(/\s+/g, ".")}@guest.travala.local`;
}

function nameFromEmail(email: string) {
  const local = email.split("@")[0] || "Guest";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || "Guest";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const email = normalizeEmail(data.email);

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: nameFromEmail(email),
          password: await hashPassword(crypto.randomUUID()),
          role: "USER",
        },
      });
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
