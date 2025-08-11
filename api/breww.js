// /api/breww.js
export default async function handler(req, res) {
  // --- CORS so browser tools (Hoppscotch/Postman) can call this ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "x-proxy-token, content-type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  // Read-only
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  // Secrets from Vercel → Settings → Environment Variables
  const base  = (process.env.BREWW_API_BASE || "https://breww.com/api/").trim(); // keep trailing slash ok
  const key   = process.env.BREWW_API_KEY;    // your Breww API key
  const gate  = process.env.PROXY_TOKEN;      // your private token for this proxy
  if (!key)  return res.status(500).json({ error: "Missing BREWW_API_KEY" });
  if (!gate || req.headers["x-proxy-token"] !== gate) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { path = "", ...rest } = req.query;
  if (!path) return res.status(400).json({ error: "Missing 'path' query parameter" });

  // --- Allow-list: valid Breww public API resources (note the trailing slash) ---
  const allowed = [
    /^products\/?$/i,
    /^orders\/?$/i,
    /^order-lines\/?$/i,   // if available on your account
    /^stock-items\/?$/i,
    /^batches\/?$/i,
    /^vessels\/?$/i,
    /^sites\/?$/i,
  ];
  if (!allowed.some(rx => rx.test(String(path)))) {
    return res.status(400).json({ error: "Endpoint not allowed", path });
  }

  // Build upstream URL
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = String(path).replace(/^\/+/, "");
  const url = new URL(`${cleanBase}/${cleanPath}`); // e.g. https://breww.com/api/products/
  // Pass-through query (page, page_size, since, etc.)
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
