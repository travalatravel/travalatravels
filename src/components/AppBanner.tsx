import Image from "next/image";

export default function AppBanner() {
  return (
    <div className="flex items-center justify-between gap-3 bg-[#220a32] px-4 py-2.5 text-white">
      <div className="flex items-center gap-3">
        <Image
          src="https://static.travala.com/frontend/logos-v2/logo-app-download-banner.svg"
          alt="Travala App"
          width={36}
          height={36}
        />
        <div>
          <p className="text-xs font-semibold">Travala.com App</p>
          <p className="text-[10px] text-white/70">Quick and easy travel bookings!</p>
        </div>
      </div>
      <button className="rounded-lg bg-[#2dd4bf] px-4 py-1.5 text-xs font-bold text-[#1e2e5e]">
        Install
      </button>
    </div>
  );
}
