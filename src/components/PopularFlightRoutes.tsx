"use client";

import Link from "next/link";
import { Plane } from "lucide-react";
import { POPULAR_FLIGHT_ROUTES } from "@/data/flight-data";
import { buildFlightSearchQuery } from "@/lib/flight-display";
import { useTranslations } from "@/i18n/useTranslations";

function defaultDates() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  const depart = d.toISOString().slice(0, 10);
  const r = new Date(d);
  r.setDate(r.getDate() + 7);
  return { depart, return: r.toISOString().slice(0, 10) };
}

export default function PopularFlightRoutes() {
  const { messages: m } = useTranslations();
  const dates = defaultDates();

  return (
    <section className="mx-auto max-w-6xl px-3 py-10 sm:px-4 lg:px-6">
      <h2 className="text-xl font-bold text-[#1a1a1a] sm:text-2xl">{m.flightsPage.popularRoutes}</h2>
      <p className="mt-1 text-sm text-gray-500">{m.flightsPage.routesSubtitle}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {POPULAR_FLIGHT_ROUTES.map((route) => {
          const qs = buildFlightSearchQuery({
            trip: "roundtrip",
            from: route.from,
            to: route.to,
            fromCode: route.fromCode,
            toCode: route.toCode,
            depart: dates.depart,
            return: dates.return,
            adults: 1,
            children: 0,
            infants: 0,
            cabin: "economy",
          });
          return (
            <Link
              key={`${route.from}-${route.to}`}
              href={`/search?${qs.toString()}`}
              className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#2D83C2]/40 hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef5fc] text-[#2D83C2] transition group-hover:bg-[#2D83C2] group-hover:text-white">
                <Plane size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1a1a1a]">
                  {route.from} → {route.to}
                </p>
                <p className="text-xs text-gray-500">
                  {route.fromCode} – {route.toCode}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
