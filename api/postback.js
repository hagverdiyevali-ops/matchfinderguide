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

// Partner-specific mapping config
const PARTNER_MAP = {
  vortex: {
    offer_id: ["offerid"],
    affiliate_id: ["affid"],
    goal: ["goal"],
    payout: ["payout"],
    country: ["geo"],         // vortex calls it geo
    click_id: ["sub1"],       // vortex click id
    sub2: ["sub2"],
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
    country: ["country"],
  },
};

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.POSTGRES_URL);

    const q = req.query || {};
    const partner = (q.partner || "").toString().trim().toLowerCase() || "unknown";
    const map = PARTNER_MAP[partner] || {};

    // Normalize fields (works even if partner=unknown; then most become null)
    const normalized = {
      partner,
      offer_id: pick(q, map.offer_id || ["offer_id", "offerid"]),
      offer_name: pick(q, map.offer_name || ["offer_name"]),
      goal_id: pick(q, map.goal_id || ["goal_id"]),
      goal_name: pick(q, map.goal_name || ["goal_name"]),
      goal: pick(q, map.goal || ["goal"]),
      status: pick(q, map.status || ["status"]),
      status_name: pick(q, map.status_name || ["status_name"]),
      affiliate_id: pick(q, map.affiliate_id || ["affiliate_id", "affid"]),
      source: pick(q, map.source || ["source", "sub3"]),
      click_id: pick(q, map.click_id || ["click_id", "sub1"]),
      offer_prelander_id: pick(q, map.offer_prelander_id || ["offer_prelander_id"]),
      offer_url_id: pick(q, map.offer_url_id || ["offer_url_id"]),
      transaction_id: pick(q, map.transaction_id || ["transaction_id"]),
      session_ip: pick(q, map.session_ip || ["session_ip"]),
      ip: pick(q, map.ip || ["ip"]),
      date: pick(q, map.date || ["date"]),
      time: pick(q, map.time || ["time"]),
      currency: pick(q, map.currency || ["currency"]),
      payout: pick(q, map.payout || ["payout"]),
      country: pick(q, map.country || ["country", "geo"]),
      geo: pick(q, ["geo"]), // optional separate geo column
      sub2: pick(q, map.sub2 || ["sub2"]),
      sub3: pick(q, map.sub3 || ["sub3"]),
      sub4: pick(q, map.sub4 || ["sub4"]),
      sub5: pick(q, map.sub5 || ["sub5"]),
    };

    await sql`
      INSERT INTO postbacks (
        partner,
        offer_id, offer_name,
        goal_id, goal_name, goal,
        status, status_name,
        affiliate_id, source, click_id,
        offer_prelander_id, offer_url_id,
        transaction_id, session_ip, ip,
        date, time, currency, payout,
        country, geo,
        sub2, sub3, sub4, sub5,
        raw_query
      ) VALUES (
        ${normalized.partner},
        ${normalized.offer_id}, ${normalized.offer_name},
        ${normalized.goal_id}, ${normalized.goal_name}, ${normalized.goal},
        ${normalized.status}, ${normalized.status_name},
        ${normalized.affiliate_id}, ${normalized.source}, ${normalized.click_id},
        ${normalized.offer_prelander_id}, ${normalized.offer_url_id},
        ${normalized.transaction_id}, ${normalized.session_ip}, ${normalized.ip},
        ${normalized.date}, ${normalized.time}, ${normalized.currency}, ${normalized.payout},
        ${normalized.country}, ${normalized.geo},
        ${normalized.sub2}, ${normalized.sub3}, ${normalized.sub4}, ${normalized.sub5},
        ${JSON.stringify(q)}
      );
    `;

    return res.status(200).send("OK");
  } catch (e) {
    return res.status(500).send("ERROR");
  }
}