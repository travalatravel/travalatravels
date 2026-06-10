import * as FlagIcons from "country-flag-icons/react/3x2";
import { resolveCountryCode } from "@/lib/country-code";

type Props = {
  country?: string | null;
  location?: string | null;
  className?: string;
  title?: string;
};

export default function CountryFlag({
  country,
  location,
  className = "h-3.5 w-[21px] flex-shrink-0 rounded-[2px] object-cover shadow-sm",
  title,
}: Props) {
  const code = resolveCountryCode(country, location);
  if (!code) return null;

  const Flag = FlagIcons[code as keyof typeof FlagIcons];
  if (!Flag) return null;

  return <Flag title={title ?? country ?? location ?? code} className={className} aria-hidden />;
}
