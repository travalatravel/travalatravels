import { redirect, notFound } from "next/navigation";
import { findOfferByHotelSlug } from "@/lib/hotel-slug";

export default async function HotelSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const offer = await findOfferByHotelSlug(decodeURIComponent(slug));

  if (!offer) {
    notFound();
  }

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") qs.set(key, value);
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`/offers/${offer.id}${suffix}`);
}
