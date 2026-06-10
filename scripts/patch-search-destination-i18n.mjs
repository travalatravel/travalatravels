import fs from "fs";

const keys = `    enterDestination: "Enter a destination to search for hotels.",
    loadingLiveRates: "Loading live rates for your dates…",
`;

for (const f of fs.readdirSync("src/i18n/messages")) {
  if (!f.endsWith(".ts") || f === "en.ts" || f === "de.ts") continue;
  const p = `src/i18n/messages/${f}`;
  let c = fs.readFileSync(p, "utf8");
  if (c.includes("enterDestination")) continue;
  c = c.replace(/  searchPage: \{\n/, `  searchPage: {\n${keys}`);
  fs.writeFileSync(p, c);
  console.log("patched", f);
}
