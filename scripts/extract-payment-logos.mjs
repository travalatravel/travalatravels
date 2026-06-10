import fs from "fs";
const html = fs.readFileSync("scripts/homepage.html", "utf8");
const logos = [...html.matchAll(/https:\/\/static\.travala\.com\/frontend\/images\/paymentaccept\/[^"']+/g)].map((m) => m[0]);
console.log(JSON.stringify([...new Set(logos)], null, 2));
