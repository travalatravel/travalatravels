import Link from "next/link";
import { Percent, Bitcoin, BadgeCheck } from "lucide-react";

export default function SavingsPromo() {
  return (
    <section className="border-y border-slate-200 bg-white py-14">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Percent,
              title: "Up to 62% off luxury stays",
              text: "We negotiate directly with hotels. You get palace-level properties at prices the big sites can't match.",
              cta: "Browse deals",
              href: "/search?type=stays",
            },
            {
              icon: Bitcoin,
              title: "Extra 20% off with crypto",
              text: "Pay in BTC, ETH or USDC at checkout. Instant confirmation, zero card fees, 20% bigger savings.",
              cta: "See crypto rates",
              href: "/stays",
            },
            {
              icon: BadgeCheck,
              title: "Price match guarantee",
              text: "Find a lower rate elsewhere within 24 hours? We refund the difference. No questions asked.",
              cta: "Learn more",
              href: "/search?type=stays",
            },
          ].map(({ icon: Icon, title, text, cta, href }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 transition hover:border-amber-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e2e5e] text-amber-400">
                <Icon size={22} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#1e2e5e]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{text}</p>
              <Link
                href={href}
                className="mt-4 inline-block text-sm font-semibold text-[#2577be] hover:underline"
              >
                {cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
