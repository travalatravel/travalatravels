import fs from "fs";

const line = '    copyrightLine: "© 2017–2026 Travala.com. All rights reserved.",\n';

for (const f of fs.readdirSync("src/i18n/messages")) {
  if (!f.endsWith(".ts") || f === "en.ts" || f === "de.ts" || f === "index.ts") continue;
  const p = `src/i18n/messages/${f}`;
  let c = fs.readFileSync(p, "utf8");
  if (c.includes("copyrightLine")) continue;
  c = c.replace(/(copyright: "[^"]+",\n)/, `$1${line}`);
  fs.writeFileSync(p, c);
}
