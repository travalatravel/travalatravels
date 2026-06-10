import SiteChrome from "@/components/SiteChrome";
import CategoryHero from "@/components/CategoryHero";

export const metadata = { title: "Book Car Rental with Crypto | Travala" };

export default function CarRentalPage() {
  return (
    <SiteChrome>
      <CategoryHero
        title="Car Rental"
        subtitle="Compare car rental deals from trusted providers worldwide"
        defaultType="car-rental"
      />
    </SiteChrome>
  );
}
