import fs from "fs";

const html = fs.readFileSync("scripts/hotel-dated.html", "utf8");
const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]);
console.log("scripts:", scripts.length);

const patterns = [];
for (const src of scripts.slice(0, 15)) {
  const url = `https://www.travala.com${src}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const js = await res.text();
  for (const m of js.matchAll(/https?:\\?\/\\?\/[a-zA-Z0-9._/-]+/g)) {
    const u = m[0].replace(/\\/g, "");
    if (/api|hotel|search|price|availability|booking/i.test(u) && u.length < 120) patterns.push(u);
  }
  for (const m of js.matchAll(/"\/api\/[^"]+"/g)) patterns.push(m[0]);
  for (const m of js.matchAll(/"[a-zA-Z]*[Aa]pi[a-zA-Z]*"\s*:\s*"([^"]+)"/g)) patterns.push(m[1]);
}
console.log([...new Set(patterns)].slice(0, 80).join("\n"));
