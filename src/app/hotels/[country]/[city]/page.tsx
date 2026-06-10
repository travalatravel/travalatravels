import HotelListingPage from "@/components/HotelListingPage";

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

  return (
    <HotelListingPage
      title={`Hotels in ${city}, ${country}`}
      subtitle={`Find the best places to stay in ${city}`}
      query={city}
      country={country}
      city={city}
    />
  );
}
