<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Keg & Cask Planner — West Walls Brewing Co.</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root{
      --bg:#0b0d10; --panel:#0d1117; --muted:#7a8799; --line:#1f2632;
      --chip:#121923; --ok:#39c07f; --warn:#f5b301; --bad:#ef4e4e; --ink:#e7eef8;
      --accent:#3b82f6;
    }
    *{box-sizing:border-box}
    body{margin:0; font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif; color:var(--ink); background:var(--bg)}
    header{position:sticky; top:0; z-index:5; background:var(--panel); border-bottom:1px solid var(--line)}
    .wrap{max-width:1400px; margin:0 auto; padding:18px 20px}
    h1{margin:0; font-size:18px; letter-spacing:.2px}
    .controls{margin-top:10px; display:flex; gap:12px; flex-wrap:wrap}
    label{display:flex; gap:8px; align-items:center; font-size:13px; color:var(--muted)}
    select,button{
      padding:8px 10px; border-radius:10px; border:1px solid #2a3343;
      background:#121923; color:var(--ink); font-size:13px;
    }
    button{background:var(--accent); border-color:transparent; cursor:pointer}

    main.wrap{display:grid; grid-template-columns: 1fr 340px; gap:18px; align-items:start}
    @media (max-width: 1100px){ main.wrap{grid-template-columns: 1fr} }

    .panel{background:var(--panel); border:1px solid var(--line); border-radius:16px; overflow:hidden}
    .panel h2{margin:0; padding:14px 16px; border-bottom:1px solid var(--line); font-size:15px}
    .section{padding:10px 16px 16px}

    table{width:100%; border-collapse:collapse; font-size:13px; table-layout:auto}
    th,td{border-bottom:1px solid var(--line); padding:10px 8px; text-align:left; vertical-align:middle}
    th{color:var(--muted); font-weight:600; background:var(--panel)}
    .muted{color:var(--muted)}
    .ok{color:var(--ok)} .warn{color:var(--warn)} .bad{color:var(--bad)}
    .note{font-size:12px; color:var(--muted); margin:6px 0 0}

    .chips{display:flex; gap:8px; flex-wrap:wrap}
    .chip{background:var(--chip); border:1px solid #2a3343; padding:4px 8px; border-radius:999px; font-size:12px}

    .stack{display:flex; flex-direction:column; gap:8px; padding:12px}
    .cardItem{
      border:1px solid var(--line); background:#0f141c; border-radius:12px; padding:10px 12px;
      display:grid; grid-template-columns: 1fr auto; gap:6px; align-items:center
    }
    .cardItem h4{margin:0; font-size:14px}
    .tag{font-size:11px; padding:3px 8px; border-radius:999px; background:#121923; border:1px solid #263246; color:var(--muted)}
    .status.ok{border-color:#164d31; background:#0f1b16; color:var(--ok)}
    .status.warn{border-color:#5e4b06; background:#1a1607; color:var(--warn)}
    .status.bad{border-color:#612626; background:#1b1010; color:var(--bad)}

    /* Off-site section */
    .offsite-summary{display:flex; gap:10px; flex-wrap:wrap; margin:6px 0 0}
    .pill{font-size:12px; background:#121923; border:1px solid #2a3343; padding:4px 8px; border-radius:999px}
  </style>
</head>
<body>
<header>
  <div class="wrap">
    <h1>Keg & Cask Planner</h1>
    <div class="controls">
      <label>Orders lookback
        <select id="lookback">
          <option value="56">8 weeks</option>
          <option value="84" selected>12 weeks</option>
          <option value="112">16 weeks</option>
          <option value="168">24 weeks</option>
        </select>
      </label>
      <label>Cover target
        <select id="cover">
          <option value="1.5">1.5 weeks</option>
          <option value="2" selected>2 weeks</option>
          <option value="3">3 weeks</option>
          <option value="4">4 weeks</option>
          <option value="6">6 weeks</option>
          <option value="8">8 weeks</option>
        </select>
      </label>
      <button id="refresh">Refresh</button>
      <span id="status" class="note">Loading…</span>
    </div>
  </div>
</header>

<main class="wrap">
  <div class="panel">
    <h2>Production — Keg</h2>
    <div class="section">
      <table id="kegTable">
        <thead>
        <tr>
          <th>Beer</th>
          <th>Available stock</th>
          <th>In tanks (equiv.)</th>
          <th>Demand/wk</th>
          <th>Weeks cover*</th>
          <th>Latest brew start</th>
          <th>Status</th>
          <th>Sizes</th>
        </tr>
        </thead>
        <tbody></tbody>
      </table>
      <p class="note">*Cover = (Available + In‑tanks) / weekly demand.</p>
    </div>

    <h2 style="border-top:1px solid var(--line)">Production — Cask</h2>
    <div class="section">
      <table id="caskTable">
        <thead>
        <tr>
          <th>Beer</th>
          <th>Available stock</th>
          <th>In tanks (equiv.)</th>
          <th>Demand/wk</th>
          <th>Weeks cover*</th>
          <th>Latest brew start</th>
          <th>Status</th>
        </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>

    <h2 style="border-top:1px solid var(--line)">Off‑site — Bottled in Cumbria</h2>
    <div class="section">
      <div id="offsiteSummary" class="offsite-summary"></div>
      <table id="offsiteTable" style="margin-top:10px">
        <thead>
        <tr>
          <th>Beer</th>
          <th>Litres remaining off‑site</th>
          <th>Batches</th>
          <th>Last sent</th>
        </tr>
        </thead>
        <tbody></tbody>
      </table>
      <p class="note">This shows beer currently away at Bottled in Cumbria (not yet received back). It is kept separate from cover calculations above.</p>
    </div>
  </div>

  <aside class="panel">
    <h2>Brew now (priority)</h2>
    <div id="priority" class="stack"></div>
    <div class="section">
      <p class="note">Items appear here when cover is below your target (keg sizes combined per beer).</p>
    </div>
  </aside>
</main>

<script>
// ---------- Tiny network debug helper ----------
const dbg = { logs: [] };
function logCall(url, status) {
  dbg.logs.push({ when: new Date().toISOString(), status, url });
}

/** ========= CONFIG ========= **/
const PROXY_URL   = "https://breww-proxy.vercel.app/api/breww";
const PROXY_TOKEN = "w2hd8b3947ghbfa9n349gh20q9g8h4";

const KEG_BEERS  = ["Too Easy","Gold Fool","Nitro Man","Texas Sun","Express Yourself","Full Tilt"];
const CASK_BEERS = ["Low Rider","Off The Wall","Her","Bitter End"];

// Convert litres to container counts
const L_PER = { Keg30: 30, Keg50: 50, Firkin: 40.9 };

/** --------- helpers --------- */
function inferFormat(text){
  const t = (text||"").toLowerCase();
  if (t.includes("firkin")) return "Cask Firkin";
  if (t.includes("50l") || (t.includes("keg") && t.includes("50"))) return "Keg 50L";
  if (t.includes("30l") || (t.includes("keg") && t.includes("30"))) return "Keg 30L";
  return null;
}
function matchBeer(text, beer){
  return (text||"").toLowerCase().replace(/\./g,"").includes(beer.toLowerCase().replace(/\./g,""));
}

/** Turnaround (days) */
const TURN_DAYS = {
  "Texas Sun": 23.125, "Too Easy": 77.4167, "Nitro Man": 17.125, "Gold Fool": 17.125,
  "Off The Wall": 20.25, "Low Rider": 12.75, "Bitter End": 15.2083,
  "Full Tilt": 23.8333, "Her": 14.9167, "Express Yourself": 25.25
};
const FALLBACK = { ale: 12, lager: 14 };
function guessType(beer){ return beer==="Too Easy" ? "lager" : "ale"; }

/** HTTP */
async function brewwList(path, params = {}){
  let page = 1, all = [];
  while (page <= 15){
    const qs = new URLSearchParams({ path, page_size: 200, page, ...params }).toString();
    const fullUrl = `${PROXY_URL}?${qs}`;
    const r  = await fetch(fullUrl, { headers: { "x-proxy-token": PROXY_TOKEN } });
    logCall(fullUrl, r.status);
    if (!r.ok) throw new Error(`${path} ${r.status}`);
    const data = await r.json();
    all = all.concat(data.results || []);
    if (!data.next) break;
    page++;
  }
  return all;
}

/** --------- main loader --------- */
async function load(){
  const statusEl = document.getElementById("status");
  statusEl.textContent = "Loading…";
  try {
    const lookbackDays = parseInt(document.getElementById("lookback").value, 10);
    const coverTarget  = parseFloat(document.getElementById("cover").value);

    // 1) Fetch core data for production
    const productFields = "id,name,code,quantity_in_stock_in_format";
    const batchFields   = "id,drink,created_on,current_vessel_info,final_volume,status";
    const [products, ordersRaw, batches] = await Promise.all([
      brewwList("products/", { include_fields: productFields }),
      brewwList("orders/"),
      brewwList("drink-batches/", { include_fields: batchFields })
    ]);

    // 2) Demand in lookback
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - lookbackDays);
    const ordersForDemand = ordersRaw.filter(o=>{
      const d = new Date(o.issue_date || o.created_at || o.last_modified_at || new Date());
      return d >= cutoff;
    });

    // 3) Allocations (outstanding)
    const allocatedByProduct = new Map();
    for (const o of ordersRaw){
      for (const line of (o.order_lines || [])){
        const ordered = Number(line.quantity ?? 0);
        const sent    = Number(line.quantity_dispatched ?? 0);
        const outstanding = Math.max(0, ordered - sent);
        if (outstanding > 0 && line.product != null){
          allocatedByProduct.set(line.product,
            (allocatedByProduct.get(line.product) || 0) + outstanding
          );
        }
      }
    }

    // 4) Demand per beer/week
    function demandPerWeek(beer){
      let qty = 0;
      for (const o of ordersForDemand){
        for (const line of (o.order_lines || [])){
          if (!matchBeer(line.product_name, beer)) continue;
          const q = Number(line.quantity_dispatched ?? line.quantity ?? 0);
          qty += q;
        }
      }
      return qty / (lookbackDays / 7);
    }

    // 5) Available stock by format (minus outstanding)
    function availableStockByFormat(beer){
      const bucket = { total: 0 };
      for (const p of products){
        if (!matchBeer(p.name, beer)) continue;
        const fmt = inferFormat(p.name);
        if (!fmt) continue;
        const inStock  = Number(p.quantity_in_stock_in_format ?? 0);
        const allocated = Number(allocatedByProduct.get(p.id) || 0);
        const available = Math.max(0, inStock - allocated);
        bucket[fmt] = (bucket[fmt] || 0) + available;
        bucket.total += available;
      }
      return bucket;
    }

    // 6) In-tanks litres (current_vessel_info[].fill_volume.litre)
    const inTankLitresByBeer = {};
    for (const b of (batches || [])){
      const beerName = (b?.drink?.name) || "";
      if (!beerName) continue;
      const arr = Array.isArray(b?.current_vessel_info) ? b.current_vessel_info : [];
      if (arr.length === 0) continue;
      const litres = arr.reduce((sum, v) => sum + Number(v?.fill_volume?.litre || 0), 0);
      if (litres <= 0) continue;
      inTankLitresByBeer[beerName] = (inTankLitresByBeer[beerName] || 0) + litres;
    }
    function inTanksEquivalent(beer, kind){
      const litres = Object.entries(inTankLitresByBeer)
        .filter(([n]) => matchBeer(n, beer))
        .reduce((sum,[,L]) => sum + L, 0);
      if (litres <= 0) return { total:0, bySize:{} };
      if (kind === "keg"){
        const half = litres / 2;
        const k30  = Math.floor(half / L_PER.Keg30);
        const k50  = Math.floor(half / L_PER.Keg50);
        return { total: k30 + k50, bySize: { "Keg 30L": k30, "Keg 50L": k50 } };
      } else {
        const firks = Math.floor(litres / L_PER.Firkin);
        return { total: firks, bySize: { "Cask Firkin": firks } };
      }
    }

    function latestBrewDateFrom(coverWks, turnDays, targetWks){
      if (coverWks === 99) return "—";
      const daysUntil = (coverWks - targetWks) * 7 - turnDays;
      const d = new Date(); d.setDate(d.getDate() + Math.floor(daysUntil));
      return d.toISOString().slice(0,10);
    }
    function statusFromCover(coverWks, targetWks){
      if (coverWks < targetWks/2) return "At risk";
      if (coverWks < targetWks)   return "Needs brew soon";
      return "OK";
    }
    function fmt1(x){ return (x===99) ? "—" : x.toFixed(1) }

    // 7) Build production tables
    const kegRows  = [];
    const caskRows = [];

    for (const beer of KEG_BEERS){
      const turn = TURN_DAYS[beer] ?? (guessType(beer) === "lager" ? FALLBACK.lager : FALLBACK.ale);
      const sizes = availableStockByFormat(beer);
      const dem   = demandPerWeek(beer);
      const tanks = inTanksEquivalent(beer, "keg");
      const availablePlusTanks = (sizes.total || 0) + (tanks.total || 0);
      const cover = dem > 0 ? availablePlusTanks / dem : (availablePlusTanks > 0 ? 99 : 0);
      const latest = dem > 0 ? latestBrewDateFrom(cover, turn, coverTarget) : "N/A";
      const status = statusFromCover(cover, coverTarget);
      kegRows.push({
        beer, available: sizes.total || 0, inTanks: tanks.total || 0,
        demand: dem, cover, latest, status, sizes, tanksBySize: tanks.bySize || {}
      });
    }

    for (const beer of CASK_BEERS){
      const turn = TURN_DAYS[beer] ?? FALLBACK.ale;
      const sizes = availableStockByFormat(beer);
      const dem   = demandPerWeek(beer);
      const tanks = inTanksEquivalent(beer, "cask");
      const available = sizes["Cask Firkin"] || 0;
      const availablePlusTanks = available + (tanks.total || 0);
      const cover = dem > 0 ? availablePlusTanks / dem : (availablePlusTanks > 0 ? 99 : 0);
      const latest = dem > 0 ? latestBrewDateFrom(cover, turn, coverTarget) : "N/A";
      const status = statusFromCover(cover, coverTarget);
      caskRows.push({
        beer, available, inTanks: tanks.total || 0, demand: dem, cover, latest, status
      });
    }

    // 8) Render production
    document.querySelector("#kegTable tbody").innerHTML = kegRows.map(r=>{
      const cls = r.status === "OK" ? "ok" : r.status === "At risk" ? "bad" : "warn";
      return `<tr>
        <td>${r.beer}</td>
        <td>${r.available}</td>
        <td>${r.inTanks}</td>
        <td>${fmt1(r.demand)}</td>
        <td>${fmt1(r.cover)}</td>
        <td>${r.latest}</td>
        <td class="${cls}">${r.status}</td>
        <td>
          <div class="chips">
            <span class="chip">30L: <b>${r.sizes["Keg 30L"]||0}</b> + <b>${r.tanksBySize["Keg 30L"]||0}</b> in tanks</span>
            <span class="chip">50L: <b>${r.sizes["Keg 50L"]||0}</b> + <b>${r.tanksBySize["Keg 50L"]||0}</b> in tanks</span>
          </div>
        </td>
      </tr>`;
    }).join("");

    document.querySelector("#caskTable tbody").innerHTML = caskRows.map(r=>{
      const cls = r.status === "OK" ? "ok" : r.status === "At risk" ? "bad" : "warn";
      return `<tr>
        <td>${r.beer}</td>
        <td>${r.available}</td>
        <td>${r.inTanks}</td>
        <td>${fmt1(r.demand)}</td>
        <td>${fmt1(r.cover)}</td>
        <td>${r.latest}</td>
        <td class="${cls}">${r.status}</td>
      </tr>`;
    }).join("");

    // 9) Priority panel (by beer)
    const priorityMap = new Map();
    function consider(arr){
      for (const r of arr){
        if (r.cover === 99 || isNaN(r.cover)) continue;
        if (r.cover >= coverTarget) continue;
        const curr = priorityMap.get(r.beer);
        if (!curr || r.cover < curr.cover){
          priorityMap.set(r.beer, { beer:r.beer, cover:r.cover, latest:r.latest });
        }
      }
    }
    consider(kegRows); consider(caskRows);

    const list = Array.from(priorityMap.values())
      .sort((a,b)=> a.cover!==b.cover ? a.cover-b.cover : (a.latest||"").localeCompare(b.latest||""));

    document.getElementById("priority").innerHTML =
      list.length ? list.map(p=>{
        const label = p.cover < coverTarget/2 ? "bad" : "warn";
        return `<div class="cardItem">
          <div>
            <h4>${p.beer}</h4>
            <div class="chips" style="margin-top:4px">
              <span class="tag">Cover: <b>${p.cover.toFixed(1)} wks</b></span>
              <span class="tag">Latest start: <b>${p.latest}</b></span>
            </div>
          </div>
          <span class="tag status ${label}">${label==='bad'?'At risk':'Brew soon'}</span>
        </div>`;
      }).join("")
      : `<div class="note" style="padding:0 12px">All good — nothing below target.</div>`;

    /* ================= Off‑site — Bottled in Cumbria ================= */
    // A) Find the "Bottled in Cumbria" customer (entity_type includes 4 = third party packager)
    const custFields = "id,name,entity_type";
    const customers = await brewwList("customers/", { include_fields: custFields });
    const bic = customers.find(c =>
      String(c.name||"").toLowerCase().includes("bottled in cumbria") &&
      ((c.entity_type|0) & 4) === 4
    );

    // B) Pull planned-packagings and filter to BIC
    const ppFields = "id,beer,drink,packager,packager_name,volume_sent,volume_remaining,total_volume,datetime_sent,status,batch";
    const planned = await brewwList("planned-packagings/", { include_fields: ppFields });

    // Filter rows belonging to Bottled in Cumbria with remaining volume
    const atBIC = planned.filter(p => {
      const byName = String(p.packager_name||"").toLowerCase().includes("bottled in cumbria");
      const byId   = bic && p.packager && (p.packager.id === bic.id);
      const remainingL = Number(p?.volume_remaining?.litre || 0);
      return (byName || byId) && remainingL > 0;
    });

    // Aggregate by beer
    const agg = new Map(); // beer => { litres, batches:Set, last:Date }
    for (const row of atBIC){
      const beerName =
        row?.beer?.name || row?.drink?.name || row?.drink?.drink_name || "Unknown";
      const litres = Number(row?.volume_remaining?.litre || 0);
      const batch  = row?.batch ? (row.batch.batch_code || row.batch.code || row.batch) : (row.batch_code || "");
      const sent   = row?.datetime_sent ? new Date(row.datetime_sent) : null;

      if (!agg.has(beerName)){
        agg.set(beerName, { litres:0, batches:new Set(), last:null });
      }
      const a = agg.get(beerName);
      a.litres += litres;
      if (batch) a.batches.add(String(batch));
      if (sent && (!a.last || sent > a.last)) a.last = sent;
    }

    // Render summary pills + table
    const totalLitres = Array.from(agg.values()).reduce((s,a)=>s+a.litres,0);
    const offsiteSummary = document.getElementById("offsiteSummary");
    offsiteSummary.innerHTML =
      `<span class="pill"><b>${bic ? bic.name : "Bottled in Cumbria"}</b></span>
       <span class="pill">Beers: <b>${agg.size}</b></span>
       <span class="pill">Total remaining: <b>${totalLitres.toFixed(0)} L</b></span>`;

    const offTbody = document.querySelector("#offsiteTable tbody");
    offTbody.innerHTML = agg.size ? Array.from(agg.entries()).map(([beer,a])=>{
      const last = a.last ? a.last.toISOString().slice(0,10) : "—";
      return `<tr>
        <td>${beer}</td>
        <td>${a.litres.toFixed(0)} L</td>
        <td>${Array.from(a.batches).join(", ") || "—"}</td>
        <td>${last}</td>
      </tr>`;
    }).join("") : `<tr><td colspan="4" class="muted">No beer currently at Bottled in Cumbria.</td></tr>`;

    // Print network log (even on success)
    const dbgpre = document.getElementById("dbgpre");
    if (dbgpre) dbgpre.textContent = dbg.logs.map(l => `${l.when}  ${l.status}  ${l.url}`).join("\n");

    statusEl.textContent = "Up to date";
  } catch (err) {
    console.error(err);
    document.getElementById("status").textContent = "Error loading data — see debug log below.";
    const dbgpre = document.getElementById("dbgpre");
    if (dbgpre) {
      dbgpre.textContent =
        dbg.logs.map(l => `${l.when}  ${l.status}  ${l.url}`).join("\n") +
        "\n\n" + (err?.stack || String(err));
    }
  }
}

// Bind
document.getElementById("refresh").addEventListener("click", load);
window.addEventListener("load", load);
</script>

<!-- Network debug panel -->
<div style="background:#0f141c; color:#9fb0c4; font-size:12px; padding:10px; border-top:1px solid #1f2632; max-height:220px; overflow:auto">
  <strong>Network debug log</strong>
  <pre id="dbgpre" style="white-space:pre-wrap; margin:6px 0 0"></pre>
</div>
</body>
</html>
