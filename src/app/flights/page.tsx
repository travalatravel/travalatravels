import SiteChrome from "@/components/SiteChrome";
import CategoryHero from "@/components/CategoryHero";

export const metadata = { title: "Book Flights with Crypto | Travala" };

export default function FlightsPage() {
  return (
    <SiteChrome>
      <CategoryHero
        title="Book Flights"
        subtitle="Search and compare flights from hundreds of airlines worldwide"
        defaultType="flights"
      />
    </SiteChrome>
  );
}
