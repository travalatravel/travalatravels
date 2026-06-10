import fs from "fs";

const file = process.argv[2] || "scripts/hotel-dated.html";
const html = fs.readFileSync(file, "utf8");
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (!m) {
  console.log("No NEXT_DATA, size", html.length);
  process.exit(1);
}
const props = JSON.parse(m[1]).props.pageProps;

function find(o, d = 0, pth = "") {
  if (d > 10 || !o || typeof o !== "object") return;
  for (const [k, v] of Object.entries(o)) {
    if (/price|rate|amount|usd|total|min_/i.test(k) && (typeof v === "number" || (typeof v === "string" && /^\d/.test(String(v))))) {
      console.log(`${pth}.${k} =`, v);
    }
    find(v, d + 1, `${pth}.${k}`);
  }
}
console.log("keys:", Object.keys(props).join(", "));
find(props);
