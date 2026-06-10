import Header from "./Header";
import Footer from "./Footer";

export default function SiteChrome({
  children,
  headerVariant = "default",
}: {
  children: React.ReactNode;
  headerVariant?: "home" | "default";
}) {
  return (
    <>
      <Header variant={headerVariant} />
      {children}
      <Footer />
    </>
  );
}
