const url = "https://www.travala.com/_next/static/chunks/pages/_app-0b73762efcda33d6.js";
const js = await (await fetch(url)).text();

const start = js.indexOf("RI:()=>c");
console.log(js.slice(start - 200, start + 2500));
