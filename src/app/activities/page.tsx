import SiteChrome from "@/components/SiteChrome";
import CategoryHero from "@/components/CategoryHero";

export const metadata = { title: "Book Activities & Tours with Crypto | Travala" };

export default function ActivitiesPage() {
  return (
    <SiteChrome>
      <CategoryHero
        title="Activities & Tours"
        subtitle="Discover unforgettable experiences and tours in top destinations"
        defaultType="activities"
      />
    </SiteChrome>
  );
}
