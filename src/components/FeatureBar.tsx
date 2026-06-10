import Image from "next/image";
import { FEATURES } from "@/data/site-data";

export default function FeatureBar() {
  return (
    <section className="border-b border-gray-100 bg-white py-8 sm:py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-3 sm:grid-cols-2 sm:px-4 lg:grid-cols-4 lg:gap-6 lg:px-6">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#2577be]">
              <Image
                src={feature.image}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6"
                unoptimized
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1e2e5e]">{feature.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
