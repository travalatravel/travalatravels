import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";
import HeroSearch from "@/components/HeroSearch";
import PopularFlightRoutes from "@/components/PopularFlightRoutes";
import CryptoFriendlySection from "@/components/CryptoFriendlySection";
import { FLIGHT_AIRLINES } from "@/data/flight-data";
import { resolveLocale } from "@/i18n/detect";
import { getMessages } from "@/i18n/messages";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const m = getMessages(locale);
  return { title: m.meta.flightsTitle };
}

export default async function FlightsPage() {
  const locale = await resolveLocale();
  const m = getMessages(locale);

  return (
    <SiteChrome>
      <HeroSearch defaultTab="flights" />
      <PopularFlightRoutes />

      <section className="border-t border-gray-100 bg-[#f8fafc] py-10">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
          <h2 className="text-xl font-bold text-[#1a1a1a] sm:text-2xl">{m.flightsPage.airlinesWorldwide}</h2>
          <p className="mt-1 text-sm text-gray-500">{m.flightsPage.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {FLIGHT_AIRLINES.map((airline) => (
              <span
                key={airline}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#1a1a1a] shadow-sm"
              >
                {airline}
              </span>
            ))}
          </div>
        </div>
      </section>

      <CryptoFriendlySection />
    </SiteChrome>
  );
}
