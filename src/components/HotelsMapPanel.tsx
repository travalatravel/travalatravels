"use client";

import type { Offer } from "@/lib/types";
import { parseTravalaSlug } from "@/lib/hotel-slug";
import { MapPin } from "lucide-react";
import { useTranslations } from "@/i18n/useTranslations";

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  london: { lat: 51.5074, lng: -0.1278 },
  paris: { lat: 48.8566, lng: 2.3522 },
  berlin: { lat: 52.52, lng: 13.405 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  "new york": { lat: 40.7128, lng: -74.006 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  rome: { lat: 41.9028, lng: 12.4964 },
  barcelona: { lat: 41.3851, lng: 2.1734 },
  germany: { lat: 51.1657, lng: 10.4515 },
};

function coordsForOffer(offer: Offer) {
  const city = offer.city?.toLowerCase() || "";
  const country = offer.country?.toLowerCase() || "";
  return CITY_COORDS[city] || CITY_COORDS[country] || { lat: 20, lng: 0 };
}

export default function HotelsMapPanel({
  offers,
  centerLabel,
}: {
  offers: Offer[];
  centerLabel?: string;
}) {
  const { messages: m } = useTranslations();
  const center = offers[0] ? coordsForOffer(offers[0]) : { lat: 51.5, lng: 0 };
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.4}%2C${center.lat - 0.25}%2C${center.lng + 0.4}%2C${center.lat + 0.25}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-[#1a1a1a]">{m.searchFilters.map}</p>
        {centerLabel && <p className="text-xs text-gray-500">{centerLabel}</p>}
      </div>
      <iframe
        title={m.common.hotelMap}
        src={mapSrc}
        className="h-56 w-full border-0 sm:h-72"
        loading="lazy"
      />
      <ul className="max-h-48 overflow-y-auto border-t border-gray-100 p-3 text-xs">
        {offers.slice(0, 12).map((offer) => {
          const slug = parseTravalaSlug(offer.metadata);
          const href = slug ? `/hotel/${slug}` : `/offers/${offer.id}`;
          return (
            <li key={offer.id} className="border-b border-gray-50 py-2 last:border-0">
              <a href={href} className="flex items-start gap-2 text-[#1a1a1a] hover:text-[#2D83C2]">
                <MapPin size={12} className="mt-0.5 shrink-0 text-[#2D83C2]" />
                <span className="line-clamp-2">{offer.title}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
