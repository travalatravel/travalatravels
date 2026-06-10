import fs from "fs";

const file = process.argv[2] || "scripts/city-london.html";
const html = fs.readFileSync(file, "utf8");
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (!m) {
  console.log("no data, file size", html.length, "preview:", html.slice(0, 200));
  process.exit(1);
}
const props = JSON.parse(m[1]).props.pageProps;
console.log("keys:", Object.keys(props).join(", "));

function scan(obj, path = "", depth = 0) {
  if (depth > 7 || !obj || typeof obj !== "object") return;
  if (Array.isArray(obj) && obj.length > 3 && typeof obj[0] === "object") {
    const keys = Object.keys(obj[0]);
    if (keys.some((k) => /hotel|slug|star|price|name|thumbnail/i.test(k))) {
      console.log(`\nARRAY ${path} len=${obj.length}`);
      console.log(JSON.stringify(obj[0], null, 2).slice(0, 800));
    }
  }
  if (Array.isArray(obj)) return;
  for (const [k, v] of Object.entries(obj)) scan(v, path ? `${path}.${k}` : k, depth + 1);
}
scan(props);
