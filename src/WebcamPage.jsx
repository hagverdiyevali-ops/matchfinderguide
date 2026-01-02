// src/WebcamPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CookieConsent from "./CookieConsent.jsx";
import { Analytics } from "@vercel/analytics/react";
import WEBCAM_OFFERS from "./webcamOffers.js";

/* ---------- small helpers ---------- */
const cn = (...c) => c.filter(Boolean).join(" ");

const CLICK_ID_KEY = "mfg_click_id";
const GCLID_KEY = "mfg_gclid";

// optional (safe even if never set)
const FBCLID_KEY = "mfg_fbclid";
const TTCLID_KEY = "mfg_ttclid";

/* ---------- COPY (edit freely) ---------- */
const COPY = {
  HERO_KICKER: "Tilbud på live videochat",
  HERO_HEADLINE: "Sammenlign live chat-plattformer",
  HERO_SUBLINE: "Sorter etter vurdering og funksjoner. Åpnes i ny fane.",
  CTA_LABEL: "Registrer deg",
  CTA_LABEL_MOBILE: "Registrer",
  SEARCH_PLACEHOLDER: "Søk etter privat rom, tilfeldig chat, direkte…",

  MOBILE_FILTER_OPEN: "Vis filtre",
  MOBILE_FILTER_CLOSE: "Skjul filtre",

  BLOG_TITLE: "Slik velger du riktig live chat-plattform: en trygg og smart guide",
  BLOG_KICKER: "En liten guide før du klikker deg videre",
};

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
function getStoredFbclid() {
  return getStored(FBCLID_KEY);
}
function getStoredTtclid() {
  return getStored(TTCLID_KEY);
}

function getTrafficSource() {
  return "matchfinderguide";
}
function getSubSource() {
  return "search-traffic";
}

/**
 * Supports both:
 * - {click_id}/{sub1} style macros (your existing partners)
 * - #leadid#/#s1#/#utm_source# style tokens (new partner token system)
 */
function replacePartnerMacros(rawUrl, vars) {
  let out = String(rawUrl || "");
  const rep = (k, v) => (out = out.replaceAll(k, encodeURIComponent(v ?? "")));

  // Existing curly macros
  rep("{click_id}", vars.clickId);
  rep("{gclid}", vars.gclid);
  rep("{source}", vars.source);
  rep("{sub_source}", vars.subSource);

  rep("{sub1}", vars.clickId);
  rep("{sub2}", vars.gclid);
  rep("{sub3}", vars.source);
  rep("{sub4}", vars.sub4 || "");
  rep("{sub5}", vars.subSource);

  rep("{ml_sub1}", vars.clickId);
  rep("{ml_sub2}", vars.gclid);
  rep("{ml_sub3}", vars.source);
  rep("{ml_sub4}", vars.sub4 || "");
  rep("{ml_sub5}", vars.subSource);

  rep("{click_id2}", vars.gclid);
  rep("{click_id3}", vars.source);
  rep("{click_id4}", vars.sub4 || "");
  rep("{click_id5}", vars.subSource);
  rep("{token_1}", vars.gclid);
  rep("{token_2}", vars.subSource);

  // Hash token system
  rep("#leadid#", vars.clickId);
  rep("#affid#", vars.affid || "");
  rep("#oid#", vars.oid || "");
  rep("#campid#", vars.campid || vars.utmCampaign || "webcam_offers");
  rep("#cid#", vars.cid || vars.subSource || "");
  rep("#tid#", vars.tid || "");

  rep("#s1#", vars.clickId);
  rep("#s2#", vars.gclid);
  rep("#s3#", vars.source);
  rep("#s4#", vars.sub4 || "");
  rep("#s5#", vars.subSource);

  rep("#fbclid#", vars.fbclid || "");
  rep("#ttclid#", vars.ttclid || "");
  rep("#gclid#", vars.gclid || "");
  rep("#xclid#", vars.xclid || vars.clickId || "");

  rep("#utm_source#", vars.utmSource || vars.source);
  rep("#utm_medium#", vars.utmMedium || "site");
  rep("#utm_campaign#", vars.utmCampaign || "webcam_offers");
  rep("#utm_term#", vars.utmTerm || "");
  rep("#utm_content#", vars.utmContent || "");

  return out;
}

