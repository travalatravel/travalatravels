import SiteChrome from "@/components/SiteChrome";
import HeroSearch from "@/components/HeroSearch";
import PopularFlightRoutes from "@/components/PopularFlightRoutes";
import CryptoFriendlySection from "@/components/CryptoFriendlySection";
import { FLIGHT_AIRLINES } from "@/data/flight-data";

export const metadata = { title: "Book Flights with Crypto | Travala" };

export default function FlightsPage() {
  return (
    <SiteChrome>
      <HeroSearch defaultTab="flights" />
      <PopularFlightRoutes />

      <section className="border-t border-gray-100 bg-[#f8fafc] py-10">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
          <h2 className="text-xl font-bold text-[#1e2e5e] sm:text-2xl">600+ airlines worldwide</h2>
          <p className="mt-1 text-sm text-gray-500">Search and compare flights from leading carriers</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {FLIGHT_AIRLINES.map((airline) => (
              <span
                key={airline}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#1e2e5e] shadow-sm"
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
