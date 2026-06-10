"use client";

import Image from "next/image";
import { Building2, Plane } from "lucide-react";
import { ASSETS } from "@/data/site-data";
import { useTranslations } from "@/i18n/useTranslations";

export const SEARCH_TABS = [
  { key: "stays", labelKey: "stays" as const, icon: Building2 },
  { key: "flights", labelKey: "flights" as const, icon: Plane },
] as const;

export function formatDesktopDate(iso: string, fallback = "Select date", locale = "en-GB") {
  if (!iso) return { full: fallback, day: "" };
  const d = new Date(`${iso}T12:00:00`);
  return {
    full: d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }),
    day: d.toLocaleDateString(locale, { weekday: "long" }),
  };
}

export function formatMobileDateCard(iso: string, fallback: string, locale = "en-GB") {
  if (!iso) return { primary: fallback, secondary: "" };
  const d = new Date(`${iso}T12:00:00`);
  return {
    primary: d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }),
    secondary: d.toLocaleDateString(locale, { weekday: "long" }),
  };
}

/** @deprecated Use formatMobileDateCard — kept for any legacy usage */
export function formatMobileDate(iso: string, locale = "en-GB") {
  if (!iso) return { dayNum: "—", weekday: "", month: "" };
  const d = new Date(`${iso}T12:00:00`);
  return {
    dayNum: String(d.getDate()),
    weekday: d.toLocaleDateString(locale, { weekday: "short" }),
    month: d.toLocaleDateString(locale, { month: "short" }),
  };
}

