"use client";

import Image from "next/image";
import Link from "next/link";
import Carousel from "./Carousel";
import { CUSTOMER_REVIEWS, TRUSTPILOT_RATING } from "@/data/reviews-data";
import { useTranslations } from "@/i18n/useTranslations";

function TrustpilotStar({ filled = true, size = 18 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill={filled ? "#00b67a" : "#dcdce6"}
        d="M12 0l3.09 6.26L22 7.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 12.14l-5-4.87 6.91-1.01L12 0z"
      />
    </svg>
  );
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <TrustpilotStar key={i} filled={i < rating} size={size} />
      ))}
    </div>
  );
}

export default function CustomerReviews() {
  const { messages: m, fmt } = useTranslations();
  const r = m.reviews;

  return (
    <section className="border-y border-gray-100 bg-[#f8fafc] py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#1a1a1a] sm:text-2xl md:text-3xl">
              {r.title}
            </h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">{r.subtitle}</p>
          </div>

          <Link
            href="https://www.trustpilot.com/review/travala.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 flex-col items-start rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:border-[#2D83C2]/40 hover:shadow-md sm:items-center"
          >
            <Image
              src="https://cdn.trustpilot.net/brand-assets/4.1.0/logo-black.svg"
              alt="Trustpilot"
              width={110}
              height={28}
              className="h-6 w-auto"
              unoptimized
            />
            <div className="mt-2 flex items-center gap-2">
              <StarRow rating={5} size={14} />
              <span className="text-lg font-bold text-[#1a1a1a]">{TRUSTPILOT_RATING.score}</span>
              <span className="rounded bg-[#00b67a] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {r.excellent}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {fmt(r.basedOn, { count: TRUSTPILOT_RATING.count.toLocaleString() })}
            </p>
          </Link>
        </div>

        <div className="mt-8">
          <Carousel>
            {CUSTOMER_REVIEWS.map((review) => (
              <article
                key={review.id}
                className="w-72 flex-shrink-0 snap-start rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:w-80"
              >
                <StarRow rating={review.rating} />
                <h3 className="mt-3 text-sm font-bold text-[#1a1a1a]">{review.title}</h3>
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-gray-600">{review.body}</p>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                  <span className="font-semibold text-[#1a1a1a]">
                    {review.name} · {review.location}
                  </span>
                  <span>{review.date}</span>
                </div>
              </article>
            ))}
          </Carousel>
        </div>

        <p className="mt-6 text-center">
          <Link
            href="https://www.trustpilot.com/review/travala.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#2D83C2] hover:underline"
          >
            {r.readOnTrustpilot}
          </Link>
        </p>
      </div>
    </section>
  );
}
