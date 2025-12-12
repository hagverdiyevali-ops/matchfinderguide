// /api/postback.js

export default function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).send("Method Not Allowed");
    }

    const {
      click_id = "",
      offer_id = "",
      offer_name = "",
      goal_id = "",
      goal_name = "",
      status = "",
      status_name = "",
      transaction_id = "",
      payout = "",
      currency = "",
      country = "",
      source = "",
      ip = "",
      session_ip = "",
      date = "",
      time = "",
    } = req.query;

    if (!click_id) {
      return res.status(400).send("Missing click_id");
    }

    console.log("POSTBACK_RECEIVED", {
      click_id,
      offer_id,
      offer_name,
      goal_id,
      goal_name,
      status,
      status_name,
      transaction_id,
      payout,
      currency,
      country,
      source,
      ip,
      session_ip,
      date,
      time,
      received_at: new Date().toISOString(),
    });

    return res.status(200).send("OK");
  } catch (err) {
    console.error("POSTBACK_ERROR", err);
    return res.status(500).send("Server Error");
  }
}