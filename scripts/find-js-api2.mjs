import fs from "fs";

const html = fs.readFileSync("scripts/hotel-dated.html", "utf8");
const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]);

const hits = new Set();
for (const src of scripts) {
  const url = `https://www.travala.com${src}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const js = await res.text();
  if (!/check_in|checkOut|availability|hotel_id|lowestPrice|roomRate|searchHotel/i.test(js)) continue;
  console.log("\n===", src, "===");
  for (const m of js.matchAll(/[\w/.-]*(?:hotel|search|availability|price|check_in)[\w/.-]*/gi)) {
    if (m[0].length > 5 && m[0].length < 80) hits.add(m[0]);
  }
}
console.log([...hits].slice(0, 100).join("\n"));
