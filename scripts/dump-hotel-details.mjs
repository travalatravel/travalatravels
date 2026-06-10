import fs from "fs";

const html = fs.readFileSync("scripts/hotel-detail.html", "utf8");
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
const props = JSON.parse(m[1]).props.pageProps;
const hotel = props.hotelInformationProps;
const meta = props.hotelInformationMeta;

console.log("hotel keys:", Object.keys(hotel || {}));
console.log("meta keys:", Object.keys(meta || {}));

for (const key of ["description", "policies", "amenities", "facilities", "check_in", "check_out", "rooms", "address", "star", "name"]) {
  if (hotel?.[key] !== undefined) {
    const val = hotel[key];
    console.log(`\n=== ${key} ===`);
    console.log(JSON.stringify(val, null, 2).slice(0, 1500));
  }
}

if (meta) {
  console.log("\n=== meta sample ===");
  console.log(JSON.stringify(meta, null, 2).slice(0, 2000));
}
