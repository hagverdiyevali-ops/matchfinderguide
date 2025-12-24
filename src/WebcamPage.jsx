// src/WebcamPage.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CookieConsent from "./CookieConsent.jsx";
import { Analytics } from "@vercel/analytics/react";
import WEBCAM_OFFERS from "./webcamOffers.js";

/* ---------- small helpers ---------- */
const cn = (...c) => c.filter(Boolean).join(" ");

const CLICK_ID_KEY = "mfg_click_id";
const GCLID_KEY = "mfg_gclid";

/* ---------- COPY (edit freely) ---------- */
const COPY = {
  HERO_KICKER: "Live video chat offers",
  HERO_HEADLINE: "Compare top live chat platforms in minutes",
  HERO_SUBLINE: "Filter by ratings and features like random matching, instant start, and private rooms.",
  CTA_LABEL: "Register here", // <-- change to whatever you want in one place
  SEARCH_PLACEHOLDER: "Search random match, private rooms, instant chat…",
  FEATURE_STRIP: "Random match • Private rooms • Instant start",
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
function getTrafficSource() {
  return "matchfinderguide";
}
function getSubSource() {
  return "search-traffic";
}

function replacePartnerMacros(rawUrl, vars) {
  let out = String(rawUrl || "");
  const rep = (k, v) => (out = out.replaceAll(k, encodeURIComponent(v ?? "")));

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

  return out;
}

function setIfMissing(u, key, value) {
  if (value === undefined || value === null || String(value).trim() === "") return;

  const cur = u.searchParams.get(key);
  const looksPlaceholder =
    !cur || cur.includes("{") || cur === "FOR_SUB1" || cur === "FOR_SUB2" || cur === "FOR_CLICKID";

  if (looksPlaceholder) u.searchParams.set(key, value);
}

function detectPartnerScheme(u) {
  const has = (k) => u.searchParams.has(k);

  if (has("ml_sub1") || has("ml_sub2") || has("ml_sub3") || has("ml_sub4") || has("ml_sub5")) return "mylead";
  if (has("click_id2") || has("click_id3") || has("click_id4") || has("click_id5") || has("token_1") || has("token_2"))
    return "affilitex";
  if (has("sub1") || has("sub2") || has("sub3") || has("sub4") || has("sub5")) return "vortex_sub";
  if (has("aff_sub1") || has("aff_sub2") || has("aff_sub3") || has("aff_sub5")) return "aff_sub";
  if (has("click_id") || has("source")) return "cpamatica";

  const host = (u.hostname || "").toLowerCase();
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
      source: getTrafficSource(),
      subSource: getSubSource(),
      sub4: "",
    };

    const replaced = replacePartnerMacros(url, vars);
    const u = new URL(replaced);

    if (!u.searchParams.get("utm_source")) u.searchParams.set("utm_source", vars.source);
    if (!u.searchParams.get("utm_medium")) u.searchParams.set("utm_medium", "site");
    if (!u.searchParams.get("utm_campaign")) u.searchParams.set("utm_campaign", "webcam_offers");

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

/* ---------- UI bits ---------- */
function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-slate-900/70 border-slate-700 text-slate-100",
    pink: "bg-pink-500/10 border-pink-500/30 text-pink-200",
    amber: "bg-amber-400/10 border-amber-300/30 text-amber-100",
    green: "bg-emerald-400/10 border-emerald-300/30 text-emerald-100",
  };
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px]", tones[tone] || tones.neutral)}>
      {children}
    </span>
  );
}

function RatingStars({ rating }) {
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
      <span key={i} className={cn("text-base leading-none", cls)}>
        ★
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex items-center gap-0.5">{stars}</div>
      <span className="text-[12px] font-semibold text-slate-100">{value.toFixed(1)}</span>
      <span className="text-[11px] text-slate-500">/ 5</span>
    </div>
  );
}

function isTopChoice(index) {
  return index === 0;
}

function FeatureIcons({ offer }) {
  const items = [];

  if (offer.randomChat) items.push({ key: "random", label: "Random Match", icon: "🎲" });
  if (offer.freePrivateShows) items.push({ key: "private", label: "Private Rooms", icon: "🔒" });
  if (offer.instantMatch) items.push({ key: "instant", label: "Instant Start", icon: "⚡" });

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
      {isTop && <Pill tone="pink">🔥 Top choice</Pill>}
      {category && (
        <Pill tone="neutral">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
          Best for: <span className="font-medium">{category}</span>
        </Pill>
      )}
      {Number(offer.rating) >= 4.5 && <Pill tone="amber">High rated</Pill>}
    </div>
  );
}

