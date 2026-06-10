import { NextResponse } from "next/server";
import { getAdminSessionFromRequest, isAdminPasswordConfigured } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const configured = await isAdminPasswordConfigured();
  const session = await getAdminSessionFromRequest(request);

  return NextResponse.json({
    configured,
    authenticated: !!session,
  });
}
