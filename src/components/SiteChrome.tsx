import AppInstallBanner from "./AppInstallBanner";
import Header from "./Header";
import Footer from "./Footer";

export default function SiteChrome({
  children,
  overHero = false,
}: {
  children: React.ReactNode;
  overHero?: boolean;
}) {
  return (
    <>
      <AppInstallBanner />
      <Header overHero={overHero} />
      {children}
      <Footer />
    </>
  );
}
