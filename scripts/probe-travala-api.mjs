const endpoints = [
  "https://www.travala.com/api/hotels/8035714/availability",
  "https://www.travala.com/api/v1/hotels/8035714",
  "https://www.travala.com/api/hotel/8035714",
  "https://www.travala.com/api/search/hotels",
  "https://be.travala.com/api/hotels/8035714",
  "https://be.travala.com/v1/hotels/search",
  "https://gateway.travala.com/hotels/8035714",
];

const qs = "?check_in=2026-07-01&check_out=2026-07-05&adults=2&rooms=1";

for (const base of endpoints) {
  const url = base + (base.includes("search") ? "" : qs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();
    console.log(res.status, url, text.slice(0, 120).replace(/\n/g, " "));
  } catch (e) {
    console.log("ERR", url, e.message);
  }
}
