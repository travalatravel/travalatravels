const url = "https://www.travala.com/_next/static/chunks/pages/_app-0b73762efcda33d6.js";
const js = await (await fetch(url)).text();

// module 4619
const m = js.match(/4619:\(e,t,r\)=>\{[\s\S]{0,3000}?\n\}/);
if (m) console.log("4619:\n", m[0].slice(0, 2000));

// search baseURL
for (const term of ["baseURL", "BASE_URL", "api.travala", "searching/hotel"]) {
  let pos = 0;
  let n = 0;
  while (n < 3) {
    const i = js.indexOf(term, pos);
    if (i < 0) break;
    console.log(`\n${term}:`, js.slice(Math.max(0, i - 80), i + 150));
    pos = i + term.length;
    n++;
  }
}