function setIfMissing(u, key, value) {
  if (value === undefined || value === null || String(value).trim() === "") return;

  const cur = u.searchParams.get(key);
  const looksPlaceholder =
    !cur ||
    cur.includes("{") ||
    cur.includes("#") ||
    cur === "FOR_SUB1" ||
    cur === "FOR_SUB2" ||
    cur === "FOR_CLICKID";

  if (looksPlaceholder) u.searchParams.set(key, value);
}

function detectPartnerScheme(u) {
  const has = (k) => u.searchParams.has(k);

  if (has("ml_sub1") || has("ml_sub2") || has("ml_sub3") || has("ml_sub4") || has("ml_sub5"))
    return "mylead";
  if (
    has("click_id2") ||
    has("click_id3") ||
    has("click_id4") ||
    has("click_id5") ||
    has("token_1") ||
    has("token_2")
  )
    return "affilitex";
  if (has("sub1") || has("sub2") || has("sub3") || has("sub4") || has("sub5")) return "vortex_sub";
  if (has("aff_sub1") || has("aff_sub2") || has("aff_sub3") || has("aff_sub5")) return "aff_sub";
  if (has("click_id") || has("source")) return "cpamatica";

  const host = (u.hostname || "").toLowerCase();
  if (host.includes("cdsecure-dt.com")) return "cdsecure";
  if (host.includes("afftrk06.com")) return "affilitex";
  if (host.includes(".today")) return "vortex_sub";
  if (host.includes("cm-trk6.com")) return "aff_sub";

  return "cpamatica";
}

function withTracking(url) {
  try {
    const vars = {
      clickId: getStoredClickId(),
      gclid: getStoredGclid(),
      fbclid: getStoredFbclid(),
      ttclid: getStoredTtclid(),
      xclid: getStoredClickId(),

      source: getTrafficSource(),
      subSource: getSubSource(),
      sub4: "",

      utmSource: getTrafficSource(),
      utmMedium: "site",
      utmCampaign: "webcam_offers",
      utmTerm: "",
      utmContent: "",
    };

    const replaced = replacePartnerMacros(url, vars);
    const u = new URL(replaced);

    if (!u.searchParams.get("utm_source")) u.searchParams.set("utm_source", vars.utmSource);
    if (!u.searchParams.get("utm_medium")) u.searchParams.set("utm_medium", vars.utmMedium);
    if (!u.searchParams.get("utm_campaign")) u.searchParams.set("utm_campaign", vars.utmCampaign);

    const scheme = detectPartnerScheme(u);

    if (scheme === "vortex_sub") {
      setIfMissing(u, "sub1", vars.clickId);
      setIfMissing(u, "sub2", vars.gclid);
      setIfMissing(u, "sub3", vars.source);
      setIfMissing(u, "sub4", vars.sub4);
      setIfMissing(u, "sub5", vars.subSource);
    } else if (scheme === "mylead") {
      setIfMissing(u, "ml_sub1", vars.clickId);
      setIfMissing(u, "ml_sub2", vars.gclid);
      setIfMissing(u, "ml_sub3", vars.source);
      setIfMissing(u, "ml_sub4", vars.sub4);
      setIfMissing(u, "ml_sub5", vars.subSource);
    } else if (scheme === "affilitex") {
      setIfMissing(u, "click_id", vars.clickId);
      setIfMissing(u, "click_id2", vars.gclid);
      setIfMissing(u, "click_id3", vars.source);
      setIfMissing(u, "click_id4", vars.sub4);
      setIfMissing(u, "click_id5", vars.subSource);

      setIfMissing(u, "token_1", vars.gclid);
      setIfMissing(u, "token_2", vars.subSource);
    } else if (scheme === "aff_sub") {
      setIfMissing(u, "aff_sub1", vars.clickId);
      setIfMissing(u, "aff_sub2", vars.gclid);
      setIfMissing(u, "aff_sub3", vars.source);
      setIfMissing(u, "aff_sub5", vars.subSource);

      setIfMissing(u, "click_id", vars.clickId);
      setIfMissing(u, "source", `${vars.source}:${vars.subSource}`);
    } else if (scheme === "cdsecure") {
      setIfMissing(u, "s1", vars.clickId);
      setIfMissing(u, "s2", vars.gclid);
      setIfMissing(u, "s3", vars.source);
      setIfMissing(u, "s4", vars.sub4);
      setIfMissing(u, "s5", vars.subSource);

      setIfMissing(u, "gclid", vars.gclid);
      setIfMissing(u, "xclid", vars.clickId);
      setIfMissing(u, "fbclid", vars.fbclid);
      setIfMissing(u, "ttclid", vars.ttclid);

      setIfMissing(u, "utm_source", vars.utmSource);
      setIfMissing(u, "utm_medium", vars.utmMedium);
      setIfMissing(u, "utm_campaign", vars.utmCampaign);
    } else {
      setIfMissing(u, "click_id", vars.clickId);
      setIfMissing(u, "source", `${vars.source}:${vars.subSource}`);
    }

    if (vars.clickId && !u.searchParams.get("dbg_click_id")) u.searchParams.set("dbg_click_id", vars.clickId);
    if (vars.gclid && !u.searchParams.get("dbg_gclid")) u.searchParams.set("dbg_gclid", vars.gclid);

    return u.toString();
  } catch {
    return url;
  }
}