export function SearchFormTabs({
  activeTab,
  onTabChange,
  isHero,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isHero: boolean;
}) {
  const { messages: m } = useTranslations();

  if (isHero) {
    return (
      <div
        role="tablist"
        aria-label="searchType"
        className="mx-6 -mb-0.5 flex gap-0.5 lg:mx-0 lg:mb-0 lg:gap-0 lg:overflow-x-auto lg:scrollbar-hide"
      >
        {SEARCH_TABS.map((tab) => {
          const active = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tab.key)}
              className={`relative z-[1] flex flex-1 flex-col items-center gap-1.5 rounded-t-lg border border-b-0 px-2 py-2 lg:min-w-[100px] lg:flex-none lg:gap-1.5 lg:rounded-none lg:border-0 lg:border-t-[3px] lg:px-4 lg:py-3 ${
                active
                  ? "z-[2] border-[#ccc] bg-white lg:border-t-[#2D83C2] lg:bg-white"
                  : "border-[#ccc] bg-white/95 text-gray-600 lg:border-t-transparent lg:bg-white/80"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full lg:h-9 lg:w-9 ${
                  active ? "bg-[#2D83C2] text-white lg:bg-[#1E2E5E]" : "bg-[#eaf3f9] text-[#2D83C2]"
                }`}
              >
                <Icon size={18} />
              </span>
              <span
                className={`text-xs font-medium leading-4 lg:text-[11px] lg:font-semibold ${
                  active ? "text-[#333] lg:text-[#1a1a1a] lg:font-medium" : "text-gray-600"
                }`}
              >
                {m.nav[tab.labelKey]}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      aria-label="searchType"
      className="flex snap-x snap-mandatory gap-0 overflow-x-auto border-b border-gray-100 scrollbar-hide"
    >
      {SEARCH_TABS.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onTabChange(tab.key)}
            className={`relative flex-shrink-0 snap-start px-3 py-2.5 text-xs font-semibold sm:px-5 sm:py-3 sm:text-sm ${
              active
                ? "text-[#2D83C2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2D83C2]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {m.nav[tab.labelKey]}
          </button>
        );
      })}
    </div>
  );
}

export function SearchFormShell({
  isHero,
  children,
}: {
  isHero: boolean;
  children: React.ReactNode;
}) {
  if (isHero) {
    return (
      <div className="mx-auto w-full max-w-[90%] sm:max-w-[342px] lg:max-w-none">
        <div className="overflow-hidden rounded-b-lg bg-white shadow-[0_3px_6px_rgba(0,0,0,0.16)] lg:rounded-t-lg lg:shadow-[0_3px_6px_rgba(0,0,0,0.16)]">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 rounded-2xl bg-white p-2 shadow-xl sm:p-2.5">
      {children}
    </div>
  );
}

export function SearchFormPanel({
  isHero,
  tabRow,
  children,
}: {
  isHero: boolean;
  tabRow: React.ReactNode;
  children: React.ReactNode;
}) {
  if (isHero) {
    return (
      <>
        {tabRow}
        <div className="border border-t-0 border-[#2D83C2] bg-white lg:rounded-b-lg lg:rounded-tr-lg lg:rounded-tl-none lg:border-[#ccc] lg:border-t-0">
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      {tabRow}
      <div className="p-2 sm:p-3">{children}</div>
    </>
  );
}

export function SearchSubmitButton({
  disabled,
  isHero,
  className = "",
}: {
  disabled?: boolean;
  isHero: boolean;
  className?: string;
}) {
  const { messages: m } = useTranslations();

  return (
    <button
      type="submit"
      disabled={disabled}
      className={`shrink-0 rounded-lg font-semibold transition ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:opacity-90"
      } ${
        isHero
          ? "h-[42px] w-full bg-[#2577be] text-sm text-white lg:m-2 lg:h-auto lg:min-h-0 lg:w-auto lg:min-w-[148px] lg:self-center lg:rounded-lg lg:bg-[#9eb8f5] lg:px-8 lg:py-3 lg:text-[#1E2E5E] lg:font-bold lg:uppercase lg:tracking-wide lg:hover:bg-[#8aaef0] disabled:lg:bg-[#9eb8f5]/50 disabled:lg:text-[#1E2E5E]/50"
          : "min-h-12 w-full bg-[#2577be] px-6 py-3.5 text-sm text-white sm:w-auto lg:bg-[#9eb8f5] lg:font-bold lg:uppercase lg:tracking-wide lg:text-[#1E2E5E]"
      } ${className}`}
    >
      {m.common.search}
    </button>
  );
}

/** Travala mobile SearchWrap__card */
export function MobileSearchCard({
  icon,
  onClick,
  primary,
  secondary,
  placeholder,
  label,
  className = "",
  children,
}: {
  icon: React.ReactNode;
  onClick?: () => void;
  primary?: string;
  secondary?: string;
  placeholder?: string;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex min-h-[42px] w-full items-center gap-3 rounded-lg bg-[#f2f5f9] px-3 py-2.5 text-left lg:hidden ${className}`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">{icon}</span>
      <div className="min-w-0 flex-1">
        {label && <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</div>}
        {primary ? (
          <>
            <div className={`truncate text-sm font-medium text-[#1a1a1a] ${label ? "mt-0.5" : ""}`}>{primary}</div>
            {secondary && <div className="text-xs text-gray-500">{secondary}</div>}
          </>
        ) : (
          <div className={`text-sm text-[#bcbcbc] ${label ? "mt-0.5" : ""}`}>{placeholder}</div>
        )}
      </div>
      {children}
    </Tag>
  );
}

export function MobileDatepickerIcon() {
  return (
    <Image src={ASSETS.datepickerIcon} alt="" width={20} height={20} className="shrink-0 opacity-80" unoptimized />
  );
}

export function MobileSearchIcon() {
  return (
    <Image src={ASSETS.searchIcon} alt="" width={20} height={20} className="shrink-0 opacity-70" unoptimized />
  );
}

export function MobileUserIcon() {
  return <Image src={ASSETS.userIcon} alt="" width={20} height={20} className="shrink-0" unoptimized />;
}

export function MobileDateCards({
  checkIn,
  checkOut,
  checkInLabel,
  checkOutLabel,
  onCheckInClick,
  onCheckOutClick,
  checkInInput,
  checkOutInput,
  locale = "en-GB",
  showCheckOut = true,
  checkInFallback,
  checkOutFallback,
}: {
  checkIn: string;
  checkOut: string;
  checkInLabel?: string;
  checkOutLabel?: string;
  onCheckInClick: () => void;
  onCheckOutClick?: () => void;
  checkInInput: React.ReactNode;
  checkOutInput?: React.ReactNode;
  locale?: string;
  showCheckOut?: boolean;
  checkInFallback: string;
  checkOutFallback: string;
}) {
  const inFmt = formatMobileDateCard(checkIn, checkInFallback, locale);
  const outFmt = formatMobileDateCard(checkOut, checkOutFallback, locale);
  const dateIcon = <MobileDatepickerIcon />;

  return (
    <div className="flex flex-col gap-3 lg:hidden">
      <MobileSearchCard
        icon={dateIcon}
        onClick={onCheckInClick}
        label={checkInLabel}
        primary={checkIn ? inFmt.primary : undefined}
        secondary={checkIn ? inFmt.secondary : undefined}
        placeholder={checkInFallback}
      >
        {checkInInput}
      </MobileSearchCard>
      {showCheckOut && onCheckOutClick && (
        <MobileSearchCard
          icon={dateIcon}
          onClick={onCheckOutClick}
          label={checkOutLabel}
          primary={checkOut ? outFmt.primary : undefined}
          secondary={checkOut ? outFmt.secondary : undefined}
          placeholder={checkOutFallback}
        >
          {checkOutInput}
        </MobileSearchCard>
      )}
    </div>
  );
}

/** @deprecated Use MobileDateCards for Travala mobile layout */
export function MobileDateRange({
  checkIn,
  checkOut,
  checkInLabel,
  checkOutLabel,
  onCheckInClick,
  onCheckOutClick,
  checkInInput,
  checkOutInput,
  locale = "en-GB",
  checkInFallback = "Select date",
  checkOutFallback = "Select date",
}: {
  checkIn: string;
  checkOut: string;
  checkInLabel: string;
  checkOutLabel: string;
  onCheckInClick: () => void;
  onCheckOutClick: () => void;
  checkInInput: React.ReactNode;
  checkOutInput: React.ReactNode;
  locale?: string;
  checkInFallback?: string;
  checkOutFallback?: string;
}) {
  return (
    <MobileDateCards
      checkIn={checkIn}
      checkOut={checkOut}
      checkInLabel={checkInLabel}
      checkOutLabel={checkOutLabel}
      onCheckInClick={onCheckInClick}
      onCheckOutClick={onCheckOutClick}
      checkInInput={checkInInput}
      checkOutInput={checkOutInput}
      locale={locale}
      checkInFallback={checkInFallback}
      checkOutFallback={checkOutFallback}
    />
  );
}

export function DesktopDateButton({
  label,
  full,
  day,
  onClick,
  input,
  icon,
}: {
  label: string;
  full: string;
  day: string;
  onClick: () => void;
  input: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hidden min-w-0 flex-1 items-center gap-2.5 border-r border-gray-200 px-4 py-3.5 text-left lg:flex"
    >
      {icon}
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[#1a1a1a]">{full}</div>
        {day && <div className="text-xs text-gray-500">{day}</div>}
      </div>
      {input}
    </button>
  );
}
