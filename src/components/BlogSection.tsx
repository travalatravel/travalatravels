import { ArrowRight } from "lucide-react";
import Carousel from "./Carousel";
import { BLOG_POSTS } from "@/data/site-data";

const BLOG_COLORS = [
  "from-blue-600 to-blue-800",
  "from-teal-600 to-teal-800",
  "from-purple-600 to-purple-800",
  "from-orange-600 to-orange-800",
  "from-indigo-600 to-indigo-800",
  "from-emerald-600 to-emerald-800",
];

export default function BlogSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#2577be]">Inspiration</p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[#1e2e5e] md:text-3xl">
          Where To Go &amp; What To See
        </h2>
        <p className="mt-2 text-gray-500">
          Get inspired with travel guides and destination ideas from our blog
        </p>

        <div className="mt-8">
          <Carousel>
            {BLOG_POSTS.map((post, i) => (
              <div
                key={post}
                className="w-64 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
              >
                <div className={`h-36 bg-gradient-to-br ${BLOG_COLORS[i % BLOG_COLORS.length]} flex items-end p-4`}>
                  <span className="text-sm font-semibold text-white leading-snug line-clamp-3">{post}</span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-xs text-gray-500">Read more</span>
                  <ArrowRight size={14} className="text-[#2577be]" />
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
