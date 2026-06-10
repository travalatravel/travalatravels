import FlashSaleBanner from "@/components/FlashSaleBanner";
import Header from "@/components/Header";
import HeroSearch from "@/components/HeroSearch";
import SocialProofBar from "@/components/SocialProofBar";
import LuxuryDealsSection from "@/components/LuxuryDealsSection";
import SavingsPromo from "@/components/SavingsPromo";
import FeatureBar from "@/components/FeatureBar";
import Destinations from "@/components/Destinations";
import CryptoSection from "@/components/CryptoSection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <FlashSaleBanner />
      <Header />
      <HeroSearch />
      <SocialProofBar />
      <LuxuryDealsSection />
      <SavingsPromo />
      <FeatureBar />
      <Destinations />
      <CryptoSection />
      <FAQ />
      <Footer />
    </>
  );
}