/* ---------- Opt-in popup ---------- */
function OptInPopup({ open, variant = "doi", onClose, autoCloseMs = 30000 }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), autoCloseMs);
    return () => clearTimeout(t);
  }, [open, autoCloseMs, onClose]);

  if (!open) return null;

  const content =
    variant === "doi"
      ? {
          title: "Én siste ting ✅",
          body: "På neste side må du skrive inn e-post og bekrefte den for å aktivere profilen.",
          hint: "Sjekk Søppelpost/Kampanjer hvis du ikke finner e-posten.",
        }
      : {
          title: "Nesten i mål ✅",
          body: "På neste side skriver du bare inn e-posten din. Ingen bekreftelse nødvendig.",
          hint: "Tips: Bruk en ekte e-post så du ikke går glipp av meldinger.",
        };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4" role="dialog">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-black/10 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base sm:text-lg font-semibold text-slate-900">{content.title}</div>
              <div className="mt-2 text-sm sm:text-[15px] leading-relaxed text-slate-700">{content.body}</div>
              <div className="mt-3 text-xs sm:text-sm text-slate-600">{content.hint}</div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-xl px-3 py-1.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800"
              aria-label="Lukk"
            >
              Lukk
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-slate-500">Du kan fortsette i den nye fanen.</div>
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800"
            >
              Skjønner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI bits ---------- */
