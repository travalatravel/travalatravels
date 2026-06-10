import fs from "fs";

const res = await fetch("https://www.travala.com/", {
  headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html", "Accept-Language": "en" },
});
const html = await res.text();
const data = JSON.parse(html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]);
const props = data.props.pageProps;

fs.mkdirSync("docs/research", { recursive: true });
fs.writeFileSync("docs/research/homepage-next-data.json", JSON.stringify({
  topUniqueProperties: props.topUniqueProperties?.slice?.(0, 12) || props.topUniqueProperties,
  paymentOptions: props.paymentOptions,
  dataBlogPosts: props.dataBlogPosts?.slice?.(0, 8) || props.dataBlogPosts,
  dataContentHub: props.dataContentHub,
  allFaqQuestions: props.allFaqQuestions?.slice?.(0, 10) || props.allFaqQuestions,
  newWorldwideLocations: props.newWorldwideLocations,
  homeData: {
    number: props.homeData?.number,
    partners: props.homeData?.partners,
    popular_destination_group: props.homeData?.popular_destination_group,
    global_popular_destinations: props.homeData?.global_popular_destinations,
  },
}, null, 2));

// Hero images from HTML
const heroPc = html.match(/HomepageHeroBannerPc_heroBackgroundImage__[^"]*"[^>]*style="[^"]*url\(([^)]+)\)/);
const heroMb = html.match(/HomepageHeroBannerMb_heroBackgroundImage__[^"]*"[^>]*style="[^"]*url\(([^)]+)\)/);
console.log("hero PC:", heroPc?.[1]);
console.log("hero MB:", heroMb?.[1]);

// Feature items text from HTML
const features = [...html.matchAll(/class="[^"]*HomePage(?:PC|Mobile)[^"]*"[^>]*>[\s\S]*?<\/section>/gi)];
console.log("written docs/research/homepage-next-data.json");
