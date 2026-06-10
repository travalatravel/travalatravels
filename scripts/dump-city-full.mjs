import fs from "fs";

const html = fs.readFileSync("scripts/city-london2.html", "utf8");
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
const cpd = JSON.parse(m[1]).props.pageProps.cityPropertyData;

for (const key of [
  "all_hotels",
  "explore_properties",
  "recently_booked_properties",
  "top_picks",
  "static_property",
  "popularRoutesFrom",
  "popularRoutesTo",
]) {
  const val = cpd[key];
  if (!val) {
    console.log(`\n=== ${key}: missing ===`);
    continue;
  }
  const arr = Array.isArray(val) ? val : val.properties || [val];
  console.log(`\n=== ${key} (${arr.length}) ===`);
  console.log(JSON.stringify(arr[0], null, 2).slice(0, 900));
}
