// api/postback.js
import { neon } from "@neondatabase/serverless";

/* -------------------- helpers -------------------- */

// first non-empty value from object
function pick(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return String(v);
    }
  }
  return null;
}

// normalize payout safely (returns string or null)
function normalizePayout(p) {
  if (p === undefined || p === null) return null;
  const s = String(p).trim().replace(",", ".");
  return /^[0-9]+(\.[0-9]+)?$/.test(s) ? s : null;
}

function upperOrNull(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.toUpperCase() : null;
}

// merge query + body (POST callbacks often send body)
function getPayload(req) {
  const q = req?.query && typeof req.query === "object" ? req.query : {};
  const b = req?.body && typeof req.body === "object" ? req.body : {};
  // body should override query if same key exists
  return { ...q, ...b };
}

// auto-detect partner by parameter shape
function detectPartner(p) {
  const keys = new Set(Object.keys(p || {}).map((k) => k.toLowerCase()));

  // MyLead-style
  if (
    keys.has("ml_sub1") ||
    keys.has("ml_sub2") ||
    keys.has("ml_sub3") ||
    keys.has("ml_sub4") ||
    keys.has("ml_sub5")
  ) {
    return "mylead";
  }

  // Affilitex-style
  if (
    keys.has("click_id2") ||
    keys.has("click_id3") ||
    keys.has("click_id4") ||
    keys.has("click_id5") ||
    keys.has("token_1") ||
    keys.has("token_2")
  ) {
    return "affilitex";
  }

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

/* ---------------- partner maps ---------------- */

const PARTNER_MAP = {
  vortex: {
    click_id: ["sub1", "click_id", "aff_sub1"],
    gclid: ["sub2", "gclid", "aff_sub2", "token_1", "click_id2"],
    offer_id: ["offerid", "offer_id"],
    goal: ["goal", "event", "type"],
    payout: ["payout", "amount"],
    currency: ["currency"],
    geo: ["geo", "country"],
    transaction_id: ["transaction_id", "txid", "tid"],
    status: ["status", "status_name"],
  },

  cpamatica: {
    click_id: ["click_id", "aff_sub1", "sub1"],
    gclid: ["gclid", "aff_sub2", "sub2", "token_1", "click_id2"],
    offer_id: ["offer_id"],
    goal: ["goal", "goal_id", "goal_name"],
    payout: ["payout"],
    currency: ["currency"],
    geo: ["country", "geo"],
    transaction_id: ["transaction_id", "txid", "tid"],
    status: ["status", "status_name"],
  },

  affilitex: {
    click_id: ["click_id", "sub1", "aff_sub1", "ml_sub1"],
    // Affilitex often uses click_id2 + token_1; we accept both
    gclid: ["token_1", "click_id2", "gclid", "aff_sub2", "sub2"],
    offer_id: ["offer_id", "offerid", "offer"],
    goal: ["goal", "event", "type"],
    payout: ["payout", "amount"],
    currency: ["currency"],
    geo: ["geo", "country"],
    transaction_id: ["transaction_id", "txid", "tid"],
    status: ["status", "status_name"],
  },

  mylead: {
    click_id: ["ml_sub1", "click_id", "sub1", "aff_sub1"],
    gclid: ["ml_sub2", "gclid", "sub2", "aff_sub2", "token_1", "click_id2"],
    offer_id: ["offer_id", "offerid", "offer"],
    goal: ["goal", "event", "type"],
    payout: ["payout", "amount"],
    currency: ["currency"],
    geo: ["geo", "country"],
    transaction_id: ["transaction_id", "txid", "tid"],
    status: ["status", "status_name"],
  },

  unknown: {
    // best-effort fallback across common patterns
    click_id: ["click_id", "aff_sub1", "sub1", "ml_sub1"],
    gclid: ["gclid", "aff_sub2", "sub2", "ml_sub2", "token_1", "click_id2"],
    offer_id: ["offer_id", "offerid", "offer"],
    goal: ["goal", "goal_id", "goal_name", "event", "type"],
    payout: ["payout", "amount"],
    currency: ["currency"],
    geo: ["geo", "country"],
    transaction_id: ["transaction_id", "txid", "tid"],
    status: ["status", "status_name"],
  },
};

/* -------------------- handler -------------------- */

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.POSTGRES_URL);

    const payload = getPayload(req);

    // partner: explicit ?partner=... overrides auto-detect
    const partnerParam = (payload.partner || "").toString().trim().toLowerCase();
    const partner = partnerParam || detectPartner(payload) || "unknown";
    const map = PARTNER_MAP[partner] || PARTNER_MAP.unknown;

    const click_id = pick(payload, map.click_id);
    const gclid = pick(payload, map.gclid);

    const offer_id = pick(payload, map.offer_id);
    const goal = pick(payload, map.goal);
    const transaction_id = pick(payload, map.transaction_id);
    const status = pick(payload, map.status);

    const payout = normalizePayout(pick(payload, map.payout));
    const currency = upperOrNull(pick(payload, map.currency));
    const geo = upperOrNull(pick(payload, map.geo));

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
        ${payout}::numeric,
        ${currency},
        ${geo},
        ${gclid},
        ${transaction_id},
        ${status},
        ${JSON.stringify(payload)}::jsonb
      );
    `;

    // Partners generally only require 200 OK.
    return res.status(200).send("OK");
  } catch (e) {
    // Returning 500 forces partner retries (often desirable if DB had a temporary issue).
    return res.status(500).send("ERROR");
  }
}