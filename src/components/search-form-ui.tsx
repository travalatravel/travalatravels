"use client";

import { Building2, Plane } from "lucide-react";
import { useTranslations } from "@/i18n/useTranslations";

export const SEARCH_TABS = [
  { key: "stays", labelKey: "stays" as const, icon: Building2 },
  { key: "flights", labelKey: "flights" as const, icon: Plane },
] as const;

export function formatDesktopDate(iso: string, fallback = "Select date") {
  if (!iso) return { full: fallback, day: "" };
  const d = new Date(`${iso}T12:00:00`);
  return {
    full: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    day: d.toLocaleDateString("en-GB", { weekday: "long" }),
  };
}

export function formatMobileDate(iso: string) {
  if (!iso) return { dayNum: "—", weekday: "", month: "" };
  const d = new Date(`${iso}T12:00:00`);
  return {
    dayNum: String(d.getDate()),
    weekday: d.toLocaleDateString("en-GB", { weekday: "short" }),
    month: d.toLocaleDateString("en-GB", { month: "short" }),
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
      <div role="tablist" aria-label="searchType" className="flex gap-0 overflow-x-auto scrollbar-hide">
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
              className={`flex min-w-[25%] flex-1 flex-shrink-0 flex-col items-center gap-1.5 border-t-[3px] px-3 py-3 sm:min-w-[88px] sm:flex-none sm:gap-1.5 sm:rounded-t-lg sm:border sm:border-b-0 sm:px-4 sm:py-2 lg:min-w-[100px] ${
                active
                  ? "border-t-[#2D83C2] bg-white sm:z-[2] sm:border-[#ccc] sm:border-b-white sm:border-t-[#ccc]"
                  : "border-t-transparent bg-white/95 text-gray-600 sm:border-transparent sm:bg-white/80"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10 ${
                  active ? "bg-[#2D83C2] text-white lg:bg-[#1E2E5E]" : "bg-[#eaf3f9] text-[#2D83C2]"
                }`}
              >
                <Icon size={18} />
              </span>
              <span
                className={`text-[11px] font-semibold sm:text-xs ${
                  active ? "text-[#2D83C2] lg:text-[#1a1a1a] lg:font-medium" : "text-gray-600"
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
      <div className="w-full">
        <div className="overflow-hidden rounded-t-xl bg-white shadow-[0_3px_6px_rgba(0,0,0,0.16)] sm:rounded-t-lg lg:shadow-[0_3px_6px_rgba(0,0,0,0.16)]">
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
        <div className="bg-white lg:rounded-b-lg lg:rounded-tr-lg lg:rounded-tl-none lg:border lg:border-[#ccc] lg:border-t-0">
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
      className={`shrink-0 rounded-xl font-bold uppercase tracking-wide transition ${
        disabled
          ? "cursor-not-allowed bg-[#9eb8f5]/50 text-[#1E2E5E]/50"
          : "bg-[#9eb8f5] text-[#1E2E5E] hover:bg-[#8aaef0]"
      } ${
        isHero
          ? "min-h-12 w-full px-6 py-3.5 lg:m-2 lg:min-h-0 lg:w-auto lg:min-w-[148px] lg:self-center lg:rounded-lg lg:px-8 lg:py-3"
          : "min-h-12 w-full px-6 py-3.5 sm:w-auto"
      } ${className}`}
    >
      {m.common.search}
    </button>
  );
}

export function MobileDateRange({
  checkIn,
  checkOut,
  checkInLabel,
  checkOutLabel,
  onCheckInClick,
  onCheckOutClick,
  checkInInput,
  checkOutInput,
}: {
  checkIn: string;
  checkOut: string;
  checkInLabel: string;
  checkOutLabel: string;
  onCheckInClick: () => void;
  onCheckOutClick: () => void;
  checkInInput: React.ReactNode;
  checkOutInput: React.ReactNode;
}) {
  const inFmt = formatMobileDate(checkIn);
  const outFmt = formatMobileDate(checkOut);

  return (
    <div className="flex overflow-hidden rounded-xl bg-[#eef3f8] lg:hidden">
      <button
        type="button"
        onClick={onCheckInClick}
        className="flex min-h-[72px] flex-1 flex-col justify-center px-4 py-3 text-left"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{checkInLabel}</span>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-3xl font-bold leading-none text-[#2D83C2]">{inFmt.dayNum}</span>
          <div className="text-sm leading-tight text-gray-700">
            <div>{inFmt.weekday}</div>
            <div>{inFmt.month}</div>
          </div>
        </div>
        {checkInInput}
      </button>
      <div className="flex w-8 shrink-0 items-center justify-center text-lg text-[#9eb8f5]" aria-hidden>
        →
      </div>
      <button
        type="button"
        onClick={onCheckOutClick}
        className="flex min-h-[72px] flex-1 flex-col justify-center px-4 py-3 text-left"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{checkOutLabel}</span>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-3xl font-bold leading-none text-[#2D83C2]">{outFmt.dayNum}</span>
          <div className="text-sm leading-tight text-gray-700">
            <div>{outFmt.weekday}</div>
            <div>{outFmt.month}</div>
          </div>
        </div>
        {checkOutInput}
      </button>
    </div>
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