function RatingStars({ rating, compact = false }) {
  const raw = Number(rating) || 0;
  const value = Math.max(0, Math.min(5, raw));
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5 && full < 5;

  const stars = [];
  for (let i = 0; i < 5; i++) {
    let cls = "text-slate-600";
    if (i < full) cls = "text-amber-400";
    else if (i === full && hasHalf) cls = "text-amber-300";
    stars.push(
      <span key={i} className={cn(compact ? "text-[12px]" : "text-base", "leading-none", cls)}>
        ★
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">{stars}</div>
      <span className={cn(compact ? "text-[11px]" : "text-[12px]", "font-semibold text-slate-100")}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function MobileMiniFeatures({ offer }) {
  const chips = [];
  if (offer.randomChat) chips.push({ key: "tilf", label: "🎲" });
  if (offer.freePrivateShows) chips.push({ key: "priv", label: "🔒" });
  if (offer.instantMatch) chips.push({ key: "inst", label: "⚡" });
  if (chips.length === 0) return null;

  return (
    <div className="mt-1 flex items-center gap-1.5">
      {chips.slice(0, 2).map((c) => (
        <span
          key={c.key}
          className="inline-flex items-center justify-center rounded-full border border-slate-800 bg-slate-950/40 h-5 w-6 text-[11px] text-slate-200"
          title="Funksjon"
        >
          {c.label}
        </span>
      ))}
      <span className="text-[10px] text-slate-500">Funksjoner</span>
    </div>
  );
}

/* ✅ Mobile row: compact + CTA visible (NO DOI/SOI LABELS) */
function MobileOfferRow({ offer, index, onOfferGuide }) {
  const cleanName = (offer.name || "").replace(/\.com$/i, "");
  const finalUrl = withTracking(offer.affiliateUrl || "");
  const logo = offer.preview || null;

  function openOffer() {
    window.open(finalUrl, "_blank", "noopener,noreferrer");
    onOfferGuide?.(offer);
  }
  function onRowKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openOffer();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openOffer}
      onKeyDown={onRowKeyDown}
      className={cn(
        "w-full rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur",
        "px-3 py-2.5 active:scale-[0.99] transition cursor-pointer"
      )}
      aria-label={`${cleanName} – åpne tilbud`}
    >
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
          {logo ? (
            <img src={logo} alt={`${cleanName} logo`} className="h-full w-full object-contain p-1" loading="lazy" />
          ) : (
            <span className="text-[10px] text-slate-500">Logo</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[13px] font-extrabold text-slate-50 truncate">
                #{index + 1} {cleanName}
              </div>

              {offer.bestFor ? (
                <div className="mt-0.5 text-[11px] text-slate-400 truncate">{offer.bestFor}</div>
              ) : null}

              <div className="mt-1 flex items-center gap-2">
                <RatingStars rating={offer.rating} compact />
                <MobileMiniFeatures offer={offer} />
              </div>

              {/* keep 1 line only to save height */}
              {offer.usp ? <div className="mt-1 text-[11px] text-slate-500 truncate">{offer.usp}</div> : null}
            </div>

            {/* ✅ CTA always visible */}
            <div className="shrink-0 flex flex-col items-end gap-1">
              <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  onOfferGuide?.(offer);
                }}
                className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-[11px] font-extrabold
                           bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white
                           shadow-[0_16px_40px_-26px_rgba(0,0,0,0.95)]
                           active:scale-95 transition"
              >
                {COPY.CTA_LABEL_MOBILE} <span className="ml-1 text-[11px]">↗</span>
              </a>
              <span className="text-[10px] text-slate-500">Ny fane</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Desktop UI ---------- */
function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-slate-900/70 border-slate-700 text-slate-100",
    pink: "bg-pink-500/10 border-pink-500/30 text-pink-200",
    amber: "bg-amber-400/10 border-amber-300/30 text-amber-100",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px]",
        tones[tone] || tones.neutral
      )}
    >
      {children}
    </span>
  );
}

function isTopChoice(index) {
  return index === 0;
}

function FeatureIcons({ offer }) {
  const items = [];
  if (offer.randomChat) items.push({ key: "tilfeldig", label: "Tilfeldig Treff", icon: "🎲" });
  if (offer.freePrivateShows) items.push({ key: "privat", label: "Private Rom", icon: "🔒" });
  if (offer.instantMatch) items.push({ key: "øyeblikkelig", label: "Øyeblikkelig Start", icon: "⚡" });
  if (items.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {items.map((it) => (
        <span
          key={it.key}
          className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/50 px-3 py-1 text-[11px] text-slate-200"
          title={it.label}
        >
          <span className="text-[12px]">{it.icon}</span>
          <span className="font-medium">{it.label}</span>
        </span>
      ))}
    </div>
  );
}

function OfferBadgeRow({ offer, index }) {
  const category = offer.bestFor ? offer.bestFor.charAt(0).toUpperCase() + offer.bestFor.slice(1) : null;
  const isTop = isTopChoice(index);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isTop && <Pill tone="pink">🔥 Toppvalg</Pill>}
      {category && (
        <Pill tone="neutral">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
          Best for: <span className="font-medium">{category}</span>
        </Pill>
      )}
      {Number(offer.rating) >= 4.5 && <Pill tone="amber">Høyt vurdert</Pill>}
    </div>
  );
}

