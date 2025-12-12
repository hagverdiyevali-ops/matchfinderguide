// api/postback.js
import { neon } from "@neondatabase/serverless";

/* -------------------- helpers -------------------- */

// first non-empty value from query
function pick(q, keys) {
  for (const k of keys) {
    const v = q?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return String(v);
    }
  }
  return null;
}

// auto-detect partner by parameter shape
function detectPartner(q) {
  const keys = new Set(Object.keys(q || {}).map((k) => k.toLowerCase()));

  // Cpamatica-style
  if (keys.has("offer_id") || keys.has("transaction_id") || keys.has("status_name")) {
    return "cpamatica";
  }

  // Vortex-style
  if (keys.has("offerid") || keys.has("affid") || keys.has("sub1")) {
    return "vortex";
  }

  return "unknown";
}

// normalize payout safely
function normalizePayout(p) {
  if (!p) return null;
  const s = String(p).trim().replace(",", ".");
  return /^[0-9]+(\.[0-9]+)?$/.test(s) ? s : null;
}

/* ---------------- partner maps (optional helpers) ---------------- */

const PARTNER_MAP = {
  vortex: {
    offer_id: ["offerid"],
    affiliate_id: ["affid"],
    goal: ["goal"],
    payout: ["payout"],
    geo: ["geo"],
    click_id: ["sub1"],
  },

  cpamatica: {
    offer_id: ["offer_id"],
    affiliate_id: ["affiliate_id"],
    goal: ["goal", "goal_id", "goal_name"],
    payout: ["payout"],
    currency: ["currency"],
    geo: ["country"],
    click_id: ["click_id", "aff_sub1"],
  },
};

/* -------------------- handler -------------------- */

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.POSTGRES_URL);
    const q = req.query || {};

    // detect partner
    const partnerParam = (q.partner || "").toString().trim().toLowerCase();
    const partner = partnerParam || detectPartner(q);
    const map = PARTNER_MAP[partner] || {};

    // core fields
    const click_id = pick(q, map.click_id || ["click_id", "aff_sub1", "sub1"]);
    const offer_id = pick(q, map.offer_id || ["offer_id", "offerid"]);
    const goal = pick(q, map.goal || ["goal", "goal_id", "goal_name"]);
    const transaction_id = pick(q, ["transaction_id", "txid", "tid"]);

    // ✅ GLOBAL gclid handling (future-proof)
    const gclid = pick(q, [
      "gclid",
      "aff_sub2",
      "sub2",
      "aff_sub4",
      "sub4",
    ]);

    const payout = normalizePayout(pick(q, map.payout || ["payout"]));
    const currency = pick(q, map.currency || ["currency"]);
    const geo = pick(q, map.geo || ["geo", "country"]);
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
        gclid,
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
        ${gclid},
        ${transaction_id},
        ${status},
        ${JSON.stringify(q)}
      );
    `;

    // partners only care about 200 OK
    return res.status(200).send("OK");
  } catch (e) {
    return res.status(500).send("ERROR");
  }
}