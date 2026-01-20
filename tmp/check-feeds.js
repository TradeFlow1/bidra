const sold = process.argv[2];
const urls = [
  "http://127.0.0.1:3000/api/listings?local=1",
  "http://127.0.0.1:3000/api/listings",
];

(async () => {
  for (const u of urls) {
    const r = await fetch(u, { cache: "no-store" });
    const j = await r.json();
    const ids = (j.listings || []).map((x) => x.id);
    console.log("URL", u);
    console.log("COUNT", ids.length);
    console.log("HAS_SOLD_ID", ids.includes(sold));
    console.log("---");
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
