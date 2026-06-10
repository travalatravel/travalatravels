import Carousel from "./Carousel";
import { PROPERTY_TYPES } from "@/data/site-data";

const PROPERTY_ICONS: Record<string, string> = {
  "Unique Property": "🏠",
  Hotel: "🏨",
  Chalet: "🏔️",
  Cottage: "🏡",
  "Hostel & Backpacker": "🎒",
  Ranch: "🤠",
  Villa: "🏛️",
  Lodge: "🌲",
  Apartment: "🏢",
  "Private Vacation Home": "🏠",
  Houseboat: "⛵",
  Motel: "🛣️",
  Ryokan: "🎎",
  Treehouse: "🌳",
  Aparthotel: "🏨",
  "Condominium Resort": "🏖️",
  Campsite: "⛺",
  Riad: "🕌",
  Hostal: "🛏️",
  "Country House": "🌾",
  Resort: "🌴",
  Pension: "🏠",
  "Pousada (Portugal)": "🇵🇹",
  "Pousada (Brazil)": "🇧🇷",
  Residence: "🏠",
  Townhouse: "🏘️",
  Castle: "🏰",
  "Safari & Tentalow": "🦁",
  Palace: "👑",
  Inn: "🍺",
  "Agritourism Property": "🌻",
  Cruise: "🚢",
  "Holiday Park": "🎡",
  "Capsule Hotel": "💊",
  "Bed & Breakfast": "🥐",
  Guesthouse: "🏠",
  Condo: "🏢",
  "All-Inclusive Property": "🌊",
  Cabin: "🪵",
  "Mobile homes": "🚐",
};

export default function UniqueProperties() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#1e2e5e] md:text-3xl">
          Top Unique Properties
        </h2>
        <p className="mt-2 text-gray-500">
          Find the most distinctive places to stay on Travala
        </p>

        <div className="mt-8">
          <Carousel>
            {PROPERTY_TYPES.map((type) => (
              <div
                key={type}
                className="flex w-32 flex-shrink-0 cursor-pointer flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 transition hover:border-[#2577be] hover:shadow-md"
              >
                <span className="text-3xl">{PROPERTY_ICONS[type] || "🏠"}</span>
                <span className="text-center text-xs font-medium text-[#1e2e5e] leading-tight">{type}</span>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
