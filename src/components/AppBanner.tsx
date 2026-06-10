import Image from "next/image";
import Link from "next/link";

export default function AppBanner() {
  return (
    <div className="flex items-center justify-between gap-3 bg-[#2D83C2] px-4 py-2.5 text-white">
      <div className="flex min-w-0 items-center gap-3">
        <Image
          src="https://static.travala.com/frontend/logos-v2/logo-app-download-banner.svg"
          alt="Travala App"
          width={36}
          height={36}
          unoptimized
        />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">Travala.com App</p>
          <p className="truncate text-[10px] text-white/80">Quick and easy travel bookings!</p>
        </div>
      </div>
      <Link
        href="https://www.travala.com/mobile"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-lg bg-white px-4 py-1.5 text-xs font-bold text-[#2D83C2] hover:bg-white/90"
      >
        Install
      </Link>
    </div>
  );
}
