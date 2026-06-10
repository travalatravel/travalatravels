import { Wallet, Headphones, ShieldCheck, Star } from "lucide-react";
import { FEATURES } from "@/data/site-data";

const ICONS = {
  support: Headphones,
  payment: Wallet,
  rewards: Star,
  guarantee: ShieldCheck,
};

export default function FeatureBar() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        {FEATURES.map((feature) => {
          const Icon = ICONS[feature.icon as keyof typeof ICONS];
          return (
            <div key={feature.title} className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#2577be]/10">
                <Icon size={22} className="text-[#2577be]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#1e2e5e]">{feature.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
