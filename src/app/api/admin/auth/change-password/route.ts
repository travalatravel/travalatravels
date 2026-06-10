import { NextResponse } from "next/server";
import { z } from "zod";
import { changeAdminPassword, getAdminSessionFromRequest } from "@/lib/admin-auth";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8),
});

export async function POST(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);

    if (data.newPassword !== data.confirmPassword) {
      return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
    }

    await changeAdminPassword(data.currentPassword, data.newPassword);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Could not change password";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
