"use client";

export type SortOption = "recommended" | "price-asc" | "price-desc" | "stars-desc";

export default function SearchFilters({
  sort,
  onSortChange,
  total,
}: {
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  total: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
      <p className="text-sm text-gray-600">
        {total > 0 ? `${total.toLocaleString()} properties found` : "No properties found"}
      </p>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <span className="hidden sm:inline">Sort by</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2577be]"
        >
          <option value="recommended">Recommended</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="stars-desc">Star rating</option>
        </select>
      </label>
    </div>
  );
}
