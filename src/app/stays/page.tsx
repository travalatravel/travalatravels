import FlashSaleBanner from "@/components/FlashSaleBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";

export const metadata = { title: "Book Hotels with Crypto | Travala" };

export default function StaysPage() {
  return (
    <>
      <FlashSaleBanner />
      <Header />
      <div className="bg-[#1e2e5e] px-3 py-8 text-center text-white sm:px-4 sm:py-12">
        <h1 className="text-2xl font-bold sm:text-3xl">Book Hotels &amp; Stays</h1>
        <p className="mt-2 text-sm text-white/80 sm:text-base">Best Prices Guaranteed on 2,200,000+ Hotels Worldwide</p>
        <div className="mx-auto mt-6 w-full max-w-4xl sm:mt-8">
          <SearchForm defaultType="stays" />
        </div>
      </div>
      <Footer />
    </>
  );
}