function WebcamOfferCard({ offer, index, onOfferGuide }) {
  const cleanName = (offer.name || "").replace(/\.com$/i, "");
  const shortFeatures = Array.isArray(offer.features) ? offer.features.slice(0, 3) : [];
  const finalUrl = withTracking(offer.affiliateUrl || "");
  const logo = offer.preview || null;
  const cover = offer.cover || null;
  const isTop = isTopChoice(index);

  const optIn = (offer?.optInType || "soi").toLowerCase() === "doi" ? "doi" : "soi";
  const ctaHint =
    optIn === "doi"
      ? "Skriv inn e-post og bekreft for å låse opp matcher."
      : "Skriv inn e-post for å låse opp matcher.";

  function onCardClick(e) {
    const interactive = e.target.closest?.("a, button, input, select, textarea, label");
    if (interactive) return;
    window.open(finalUrl, "_blank", "noopener,noreferrer");
    onOfferGuide?.(offer);
  }
  function onCardKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.open(finalUrl, "_blank", "noopener,noreferrer");
      onOfferGuide?.(offer);
    }
  }

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`${cleanName} – åpne tilbud`}
      onClick={onCardClick}
      onKeyDown={onCardKeyDown}
      className={cn(
        "group relative rounded-3xl p-[1px] bg-gradient-to-br cursor-pointer",
        isTop
          ? "from-pink-500/60 via-rose-400/50 to-amber-400/40"
          : offer.color || "from-slate-800/80 to-slate-900/80"
      )}
    >
      <div className="relative rounded-3xl overflow-hidden bg-slate-950/92 border border-slate-800">
        {cover && (
          <div className="absolute inset-0">
            <img src={cover} alt="" className="h-full w-full object-cover opacity-25 scale-[1.02]" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/30" />
          </div>
        )}

        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-[520px] rounded-full bg-pink-500/10 blur-3xl" />

        <div className="relative z-10 p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
            <div className="flex-shrink-0 w-full lg:w-72">
              <div className="h-24 sm:h-28 rounded-2xl bg-slate-900/70 border border-slate-700/70 overflow-hidden shadow-inner flex items-center justify-center">
                {logo ? (
                  <img
                    src={logo}
                    alt={`${cleanName} logo`}
                    className="max-h-full max-w-full object-contain px-4 py-2"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-500">Partner logo</span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.22em] text-slate-500">#{index + 1}</span>
                <RatingStars rating={offer.rating} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-50 truncate">{cleanName}</h3>
                  <p className="mt-1 text-[13px] text-slate-300 max-w-2xl leading-relaxed">
                    {offer.usp ||
                      "Sammenlign dette tilbudet raskt ved hjelp av vurdering, kategori og nøkkelfunksjoner."}
                  </p>

                  <FeatureIcons offer={offer} />
                </div>

                <div className="hidden sm:flex flex-col items-end gap-2">
                  <a
                    href={finalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onOfferGuide?.(offer)}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold
                               bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white
                               shadow-[0_18px_45px_-24px_rgba(0,0,0,0.9)]
                               hover:brightness-105 active:scale-95 transition"
                  >
                    {COPY.CTA_LABEL} <span className="ml-2 text-xs">↗</span>
                  </a>
                  {/* ✅ keep guidance text, but no DOI/SOI words */}
                  <span className="text-[11px] text-slate-500">{ctaHint}</span>
                </div>
              </div>

              <div className="mt-3">
                <OfferBadgeRow offer={offer} index={index} />
              </div>

              {shortFeatures.length > 0 && (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-[13px] text-slate-200">
                  {shortFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-pink-400" />
                      <span className="min-w-0">{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 sm:hidden">
                <a
                  href={finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onOfferGuide?.(offer)}
                  className="w-full inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold
                             bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white
                             shadow-[0_18px_45px_-24px_rgba(0,0,0,0.9)]
                             hover:brightness-105 active:scale-95 transition"
                >
                  {COPY.CTA_LABEL} <span className="ml-2 text-xs">↗</span>
                </a>
                {/* ✅ keep guidance text, but no DOI/SOI words */}
                <p className="mt-2 text-[11px] text-slate-500">{ctaHint}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              Tips: sammenlign plattformer etter <span className="text-slate-300">vurdering</span>,{" "}
              <span className="text-slate-300">kategori</span>, og ikoner.
            </div>
            <div className="text-[11px] text-slate-500">Opplysning: Vi kan tjene provisjon fra partnerlenker.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page component ---------- */
export default function WebcamPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [onlyTop, setOnlyTop] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortMode, setSortMode] = useState("rating_desc");

  // ✅ mobile-only filters toggle (keeps offers visible first)
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ✅ match Tailwind sm breakpoint
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = () => setIsMobile(!!mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // ✅ popup state
  const [optInPopup, setOptInPopup] = useState({ open: false, variant: "doi" });

  // Hero/blog visuals
  const heroSrc = `${import.meta.env.BASE_URL}hero-webcam.jpg`;
  const [heroOk, setHeroOk] = useState(true);

  const blogVisualSrc = `${import.meta.env.BASE_URL}blog-romantic.jpg`;
  const [blogImgOk, setBlogImgOk] = useState(true);

  const categories = useMemo(() => {
    const set = new Set();
    (Array.isArray(WEBCAM_OFFERS) ? WEBCAM_OFFERS : []).forEach((o) => {
      if (o?.bestFor) set.add(String(o.bestFor).toLowerCase());
    });
    return ["all", ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    let list = Array.isArray(WEBCAM_OFFERS) ? WEBCAM_OFFERS.slice(0) : [];
    const q = query.trim().toLowerCase();

    if (q) {
      list = list.filter((o) => {
        const hay = `${o?.name || ""} ${o?.usp || ""} ${(o?.features || []).join(" ")} ${
          o?.randomChat ? "tilfeldig match tilfeldig chat rulett" : ""
        } ${o?.freePrivateShows ? "private rom private forestillinger" : ""} ${
          o?.instantMatch ? "øyeblikkelig match" : ""
        }`.toLowerCase();
        return hay.includes(q);
      });
    }

    if (category !== "all") list = list.filter((o) => String(o?.bestFor || "").toLowerCase() === category);
    if (minRating > 0) list = list.filter((o) => (Number(o?.rating) || 0) >= minRating);

    if (sortMode === "name_asc")
      list.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
    else list.sort((a, b) => (Number(b?.rating) || 0) - (Number(a?.rating) || 0));

    if (onlyTop) list = list.slice(0, 1);
    return list;
  }, [query, category, onlyTop, minRating, sortMode]);

  function onOfferGuide(offer) {
    const t = (offer?.optInType || "soi").toLowerCase() === "doi" ? "doi" : "soi";
    setOptInPopup({ open: true, variant: t });
  }

  return (
    <>
      <main className="min-h-screen bg-slate-950 text-slate-50">
        {/* Background visuals */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[920px] rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute top-40 right-[-120px] h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute bottom-[-120px] left-[-120px] h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(236,72,153,0.08),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(251,191,36,0.06),transparent_45%),radial-gradient(circle_at_50%_90%,rgba(244,63,94,0.07),transparent_55%)]" />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-950/85 border-b border-slate-800/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-2 sm:py-3 flex items-center justify-between gap-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                <img src="/logo.svg" className="h-5 w-5" alt="MatchFinderGuide" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-semibold text-slate-200">
                  MatchFinder<span className="text-pink-400">Guide</span>
                </span>
                <span className="text-[10px] text-slate-500">Norway • Offers</span>
              </div>
            </Link>

            <div className="hidden sm:flex items-center gap-2">
              <Pill tone="neutral">🎲 Tilfeldig treff</Pill>
              <Pill tone="neutral">🔒 Private rom</Pill>
              <Pill tone="neutral">⚡ Øyeblikkelig start</Pill>
            </div>

            {isMobile && (
              <button
                type="button"
                onClick={() => setShowMobileFilters((s) => !s)}
                className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-[11px] font-semibold text-slate-200"
              >
                {showMobileFilters ? COPY.MOBILE_FILTER_CLOSE : COPY.MOBILE_FILTER_OPEN}
              </button>
            )}
          </div>
        </header>

        {/* Hero (slim on mobile so 3 offers fit) */}
        <section className="mx-auto max-w-6xl px-4 pt-2 sm:pt-7 pb-2 sm:pb-6">
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/60 backdrop-blur">
            <div className="relative h-20 sm:h-52 md:h-56">
              {heroOk ? (
                <img
                  src={heroSrc}
                  alt="Hero"
                  className="h-full w-full object-cover opacity-85"
                  loading="eager"
                  onError={() => setHeroOk(false)}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-slate-950 via-purple-900/30 to-pink-900/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 p-4 sm:p-8">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-pink-400">{COPY.HERO_KICKER}</p>
              <h1 className="mt-1 text-[17px] sm:text-3xl font-extrabold text-slate-50 leading-snug">
                {COPY.HERO_HEADLINE}
              </h1>
              <p className="mt-1 hidden sm:block text-sm text-slate-300 max-w-2xl leading-relaxed">{COPY.HERO_SUBLINE}</p>

              <div className={cn("mt-3 sm:mt-6", isMobile ? (showMobileFilters ? "block" : "hidden") : "block")}>
                <div className="grid gap-3 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    <label className="block text-[11px] text-slate-500 mb-1">Search</label>
                    <div className="flex items-center rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2">
                      <span className="text-slate-500 mr-2">⌕</span>
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={COPY.SEARCH_PLACEHOLDER}
                        className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-3">
                    <label className="block text-[11px] text-slate-500 mb-1">Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-[11px] text-slate-500 mb-1">Minimumsvurdering</label>
                    <select
                      value={minRating}
                      onChange={(e) => setMinRating(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none"
                    >
                      <option value={0}>Any</option>
                      <option value={4.0}>4.0+</option>
                      <option value={4.3}>4.3+</option>
                      <option value={4.5}>4.5+</option>
                      <option value={4.7}>4.7+</option>
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-[11px] text-slate-500 mb-1">Sortere</label>
                    <select
                      value={sortMode}
                      onChange={(e) => setSortMode(e.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none"
                    >
                      <option value="rating_desc">Vurdering (høy → lav)</option>
                      <option value="name_asc">Navn (A → Å)</option>
                    </select>
                  </div>

                  <div className="lg:col-span-12 flex flex-wrap items-center justify-between gap-3 pt-1">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={onlyTop}
                        onChange={(e) => setOnlyTop(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-950"
                      />
                      Show only Top choice
                    </label>

                    <div className="text-[12px] text-slate-500">
                      Showing <span className="text-slate-200 font-semibold">{filtered.length}</span>{" "}
                      {filtered.length === 1 ? "tilby" : "tilbud"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Offers */}
        <section className="mx-auto max-w-6xl px-4 pb-10">
          {isMobile ? (
            <div className="space-y-2">
              {filtered.map((offer, index) => (
                <MobileOfferRow key={offer.name || index} offer={offer} index={index} onOfferGuide={onOfferGuide} />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {filtered.map((offer, index) => (
                <WebcamOfferCard key={offer.name || index} offer={offer} index={index} onOfferGuide={onOfferGuide} />
              ))}
            </div>
          )}

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/60 backdrop-blur p-6">
            <h2 className="text-base font-bold text-slate-50">Åpenhet &amp; sikkerhetsmerknader</h2>
            <ul className="mt-3 grid gap-2 text-[13px] text-slate-300">
              <li className="flex gap-2">
                <span className="text-pink-400 mt-0.5">•</span>
                Lenker åpner eksterne partnernettsteder. Les vilkår og personvern før du registrerer deg.
              </li>
              <li className="flex gap-2">
                <span className="text-pink-400 mt-0.5">•</span>
                Vi kan tjene provisjon når du blir medlem via lenkene våre.
              </li>
              <li className="flex gap-2">
                <span className="text-pink-400 mt-0.5">•</span>
                Vurderinger og ikoner er indikatorer (ikke garanti). Sammenlign funksjoner som betyr noe for deg.
              </li>
            </ul>
          </div>

          {/* ✅ Blog kept at bottom */}
          <article className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/60 backdrop-blur overflow-hidden">
            <div className="relative h-36 sm:h-56">
              {blogImgOk ? (
                <img
                  src={blogVisualSrc}
                  alt="Romantisk stemning"
                  className="h-full w-full object-cover opacity-90"
                  loading="lazy"
                  onError={() => setBlogImgOk(false)}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-slate-950 via-rose-900/25 to-pink-900/25" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />

              <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/55 px-4 py-2 text-[11px] text-slate-200">
                  <span className="text-[12px]">💞</span>
                  <span className="uppercase tracking-[0.22em] text-slate-300">{COPY.BLOG_KICKER}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-50">{COPY.BLOG_TITLE}</h2>

              <p className="mt-3 text-[13px] sm:text-sm text-slate-300 leading-relaxed">
                Live chat- og videochat-plattformer kan være en rask måte å møte nye mennesker på, men kvaliteten
                varierer mye. Noen tjenester har gode filtre, klare vilkår og en ryddig brukeropplevelse – mens andre kan
                føles rotete eller utrygge. Her er en enkel guide som hjelper deg å sammenligne plattformer basert på
                funksjoner, vurderinger og personvern.
              </p>

              <div className="mt-5 space-y-4">
                <section>
                  <h3 className="text-sm font-bold text-slate-100">1) Start med hva du faktisk vil ha</h3>
                  <p className="mt-1 text-[13px] text-slate-300 leading-relaxed">
                    Bestem deg for én ting: hva er målet ditt? Tilfeldig chat passer hvis du vil møte nye personer raskt,
                    private rom passer hvis du vil ha mer kontroll, og øyeblikkelig start er best når du vil komme i gang
                    uten mye oppsett.
                  </p>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-100">2) Se etter tydelige tegn på kvalitet</h3>
                  <ul className="mt-2 grid gap-2 text-[13px] text-slate-300">
                    <li className="flex gap-2">
                      <span className="text-pink-400 mt-0.5">•</span>
                      Tydelige vilkår og personvernpolicy
                    </li>
                    <li className="flex gap-2">
                      <span className="text-pink-400 mt-0.5">•</span>
                      Stabil opplevelse på mobil
                    </li>
                    <li className="flex gap-2">
                      <span className="text-pink-400 mt-0.5">•</span>
                      Klare beskrivelser av funksjoner og kostnader
                    </li>
                    <li className="flex gap-2">
                      <span className="text-pink-400 mt-0.5">•</span>
                      Innstillinger for blokkering/rapportering
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-100">3) Vurdering er nyttig – men ikke hele sannheten</h3>
                  <p className="mt-1 text-[13px] text-slate-300 leading-relaxed">
                    Vurderinger kan gi en rask pekepinn, men to plattformer kan ha lik score og likevel være ulike.
                    Kombiner derfor vurderingen med kategori (“best for”) og funksjoner som faktisk betyr noe for deg.
                  </p>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-100">4) Personvern og sikkerhet: små vaner som hjelper</h3>
                  <ul className="mt-2 grid gap-2 text-[13px] text-slate-300">
                    <li className="flex gap-2">
                      <span className="text-pink-400 mt-0.5">•</span>
                      Bruk et sterkt passord (ikke samme som andre steder)
                    </li>
                    <li className="flex gap-2">
                      <span className="text-pink-400 mt-0.5">•</span>
                      Les vilkår før betaling/oppgradering
                    </li>
                    <li className="flex gap-2">
                      <span className="text-pink-400 mt-0.5">•</span>
                      Del ikke privat info tidlig (adresse, privat e-post osv.)
                    </li>
                    <li className="flex gap-2">
                      <span className="text-pink-400 mt-0.5">•</span>
                      Vær skeptisk til press eller “for gode” tilbud
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-100">Kort oppsummering</h3>
                  <p className="mt-1 text-[13px] text-slate-300 leading-relaxed">
                    Velg plattform etter behov, sjekk kvalitetssignaler, bruk vurderinger smart, og ha kontroll på
                    personverninnstillinger. Da får du en bedre og tryggere opplevelse.
                  </p>
                </section>
              </div>

              <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
            </div>
          </article>

          <p className="mt-6 text-[11px] text-slate-600">
            MatchFinderGuide er en plattform for å finne tilbud. Alle varemerker tilhører sine respektive eiere.
          </p>
        </section>
      </main>

      {/* Popup still used, but DOI/SOI is not shown on cards */}
      <OptInPopup
        open={optInPopup.open}
        variant={optInPopup.variant}
        onClose={() => setOptInPopup((s) => ({ ...s, open: false }))}
        autoCloseMs={30000}
      />

      <CookieConsent />
      <Analytics />
    </>
  );
}