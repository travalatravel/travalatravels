import fs from "fs";

const dup =
  ', subtitle: "Get inspired with travel guides and destination ideas from our blog", inspiration: "Inspiration"';

for (const f of fs.readdirSync("src/i18n/messages")) {
  if (!f.endsWith(".ts")) continue;
  const p = `src/i18n/messages/${f}`;
  let c = fs.readFileSync(p, "utf8");
  const idx = c.indexOf(dup);
  if (idx === -1) continue;
  const second = c.indexOf(dup, idx + 1);
  if (second === -1) continue;
  c = c.slice(0, second) + c.slice(second + dup.length);
  fs.writeFileSync(p, c);
  console.log("fixed", f);
}
