"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import OfferCard from "./OfferCard";
import type { Offer } from "@/lib/types";

export default function FlightHotelBundle({
  destination,
  depart,
  returnDate,
}: {
  destination: string;
  depart?: string;
  returnDate?: string;
}) {
  const [hotels, setHotels] = useState<Offer[]>([]);

  useEffect(() => {
    if (!destination.trim()) return;
    const params = new URLSearchParams({
      type: "stays",
      q: destination,
      limit: "4",
      sort: "stars-desc",
    });
    fetch(`/api/search?${params}`)
      .then((r) => r.json())
      .then((d) => setHotels(d.offers || []))
      .catch(() => setHotels([]));
  }, [destination]);

  if (!hotels.length) return null;

  const qs = new URLSearchParams({ type: "stays", q: destination });
  if (depart) qs.set("checkIn", depart);
  if (returnDate) qs.set("checkOut", returnDate);

  return (
    <section className="mt-10 rounded-2xl border border-[#2577be]/20 bg-gradient-to-br from-[#eef5fc] to-white p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="text-[#2577be]" size={20} />
          <h2 className="text-lg font-bold text-[#1e2e5e]">Add a hotel in {destination}</h2>
        </div>
        <Link href={`/search?${qs.toString()}`} className="text-sm font-semibold text-[#2577be] hover:underline">
          View all hotels →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {hotels.map((h) => (
          <OfferCard key={h.id} offer={h} />
        ))}
      </div>
    </section>
  );
}
