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

function getStoredClickId() {
  try {
    return localStorage.getItem(CLICK_ID_KEY) || "";
  } catch {
    return "";
  }
}

function getStoredGclid() {
  try {
    return localStorage.getItem(GCLID_KEY) || "";
  } catch {
    return "";
  }
}

/**
 * Replace partner placeholders in any URL string.
 * Supports: {click_id}, {gclid}
 */
function replacePartnerMacros(rawUrl, clickId, gclid) {
  let out = String(rawUrl || "");
  if (clickId) out = out.replaceAll("{click_id}", encodeURIComponent(clickId));
  if (gclid) out = out.replaceAll("{gclid}", encodeURIComponent(gclid));
  return out;
}

/**
 * Safe URL builder:
 * - Replaces partner macros if present (aff_sub1={click_id}, aff_sub2={gclid})
 * - Adds UTMs if missing
 * - Ensures aff_sub1 & aff_sub2 are populated (recommended for postback + Google Ads mapping)
 * - Optionally keeps click_id/gclid params too (handy for debugging)
 */
function withTracking(url) {
  try {
    const clickId = getStoredClickId();
    const gclid = getStoredGclid();

    // 1) Replace placeholders like aff_sub1={click_id}
    const replaced = replacePartnerMacros(url, clickId, gclid);

    // 2) Parse and set query params safely
    const u = new URL(replaced);

    // default UTMs (keep existing if already present)
    if (!u.searchParams.get("utm_source"))
      u.searchParams.set("utm_source", "matchfinderguide");
    if (!u.searchParams.get("utm_medium"))
      u.searchParams.set("utm_medium", "site");
    if (!u.searchParams.get("utm_campaign"))
      u.searchParams.set("utm_campaign", "webcam_offers");

    // Partner tracking params (most important for postback)
    if (clickId) {
      const affSub1 = u.searchParams.get("aff_sub1");
      if (!affSub1 || affSub1 === "{click_id}") {
        u.searchParams.set("aff_sub1", clickId);
      }

      // optional debug param
      if (!u.searchParams.get("click_id")) {
        u.searchParams.set("click_id", clickId);
      }
    }

    if (gclid) {
      const affSub2 = u.searchParams.get("aff_sub2");
      if (!affSub2 || affSub2 === "{gclid}") {
        u.searchParams.set("aff_sub2", gclid);
      }

      // optional debug param
      if (!u.searchParams.get("gclid")) {
        u.searchParams.set("gclid", gclid);
      }
    }

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
        <span className="text-[11px] font-semibold text-slate-100">
          {value.toFixed(1)} / 5
        </span>
      </div>
      <span className="text-[10px] text-slate-400 uppercase tracking-[0.16em]">
        Trust score
      </span>
    </div>
  );
}

function isTopChoice(index) {
  return index === 0;
}

/* ---------- Webcam-specific offer card (wide logos) ---------- */
function WebcamOfferCard({ offer, index }) {
  const cleanName = (offer.name || "").replace(/\.com$/i, "");
  const shortFeatures = Array.isArray(offer.features)
    ? offer.features.slice(0, 2)
    : [];
  const category = offer.bestFor
    ? offer.bestFor.charAt(0).toUpperCase() + offer.bestFor.slice(1)
    : null;

  const finalUrl = withTracking(offer.affiliateUrl || "");
  const isTop = isTopChoice(index);
  const previewSrc = offer.preview || null;

  return (
    <div
      className={cn(
        "group relative rounded-3xl p-[1px] bg-gradient-to-br",
        isTop
          ? "from-pink-500/60 via-rose-400/50 to-amber-400/40"
          : offer.color || "from-slate-800/80 to-slate-900/80"
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
                  <span className="text-xs font-semibold text-slate-500">
                    Webcam site logo
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-[0] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.18em]">
                    #{index + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-50 truncate">
                    {cleanName}
                  </h3>
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
              {offer.usp && (
                <p className="text-sm text-slate-200 leading-relaxed">
                  {offer.usp}
                </p>
              )}

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

              <p className="text-[11px] text-slate-400 sm:ml-1">
                External partner site · 18+ only
              </p>
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
                <img
                  src="/logo.svg"
                  className="h-5 w-5"
                  alt="MatchFinderGuide"
                />
              </div>

              <div className="flex flex-col leading-tight">
                <span className="text-xs font-semibold text-slate-200">
                  MatchFinder<span className="text-pink-400">Guide</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  Live Webcam Sites
                </span>
              </div>
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-4 pt-4 pb-10">
          <div className="mb-4 space-y-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-pink-400">
              Trusted webcam platforms · 18+ only
            </p>

            <h1 className="text-xl font-bold text-slate-50">
              Best Webcam Sites — Safe, Popular &amp; Easy to Explore
            </h1>

            <p className="text-xs text-slate-400 max-w-xl">
              Browse reliable webcam platforms where you can connect, chat and
              enjoy live content safely. We highlight easy-to-use sites with
              active performers, smooth streaming and friendly communities.
            </p>
          </div>

          <div className="space-y-5">
            {sortedByRating.map((offer, index) => (
              <WebcamOfferCard
                key={offer.name || index}
                offer={offer}
                index={index}
              />
            ))}
          </div>

          <p className="mt-6 text-[11px] text-slate-500">
            These platforms are intended for adults 18+ only. We may earn a
            commission when you create an account through our links. Please
            review each platform’s safety, privacy and community guidelines
            before using.
          </p>
        </section>
      </main>

      <CookieConsent />
      <Analytics />
    </>
  );
}