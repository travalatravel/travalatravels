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

export default async function HotelsCountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: countrySlug } = await params;
  const country = titleCase(decodeURIComponent(countrySlug));
  const locale = await resolveLocale();
  const m = getMessages(locale);

  return (
    <HotelListingPage
      title={formatMessage(m.hotelsPage.inCountry, { country })}
      subtitle={formatMessage(m.hotelsPage.inCountrySub, { country })}
      query={country}
      country={country}
    />
  );
}
