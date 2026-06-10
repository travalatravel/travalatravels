"use client";

const MESSAGES = [
  "Michael from Zürich just saved $1,240 on a Maldives villa",
  "Sarah booked The Burj Al Arab — 52% off today",
  "127 luxury suites booked in the last hour",
  "Crypto payers save an extra 20% on every booking",
  "Emma from London secured a Paris 5★ suite — only 3 left",
  "Flash sale: Dubai palace hotels from $189/night",
];

export default function SocialProofBar() {
  const items = [...MESSAGES, ...MESSAGES];

  return (
    <div className="overflow-hidden border-y border-slate-200 bg-slate-50 py-3">
      <div className="marquee-track flex w-max">
        {items.map((msg, i) => (
          <span
            key={i}
            className="mx-8 inline-flex flex-shrink-0 items-center gap-2 text-xs text-slate-600"
          >
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
