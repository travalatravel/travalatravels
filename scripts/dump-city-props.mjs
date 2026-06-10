import fs from "fs";

const html = fs.readFileSync("scripts/city-london2.html", "utf8");
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
const props = JSON.parse(m[1]).props.pageProps;

const cpd = props.cityPropertyData;
console.log("cityPropertyData keys:", cpd ? Object.keys(cpd) : "null");
if (cpd?.properties) {
  console.log("properties count:", cpd.properties.length);
  console.log("sample:", JSON.stringify(cpd.properties[0], null, 2));
}
if (cpd?.hotels) {
  console.log("hotels count:", cpd.hotels.length);
  console.log("sample:", JSON.stringify(cpd.hotels[0], null, 2));
}

// scan cityPropertyData deeply
function scan(obj, path = "", depth = 0) {
  if (depth > 4 || !obj || typeof obj !== "object") return;
  if (Array.isArray(obj) && obj.length > 20) {
    console.log(`Large array at ${path}: ${obj.length} items, keys: ${Object.keys(obj[0] || {}).join(", ")}`);
  }
  if (Array.isArray(obj)) return;
  for (const [k, v] of Object.entries(obj)) scan(v, path ? `${path}.${k}` : k, depth + 1);
}
if (cpd) scan(cpd);
