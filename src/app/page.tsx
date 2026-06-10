import AppInstallBanner from "@/components/AppInstallBanner";
import Header from "@/components/Header";
import HeroSearch from "@/components/HeroSearch";
import FeatureBar from "@/components/FeatureBar";
import Destinations from "@/components/Destinations";
import TopUniqueProperties from "@/components/TopUniqueProperties";
import BlogSection from "@/components/BlogSection";
import TravelGuides from "@/components/TravelGuides";
import CryptoSection from "@/components/CryptoSection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <AppInstallBanner />
      <div className="relative">
        <Header overHero />
        <HeroSearch />
      </div>
      <FeatureBar />
      <Destinations />
      <TopUniqueProperties />
      <BlogSection />
      <TravelGuides />
      <CryptoSection />
      <FAQ />
      <Footer />
    </>
  );
}
