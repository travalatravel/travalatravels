import { NextResponse } from "next/server";
import { getAdminSessionFromRequest, type AdminSession } from "./admin-auth";

export async function withAdmin(
  request: Request,
  handler: (admin: AdminSession) => Promise<NextResponse>
) {
  const admin = await getAdminSessionFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return handler(admin);
}
