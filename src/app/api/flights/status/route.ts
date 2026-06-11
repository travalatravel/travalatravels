import { NextResponse } from "next/server";
import { airScraperCheckServer, airScraperConfigured, airScraperMarket } from "@/lib/air-scraper";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = airScraperConfigured();
  const online = configured ? await airScraperCheckServer() : false;

  return NextResponse.json({
    configured,
    online,
    plan: process.env.RAPIDAPI_PLAN || "basic",
    ...airScraperMarket(),
    endpoints: {
      searchFlights: "/api/v1/flights/searchFlights",
      searchAirport: "/api/v1/flights/searchAirport",
    },
  });
}
