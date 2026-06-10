import fs from "fs";

const html = fs.readFileSync("scripts/hotel-dated.html", "utf8");
const idx = html.indexOf("$225.00");
if (idx >= 0) console.log(html.slice(Math.max(0, idx - 400), idx + 400));

// find lowest/night patterns
for (const pat of ["per night", "Per night", "/night", "total for", "Room", "room_price"]) {
  const i = html.indexOf(pat);
  if (i >= 0) console.log("\n---", pat, "---\n", html.slice(i, i + 200));
}
