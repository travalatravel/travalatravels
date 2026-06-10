import fs from "fs";
import path from "path";

const replacements = [
  [/bg-\[#1e2e5e\]/gi, "bg-[#1a5f94]"],
  [/hover:bg-\[#1e2e5e\]/gi, "hover:bg-[#1a5f94]"],
  [/from-\[#2D83C2\] to-\[#1e2e5e\]/gi, "from-[#2D83C2] to-[#1a5f94]"],
  [/text-\[#1e2e5e\]/gi, "text-[#1a1a1a]"],
  [/border-\[#1e2e5e\]/gi, "border-[#1a1a1a]"],
  [/#1e2e5e\/90/gi, "#1a5f94/90"],
  [/#2dd4bf/gi, "#2D83C2"],
  [/#14b8a6/gi, "#1a5f94"],
  [/#00b67a/gi, "#2D83C2"],
  [/--primary-dark:\s*#1e2e5e/gi, "--primary-dark: #1a5f94"],
  [/--mint:\s*#2dd4bf/gi, "--mint: #2D83C2"],
  [/--mint-dark:\s*#14b8a6/gi, "--mint-dark: #1a5f94"],
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") walk(p);
    else if (/\.(tsx?|css)$/.test(entry.name)) {
      let c = fs.readFileSync(p, "utf8");
      let changed = false;
      for (const [from, to] of replacements) {
        if (from.test(c)) {
          c = c.replace(from, to);
          changed = true;
        }
      }
      if (changed) fs.writeFileSync(p, c);
    }
  }
}

walk("src");
console.log("brand colors replaced");
