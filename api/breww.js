// /api/breww.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "x-proxy-token, content-type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  const base  = (process.env.BREWW_API_BASE || "https://breww.com/api/").trim();
  const key   = process.env.BREWW_API_KEY;
  const gate  = process.env.PROXY_TOKEN;
  if (!key)  return res.status(500).json({ error: "Missing BREWW_API_KEY" });
  if (!gate || req.headers["x-proxy-token"] !== gate) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { path = "", ...rest } = req.query;
  if (!path) return res.status(400).json({ error: "Missing 'path' query parameter" });

  const allowed = [
    /^products\/?$/i,
    /^orders\/?$/i,
    /^stock-items\/?$/i,
    /^planned-packagings\/?$/i,

    /^drink-batches\/?$/i,
    /^drink-batch-actions\/?$/i,

    /^fermentation-readings\/?$/i,
    /^vessels\/?$/i,
    /^drinks\/?$/i,
    /^inventory-receipts\/?$/i,
    /^ingredient-batches\/?$/i,
    /^container-types\/?$/i,
    /^containers\/?$/i,

    /^fulfillments\/?$/i,
    /^crm\/customers\/?$/i,
    /^crm\/customers\/basic\/?$/i,
    /^contacts\/?$/i,
    /^crm-activities\/?$/i,

    /^suppliers\/?$/i,
    /^purchase-orders\/?$/i,

    /^business-details\/?$/i,
    /^locations\/?$/i,
  ];

  if (!allowed.some(rx => rx.test(String(path)))) {
    return res.status(400).json({ error: "Endpoint not allowed", path });
  }

  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = String(path).replace(/^\/+/, "");
  const url = new URL(`${cleanBase}/${cleanPath}`);
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }

  try {
    console.log("Breww upstream:", url.toString());
    const r = await fetch(url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      cache: "no-store",
    });
    const contentType = r.headers.get("content-type") || "application/json";
    const body = await r.text();
    res.status(r.status).setHeader("content-type", contentType).send(body);
  } catch (e) {
    res.status(502).json({ error: "Upstream error", detail: String(e) });
  }
}
