import fs from "fs";

const input = process.argv[2] || "-";
const html = input === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(input, "utf8");
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (!m) {
  console.error("No __NEXT_DATA__ found");
  process.exit(1);
}
const data = JSON.parse(m[1]);
const props = data.props?.pageProps || {};
console.log("pageProps keys:", Object.keys(props).join(", "));
for (const key of ["hotels", "topProperties", "popularHotels", "homeData", "topUniqueProperties", "newWorldwideLocations", "hotel", "property", "destinations", "hotelInformationProps", "locationInfo"]) {
  if (props[key]) {
    const val = props[key];
    const arr = Array.isArray(val) ? val : [val];
    console.log(`\n=== ${key} (${arr.length}) ===`);
    console.log(JSON.stringify(arr[0], null, 2).slice(0, 2000));
  }
}
