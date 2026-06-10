"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { isGenericTravalaImage, travalaSlugFromOffer } from "@/lib/travala-image";

type Props = {
  src: string;
  alt: string;
  metadata?: string | null;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
};

export default function OfferImage({
  src,
  alt,
  metadata,
  fill,
  width,
  height,
  className,
  priority,
}: Props) {
  const [resolved, setResolved] = useState(src);

  useEffect(() => {
    setResolved(src);
    if (!isGenericTravalaImage(src)) return;

    const slug = travalaSlugFromOffer(metadata ?? null);
    if (!slug) return;

    let cancelled = false;
    fetch(`/api/hotel-image?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.url) setResolved(data.url);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [src, metadata]);

  const imgProps = {
    src: resolved,
    alt,
    className,
    priority,
    sizes: fill ? "(max-width: 768px) 100vw, 33vw" : undefined,
  };

  if (fill) {
    return <Image {...imgProps} fill unoptimized={resolved.includes("travelapi.com")} />;
  }

  return (
    <Image
      {...imgProps}
      width={width ?? 400}
      height={height ?? 300}
      unoptimized={resolved.includes("travelapi.com")}
    />
  );
}
