import Link from "next/link";
import SearchForm from "./SearchForm";
import SafeImage from "./SafeImage";
import { ASSETS } from "@/data/site-data";
import { ShieldCheck, Sparkles } from "lucide-react";

const HERO_IMAGE =
  "https://static.travala.com/destination/Middle%20East/dubai.jpg";
const HERO_FALLBACK = ASSETS.heroBg;

export default function HeroSearch() {
  return (
    <section className="relative min-h-[460px] overflow-hidden sm:min-h-[520px] lg:min-h-[680px]">
      <SafeImage
        src={HERO_IMAGE}
        fallbackSrc={HERO_FALLBACK}
        alt="Luxury travel Dubai"
        fill
        fallbackClassName="bg-gradient-to-br from-[#0f172a] via-[#1e2e5e] to-[#0f172a]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/85 via-[#1e2e5e]/60 to-[#0f172a]/90" />

      <div className="relative z-10 mx-auto max-w-5xl px-3 pt-10 pb-14 text-center sm:px-4 sm:pt-14 sm:pb-20 lg:pt-20">
        <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 backdrop-blur sm:mb-6 sm:px-4 sm:text-sm">
          <Sparkles size={14} className="flex-shrink-0" />
          <span className="truncate">Luxury travel · Up to 62% off</span>
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          Five-star escapes
          <br />
          <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            for less than you think
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl px-1 text-sm text-white/75 sm:mt-5 sm:text-base md:text-lg">
          Palaces in Dubai, suites in Paris, villas in Bali — exclusive rates
          unlocked today. Pay with crypto and save an extra 20%.
        </p>

        <div className="mt-5 flex flex-col items-center justify-center gap-2 text-xs text-white/60 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            Best price guarantee
          </span>
          <span className="hidden sm:inline">·</span>
          <span>14,000+ luxury hotels</span>
          <span className="hidden sm:inline">·</span>
          <span>No hidden fees</span>
        </div>

        <div className="mx-auto mt-6 w-full max-w-4xl sm:mt-10">
          <SearchForm />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2 sm:mt-8 sm:gap-3">
          {[
            { label: "Dubai 5★", href: "/search?type=stays&q=dubai" },
            { label: "Maldives", href: "/search?type=stays&q=maldives" },
            { label: "Paris Suites", href: "/search?type=stays&q=paris" },
            { label: "Bali Villas", href: "/search?type=stays&q=bali" },
          ].map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur transition hover:border-amber-500/50 hover:bg-white/20 sm:px-4 sm:py-2 sm:text-sm"
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
