// Search all chunks from hotel page for API path strings
import fs from "fs";

const html = fs.readFileSync("scripts/hotel-dated.html", "utf8");
const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]);

const apiPaths = new Set();
const apiHosts = new Set();

for (const src of scripts) {
  const js = await (await fetch(`https://www.travala.com${src}`)).text();
  for (const m of js.matchAll(/["'](\/api\/[a-zA-Z0-9_/-]{3,80})["']/g)) apiPaths.add(m[1]);
  for (const m of js.matchAll(/["'](https?:\/\/[a-zA-Z0-9.-]+\/[a-zA-Z0-9_/-]{3,80})["']/g)) {
    const u = m[1];
    if (/travala|hotel|property|booking/i.test(u)) apiHosts.add(u);
  }
  if (js.includes("RI:") || js.includes(",RI=")) {
    const i = js.search(/[,{]RI[:=]/);
    if (i >= 0) console.log("RI in", src, js.slice(i, i + 400));
  }
}

console.log("\nAPI paths:\n", [...apiPaths].join("\n"));
console.log("\nAPI hosts:\n", [...apiHosts].slice(0, 30).join("\n"));
