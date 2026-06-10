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
      <div className="bg-[#1e2e5e] py-12 text-center text-white">
        <h1 className="text-3xl font-bold">Book Hotels &amp; Stays</h1>
        <p className="mt-2 text-white/80">Best Prices Guaranteed on 2,200,000+ Hotels Worldwide</p>
        <div className="mx-auto mt-8 max-w-4xl px-4">
          <SearchForm defaultType="stays" />
        </div>
      </div>
      <Footer />
    </>
  );
}
