async function get(u) {
  const r = await fetch(u, { cache: "no-store" });
  const j = await r.json();
  return new Set((j.listings || []).map((x) => x.id));
}
(async () => {
  const home = await get("http://127.0.0.1:3000/api/listings?local=1");
  const all  = await get("http://127.0.0.1:3000/api/listings");
  const onlyHome = [...home].filter((x) => !all.has(x));
  const onlyAll  = [...all].filter((x) => !home.has(x));
  console.log("ONLY_HOME", onlyHome.length);
  console.log("ONLY_LISTINGS", onlyAll.length);
  if (onlyHome.length) console.log("onlyHomeSample", onlyHome.slice(0, 5));
  if (onlyAll.length) console.log("onlyListingsSample", onlyAll.slice(0, 5));
})().catch((e) => { console.error(e); process.exit(1); });
