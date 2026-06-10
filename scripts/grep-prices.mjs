import fs from "fs";

const html = fs.readFileSync("scripts/hotel-dated.html", "utf8");

// JSON price blobs
for (const m of html.matchAll(/"(?:price|amount|total|rate|lowest)[^"]*"\s*:\s*[\d.]+/gi)) {
  console.log(m[0].slice(0, 120));
}

// USD display patterns
for (const m of html.matchAll(/\$[\d,]+(?:\.\d{2})?/g)) {
  if (m[0].length < 15) console.log("usd:", m[0]);
}

// self.__next_f or RSC chunks
const rsc = html.match(/self\.__next_f\.push\(\[1,"([^"]{0,500})/);
if (rsc) console.log("rsc sample:", rsc[1].slice(0, 300));
