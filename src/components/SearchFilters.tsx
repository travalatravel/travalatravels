"use client";

import { Map, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "@/i18n/useTranslations";

export type SortOption = "recommended" | "price-asc" | "price-desc" | "stars-desc";
export type StarFilter = 0 | 3 | 4 | 5;

export default function SearchFilters({
  sort,
  onSortChange,
  total,
  starsMin = 0,
  onStarsChange,
  priceMax = 0,
  onPriceMaxChange,
  showMap,
  onToggleMap,
}: {
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  total: number;
  starsMin?: StarFilter;
  onStarsChange?: (value: StarFilter) => void;
  priceMax?: number;
  onPriceMaxChange?: (value: number) => void;
  showMap?: boolean;
  onToggleMap?: () => void;
}) {
  const { messages: m, fmt } = useTranslations();
  const s = m.searchFilters;

  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="text-sm text-gray-600">
        {total > 0
          ? fmt(m.common.propertiesFound, { count: total.toLocaleString() })
          : m.common.noPropertiesFound}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {onStarsChange && (
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <SlidersHorizontal size={14} />
            <select
              value={starsMin}
              onChange={(e) => onStarsChange(Number(e.target.value) as StarFilter)}
              className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm outline-none focus:border-[#2D83C2]"
            >
              <option value={0}>{s.allStars}</option>
              <option value={3}>{s.stars3}</option>
              <option value={4}>{s.stars4}</option>
              <option value={5}>{s.stars5}</option>
            </select>
          </label>
        )}

        {onPriceMaxChange && (
          <select
            value={priceMax}
            onChange={(e) => onPriceMaxChange(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm outline-none focus:border-[#2D83C2]"
          >
            <option value={0}>{s.anyPrice}</option>
            <option value={100}>{s.under100}</option>
            <option value={200}>{s.under200}</option>
            <option value={400}>{s.under400}</option>
          </select>
        )}

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span className="hidden sm:inline">{s.sortBy}</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2D83C2]"
          >
            <option value="recommended">{m.sort.recommended}</option>
            <option value="price-asc">{m.sort["price-asc"]}</option>
            <option value="price-desc">{m.sort["price-desc"]}</option>
            <option value="stars-desc">{s.starsHigh}</option>
          </select>
        </label>

        {onToggleMap && (
          <button
            type="button"
            onClick={onToggleMap}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              showMap
                ? "border-[#2D83C2] bg-[#eef5fc] text-[#2D83C2]"
                : "border-gray-200 bg-white text-gray-600 hover:border-[#2D83C2]"
            }`}
          >
            <Map size={14} />
            {s.map}
          </button>
        )}
      </div>
    </div>
  );
}
