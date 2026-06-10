import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";
import CategoryHero from "@/components/CategoryHero";
import { resolveLocale } from "@/i18n/detect";
import { getMessages } from "@/i18n/messages";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const m = getMessages(locale);
  return { title: m.meta.staysTitle };
}

export default async function StaysPage() {
  const locale = await resolveLocale();
  const m = getMessages(locale);

  return (
    <SiteChrome>
      <CategoryHero
        title={m.categoryPages.stays.title}
        subtitle={m.categoryPages.stays.subtitle}
        defaultType="stays"
      />
    </SiteChrome>
  );
}
