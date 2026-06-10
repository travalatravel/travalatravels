import SearchForm from "./SearchForm";

export default function CategoryHero({
  title,
  subtitle,
  defaultType,
}: {
  title: string;
  subtitle: string;
  defaultType: string;
}) {
  return (
    <div className="bg-[#1a5f94] px-3 py-8 text-center text-white sm:px-4 sm:py-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-sm text-white/85 sm:text-base">{subtitle}</p>
      <div className="mx-auto mt-6 w-full max-w-4xl sm:mt-8">
        <SearchForm defaultType={defaultType} />
      </div>
    </div>
  );
}
