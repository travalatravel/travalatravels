import HotelListingPage from "@/components/HotelListingPage";

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

  return (
    <HotelListingPage
      title={`Hotels in ${country}`}
      subtitle={`Browse top hotels and properties in ${country}`}
      query={country}
      country={country}
    />
  );
}
