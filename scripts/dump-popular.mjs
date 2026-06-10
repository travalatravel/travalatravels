import fs from "fs";

const html = fs.readFileSync("scripts/homepage.html", "utf8");
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
const data = JSON.parse(m[1]);
const groups = data.props.pageProps.homeData.popular_destination_group;
let total = 0;
for (const g of groups) {
  const props = g.popular_properties || [];
  total += props.length;
  if (props.length) {
    console.log(`Group ${g.name}: ${props.length} properties`);
    console.log(JSON.stringify(props[0], null, 2));
  }
}
console.log("Total popular_properties:", total);