function WebcamOfferCard({ offer, index }) {
  const cleanName = (offer.name || "").replace(/\.com$/i, "");
  const shortFeatures = Array.isArray(offer.features) ? offer.features.slice(0, 3) : [];
  const finalUrl = withTracking(offer.affiliateUrl || "");
  const logo = offer.preview || null;
  const cover = offer.cover || null;
  const isTop = isTopChoice(index);

  return (
    <div
      className={cn(
        "group relative rounded-3xl p-[1px] bg-gradient-to-br",
        isTop ? "from-pink-500/60 via-rose-400/50 to-amber-400/40" : offer.color || "from-slate-800/80 to-slate-900/80"
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
                  <img src={logo} alt={`${cleanName} logo`} className="max-h-full max-w-full object-contain px-4 py-2" loading="lazy" />
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
                    {offer.usp || "Compare this offer quickly using rating, category, and key features."}
                  </p>

                  {/* NEW: Feature icons */}
                  <FeatureIcons offer={offer} />
                </div>

                <div className="hidden sm:flex flex-col items-end gap-2">
                  <a
                    href={finalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold
                               bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white
                               shadow-[0_18px_45px_-24px_rgba(0,0,0,0.9)]
                               hover:brightness-105 active:scale-95 transition"
                  >
                    {COPY.CTA_LABEL} <span className="ml-2 text-xs">↗</span>
                  </a>
                  <span className="text-[11px] text-slate-500">Opens partner website</span>
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
                  className="w-full inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold
                             bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white
                             shadow-[0_18px_45px_-24px_rgba(0,0,0,0.9)]
                             hover:brightness-105 active:scale-95 transition"
                >
                  {COPY.CTA_LABEL} <span className="ml-2 text-xs">↗</span>
                </a>
                <p className="mt-2 text-[11px] text-slate-500">Opens partner website</p>
              </div>
            </div>
          </div>

          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              Tip: compare platforms by <span className="text-slate-300">rating</span>,{" "}
              <span className="text-slate-300">category</span>, and icons.
            </div>

            <div className="text-[11px] text-slate-500">
              Disclosure: we may earn a commission from partner links.
            </div>
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
          o?.randomChat ? "random match random chat roulette" : ""
        } ${o?.freePrivateShows ? "private rooms private shows" : ""} ${o?.instantMatch ? "instant match" : ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    if (category !== "all") list = list.filter((o) => String(o?.bestFor || "").toLowerCase() === category);
    if (minRating > 0) list = list.filter((o) => (Number(o?.rating) || 0) >= minRating);

    if (sortMode === "name_asc") list.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
    else list.sort((a, b) => (Number(b?.rating) || 0) - (Number(a?.rating) || 0));

    if (onlyTop) list = list.slice(0, 1);
    return list;
  }, [query, category, onlyTop, minRating, sortMode]);

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
        <header className="sticky top-0 z-30 bg-slate-950/70 border-b border-slate-800/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
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
              <Pill tone="neutral">🎲 Random match</Pill>
              <Pill tone="neutral">🔒 Private rooms</Pill>
              <Pill tone="neutral">⚡ Instant start</Pill>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-7 pb-6">
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/60 backdrop-blur">
            {/* Top image (safe abstract) */}
            <div className="relative h-40 sm:h-52 md:h-56">
              <img
                src="/hero-webcam.jpg"
                alt="Live video chat offers"
                className="h-full w-full object-cover opacity-80"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/50 px-4 py-2 text-[11px] text-slate-200">
                  <span className="text-[12px]">✨</span>
                  <span className="uppercase tracking-[0.22em] text-slate-300">{COPY.FEATURE_STRIP}</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.22em] text-pink-400">{COPY.HERO_KICKER}</p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-50">{COPY.HERO_HEADLINE}</h1>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">{COPY.HERO_SUBLINE}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Pill tone="pink">✨ Curated list</Pill>
                <Pill tone="amber">⭐ Sorted by rating</Pill>
                <Pill tone="neutral">🇳🇴 Norway-focused</Pill>
              </div>

              {/* Controls */}
              <div className="mt-6 grid gap-3 lg:grid-cols-12">
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
                  <label className="block text-[11px] text-slate-500 mb-1">Category</label>
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
                  <label className="block text-[11px] text-slate-500 mb-1">Min rating</label>
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
                  <label className="block text-[11px] text-slate-500 mb-1">Sort</label>
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none"
                  >
                    <option value="rating_desc">Rating (high → low)</option>
                    <option value="name_asc">Name (A → Z)</option>
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
                    {filtered.length === 1 ? "offer" : "offers"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Offers */}
        <section className="mx-auto max-w-6xl px-4 pb-10">
          <div className="space-y-5">
            {filtered.map((offer, index) => (
              <WebcamOfferCard key={offer.name || index} offer={offer} index={index} />
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/60 backdrop-blur p-6">
            <h2 className="text-base font-bold text-slate-50">Transparency &amp; safety notes</h2>
            <ul className="mt-3 grid gap-2 text-[13px] text-slate-300">
              <li className="flex gap-2">
                <span className="text-pink-400 mt-0.5">•</span>
                Links open external partner websites. Review each partner’s terms and privacy policy before signing up.
              </li>
              <li className="flex gap-2">
                <span className="text-pink-400 mt-0.5">•</span>
                We may earn a commission when you join through our links. This helps maintain the platform.
              </li>
              <li className="flex gap-2">
                <span className="text-pink-400 mt-0.5">•</span>
                Ratings and icons are quick indicators (not a guarantee). Always compare features that matter to you.
              </li>
            </ul>
          </div>

          <p className="mt-6 text-[11px] text-slate-600">
            MatchFinderGuide is an offer discovery platform. All trademarks belong to their respective owners.
          </p>
        </section>
      </main>

      <CookieConsent />
      <Analytics />
    </>
  );
}