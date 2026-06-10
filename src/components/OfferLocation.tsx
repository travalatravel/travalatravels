import CountryFlag from "@/components/CountryFlag";

type Props = {
  location: string;
  country?: string | null;
  className?: string;
  textClassName?: string;
};

export default function OfferLocation({
  location,
  country,
  className = "mt-1 flex items-center gap-1.5 text-xs text-gray-500",
  textClassName = "min-w-0 truncate",
}: Props) {
  return (
    <p className={className}>
      <CountryFlag country={country} location={location} />
      <span className={textClassName}>{location}</span>
    </p>
  );
}
