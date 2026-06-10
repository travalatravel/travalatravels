"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Users } from "lucide-react";

const TABS = [
  { key: "stays", label: "Stays" },
  { key: "flights", label: "Flights" },
  { key: "car-rental", label: "Car Rental", badge: "NEW!" },
  { key: "activities", label: "Activities" },
] as const;

export default function SearchForm({
  defaultType = "stays",
  defaultQuery = "",
  compact = false,
}: {
  defaultType?: string;
  defaultQuery?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [type, setType] = useState(defaultType);
  const [query, setQuery] = useState(defaultQuery);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ type });
    if (query) params.set("q", query);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    params.set("guests", String(guests));
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className={`rounded-2xl bg-white shadow-xl ${compact ? "p-2" : "p-2"}`}>
      <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setType(tab.key)}
            className={`relative flex-shrink-0 px-5 py-3 text-sm font-semibold transition ${
              type === tab.key
                ? "text-[#2577be] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2577be]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {"badge" in tab && tab.badge && (
              <span className="mr-1 rounded bg-[#2dd4bf] px-1.5 py-0.5 text-[9px] font-bold text-[#1e2e5e]">
                {tab.badge}
              </span>
            )}
            {tab.label}
          </button>
        ))}
      </div>

      <div className={`flex flex-col gap-2 p-3 ${compact ? "" : "md:flex-row md:items-center"}`}>
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destination, city, or property..."
            className="w-full text-sm outline-none"
          />
        </div>

        {(type === "stays" || type === "car-rental") && (
          <>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none md:w-40"
              title="Check-in"
            />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none md:w-40"
              title="Check-out"
            />
          </>
        )}

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 md:w-32">
          <Users size={16} className="text-gray-400" />
          <input
            type="number"
            min={1}
            max={20}
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
            className="w-full text-sm outline-none"
          />
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#2577be] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#1e2e5e]"
        >
          <Search size={16} />
          Search
        </button>
      </div>
    </form>
  );
}
