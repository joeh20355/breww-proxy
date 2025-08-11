export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  const base = process.env.BREWW_API_BASE;
  const key  = process.env.BREWW_API_KEY;
  const token = process.env.PROXY_TOKEN;             // shared secret for your dashboard

  // Require a secret header so randoms can't hit your proxy
  if (!token || req.headers["x-proxy-token"] !== token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { path = "", ...rest } = req.query;
  // Allow only these read endpoints
  const allowed = [
    /^public\/v1\/products/,
    /^public\/v1\/orders/,
    /^public\/v1\/order_lines/,
    /^public\/v1\/batches/,
    /^public\/v1\/vessels/,
  ];
  if (!allowed.some(rx => rx.test(String(path)))) {
    return res.status(400).json({ error: "Endpoint not allowed" });
  }

  const url = new URL(base.replace(/\/+$/,"") + "/" + String(path).replace(/^\/+/,""));
  for (const [k,v] of Object.entries(rest)) url.searchParams.set(k, v);

  try {
    const r = await fetch(url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      cache: "no-store",
    });
    const text = await r.text();
    res.status(r.status).setHeader("content-type", r.headers.get("content-type") || "application/json").send(text);
  } catch (e) {
    res.status(502).json({ error: "Upstream error", detail: String(e) });
  }
}
