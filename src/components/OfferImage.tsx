"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  shouldResolveOfferImage,
  travalaRouteUrlFromOffer,
  travalaSlugFromOffer,
} from "@/lib/travala-image";
import type { OfferType } from "@/lib/types";

type Props = {
  src: string;
  alt: string;
  metadata?: string | null;
  offerType?: OfferType;
  city?: string | null;
  country?: string | null;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
};

function buildImageRequest(
  offerType: OfferType,
  metadata: string | null,
  city?: string | null,
  country?: string | null,
  checkIn?: string,
  checkOut?: string,
  guests?: number,
  rooms?: number,
): string | null {
  const params = new URLSearchParams({ type: offerType });

  if (offerType === "HOTEL") {
    const slug = travalaSlugFromOffer(metadata);
    if (!slug) return null;
    params.set("slug", slug);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", String(guests));
    if (rooms) params.set("rooms", String(rooms));
  } else if (offerType === "FLIGHT") {
    const url = travalaRouteUrlFromOffer(metadata);
    if (!url) return null;
    params.set("url", url);
  } else {
    if (!city?.trim()) return null;
    params.set("city", city.trim());
    if (country?.trim()) params.set("country", country.trim());
  }

  return `/api/offer-image?${params.toString()}`;
}

export default function OfferImage({
  src,
  alt,
  metadata,
  offerType = "HOTEL",
  city,
  country,
  checkIn,
  checkOut,
  guests,
  rooms,
  fill,
  width,
  height,
  className,
  priority,
}: Props) {
  const [resolved, setResolved] = useState(src);

  useEffect(() => {
    setResolved(src);

    if (!shouldResolveOfferImage(src, offerType, metadata ?? null, city)) return;

    const endpoint = buildImageRequest(
      offerType,
      metadata ?? null,
      city,
      country,
      checkIn,
      checkOut,
      guests,
      rooms,
    );
    if (!endpoint) return;

    let cancelled = false;
    fetch(endpoint)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.url) setResolved(data.url);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [src, metadata, offerType, city, country, checkIn, checkOut, guests, rooms]);

  const imgProps = {
    src: resolved,
    alt,
    className,
    priority,
    sizes: fill ? "(max-width: 768px) 100vw, 33vw" : undefined,
  };

  const unoptimized =
    resolved.includes("travelapi.com") || resolved.includes("static.travala.com");

  if (fill) {
    return <Image {...imgProps} fill unoptimized={unoptimized} />;
  }

  return (
    <Image
      {...imgProps}
      width={width ?? 400}
      height={height ?? 300}
      unoptimized={unoptimized}
    />
  );
}
