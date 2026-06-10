"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HeroSearch from "./HeroSearch";

const VALID_TABS = new Set(["stays", "flights", "car-rental", "activities"]);

function HeroWithTab() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "stays";
  const defaultTab = VALID_TABS.has(tab) ? tab : "stays";
  return <HeroSearch defaultTab={defaultTab} />;
}

export default function HomeTabHero() {
  return (
    <Suspense fallback={<HeroSearch />}>
      <HeroWithTab />
    </Suspense>
  );
}
