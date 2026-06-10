const url = "https://www.travala.com/_next/static/chunks/pages/_app-0b73762efcda33d6.js";
const js = await (await fetch(url)).text();

for (const term of ["lowest_package_price", "getSessionId", "/property", "/session", "hotel-package", "search_code", "user_currency"]) {
  let pos = 0;
  let n = 0;
  while (n < 4) {
    const i = js.indexOf(term, pos);
    if (i < 0) break;
    console.log(`\n--- ${term} ---\n`, js.slice(Math.max(0, i - 40), i + 200).replace(/\n/g, " "));
    pos = i + term.length;
    n++;
  }
}

// find export patterns like nd:e=> or RI:
for (const m of js.matchAll(/[A-Za-z_$]{1,3}:\s*\(?[a-z]\)?=>[^;]{0,200}(?:fetch|axios|get|post)[^;]{0,200}/g)) {
  if (/hotel|session|package|property|slug/i.test(m[0])) console.log("fn:", m[0].slice(0, 250));
}
