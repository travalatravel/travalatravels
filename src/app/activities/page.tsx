import FlashSaleBanner from "@/components/FlashSaleBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";

export const metadata = { title: "Book Activities & Tours with Crypto | Travala" };

export default function ActivitiesPage() {
  return (
    <>
      <FlashSaleBanner />
      <Header />
      <div className="bg-[#1e2e5e] px-3 py-8 text-center text-white sm:px-4 sm:py-12">
        <h1 className="text-2xl font-bold sm:text-3xl">Activities &amp; Tours</h1>
        <p className="mt-2 text-sm text-white/80 sm:text-base">Discover and book unforgettable experiences worldwide</p>
        <div className="mx-auto mt-6 w-full max-w-4xl sm:mt-8">
          <SearchForm defaultType="activities" />
        </div>
      </div>
      <Footer />
    </>
  );
}
