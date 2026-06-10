import { copyFileSync, mkdirSync } from "fs";
import { join } from "path";

const root = process.cwd();
const srcDir = join(root, "node_modules", "cryptocurrency-icons", "svg", "color");
const destDir = join(root, "public", "coins");

mkdirSync(destDir, { recursive: true });

for (const coin of ["btc", "eth", "usdc"]) {
  copyFileSync(join(srcDir, `${coin}.svg`), join(destDir, `${coin}.svg`));
}

console.log("Copied BTC, ETH, USDC icons to public/coins/");
