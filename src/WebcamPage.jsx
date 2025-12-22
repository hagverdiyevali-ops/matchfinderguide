// src/WebcamPage.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import CookieConsent from "./CookieConsent.jsx";
import { Analytics } from "@vercel/analytics/react";
import WEBCAM_OFFERS from "./webcamOffers.js";

/* ---------- small helpers ---------- */
const cn = (...c) => c.filter(Boolean).join(" ");

/**
 * Uses same keys as App.jsx
 * App.jsx is responsible for creating click_id and storing gclid from the landing URL.
 * Here we only READ them and append to outbound links.
 */
const CLICK_ID_KEY = "mfg_click_id";
const GCLID_KEY = "mfg_gclid";

function getStored(key) {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function getStoredClickId() {
  return getStored(CLICK_ID_KEY);
}

function getStoredGclid() {
  return getStored(GCLID_KEY);
}

/**
 * Get traffic source/sub-source (simple defaults).
 * You can swap these later to be dynamic (e.g., from URL params, referrer, etc.)
 */
function getTrafficSource() {
  return "matchfinderguide";
}

function getSubSource() {
  return "search-traffic";
}

/**
 * Replace partner placeholders in any URL string.
 * Supports:
 * - Your custom: {click_id}, {gclid}, {source}, {sub_source}
 * - Vortex style: {sub1}..{sub5}
 * - MyLead style: {ml_sub1}..{ml_sub5}
 * - Affilitex style: {click_id2}..{click_id5}, {token_1}, {token_2}
 */
function replacePartnerMacros(rawUrl, vars) {
  let out = String(rawUrl || "");

  const rep = (k, v) => {
    out = out.replaceAll(k, encodeURIComponent(v ?? ""));
  };

  // Common
  rep("{click_id}", vars.clickId);
  rep("{gclid}", vars.gclid);
  rep("{source}", vars.source);
  rep("{sub_source}", vars.subSource);

  // Vortex style (sub1..sub5)
  rep("{sub1}", vars.clickId);
  rep("{sub2}", vars.gclid);
  rep("{sub3}", vars.source);
  rep("{sub4}", vars.sub4 || "");
  rep("{sub5}", vars.subSource);

  // MyLead style (ml_sub1..ml_sub5)
  rep("{ml_sub1}", vars.clickId);
  rep("{ml_sub2}", vars.gclid);
  rep("{ml_sub3}", vars.source);
  rep("{ml_sub4}", vars.sub4 || "");
  rep("{ml_sub5}", vars.subSource);

  // Affilitex style (click_id2..5 + token_1/2)
  rep("{click_id2}", vars.gclid);
  rep("{click_id3}", vars.source);
  rep("{click_id4}", vars.sub4 || "");
  rep("{click_id5}", vars.subSource);
  rep("{token_1}", vars.gclid);
  rep("{token_2}", vars.subSource);

  return out;
}

/**
 * Helper: set param if missing OR still looks like a placeholder.
 */
function setIfMissing(u, key, value) {
  if (value === undefined || value === null || String(value).trim() === "") return;

  const cur = u.searchParams.get(key);
  const looksPlaceholder =
    !cur ||
    cur.includes("{") ||
    cur === "FOR_SUB1" ||
    cur === "FOR_SUB2" ||
    cur === "FOR_CLICKID";

  if (looksPlaceholder) u.searchParams.set(key, value);
}

/**
 * Detect partner scheme based on URL params/host.
 * Schemes:
 * - "vortex_sub"  => sub1..sub5
 * - "cpamatica"   => click_id + source
 * - "affilitex"   => click_id + click_id2..5 + token_1/2
 * - "mylead"      => ml_sub1..ml_sub5
 * - "aff_sub"     => aff_sub1..aff_sub5 (kept for backward compatibility)
 */
function detectPartnerScheme(u) {
  const has = (k) => u.searchParams.has(k);

  // MyLead
  if (has("ml_sub1") || has("ml_sub2") || has("ml_sub3") || has("ml_sub4") || has("ml_sub5")) {
    return "mylead";
  }

  // Affilitex
  if (
    has("click_id2") ||
    has("click_id3") ||
    has("click_id4") ||
    has("click_id5") ||
    has("token_1") ||
    has("token_2")
  ) {
    return "affilitex";
  }

  // Vortex style
  if (has("sub1") || has("sub2") || has("sub3") || has("sub4") || has("sub5")) {
    return "vortex_sub";
  }

  // Old "aff_sub" style (kept)
  if (has("aff_sub1") || has("aff_sub2") || has("aff_sub3") || has("aff_sub5")) {
    return "aff_sub";
  }

  // Cpamatica-style params
  if (has("click_id") || has("source")) {
    return "cpamatica";
  }

  // Host heuristics (optional)
  const host = (u.hostname || "").toLowerCase();
  if (host.includes("afftrk06.com")) return "affilitex";
  if (host.includes(".today")) return "vortex_sub";
  if (host.includes("cm-trk6.com")) return "aff_sub";

  // Default: cpamatica click_id + source
  return "cpamatica";
}

/**
 * Safe URL builder:
 * - Replaces macros
 * - Adds UTMs
 * - Fills partner params based on detected scheme
 */
function withTracking(url) {
  try {
    const vars = {
      clickId: getStoredClickId(),
      gclid: getStoredGclid(),
      source: getTrafficSource(),
      subSource: getSubSource(),
      sub4: "", // optional extra slot if you later need it
    };

    const replaced = replacePartnerMacros(url, vars);
    const u = new URL(replaced);

    // Default UTMs (keep existing if already present)
    if (!u.searchParams.get("utm_source")) u.searchParams.set("utm_source", vars.source);
    if (!u.searchParams.get("utm_medium")) u.searchParams.set("utm_medium", "site");
    if (!u.searchParams.get("utm_campaign")) u.searchParams.set("utm_campaign", "offers");

    const scheme = detectPartnerScheme(u);

    if (scheme === "vortex_sub") {
      // Vortex screenshot mapping:
      // sub1 = click id, sub2 = sub-2, sub3 = source, sub5 = sub source
      setIfMissing(u, "sub1", vars.clickId);
      setIfMissing(u, "sub2", vars.gclid);
      setIfMissing(u, "sub3", vars.source);
      setIfMissing(u, "sub4", vars.sub4);
      setIfMissing(u, "sub5", vars.subSource);
    } else if (scheme === "mylead") {
      // MyLead: ml_sub1..ml_sub5
      setIfMissing(u, "ml_sub1", vars.clickId);
      setIfMissing(u, "ml_sub2", vars.gclid);
      setIfMissing(u, "ml_sub3", vars.source);
      setIfMissing(u, "ml_sub4", vars.sub4);
      setIfMissing(u, "ml_sub5", vars.subSource);
    } else if (scheme === "affilitex") {
      // Affilitex screenshot mapping:
      // click_id2..5 exist, token_1/2 are visible in stats
      setIfMissing(u, "click_id", vars.clickId);
      setIfMissing(u, "click_id2", vars.gclid);
      setIfMissing(u, "click_id3", vars.source);
      setIfMissing(u, "click_id4", vars.sub4);
      setIfMissing(u, "click_id5", vars.subSource);

      setIfMissing(u, "token_1", vars.gclid);
      setIfMissing(u, "token_2", vars.subSource);
    } else if (scheme === "aff_sub") {
      // Backward compatibility (your older networks)
      setIfMissing(u, "aff_sub1", vars.clickId);
      setIfMissing(u, "aff_sub2", vars.gclid);
      setIfMissing(u, "aff_sub3", vars.source);
      setIfMissing(u, "aff_sub5", vars.subSource);

      // Also set Cpamatica style (harmless if ignored)
      setIfMissing(u, "click_id", vars.clickId);
      setIfMissing(u, "source", `${vars.source}:${vars.subSource}`);
    } else {
      // Cpamatica: click_id + source (traffic source should be stored inside source param)
      setIfMissing(u, "click_id", vars.clickId);
      setIfMissing(u, "source", `${vars.source}:${vars.subSource}`);
    }

    // Optional debug params (safe)
    if (vars.clickId && !u.searchParams.get("dbg_click_id")) u.searchParams.set("dbg_click_id", vars.clickId);
    if (vars.gclid && !u.searchParams.get("dbg_gclid")) u.searchParams.set("dbg_gclid", vars.gclid);

    return u.toString();
  } catch {
    return url;
  }
}

function RatingStars({ rating }) {
  const raw = Number(rating) || 0;
  const value = Math.max(0, Math.min(5, raw));
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5 && full < 5;
  const total = 5;

  const stars = [];
  for (let i = 0; i < total; i++) {
    let cls = "text-slate-500";
    if (i < full) cls = "text-amber-400";
    else if (i === full && hasHalf) cls = "text-amber-300";
    stars.push(
      <span key={i} className={cn("text-base", cls)}>
        ★
      </span>
    );
  }

  return (
    <div className="inline-flex flex-col items-end text-right gap-1">
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 border border-slate-700 px-3 py-1">
        <div className="flex items-center gap-0.5 leading-none">{stars}</div>
        <span className="text-[11px] font-semibold text-slate-100">{value.toFixed(1)} / 5</span>
      </div>
      <span className="text-[10px] text-slate-400 uppercase tracking-[0.16em]">Trust score</span>
    </div>
  );
}

function isTopChoice(index) {
  return index === 0;
}

/* ---------- Offer card (wide logos) ---------- */
function WebcamOfferCard({ offer, index }) {
  const cleanName = (offer.name || "").replace(/\.com$/i, "");
  const shortFeatures = Array.isArray(offer.features) ? offer.features.slice(0, 2) : [];
  const category = offer.bestFor ? offer.bestFor.charAt(0).toUpperCase() + offer.bestFor.slice(1) : null;

  const finalUrl = withTracking(offer.affiliateUrl || "");
  const isTop = isTopChoice(index);
  const previewSrc = offer.preview || null;

  return (
    <div
      className={cn(
        "group relative rounded-3xl p-[1px] bg-gradient-to-br",
        isTop ? "from-pink-500/60 via-rose-400/50 to-amber-400/40" : offer.color || "from-slate-800/80 to-slate-900/80"
      )}
    >
      {isTop && (
        <div className="pointer-events-none absolute -top-3 left-5 z-40">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                       bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400
                       text-[11px] font-extrabold tracking-wide uppercase text-white
                       shadow-[0_4px_18px_rgba(248,113,131,0.65)]
                       border border-white/40"
          >
            <span className="h-2 w-2 rounded-full bg-black/30" />
            Top choice
          </div>
        </div>
      )}

      <div
        className="relative z-20 rounded-3xl bg-slate-950/95 backdrop-blur-sm border border-slate-800
                   overflow-hidden p-5 sm:p-6 group-hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]
                   transition-shadow duration-300"
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch">
          <div className="flex-shrink-0 w-full sm:w-60 md:w-72">
            <div className="h-28 sm:h-28 md:h-32 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden shadow-inner flex items-center justify-center">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt={`${cleanName} logo`}
                  className="max-h-full max-w-full object-contain px-3 py-2"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-900">
                  <span className="text-xs font-semibold text-slate-500">Partner logo</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-[0] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.18em]">#{index + 1}</span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-50 truncate">{cleanName}</h3>
                </div>

                {category && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-700 px-3 py-1 text-[11px] text-slate-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                      Best for: <span className="font-medium">{category}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 sm:mt-0 self-start sm:self-auto">
                <RatingStars rating={offer.rating} />
              </div>
            </div>

            <div className="space-y-2">
              {offer.usp && <p className="text-sm text-slate-200 leading-relaxed">{offer.usp}</p>}

              {shortFeatures.length > 0 && (
                <ul className="text-[13px] text-slate-200 grid gap-1.5">
                  {shortFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pink-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-3">
              <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold
                           bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white
                           shadow-[0_18px_45px_-24px_rgba(0,0,0,0.9)]
                           hover:brightness-105 active:scale-95 transition"
              >
                Visit site <span className="ml-2 text-xs">↗</span>
              </a>

              <p className="text-[11px] text-slate-400 sm:ml-1">External partner site</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page component ---------- */
export default function WebcamPage() {
  const sortedByRating = useMemo(() => {
    let list = Array.isArray(WEBCAM_OFFERS) ? WEBCAM_OFFERS.slice(0) : [];
    list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    return list;
  }, []);

  return (
    <>
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <header className="sticky top-0 z-20 bg-slate-950/90 border-b border-slate-800 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="h-8 w-8 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                <img src="/logo.svg" className="h-5 w-5" alt="MatchFinderGuide" />
              </div>

              <div className="flex flex-col leading-tight">
                <span className="text-xs font-semibold text-slate-200">
                  MatchFinder<span className="text-pink-400">Guide</span>
                </span>
                <span className="text-[10px] text-slate-500">Partner offers</span>
              </div>
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-4 pt-4 pb-10">
          <div className="mb-4 space-y-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-pink-400">Trusted partners</p>

            <h1 className="text-xl font-bold text-slate-50">Top Offers — Safe, Popular &amp; Easy to Explore</h1>

            <p className="text-xs text-slate-400 max-w-xl">
              Browse trusted partner offers. We highlight easy-to-use platforms with smooth experiences and clear value.
            </p>
          </div>

          <div className="space-y-5">
            {sortedByRating.map((offer, index) => (
              <WebcamOfferCard key={offer.name || index} offer={offer} index={index} />
            ))}
          </div>

          <p className="mt-6 text-[11px] text-slate-500">
            We may earn a commission when you sign up through our links. Please review each partner’s terms and privacy
            policy before using.
          </p>
        </section>
      </main>

      <CookieConsent />
      <Analytics />
    </>
  );
}