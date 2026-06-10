const css = await fetch("https://www.travala.com/_next/static/css/6a2b13ade542e011.css").then((r) => r.text());
const idx = css.indexOf("TvaHeader_rebrandingV2");
console.log(css.slice(idx, idx + 3500));
