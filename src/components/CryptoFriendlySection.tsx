import Link from "next/link";

export default function CryptoFriendlySection() {
  return (
    <section
      aria-label="Payment options and cryptocurrency support"
      className="bg-[#220a32] px-4 py-12 text-center text-[#e1ffde] sm:py-16 lg:py-[111px]"
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      <h4 className="mb-2.5 text-sm font-normal uppercase tracking-wide">Crypto-friendly Bookings</h4>
      <h2 className="text-2xl font-black leading-tight sm:text-4xl lg:text-[52px]">
        Your money&apos;s good here.
      </h2>
      <div className="mx-auto mt-8 flex max-w-5xl flex-col items-center justify-between gap-6 lg:flex-row lg:items-end lg:text-left">
        <p className="max-w-[500px] text-sm leading-relaxed sm:text-base lg:text-left">
          We pride ourselves on being the leading crypto-native travel platform. Pay for your travel
          anywhere in the world seamlessly using 100+ cryptocurrencies or traditional payments.
        </p>
        <Link
          href="/search?type=stays"
          className="inline-flex shrink-0 items-center justify-center rounded border-[1.5px] border-[#e1ffde] px-6 py-3 text-sm font-semibold text-[#e1ffde] transition hover:bg-[#e1ffde] hover:text-[#220a32]"
        >
          See all payment options
        </Link>
      </div>
    </section>
  );
}
