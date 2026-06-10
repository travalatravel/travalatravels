"use client";

import { Suspense } from "react";
import StaysSearchResults from "@/components/StaysSearchResults";

export default function HotelListingPage({
  title,
  subtitle,
  query,
  country,
  city,
}: {
  title: string;
  subtitle?: string;
  query?: string;
  country?: string;
  city?: string;
}) {
  return (
    <Suspense fallback={<div className="p-10 text-center">…</div>}>
      <StaysSearchResults
        context={{
          title: subtitle ? `${title} — ${subtitle}` : title,
          query,
          country,
          city,
        }}
      />
    </Suspense>
  );
}
