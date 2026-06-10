import fs from "fs";
import path from "path";

const dir = "src/i18n/messages";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".ts") || f === "en.ts" || f === "de.ts") continue;
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, "utf8");
  if (c.includes("guests:")) continue;
  c = c.replace(/rooms: "([^"]+)", room: "([^"]+)",/, 'rooms: "$1", room: "$2", guests: "guests",');
  fs.writeFileSync(p, c);
}
console.log("patched common.guests");
