import { notFound } from "next/navigation";
import HotelListingPage from "@/components/HotelListingPage";
import { PROPERTY_TYPE_TILES } from "@/data/property-types-data";
import { resolveLocale } from "@/i18n/detect";
import { getMessages } from "@/i18n/messages";
import { formatMessage } from "@/i18n/useTranslations";

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

  const locale = await resolveLocale();
  const m = getMessages(locale);

  return (
    <HotelListingPage
      title={tile.name}
      subtitle={formatMessage(m.hotelsPage.propertiesWorldwide, {
        count: tile.properties.toLocaleString(),
      })}
      query={tile.name}
    />
  );
}
