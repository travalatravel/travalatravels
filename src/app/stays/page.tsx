import SiteChrome from "@/components/SiteChrome";
import CategoryHero from "@/components/CategoryHero";

export const metadata = { title: "Book Hotels with Crypto | Travala" };

export default function StaysPage() {
  return (
    <SiteChrome>
      <CategoryHero
        title="Book Hotels & Stays"
        subtitle="Best Prices Guaranteed on 2,200,000+ Hotels Worldwide"
        defaultType="stays"
      />
    </SiteChrome>
  );
}
