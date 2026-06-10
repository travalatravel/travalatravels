import FlashSaleBanner from "@/components/FlashSaleBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";

export const metadata = { title: "Car Rental with Crypto | Travala" };

export default function CarRentalPage() {
  return (
    <>
      <FlashSaleBanner />
      <Header />
      <div className="bg-[#1e2e5e] py-12 text-center text-white">
        <h1 className="text-3xl font-bold">Car Rental</h1>
        <p className="mt-2 text-white/80">NEW! Rent a car anywhere in the world and pay with crypto</p>
        <div className="mx-auto mt-8 max-w-4xl px-4">
          <SearchForm defaultType="car-rental" />
        </div>
      </div>
      <Footer />
    </>
  );
}
