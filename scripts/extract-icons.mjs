import fs from "fs";
const h = fs.readFileSync("scripts/homepage.html", "utf8");
const icons = [...h.matchAll(/https:\/\/static\.travala\.com\/resources\/images-pc\/icon\/[^"']+/g)].map((m) => m[0]);
console.log([...new Set(icons)].join("\n"));
