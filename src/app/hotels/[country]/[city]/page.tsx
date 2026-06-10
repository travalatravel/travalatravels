import HotelListingPage from "@/components/HotelListingPage";
import { resolveLocale } from "@/i18n/detect";
import { getMessages } from "@/i18n/messages";
import { formatMessage } from "@/i18n/useTranslations";

function titleCase(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function HotelsCityPage({
  params,
}: {
  params: Promise<{ country: string; city: string }>;
}) {
  const { country: countrySlug, city: citySlug } = await params;
  const country = titleCase(decodeURIComponent(countrySlug));
  const city = titleCase(decodeURIComponent(citySlug));
  const locale = await resolveLocale();
  const m = getMessages(locale);

  return (
    <HotelListingPage
      title={formatMessage(m.hotelsPage.inCity, { city, country })}
      subtitle={formatMessage(m.hotelsPage.inCitySub, { city })}
      query={city}
      country={country}
      city={city}
    />
  );
}
