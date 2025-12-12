// api/postback.js
import { neon } from "@neondatabase/serverless";

// Helper: first non-empty value
function pick(q, keys) {
  for (const k of keys) {
    const v = q?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
  }
  return null;
}

// Try to detect partner by presence of distinctive keys
function detectPartner(q) {
  const keys = new Set(Object.keys(q || {}).map((k) => k.toLowerCase()));

  if (keys.has("offer_id") || keys.has("transaction_id") || keys.has("status_name")) return "cpamatica";
  if (keys.has("offerid") || keys.has("affid") || keys.has("sub1")) return "vortex";

  return "unknown";
}

// Partner-specific mapping config (optional; helps normalize cleanly)
const PARTNER_MAP = {
  vortex: {
    offer_id: ["offerid"],
    affiliate_id: ["affid"],
    goal: ["goal"],
    payout: ["payout"],
    geo: ["geo"],
    click_id: ["sub1"],
    sub2: ["sub2"], // could be gclid or other data
    sub3: ["sub3"],
    sub4: ["sub4"],
    sub5: ["sub5"],
  },
  cpamatica: {
    offer_id: ["offer_id"],
    offer_name: ["offer_name"],
    goal_id: ["goal_id"],
    goal_name: ["goal_name"],
    status: ["status"],
    status_name: ["status_name"],
    affiliate_id: ["affiliate_id"],
    source: ["source"],
    click_id: ["click_id"],
    offer_prelander_id: ["offer_prelander_id"],
    offer_url_id: ["offer_url_id"],
    transaction_id: ["transaction_id"],
    session_ip: ["session_ip"],
    ip: ["ip"],
    date: ["date"],
    time: ["time"],
    currency: ["currency"],
    payout: ["payout"],
    geo: ["country"], // cpamatica uses country; we store in geo
    gclid: ["gclid", "aff_sub2"], // allow both
  },
};

// Convert payout to numeric
function normalizePayout(p) {
  if (!p) return null;
  const s = String(p).trim().replace(",", ".");
  return /^[0-9]+(\.[0-9]+)?$/.test(s) ? s : null;
}

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.POSTGRES_URL);
    const q = req.query || {};

    const partnerParam = (q.partner || "").toString().trim().toLowerCase();
    const partner = partnerParam || detectPartner(q);
    const map = PARTNER_MAP[partner] || {};

    const click_id = pick(q, map.click_id || ["click_id", "sub1", "aff_sub1"]);
    const offer_id = pick(q, map.offer_id || ["offer_id", "offerid"]);
    const transaction_id = pick(q, map.transaction_id || ["transaction_id", "txid", "tid"]);

    // ✅ GLOBAL gclid pick (works for all partners)
    // Priority: explicit gclid -> aff_sub2 -> sub2
    const gclid = pick(q, map.gclid || ["gclid", "aff_sub2", "sub2"]);

    const payout = normalizePayout(pick(q, map.payout || ["payout"]));

    // store country/geo in one column called geo
    const geo = pick(q, map.geo || ["geo", "country"]);

    await sql`
      INSERT INTO postbacks_v2 (
        partner,
        click_id,
        offer_id,
        goal,
        payout,
        currency,
        geo,
        gclid,
        transaction_id,
        status,
        raw_query
      ) VALUES (
        ${partner},
        ${click_id},
        ${offer_id},
        ${pick(q, map.goal || ["goal", "goal_id", "goal_name"])},
        ${payout},
        ${pick(q, map.currency || ["currency"])},
        ${geo},
        ${gclid},
        ${transaction_id},
        ${pick(q, map.status || ["status", "status_name"])},
        ${JSON.stringify(q)}
      );
    `;

    return res.status(200).send("OK");
  } catch (e) {
    return res.status(500).send("ERROR");
  }
}