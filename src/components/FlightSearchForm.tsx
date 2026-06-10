"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Building2, Plane } from "lucide-react";
import SearchSuggestions from "./SearchSuggestions";
import type { SearchSuggestion } from "@/lib/travala-suggest";
import { ASSETS } from "@/data/site-data";
import { buildFlightSearchQuery } from "@/lib/flight-display";
import type { CabinClass, TripType } from "@/lib/flight-types";
import { CABIN_LABELS } from "@/lib/flight-types";
import { useTranslations } from "@/i18n/useTranslations";

const TABS = [
  { key: "stays", labelKey: "stays" as const, icon: Building2 },
  { key: "flights", labelKey: "flights" as const, icon: Plane },
] as const;

const TRIP_KEYS: TripType[] = ["roundtrip", "oneway", "multicity"];

function defaultFlightDates() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  const depart = d.toISOString().slice(0, 10);
  const r = new Date(d);
  r.setDate(r.getDate() + 7);
  return { depart, return: r.toISOString().slice(0, 10) };
}

function formatDisplayDate(iso: string) {
  if (!iso) return { full: "", day: "" };
  const d = new Date(`${iso}T12:00:00`);
  return {
    full: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    day: d.toLocaleDateString("en-GB", { weekday: "long" }),
  };
}

type AirportField = "from" | "to" | "leg0from" | "leg0to" | "leg1from" | "leg1to";

