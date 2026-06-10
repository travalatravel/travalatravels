import fs from "fs";

const html = fs.readFileSync("scripts/homepage.html", "utf8");
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
const data = JSON.parse(m[1]);
const props = data.props.pageProps;

function findArrays(obj, path = "", depth = 0) {
  if (depth > 6 || !obj || typeof obj !== "object") return;
  if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === "object") {
    const keys = Object.keys(obj[0]);
    if (keys.some((k) => /hotel|price|name|title|city|link/i.test(k))) {
      console.log(`ARRAY ${path} len=${obj.length} keys=${keys.slice(0, 12).join(",")}`);
      console.log(JSON.stringify(obj[0], null, 2).slice(0, 600));
      console.log("---");
    }
  }
  if (Array.isArray(obj)) return;
  for (const [k, v] of Object.entries(obj)) findArrays(v, path ? `${path}.${k}` : k, depth + 1);
}

findArrays(props);
