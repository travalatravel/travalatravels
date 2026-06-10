import SearchForm from "./SearchForm";
import SafeImage from "./SafeImage";
import { ASSETS } from "@/data/site-data";

export default function HeroSearch() {
  return (
    <section className="relative min-h-[480px] overflow-hidden pb-10 pt-6 sm:min-h-[540px] sm:pb-14 lg:min-h-[600px] lg:pb-16">
      <SafeImage
        src={ASSETS.heroBg}
        fallbackSrc={ASSETS.heroBg}
        alt="Travel booking background"
        fill
        fallbackClassName="bg-[#1e2e5e]"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-8 text-center sm:pt-12 lg:pt-14">
        <h1
          className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl"
          data-testid="home-hero-title"
        >
          Book Hotels &amp; SAVE UP TO 60%
        </h1>
        <h2
          className="mx-auto mt-3 max-w-2xl text-sm text-white/90 sm:text-base md:text-lg"
          data-testid="home-hero-subtitle"
        >
          Best Prices Guaranteed on 2,200,000+ Hotels Worldwide
        </h2>

        <div className="mx-auto mt-8 w-full max-w-4xl sm:mt-10" data-testid="home-hero-search-box-container">
          <SearchForm />
        </div>
      </div>
    </section>
  );
}