export default function FlightSearchForm({
  compact = false,
  activeTab = "flights",
  onTabChange,
}: {
  compact?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}) {
  const router = useRouter();
  const urlParams = useSearchParams();
  const { messages: m, fmt } = useTranslations();
  const defaults = defaultFlightDates();
  const isHero = !compact;

  const [trip, setTrip] = useState<TripType>("roundtrip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromCode, setFromCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [leg2From, setLeg2From] = useState("");
  const [leg2To, setLeg2To] = useState("");
  const [depart, setDepart] = useState(defaults.depart);
  const [returnDate, setReturnDate] = useState(defaults.return);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabin, setCabin] = useState<CabinClass>("economy");
  const [addHotel, setAddHotel] = useState(false);
  const [paxOpen, setPaxOpen] = useState(false);

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [activeField, setActiveField] = useState<AirportField | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fieldQuery, setFieldQuery] = useState("");

  const paxRef = useRef<HTMLDivElement>(null);
  const departRef = useRef<HTMLInputElement>(null);
  const returnRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const setFieldValue = (field: AirportField, label: string, code?: string) => {
    if (field === "from") {
      setFrom(label);
      setFromCode(code || "");
    } else if (field === "to") {
      setTo(label);
      setToCode(code || "");
    } else if (field === "leg0from") setFrom(label);
    else if (field === "leg0to") setTo(label);
    else if (field === "leg1from") setLeg2From(label);
    else if (field === "leg1to") setLeg2To(label);
  };

  const fetchSuggestions = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 1) {
      setSuggestions([]);
      setSuggestLoading(false);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSuggestLoading(true);
    try {
      const params = new URLSearchParams({ q: trimmed, type: "flights", limit: "8" });
      const res = await fetch(`/api/search/suggest?${params}`, { signal: controller.signal });
      const data = (await res.json()) as { suggestions?: SearchSuggestion[] };
      setSuggestions(data.suggestions || []);
      setActiveIndex(-1);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setSuggestions([]);
    } finally {
      if (!controller.signal.aborted) setSuggestLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!compact) return;
    const tripParam = urlParams.get("trip") as TripType | null;
    if (tripParam) setTrip(tripParam);
    if (urlParams.get("from")) setFrom(urlParams.get("from")!);
    if (urlParams.get("to")) setTo(urlParams.get("to")!);
    if (urlParams.get("fromCode")) setFromCode(urlParams.get("fromCode")!);
    if (urlParams.get("toCode")) setToCode(urlParams.get("toCode")!);
    if (urlParams.get("depart")) setDepart(urlParams.get("depart")!);
    if (urlParams.get("return")) setReturnDate(urlParams.get("return")!);
    if (urlParams.get("adults")) setAdults(Math.max(1, parseInt(urlParams.get("adults")!, 10)));
    if (urlParams.get("children")) setChildren(Math.max(0, parseInt(urlParams.get("children")!, 10)));
    if (urlParams.get("infants")) setInfants(Math.max(0, parseInt(urlParams.get("infants")!, 10)));
    if (urlParams.get("cabin")) setCabin(urlParams.get("cabin") as CabinClass);
    if (urlParams.get("addHotel") === "1") setAddHotel(true);
  }, [compact, urlParams]);

  useEffect(() => {
    if (!activeField) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void fetchSuggestions(fieldQuery), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fieldQuery, activeField, fetchSuggestions]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!paxRef.current?.contains(e.target as Node)) setPaxOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  const openField = (field: AirportField, current: string) => {
    setActiveField(field);
    setFieldQuery(current);
    setSuggestions([]);
  };

  const selectSuggestion = (item: SearchSuggestion) => {
    if (!activeField) return;
    const code = item.iata || item.searchQuery?.slice(0, 3).toUpperCase();
    setFieldValue(activeField, item.label, code);
    setActiveField(null);
    setFieldQuery("");
    setSuggestions([]);
  };

  const swapAirports = () => {
    setFrom(to);
    setTo(from);
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = buildFlightSearchQuery({
      trip,
      from: from.trim(),
      to: to.trim(),
      fromCode,
      toCode,
      depart,
      return: trip === "roundtrip" ? returnDate : undefined,
      adults,
      children,
      infants,
      cabin,
      addHotel,
      legs: trip === "multicity" ? [{ from, to }, { from: leg2From, to: leg2To }] : undefined,
    });
    setActiveField(null);
    router.push(`/search?${params.toString()}`);
  };

  const departFmt = formatDisplayDate(depart);
  const returnFmt = formatDisplayDate(returnDate);
  const selectDateLabel = m.common.selectDate;
  const paxTotal = adults + children + infants;

  const airportInput = (
    field: AirportField,
    label: string,
    value: string,
    onChange: (v: string) => void,
    className = "",
  ) => (
    <div
      className={`relative min-w-0 rounded-xl border border-gray-200 bg-[#f8fafc] px-3 py-2.5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 ${className}`}
    >
      <label className="text-[10px] font-medium uppercase tracking-wide text-gray-500">{label}</label>
      <input
        type="text"
        value={activeField === field ? fieldQuery : value}
        onChange={(e) => {
          onChange(e.target.value);
          setFieldQuery(e.target.value);
        }}
        onFocus={() => openField(field, value)}
        placeholder={m.common.cityOrAirport}
        autoComplete="off"
        enterKeyHint="search"
        className="mt-1 min-h-[44px] w-full min-w-0 bg-transparent text-base font-semibold text-[#1a1a1a] outline-none placeholder:font-normal placeholder:text-gray-400 sm:mt-0.5 sm:min-h-0 sm:text-sm"
      />
      {activeField === field && (
        <SearchSuggestions
          suggestions={suggestions}
          loading={suggestLoading}
          query={fieldQuery}
          activeIndex={activeIndex}
          onSelect={selectSuggestion}
          onHover={setActiveIndex}
          mobileSheet
        />
      )}
    </div>
  );

  const tabRow = (
    <div
      role="tablist"
      className={`flex ${isHero ? "gap-1 overflow-x-auto scrollbar-hide" : "snap-x snap-mandatory gap-0 overflow-x-auto border-b border-gray-100 scrollbar-hide"}`}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            onClick={() => onTabChange?.(tab.key)}
            className={
              isHero
                ? `flex min-w-[72px] flex-shrink-0 flex-col items-center gap-1.5 rounded-t-lg border border-b-0 px-3 py-2 sm:min-w-[88px] sm:px-4 ${
                    active ? "z-[2] border-[#ccc] border-b-white bg-white" : "border-transparent bg-white/80 text-gray-600"
                  }`
                : `relative flex-shrink-0 snap-start px-3 py-2.5 text-xs font-semibold sm:px-5 sm:py-3 sm:text-sm ${
                    active ? "text-[#2577be] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2577be]" : "text-gray-500"
                  }`
            }
          >
            {isHero && (
              <span className={`flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10 ${active ? "bg-[#2d83c2] text-white" : "bg-[#eaf3f9] text-[#2d83c2]"}`}>
                <Icon size={18} />
              </span>
            )}
            <span className={`text-[11px] font-medium sm:text-xs ${isHero && active ? "text-[#1a1a1a]" : ""}`}>
              {m.nav[tab.labelKey]}
            </span>
          </button>
        );
      })}
    </div>
  );

  const tripRow = (
    <div className="mb-3 flex flex-wrap gap-2 border-b border-gray-100 pb-3 sm:gap-4">
      {TRIP_KEYS.map((key) => (
        <label
          key={key}
          className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm ${
            trip === key ? "bg-[#eef5fc] font-semibold text-[#2577be]" : "text-[#1a1a1a]"
          }`}
        >
          <input
            type="radio"
            name="trip"
            checked={trip === key}
            onChange={() => setTrip(key)}
            className="h-4 w-4 accent-[#2577be]"
          />
          {m.search.tripTypes[key]}
        </label>
      ))}
    </div>
  );

  const flightRow = (
    <div className={`flex flex-col gap-3 ${isHero ? "lg:flex-row lg:items-stretch lg:flex-wrap" : ""}`}>
      {trip !== "multicity" ? (
        <>
          <div className={`relative flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end sm:gap-2 ${isHero ? "lg:min-w-[280px]" : ""}`}>
            {airportInput("from", m.search.flyingFrom, from, setFrom, "flex-1")}
            <button
              type="button"
              onClick={swapAirports}
              aria-label="Swap airports"
              className="mx-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 text-[#2577be] hover:bg-[#eef5fc] sm:mb-0.5 sm:h-9 sm:w-9"
            >
              <ArrowLeftRight size={16} />
            </button>
            {airportInput("to", m.search.flyingTo, to, setTo, "flex-1")}
          </div>
        </>
      ) : (
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-100 p-3">
            <p className="mb-2 text-xs font-semibold text-[#2577be]">Flight 1</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {airportInput("leg0from", "From", from, setFrom)}
              {airportInput("leg0to", "To", to, setTo)}
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 p-3">
            <p className="mb-2 text-xs font-semibold text-[#2577be]">Flight 2</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {airportInput("leg1from", "From", leg2From, setLeg2From)}
              {airportInput("leg1to", "To", leg2To, setLeg2To)}
            </div>
          </div>
        </div>
      )}

      <div className={`flex min-w-0 flex-col gap-2 sm:flex-row sm:gap-2 ${isHero ? "lg:w-auto" : "w-full"}`}>
        <label className="flex min-h-[52px] min-w-0 flex-1 flex-col justify-center rounded-xl border border-gray-200 bg-[#f8fafc] px-3 py-2 sm:hidden">
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Depart</span>
          <input
            type="date"
            value={depart}
            onChange={(e) => setDepart(e.target.value)}
            className="mt-1 w-full bg-transparent text-base font-semibold text-[#1a1a1a] outline-none"
          />
        </label>
        <button
          type="button"
          onClick={() => departRef.current?.showPicker?.() ?? departRef.current?.focus()}
          className="hidden min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#f2f5f9] px-3 py-2 text-left sm:flex lg:bg-transparent lg:px-2"
        >
          {isHero && <Image src={ASSETS.datepickerIcon} alt="" width={24} height={24} className="shrink-0" unoptimized />}
          <div>
            <div className="text-[10px] text-gray-500">Depart</div>
            <div className="text-sm font-semibold text-[#1a1a1a]">{departFmt.full || selectDateLabel}</div>
            {isHero && departFmt.day && <div className="text-xs text-gray-500">{departFmt.day}</div>}
          </div>
          <input ref={departRef} type="date" value={depart} onChange={(e) => setDepart(e.target.value)} className="sr-only" tabIndex={-1} />
        </button>
        {trip === "roundtrip" && (
          <>
            <label className="flex min-h-[52px] min-w-0 flex-1 flex-col justify-center rounded-xl border border-gray-200 bg-[#f8fafc] px-3 py-2 sm:hidden">
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Return</span>
              <input
                type="date"
                value={returnDate}
                min={depart}
                onChange={(e) => setReturnDate(e.target.value)}
                className="mt-1 w-full bg-transparent text-base font-semibold text-[#1a1a1a] outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => returnRef.current?.showPicker?.() ?? returnRef.current?.focus()}
              className="hidden min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#f2f5f9] px-3 py-2 text-left sm:flex lg:bg-transparent lg:px-2"
            >
              {isHero && <Image src={ASSETS.datepickerIcon} alt="" width={24} height={24} className="shrink-0" unoptimized />}
              <div>
                <div className="text-[10px] text-gray-500">Return</div>
                <div className="text-sm font-semibold text-[#1a1a1a]">{returnFmt.full}</div>
                {isHero && returnFmt.day && <div className="text-xs text-gray-500">{returnFmt.day}</div>}
              </div>
              <input ref={returnRef} type="date" value={returnDate} min={depart} onChange={(e) => setReturnDate(e.target.value)} className="sr-only" tabIndex={-1} />
            </button>
          </>
        )}
      </div>

      <div ref={paxRef} className={`relative ${isHero ? "min-w-[180px]" : "w-full sm:w-auto"}`}>
        <button
          type="button"
          onClick={() => setPaxOpen((v) => !v)}
          className="flex min-h-[52px] w-full items-center gap-2 rounded-xl border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-left sm:min-h-0 sm:rounded-lg sm:border-0 sm:bg-[#f2f5f9] lg:bg-transparent lg:px-2"
        >
          {isHero && <Image src={ASSETS.userIcon} alt="" width={24} height={24} className="shrink-0" unoptimized />}
          <div>
            <div className="text-base font-semibold text-[#1a1a1a] sm:text-sm">
              {paxTotal} Passenger{paxTotal !== 1 ? "s" : ""}
            </div>
            <div className="text-xs text-gray-500">{CABIN_LABELS[cabin]}</div>
          </div>
        </button>
        {paxOpen && (
          <>
            <button
              type="button"
              aria-label="Close passenger selector"
              className="fixed inset-0 z-40 bg-black/30 sm:hidden"
              onClick={() => setPaxOpen(false)}
            />
            <div className="fixed inset-x-4 bottom-4 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-full sm:mt-2 sm:w-72 sm:max-h-none sm:rounded-xl">
            {[
              { label: "Adults", sub: "12+ yrs", value: adults, set: setAdults, min: 1, max: 9 },
              { label: "Children", sub: "2–11 yrs", value: children, set: setChildren, min: 0, max: 8 },
              { label: "Infants", sub: "Under 2", value: infants, set: setInfants, min: 0, max: 4 },
            ].map((row) => (
              <div key={row.label} className="mb-3 flex items-center justify-between last:mb-0">
                <div>
                  <div className="text-sm font-medium text-gray-800">{row.label}</div>
                  <div className="text-[10px] text-gray-400">{row.sub}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-lg sm:h-8 sm:w-8 sm:rounded sm:text-base" onClick={() => row.set(Math.max(row.min, row.value - 1))}>−</button>
                  <span className="w-8 text-center text-base sm:w-6 sm:text-sm">{row.value}</span>
                  <button type="button" className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-lg sm:h-8 sm:w-8 sm:rounded sm:text-base" onClick={() => row.set(Math.min(row.max, row.value + 1))}>+</button>
                </div>
              </div>
            ))}
            <div className="mt-4 border-t border-gray-100 pt-3">
              <label className="text-xs font-medium text-gray-500">Cabin class</label>
              <select
                value={cabin}
                onChange={(e) => setCabin(e.target.value as CabinClass)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-3 text-base outline-none focus:border-[#2577be] sm:py-2 sm:text-sm"
              >
                {(Object.keys(CABIN_LABELS) as CabinClass[]).map((c) => (
                  <option key={c} value={c}>{CABIN_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setPaxOpen(false)}
              className="mt-4 w-full rounded-xl bg-[#2577be] py-3 text-sm font-semibold text-white sm:hidden"
            >
              Done
            </button>
          </div>
          </>
        )}
      </div>

      <button
        type="submit"
        className={`shrink-0 rounded-xl bg-[#2577be] font-semibold uppercase tracking-wide text-white transition hover:bg-[#1e2e5e] ${
          isHero ? "min-h-12 min-w-[140px] px-6 py-3 lg:min-w-[168px] lg:self-center" : "min-h-12 w-full px-6 py-3.5 sm:w-auto"
        }`}
      >
        {m.common.search}
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSearch} className="w-full min-w-0">
      {isHero ? (
        <div className="w-full">
          {tabRow}
          <div className="rounded-b-lg rounded-tr-lg border border-[#2d83c2] bg-white p-4 shadow-[0_3px_6px_rgba(0,0,0,0.16)] sm:p-5 lg:rounded-tl-none lg:p-6">
            {tripRow}
            {flightRow}
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={addHotel} onChange={(e) => setAddHotel(e.target.checked)} className="accent-[#2577be]" />
              <Building2 size={16} className="text-[#2577be]" />
              Add a hotel at destination
            </label>
          </div>
        </div>
      ) : (
        <div className="w-full min-w-0 rounded-2xl bg-white p-2 shadow-xl sm:p-2.5">
          {tabRow}
          <div className="p-2 sm:p-3">
            {tripRow}
            {flightRow}
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={addHotel} onChange={(e) => setAddHotel(e.target.checked)} className="accent-[#2577be]" />
              Add a hotel at destination
            </label>
          </div>
        </div>
      )}
    </form>
  );
}
