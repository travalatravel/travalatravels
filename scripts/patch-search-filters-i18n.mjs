import fs from "fs";
import path from "path";

const block = `  searchFilters: {
    allStars: "All star ratings",
    stars3: "3+ stars",
    stars4: "4+ stars",
    stars5: "5 stars",
    anyPrice: "Any price",
    under100: "Under $100/night",
    under200: "Under $200/night",
    under400: "Under $400/night",
    sortBy: "Sort by",
    starsHigh: "Star rating",
    map: "Map",
  },
`;

const dir = "src/i18n/messages";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".ts") || f === "en.ts" || f === "de.ts") continue;
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, "utf8");
  if (c.includes("searchFilters")) continue;
  c = c.replace(/  searchPage: \{/, `${block}  searchPage: {`);
  fs.writeFileSync(p, c);
}
console.log("patched searchFilters");
