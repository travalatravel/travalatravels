"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Carousel from "./Carousel";
import { BLOG_POSTS_DATA } from "@/data/blog-posts-data";
import { useTranslations } from "@/i18n/useTranslations";

export default function BlogSection() {
  const { messages: m } = useTranslations();

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#2D83C2]">
              {m.blog.inspiration}
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[#1e2e5e] md:text-3xl">
              {m.blog.title}
            </h2>
            <p className="mt-2 text-gray-500">{m.blog.subtitle}</p>
          </div>
          <Link
            href="https://www.travala.com/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#2D83C2] hover:underline"
          >
            {m.common.showMore}
          </Link>
        </div>

        <div className="mt-8">
          <Carousel>
            {BLOG_POSTS_DATA.map((post) => (
              <Link
                key={post.url}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-72 flex-shrink-0 overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md sm:w-80"
              >
                <div className="relative h-40 overflow-hidden">
                  {post.image ? (
                    <Image src={post.image} alt={post.title} fill sizes="320px" className="object-cover" unoptimized />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-[#2D83C2] to-[#1e2e5e]" />
                  )}
                  <span className="absolute left-3 top-3 rounded bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2D83C2]">
                    {post.category}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="line-clamp-2 text-sm font-semibold text-[#1e2e5e]">{post.title}</span>
                  <ArrowRight size={14} className="ml-2 flex-shrink-0 text-[#2D83C2]" />
                </div>
              </Link>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
