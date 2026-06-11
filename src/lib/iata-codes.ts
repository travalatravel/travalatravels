/** Common city / airport → IATA (city or airport) codes for flight search */
const CITY_IATA: Record<string, string> = {
  london: "LON",
  paris: "PAR",
  "new york": "NYC",
  dubai: "DXB",
  bangkok: "BKK",
  singapore: "SIN",
  tokyo: "TYO",
  "los angeles": "LAX",
  "las vegas": "LAS",
  sydney: "SYD",
  melbourne: "MEL",
  frankfurt: "FRA",
  barcelona: "BCN",
  "hong kong": "HKG",
  seoul: "SEL",
  amsterdam: "AMS",
  rome: "ROM",
  madrid: "MAD",
  istanbul: "IST",
  miami: "MIA",
  chicago: "CHI",
  boston: "BOS",
  toronto: "YTO",
  vancouver: "YVR",
  berlin: "BER",
  münchen: "MUC",
  munich: "MUC",
  hamburg: "HAM",
  düsseldorf: "DUS",
  dusseldorf: "DUS",
  cologne: "CGN",
  köln: "CGN",
  koln: "CGN",
  stuttgart: "STR",
  vienna: "VIE",
  zurich: "ZRH",
  brussels: "BRU",
  lisbon: "LIS",
  athens: "ATH",
  prague: "PRG",
  warsaw: "WAW",
  copenhagen: "CPH",
  stockholm: "STO",
  oslo: "OSL",
  helsinki: "HEL",
  dublin: "DUB",
  manchester: "MAN",
  edinburgh: "EDI",
  glasgow: "GLA",
  doha: "DOH",
  abu: "AUH",
  "abu dhabi": "AUH",
  riyadh: "RUH",
  jeddah: "JED",
  cairo: "CAI",
  johannesburg: "JNB",
  "cape town": "CPT",
  mumbai: "BOM",
  delhi: "DEL",
  "new delhi": "DEL",
  bangalore: "BLR",
  bali: "DPS",
  denpasar: "DPS",
  phuket: "HKT",
  "kuala lumpur": "KUL",
  jakarta: "JKT",
  manila: "MNL",
  taipei: "TPE",
  shanghai: "SHA",
  beijing: "BJS",
  osaka: "OSA",
  honolulu: "HNL",
  "san francisco": "SFO",
  seattle: "SEA",
  dallas: "DFW",
  houston: "HOU",
  atlanta: "ATL",
  denver: "DEN",
  phoenix: "PHX",
  orlando: "ORL",
  montreal: "YMQ",
};

export function resolveIataCode(label: string, codeHint?: string): string | null {
  const hint = (codeHint || "").trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(hint)) return hint;

  const cleaned = label.trim().toLowerCase();
  if (!cleaned) return null;

  const paren = cleaned.match(/\(([a-z]{3})\)\s*$/i);
  if (paren) return paren[1].toUpperCase();

  const trailing = cleaned.match(/\b([a-z]{3})\b$/i);
  if (trailing && trailing[1].length === 3) return trailing[1].toUpperCase();

  if (CITY_IATA[cleaned]) return CITY_IATA[cleaned];

  for (const [city, iata] of Object.entries(CITY_IATA)) {
    if (cleaned.includes(city)) return iata;
  }

  const firstWord = cleaned.split(/[,\-–]/)[0]?.trim();
  if (firstWord && CITY_IATA[firstWord]) return CITY_IATA[firstWord];

  return null;
}
