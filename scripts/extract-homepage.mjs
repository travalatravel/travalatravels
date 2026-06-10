const res = await fetch("https://www.travala.com/", {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; TravalaClone/1.0)", Accept: "text/html" },
});
const html = await res.text();
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (!m) {
  console.error("No __NEXT_DATA__");
  process.exit(1);
}
const data = JSON.parse(m[1]);
const props = data.props?.pageProps || {};

function pick(obj, depth = 0) {
  if (!obj || depth > 3) return obj;
  if (Array.isArray(obj)) return obj.slice(0, 3).map((x) => pick(x, depth + 1));
  if (typeof obj !== "object") return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string" && v.length > 200) out[k] = v.slice(0, 200) + "...";
    else if (Array.isArray(v) && v.length > 5) out[k] = `[array ${v.length}]`;
    else out[k] = pick(v, depth + 1);
  }
  return out;
}

console.log("pageProps keys:", Object.keys(props));
const home = props.homeData || {};
console.log("\nhomeData keys:", Object.keys(home));

if (home.hero_banner) console.log("\nhero_banner:", JSON.stringify(home.hero_banner, null, 2).slice(0, 3000));
if (home.top_banner) console.log("\ntop_banner:", JSON.stringify(home.top_banner, null, 2).slice(0, 2000));
if (home.flash_sale) console.log("\nflash_sale:", JSON.stringify(home.flash_sale, null, 2).slice(0, 2000));

const groups = home.popular_destination_group || [];
console.log("\npopular_destination_group count:", groups.length);
for (const g of groups.slice(0, 2)) {
  console.log(" group:", g.name || g.title, "destinations:", g.destination?.length, "properties:", g.popular_properties?.length);
}

const fonts = [...html.matchAll(/fonts\.googleapis\.com[^"']+/g)].map((x) => x[0]);
console.log("\nfonts:", [...new Set(fonts)]);

const cssVars = [...html.matchAll(/--[a-zA-Z0-9-]+:\s*[^;]+/g)].slice(0, 30).map((x) => x[0]);
console.log("\ncss vars sample:", cssVars.slice(0, 15));

// Section class names from page
const sections = [...html.matchAll(/class="([^"]*(?:Home|Hero|Banner|Section|Flash|Deal|Destination)[^"]*)"/gi)]
  .map((x) => x[1].split(" ")[0])
  .filter((v, i, a) => a.indexOf(v) === i)
  .slice(0, 40);
console.log("\nsection-like classes:", sections);
