"use client";

import { useState } from "react";
import { TRAVEL_GUIDE_CATEGORIES } from "@/data/site-data";

const GUIDE_CONTENT: Record<string, string[]> = {
  "Travel Planning": [
    "Getting Around Paris: A Complete Guide to Transport, Metro & Travel Tips",
    "Where to Travel by Month: The Ultimate Guide to Year-Round Destinations",
    "Your Ultimate Packing List for Overseas Travel: Essentials You Can't Forget",
    "The Safest vs Riskiest Travel Destinations in 2026",
    "The 10 Best Travel Planning Apps to Organize Your 2026 Adventures",
    "Is Annual Travel Insurance Worth It? A 2026 Guide for Frequent Travelers",
  ],
  CRYPTO: [
    "Best Crypto to Buy Now for Travel in 2026",
    "How to Budget Your Trip Using Stablecoins: A Guide for Travellers in 2026",
    "Travala Launches Global Car Rentals with Crypto",
    "Crypto Travel Rule 2025: Booking Trips with Digital Currency",
    "Where Cryptocurrency Is Banned: Countries You Should Know Before You Travel",
    "The Ultimate Guide to Crypto Wallets: Types, AI Innovations & Top Hardware Picks for 2025",
  ],
  "Travel Destination": [
    "Discover Top Hotels & Activities in Prague",
    "Best Time to Visit London: A Month-by-Month Guide",
    "Why Visit London? Discover History, Culture, and Iconic Landmarks",
    "Discover Top Hotels & Activities in Miami",
    "Best Time to Visit Paris: A Month-by-Month Guide",
    "Discover Top Hotels & Activities in Dubai",
  ],
  "Accommodation Guides": [
    "Travel Tiger Club Experience Drop #17: Luxury Finland Travel Drop",
    "Hotel Spotlight | Hyatt Hotels & Resorts",
    "Romantic Getaway Hotels Perfect for Couples",
    "7 Incredible Luxury Treehouse Hotels Around the World",
    "Hotel Spotlight | Conrad Hotels by Hilton",
    "The Best Hotel Chains Around the World",
  ],
  "Travel Trends": [
    "Best Crypto to Buy Now for Travel in 2026",
    "How Many Travelers Use AI for Booking? Key Insights for 2026",
    "Bleisure Travel: How to Combine Work and Play on Your Trip",
    "Top 10 Fall Travel Destinations: Cozy, Colorful, and Crowd-Free",
    "The World's Best Hotels: A Big Data Breakdown",
    "Malaysia Digital Nomad Visa Guide",
  ],
  News: [
    "Travala Monthly Report: May 2026",
    "Upcoming Crypto & Travel Events: July 2026",
    "Travala Quarterly Business Update: Q1 2026",
    "Unlock $100 Off Your Travel to Bitcoin Prague 2026",
    "Travala Monthly Report: March 2026",
    "Best Cold Wallets for Crypto: Safely Store Your Digital Assets",
  ],
};

export default function TravelGuides() {
  const [active, setActive] = useState(TRAVEL_GUIDE_CATEGORIES[0]);
  const guides = GUIDE_CONTENT[active] || [];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#1e2e5e] md:text-3xl">
          Explore Our Travel Guides
        </h2>

        <div className="mt-6 flex gap-2 overflow-x-auto scrollbar-hide border-b border-gray-200 pb-0">
          {TRAVEL_GUIDE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition ${
                active === cat
                  ? "border-b-2 border-[#2577be] text-[#2577be]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <ul className="mt-6 divide-y divide-gray-100">
          {guides.map((guide) => (
            <li key={guide}>
              <a
                href="#"
                className="block py-3 text-sm text-[#1e2e5e] transition hover:text-[#2577be] hover:underline"
              >
                {guide}
              </a>
            </li>
          ))}
        </ul>
        <button className="mt-4 text-sm font-semibold text-[#2577be] hover:underline">
          View all
        </button>
      </div>
    </section>
  );
}
