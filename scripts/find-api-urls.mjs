import fs from "fs";

const html = fs.readFileSync("scripts/homepage.html", "utf8");
const urls = new Set();
for (const m of html.matchAll(/https?:\/\/[a-zA-Z0-9._/-]+/g)) {
  const u = m[0];
  if (/api|graphql|search|hotel|price|booking/i.test(u) && !/zendesk|google|facebook|twitter/i.test(u)) {
    urls.add(u.split('"')[0].split("'")[0]);
  }
}
console.log([...urls].slice(0, 50).join("\n"));
