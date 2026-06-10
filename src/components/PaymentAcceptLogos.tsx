import Image from "next/image";
import { PAYMENT_ACCEPT_LOGOS } from "@/data/site-data";

export default function PaymentAcceptLogos({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {PAYMENT_ACCEPT_LOGOS.map((logo) => (
        <Image
          key={logo.alt}
          src={logo.src}
          alt={logo.alt}
          width={70}
          height={38}
          className="h-8 w-auto rounded bg-white/10 p-0.5"
          unoptimized
        />
      ))}
    </div>
  );
}
