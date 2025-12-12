// api/postback.js
import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  // Partners often require 200 OK quickly
  res.setHeader("Cache-Control", "no-store");

  try {
    const sql = neon(process.env.POSTGRES_URL);

    // Support GET (req.query) and POST (req.body)
    const q = req.query || {};
    const b = req.body && typeof req.body === "object" ? req.body : {};
    const data = { ...q, ...b };

    // Normalize click id: partner may send click_id, or you may receive aff_sub1
    const clickId = data.click_id || data.aff_sub1 || null;

    // Normalize gclid too (optional, but helpful)
    const gclid = data.gclid || data.aff_sub2 || null;

    // Insert (everything as text is fine; DB schema decides types)
    await sql`
      INSERT INTO postbacks (
        offer_id, offer_name, goal_id, goal_name,
        status, status_name,
        affiliate_id, source, click_id, gclid,
        offer_prelander_id, offer_url_id,
        transaction_id, session_ip, ip,
        date, time, currency, payout, country,
        raw_query
      ) VALUES (
        ${data.offer_id || null}, ${data.offer_name || null}, ${data.goal_id || null}, ${data.goal_name || null},
        ${data.status || null}, ${data.status_name || null},
        ${data.affiliate_id || null}, ${data.source || null}, ${clickId}, ${gclid},
        ${data.offer_prelander_id || null}, ${data.offer_url_id || null},
        ${data.transaction_id || null}, ${data.session_ip || null}, ${data.ip || null},
        ${data.date || null}, ${data.time || null}, ${data.currency || null}, ${data.payout || null}, ${data.country || null},
        ${JSON.stringify(data)}
      );
    `;

    return res.status(200).send("OK");
  } catch (e) {
    // IMPORTANT: still return 200 so partner doesn't disable your postback
    console.error("POSTBACK_ERROR:", e);
    return res.status(200).send("OK");
  }
}