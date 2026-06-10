import fs from "fs";

const html = fs.readFileSync("scripts/hotel-detail.html", "utf8");
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
const hotel = JSON.parse(m[1]).props.pageProps.hotelInformationProps;

for (const key of ["checkin_checkout_times", "hotel_policies", "hotel_important_information", "popular_amenities", "attractions"]) {
  console.log(`\n=== ${key} ===`);
  console.log(JSON.stringify(hotel[key], null, 2).slice(0, 2500));
}
