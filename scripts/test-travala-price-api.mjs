const API = "https://api.travala.com";
const slug = "shangri-la-the-shard-london-8035714";
const params = {
  slug,
  check_in: "2026-07-01",
  check_out: "2026-07-05",
  r1: 2,
};

async function get(path, query) {
  const url = new URL(API + "/" + path);
  Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0",
      platformVersion: "web",
    },
  });
  const text = await res.text();
  console.log("\n", path, res.status);
  try {
    const json = JSON.parse(text);
    console.log(JSON.stringify(json, null, 2).slice(0, 2000));
    return json;
  } catch {
    console.log(text.slice(0, 500));
    return null;
  }
}

const session = await get("searching/search/search-property", params);
const sessionId = typeof session?.data === "string" ? session.data : session?.data?.search_code || session?.data?.session_id;
console.log("\nSESSION:", sessionId);

if (sessionId) {
  const pkg = await get("searching/package/get_package", {
    slug,
    session_id: sessionId,
    user_currency_showing: "USD",
    limit_image_rth: "V1",
    merge_room: true,
  });
  console.log("\nLOWEST:", pkg?.meta?.lowest_package_price);
}
