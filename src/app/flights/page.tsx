import FlashSaleBanner from "@/components/FlashSaleBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";

export const metadata = { title: "Book Flights with Crypto | Travala" };

export default function FlightsPage() {
  return (
    <>
      <FlashSaleBanner />
      <Header />
      <div className="bg-[#1e2e5e] px-3 py-8 text-center text-white sm:px-4 sm:py-12">
        <h1 className="text-2xl font-bold sm:text-3xl">Book Flights</h1>
        <p className="mt-2 text-sm text-white/80 sm:text-base">Search and compare flights from hundreds of airlines worldwide</p>
        <div className="mx-auto mt-6 w-full max-w-4xl sm:mt-8">
          <SearchForm defaultType="flights" />
        </div>
      </div>
      <Footer />
    </>
  );
}
