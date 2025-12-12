// api/postback.js
import { neon } from "@neondatabase/serverless";

// helper: pick first non-empty value
function pick(q, keys) {
  for (const k of keys) {
    const v = q?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return String(v);
    }
  }
  return null;
}

// detect partner by params
function detectPartner(q) {
  const keys = new Set(Object.keys(q || {}).map(k => k.toLowerCase()));

  if (keys.has("offer_id") || keys.has("transaction_id")) return "cpamatica";
  if (keys.has("offerid") || keys.has("affid") || keys.has("sub1")) return "vortex";

  return "unknown";
}

// normalize payout safely
function normalizePayout(v) {
  if (!v) return null;
  const s = String(v).replace(",", ".").trim();
  return /^[0-9]+(\.[0-9]+)?$/.test(s) ? s : null;
}

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.POSTGRES_URL);
    const q = req.query || {};

    const partner =
      (q.partner || "").toString().trim().toLowerCase() ||
      detectPartner(q);

    const click_id = pick(q, ["click_id", "sub1"]);
    const offer_id = pick(q, ["offer_id", "offerid"]);
    const goal = pick(q, ["goal", "goal_name", "goal_id"]);
    const payout = normalizePayout(pick(q, ["payout"]));
    const currency = pick(q, ["currency"]);
    const geo = pick(q, ["geo", "country"]);
    const transaction_id = pick(q, ["transaction_id"]);
    const status = pick(q, ["status", "status_name"]);

    await sql`
      INSERT INTO postbacks_v2 (
        partner,
        click_id,
        offer_id,
        goal,
        payout,
        currency,
        geo,
        transaction_id,
        status,
        raw_query
      ) VALUES (
        ${partner},
        ${click_id},
        ${offer_id},
        ${goal},
        ${payout},
        ${currency},
        ${geo},
        ${transaction_id},
        ${status},
        ${JSON.stringify(q)}
      );
    `;

    return res.status(200).send("OK");
  } catch (e) {
    console.error("postback error:", e);
    return res.status(500).send("ERROR");
  }
}