import SearchForm from "./SearchForm";
import SafeImage from "./SafeImage";
import { ASSETS } from "@/data/site-data";

export default function HeroSearch() {
  return (
    <section className="relative min-h-[420px] overflow-hidden sm:min-h-[500px] lg:min-h-[560px]">
      <SafeImage
        src={ASSETS.heroBg}
        fallbackSrc={ASSETS.heroBg}
        alt="Travel destinations"
        fill
        fallbackClassName="bg-[#1e2e5e]"
      />
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 mx-auto max-w-5xl px-3 pt-12 pb-14 text-center sm:px-4 sm:pt-16 sm:pb-20 lg:pt-20">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
          Book Hotels &amp; SAVE UP TO 60%
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/90 sm:mt-4 sm:text-base md:text-lg">
          Best Prices Guaranteed on 2,200,000+ Hotels Worldwide
        </p>

        <div className="mx-auto mt-6 w-full max-w-4xl sm:mt-10">
          <SearchForm />
        </div>
      </div>
    </section>
  );
}
