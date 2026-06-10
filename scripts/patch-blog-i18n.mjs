import fs from "fs";
import path from "path";

const dir = "src/i18n/messages";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".ts") || f === "en.ts" || f === "de.ts") continue;
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, "utf8");
  c = c.replace(
    /blog: \{ title: ([^}]+) \},/,
    'blog: { title: $1, subtitle: "Get inspired with travel guides and destination ideas from our blog", inspiration: "Inspiration" },',
  );
  fs.writeFileSync(p, c);
}
console.log("patched locale blog keys");
