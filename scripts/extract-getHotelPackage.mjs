import fs from "fs";

const html = fs.readFileSync("scripts/hotel-dated.html", "utf8");
const m = html.match(/src="(\/_next\/static\/chunks\/pages\/hotel\/%5Bslug%5D[^"]+\.js)"/);
const url = `https://www.travala.com${m[1]}`;
const js = await (await fetch(url)).text();

const idx = js.indexOf("getHotelPackage");
console.log("getHotelPackage occurrences:", (js.match(/getHotelPackage/g) || []).length);

for (const term of ["getHotelPackage", "lowest_package_price", "propertyParams", "/hotel/", "search_code", "packages"]) {
  let pos = 0;
  let n = 0;
  while (n < 5) {
    const i = js.indexOf(term, pos);
    if (i < 0) break;
    console.log(`\n--- ${term} ---\n`, js.slice(i, i + 350));
    pos = i + term.length;
    n++;
  }
}

// find URL-like strings near axios/fetch
for (const m of js.matchAll(/["'](\/[a-zA-Z0-9_/-]{8,80})["']/g)) {
  const p = m[1];
  if (/hotel|package|search|session|availability|property/i.test(p)) {
    console.log("path:", p);
  }
}
