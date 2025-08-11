// api/breww.js
export default async function handler(req, res) {
  // Let browser tools (like Hoppscotch) call us
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "x-proxy-token, content-type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  const base  = process.env.BREWW_API_BASE;   // e.g. https://breww.com/api/
  const key   = process.env.BREWW_API_KEY;    // your Breww API key
  const gate  = process.env.PROXY_TOKEN;      // your private token

  if (!base || !key) return res.status(500).json({ error: "Missing BREWW_API_BASE or BREWW_API_KEY" });
  if (!gate || req.headers["x-proxy-token"] !== gate) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { path = "", ...rest } = req.query;
  // only allow Breww public API reads
  if (!/^public\/v1\//.test(String(path))) {
    return res.status(400).json({ error: "Endpoint not allowed" });
  }

  const url = new URL(base.replace(/\/+$/,"") + "/" + String(path).replace(/^\/+/,""));
  for (const [k, v] of Object.entries(rest)) url.searchParams.set(k, v);

  try {
    const r = await fetch(url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      cache: "no-store",
    });
    const body = await r.text();
    res.status(r.status).setHeader("content-type", r.headers.get("content-type") || "application/json").send(body);
  } catch (e) {
    res.status(502).json({ error: "Upstream error", detail: String(e) });
  }
}
