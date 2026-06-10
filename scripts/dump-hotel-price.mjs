import fs from "fs";

const html = fs.readFileSync("scripts/hotel-sample.html", "utf8");
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
const props = JSON.parse(m[1]).props.pageProps;

function findPrice(obj, path = "", depth = 0) {
  if (depth > 8 || !obj || typeof obj !== "object") return;
  for (const [k, v] of Object.entries(obj)) {
    if (/price|rate|amount/i.test(k) && (typeof v === "number" || (typeof v === "string" && /^\d/.test(v)))) {
      console.log(`${path}.${k} = ${v}`);
    }
    findPrice(v, path ? `${path}.${k}` : k, depth + 1);
  }
}
findPrice(props);
