import { notFound } from "next/navigation";
import HotelListingPage from "@/components/HotelListingPage";
import { PROPERTY_TYPE_TILES } from "@/data/property-types-data";

export default async function PropertyTypePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "hotels") {
    const { redirect } = await import("next/navigation");
    redirect("/stays");
  }
  const tile = PROPERTY_TYPE_TILES.find((t) => t.slug === slug);
  if (!tile) notFound();

  return (
    <HotelListingPage
      title={tile.name}
      subtitle={`${tile.properties.toLocaleString()} properties worldwide`}
      query={tile.name}
    />
  );
}
