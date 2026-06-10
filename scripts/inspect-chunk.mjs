import fs from "fs";

const html = fs.readFileSync("scripts/hotel-dated.html", "utf8");
const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]);

for (const src of scripts) {
  const url = `https://www.travala.com${src}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const js = await res.text();
  if (!/availability|room.?rate|lowest|min_price|hotelSearch|getHotel/i.test(js)) continue;

  console.log("\n########", src, "size", js.length);
  for (const term of ["availability", "lowest", "room_rate", "hotelSearch", "getHotel", "fetch(", "axios"]) {
    let pos = 0;
    let n = 0;
    while (n < 3) {
      const i = js.indexOf(term, pos);
      if (i < 0) break;
      console.log(`-- ${term} @ ${i}:`, js.slice(Math.max(0, i - 60), i + 100).replace(/\n/g, " "));
      pos = i + term.length;
      n++;
    }
  }
}
