import { NextResponse } from "next/server";
import { z } from "zod";
import { loginAdmin, setAdminSessionCookie } from "@/lib/admin-auth";

const schema = z.object({
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const token = await loginAdmin(data.password);
    await setAdminSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
