import AppInstallBanner from "@/components/AppInstallBanner";
import Header from "@/components/Header";
import HeroSearch from "@/components/HeroSearch";
import FeatureBar from "@/components/FeatureBar";
import Destinations from "@/components/Destinations";
import TopUniqueProperties from "@/components/TopUniqueProperties";
import BlogSection from "@/components/BlogSection";
import TravelGuides from "@/components/TravelGuides";
import PartnersSection from "@/components/PartnersSection";
import CryptoSection from "@/components/CryptoSection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import StatsStrip from "@/components/StatsStrip";

export default function Home() {
  return (
    <>
      <AppInstallBanner />
      <div className="relative">
        <Header overHero />
        <HeroSearch />
      </div>
      <FeatureBar />
      <StatsStrip />
      <Destinations />
      <TopUniqueProperties />
      <BlogSection />
      <TravelGuides />
      <PartnersSection />
      <CryptoSection />
      <FAQ />
      <Footer />
    </>
  );
}
