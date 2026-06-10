import Header from "@/components/Header";
import HomeTabHero from "@/components/HomeTabHero";
import FeatureBar from "@/components/FeatureBar";
import Destinations from "@/components/Destinations";
import TopUniqueProperties from "@/components/TopUniqueProperties";
import BlogSection from "@/components/BlogSection";
import TravelGuides from "@/components/TravelGuides";
import PartnersSection from "@/components/PartnersSection";
import CustomerReviews from "@/components/CustomerReviews";
import CryptoFriendlySection from "@/components/CryptoFriendlySection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import StatsStrip from "@/components/StatsStrip";

export default function Home() {
  return (
    <>
      <Header variant="home" />
      <HomeTabHero />
      <FeatureBar />
      <CryptoFriendlySection />
      <Destinations />
      <StatsStrip />
      <TopUniqueProperties />
      <BlogSection />
      <TravelGuides />
      <PartnersSection />
      <CustomerReviews />
      <FAQ />
      <Footer />
    </>
  );
}
