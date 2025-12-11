import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import OFFERS from "./offers.js";
import CookieConsent from "./CookieConsent.jsx";
import WebcamPage from "./WebcamPage.jsx";
import { Analytics } from "@vercel/analytics/react"; // Vercel Analytics

/* ----------------- helpers ----------------- */
const cn = (...c) => c.filter(Boolean).join(" ");

function useParallax(targetRef, speed = 0.15) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = targetRef?.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const elemTop = rect.top + window.scrollY;
      const scrollY = window.scrollY || 0;
      const delta = (scrollY - elemTop) * speed;
      setOffset(delta);
    };
    const onScrollOrResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      cancelAnimationFrame(raf);
    };
  }, [targetRef, speed]);
  return { transform: `translate3d(0, ${offset}px, 0)` };
}

function withUTM(url) {
  try {
    const u = new URL(url);
    if (!u.searchParams.get("utm_source"))
      u.searchParams.set("utm_source", "matchfinderguide");
    if (!u.searchParams.get("utm_medium"))
      u.searchParams.set("utm_medium", "site");
    if (!u.searchParams.get("utm_campaign"))
      u.searchParams.set("utm_campaign", "offers_grid");
    return u.toString();
  } catch {
    return url;
  }
}

/* ----------------- Trust score stars (main cards) ----------------- */
function RatingStars({ rating }) {
  const raw = Number(rating) || 0;
  const value = Math.max(0, Math.min(5, raw));
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5 && full < 5;
  const total = 5;

  const stars = [];
  for (let i = 0; i < total; i++) {
    let cls = "text-slate-300";
    if (i < full) {
      cls = "text-amber-400";
    } else if (i === full && hasHalf) {
      cls = "text-amber-300";
    }
    stars.push(
      <span key={i} className={cn("text-base", cls)}>
        ★
      </span>
    );
  }

  return (
    <div className="inline-flex flex-col items-end text-right gap-1">
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1">
        <div className="flex items-center gap-0.5 leading-none">{stars}</div>
        <span className="text-[11px] font-semibold text-slate-700">
          {value.toFixed(1)} / 5
        </span>
      </div>
      <span className="text-[10px] text-slate-400 uppercase tracking-[0.16em]">
        Trust score
      </span>
    </div>
  );
}

/* ----------------- Small stars for top-strip ----------------- */
function StarRating({ rating }) {
  const value = Number(rating) || 0; // assume 0–5
  const maxStars = 5;
  const filled = Math.round(value);
  const stars = [];
  for (let i = 0; i < maxStars; i++) {
    stars.push(
      <span
        key={i}
        className={i < filled ? "text-amber-400" : "text-slate-300"}
      >
        ★
      </span>
    );
  }
  return <div className="text-[13px] leading-none">{stars}</div>;
}

/* ----------------- Top Choice helper ----------------- */
function isTopChoice(index) {
  return index === 0 || index === 1 || index === 2;
}

/* ----------------- Offer Card (main list) ----------------- */
export function OfferCard({ o, index }) {
  const cleanName = (o.name || "").replace(/\.com$/i, "");
  const shortFeatures = Array.isArray(o.features) ? o.features.slice(0, 2) : [];
  const category = o.bestFor
    ? o.bestFor.charAt(0).toUpperCase() + o.bestFor.slice(1)
    : null;

  const finalUrl = withUTM(o.affiliateUrl || "");
  const isTop = isTopChoice(index);

  // website preview screenshot
  const previewSrc = o.preview || o.heroImage || o.hero || null;

  return (
    <div
      className={cn(
        "group relative rounded-3xl p-[1px] bg-gradient-to-br",
        isTop
          ? "from-rose-100 via-pink-50 to-amber-100"
          : o.color || "from-slate-50 to-slate-100",
        "transition-transform duration-300 hover:scale-[1.01]"
      )}
    >
      {isTop && (
        <div className="pointer-events-none absolute -top-3 left-5 z-40">
          <div
            className="
              inline-flex items-center gap-2
              px-4 py-1.5 rounded-full
              bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300
              text-[11px] font-extrabold tracking-wide uppercase text-white
              shadow-[0_4px_18px_rgba(248,113,131,0.55)]
              border border-white/60
            "
          >
            <span className="h-2 w-2 rounded-full bg-black/30" />
            Top Choice
          </div>
        </div>
      )}

      {/* subtle highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.7),transparent_55%)] opacity-80 z-10" />

      <div
        className={cn(
          "relative z-20 rounded-3xl bg-white/95 backdrop-blur-sm border border-slate-200 overflow-hidden",
          "p-5 sm:p-6",
          "group-hover:shadow-[0_24px_60px_-30px_rgba(15,23,42,0.6)]"
        )}
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch">
          {/* Website preview on the very left / on top for mobile */}
          <div className="flex-shrink-0 w-full sm:w-40 md:w-48">
            <div className="h-32 xs:h-28 sm:h-24 md:h-28 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt={`${cleanName} preview`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-50 via-slate-50 to-sky-50">
                  <span className="text-xs font-semibold text-slate-500">
                    Site preview
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right block: content + rating + CTA */}
          <div className="flex-1 min-w-[0] flex flex-col gap-4">
            {/* Top: title + category + rating */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em]">
                    #{index + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                    {cleanName}
                  </h3>
                </div>

                {category && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-[11px] text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
                      Best for: <span className="font-medium">{category}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* stars drop below title on mobile, side on larger screens */}
              <div className="mt-2 sm:mt-0 self-start sm:self-auto">
                <RatingStars rating={o.rating} />
              </div>
            </div>

            {/* USP + features */}
            <div className="space-y-2">
              {o.usp && (
                <p className="text-sm text-slate-700 leading-relaxed">{o.usp}</p>
              )}

              {shortFeatures.length > 0 && (
                <ul className="text-[13px] text-slate-700 grid gap-1.5">
                  {shortFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-300" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* CTA */}
            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-3">
              <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold
                         bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 text-white
                         shadow-[0_18px_45px_-24px_rgba(15,23,42,0.8)]
                         hover:brightness-105 active:scale-95 transition"
              >
                Visit Site
                <span className="ml-2 text-xs">↗</span>
              </a>

              <p className="text-[11px] text-slate-500 sm:ml-1">
                External partner site · 18+ only
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Top-3 compact cards (under hero) ----------------- */
function TopStripCard({ o, index }) {
  const cleanName = (o.name || "").replace(/\.com$/i, "");
  const finalUrl = withUTM(o.affiliateUrl || "");
  const tagline =
    o.usp ||
    o.shortDescription ||
    "Trusted platform with active members and modern features.";
  const score = Number(o.rating) || 0;

  const previewSrc = o.preview || o.heroImage || o.hero || null;

  return (
    <div className="relative">
      {index === 0 && (
        <div className="absolute -top-4 left-0 z-10 rounded-md bg-slate-900 text-white text-[11px] px-3 py-1 flex items-center gap-1 shadow-sm">
          <span>👍</span>
          <span className="font-semibold">Our recommendation</span>
        </div>
      )}

      <div className="flex h-full flex-col rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-1 flex-row items-stretch gap-3 sm:gap-4 px-4 py-4 border-l-4 border-rose-400">
          {/* Small site preview */}
          <div className="flex-shrink-0 w-24 md:w-28">
            <div className="w-full h-20 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt={`${cleanName} preview`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-xs font-semibold text-slate-500">
                  Preview
                </span>
              )}
            </div>
          </div>

          {/* Text + rating/CTA (stacked) */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
            <div>
              {/* mobile: single-line, desktop: wrap */}
              <p className="text-sm font-semibold text-slate-900 truncate md:whitespace-normal md:overflow-visible">
                {cleanName}
              </p>
              <p className="mt-1 text-[13px] text-slate-600 line-clamp-3 md:line-clamp-none">
                {tagline}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <StarRating rating={score} />
                <div className="inline-flex items-center gap-1 rounded-md bg-sky-600 text-white px-2 py-1 text-[11px] font-bold">
                  <span>{score.toFixed(1)}</span>
                </div>
              </div>

              <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-semibold text-rose-600 hover:text-rose-700 whitespace-nowrap"
              >
                Visit site&nbsp;→
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Filters ----------------- */
const FILTERS = [
  { key: "all", label: "All" },
  { key: "serious", label: "Serious" },
  { key: "casual", label: "Casual" },
  { key: "international", label: "International" },
];

/* ----------------- Page Component ----------------- */
export default function App() {
  // 🌍 GEO + BOT detection
  const [countryCode, setCountryCode] = useState(null);
  const [geoReady, setGeoReady] = useState(false);
  const [isBot, setIsBot] = useState(false);

  useEffect(() => {
    // 1) Detect Google-related bots by User-Agent
    try {
      const ua = navigator.userAgent || "";
      const botRegex =
        /(Googlebot|Mediapartners-Google|AdsBot-Google|APIs-Google|Google-InspectionTool)/i;
      setIsBot(botRegex.test(ua));
    } catch {
      setIsBot(false);
    }

    // 2) Fetch IP-based country
    fetch("https://ipapi.co/json/")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.country) {
          setCountryCode(data.country);
        }
      })
      .catch(() => {
        // ignore errors, fallback: countryCode stays null
      })
      .finally(() => {
        setGeoReady(true);
      });
  }, []);

  const isNorway = countryCode === "NO";
  const shouldShowWebcam = geoReady && isNorway && !isBot;

  // If geo says "Norway human user", show webcam layout as root page
  if (shouldShowWebcam) {
    return <WebcamPage />;
  }

  // normal dating page below
  const [filter, setFilter] = useState("all");
  const [mobileOpen, setMobileOpen] = useState(false);

  const heroRef = useRef(null);
  const offersRef = useRef(null);
  const footerRef = useRef(null);

  const heroParallax = useParallax(heroRef, 0.18);
  const gridParallax = useParallax(offersRef, 0.22);
  const footSmall = useParallax(footerRef, 0.1);
  const footWide = useParallax(footerRef, 0.08); // reserved if needed

  // Sort offers once by rating
  const sortedByRating = useMemo(() => {
    let list = Array.isArray(OFFERS) ? OFFERS.slice(0) : [];
    list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    return list;
  }, []);

  const filtered = useMemo(() => {
    if (filter === "serious")
      return sortedByRating.filter((o) => /serious/i.test(o.bestFor));
    if (filter === "casual")
      return sortedByRating.filter((o) => /casual/i.test(o.bestFor));
    if (filter === "international")
      return sortedByRating.filter((o) => /international/i.test(o.bestFor));
    return sortedByRating;
  }, [filter, sortedByRating]);

  const topThree = sortedByRating.slice(0, 3);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  // helper to change filter + scroll to offers
  function goToOffersWithFilter(key) {
    setFilter(key);
    setMobileOpen(false);
    const el = document.getElementById("offers");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <>
      <main className="min-h-screen text-slate-900 relative overflow-hidden bg-gradient-to-b from-rose-50 via-white to-slate-50">
        {/* soft light noise */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12]" />

        {/* Navbar */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
            <Link
              className="flex items-center gap-3 font-extrabold text-slate-900"
              to="/"
              onClick={closeMobileMenu}
            >
              <div className="h-9 w-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <img src="/logo.svg" className="h-6 w-6" alt="MatchFinderGuide" />
              </div>
              <span className="tracking-tight text-sm sm:text-base">
                MatchFinder<span className="text-rose-500">Guide</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-5 text-sm">
              <div className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-semibold tracking-wide text-slate-700"
                >
                  <span>Categories</span>
                  <span className="text-[10px]">▾</span>
                </button>

                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 
                             shadow-xl py-2 opacity-0 translate-y-1 invisible
                             group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible
                             transition"
                >
                  <button
                    type="button"
                    onClick={() => goToOffersWithFilter("all")}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    All / General
                  </button>
                  <button
                    type="button"
                    onClick={() => goToOffersWithFilter("serious")}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Serious Dating
                  </button>
                  <button
                    type="button"
                    onClick={() => goToOffersWithFilter("international")}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    International Dating
                  </button>
                  <button
                    type="button"
                    onClick={() => goToOffersWithFilter("casual")}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Casual Dating
                  </button>
                </div>
              </div>

              <span className="w-px h-5 bg-slate-200" />

              <a
                href="#faq"
                className="hover:text-slate-900 text-slate-600 hover:underline"
              >
                FAQ
              </a>
              <a
                href="/privacy.html"
                className="hover:text-slate-900 text-slate-600 hover:underline"
              >
                Privacy
              </a>
              <a
                href="/terms.html"
                className="hover:text-slate-900 text-slate-600 hover:underline"
              >
                Terms
              </a>
              <button
                onClick={() => window.openCookieSettings?.()}
                className="hover:text-slate-900 text-slate-600 hover:underline"
                type="button"
              >
                Cookie Settings
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              type="button"
              className="sm:hidden inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? "Close" : "Menu"}
            </button>
          </div>

          {mobileOpen && (
            <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-4 text-sm space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  Categories
                </p>
                <button
                  type="button"
                  onClick={() => goToOffersWithFilter("all")}
                  className="block w-full text-left text-slate-700 hover:text-slate-900"
                >
                  All / General
                </button>
                <button
                  type="button"
                  onClick={() => goToOffersWithFilter("serious")}
                  className="block w-full text-left text-slate-700 hover:text-slate-900"
                >
                  Serious Dating
                </button>
                <button
                  type="button"
                  onClick={() => goToOffersWithFilter("international")}
                  className="block w-full text-left text-slate-700 hover:text-slate-900"
                >
                  International Dating
                </button>
                <button
                  type="button"
                  onClick={() => goToOffersWithFilter("casual")}
                  className="block w-full text-left text-slate-700 hover:text-slate-900"
                >
                  Casual Dating
                </button>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="space-y-2">
                <a
                  href="#faq"
                  onClick={closeMobileMenu}
                  className="block text-slate-600 hover:text-slate-900"
                >
                  FAQ
                </a>
                <a
                  href="/privacy.html"
                  onClick={closeMobileMenu}
                  className="block text-slate-600 hover:text-slate-900"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms.html"
                  onClick={closeMobileMenu}
                  className="block text-slate-600 hover:text-slate-900"
                >
                  Terms
                </a>
                <button
                  type="button"
                  onClick={() => {
                    window.openCookieSettings?.();
                    closeMobileMenu();
                  }}
                  className="block text-left text-slate-600 hover:text-slate-900"
                >
                  Cookie Settings
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section ref={heroRef} className="relative">
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-b from-rose-50 via-white to-rose-50"
            style={heroParallax}
          />
          <div className="mx-auto max-w-7xl px-4 pt-6 pb-6">
            <div className="rounded-[28px] bg-white/95 border border-slate-200 backdrop-blur-xl px-6 sm:px-10 py-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)]">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
                {/* LEFT */}
                <div>
                  <div className="mb-3 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-rose-50 border border-rose-200 shadow-sm">
                    <span className="rounded-full bg-white px-2.5 py-1 border border-rose-200 text-[11px] font-semibold tracking-[0.18em] uppercase text-rose-700">
                      18+
                    </span>
                    <span className="text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase text-rose-700/80">
                      Adult-only dating comparisons
                    </span>
                  </div>

                  <div className="mt-1 space-y-3">
                    <h1 className="text-2xl sm:text-4xl md:text-[2.6rem] font-extrabold leading-snug sm:leading-tight tracking-tight text-slate-900">
                      Find Better Matches —{" "}
                      <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                        Safely &amp; Confidently
                      </span>
                    </h1>
                    <p className="max-w-xl text-slate-600 text-sm sm:text-base md:text-[0.98rem] leading-relaxed mt-1.5">
                      <span className="font-semibold text-slate-900">
                        Independent, policy-compliant comparisons.
                      </span>{" "}
                      We highlight trusted dating apps and filter out low-quality,
                      spammy platforms so you can focus on real connections that fit
                      what you&apos;re looking for.
                    </p>
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <a
                      href="#offers"
                      className="inline-flex items-center justify-center rounded-2xl px-7 py-3 
                         bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 
                         text-white font-semibold text-sm sm:text-base
                         shadow-[0_18px_45px_-24px_rgba(15,23,42,0.9)]
                         hover:brightness-105 active:scale-95 transition"
                    >
                      See Top Picks
                      <span className="ml-2 text-xs">↗</span>
                    </a>
                    <a
                      href="#faq"
                      className="inline-flex items-center justify-center rounded-2xl px-7 py-3 
                         bg-slate-50 border border-slate-200 text-slate-800 
                         text-sm sm:text-base font-semibold
                         hover:bg-white active:scale-95 transition"
                    >
                      How We Compare
                    </a>
                  </div>
                </div>

                {/* RIGHT: romantic couple visual */}
                <div className="relative">
                  <div className="h-44 sm:h-48 md:h-52 rounded-[24px] bg-rose-50 border border-rose-100 overflow-hidden shadow-[0_16px_40px_-28px_rgba(15,23,42,0.8)]">
                    <img
                      src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80"
                      alt="Romantic couple enjoying time together"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-white/90">
                      <p className="font-medium">Real people. Real connections.</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 border border-white/30 text-[10px] uppercase tracking-[0.18em]">
                        Curated Matches
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top 3 Picks strip */}
        {topThree.length > 0 && (
          <section className="bg-rose-50/60 border-y border-rose-100">
            <div className="mx-auto max-w-6xl px-4 py-6">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <h2 className="text-[11px] sm:text-xs font-semibold text-rose-700 uppercase tracking-[0.18em]">
                  Our top 3 picks
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Selected by trust score, safety &amp; overall quality.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {topThree.map((o, index) => (
                  <TopStripCard key={o.id || o.name || index} o={o} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="border-y border-slate-200 bg-white/80">
          <div className="mx-auto max-w-7xl px-4 py-7">
            <div className="rounded-3xl bg-white border border-slate-200 backdrop-blur-xl px-4 sm:px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
              <div className="flex flex-col gap-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  Filter offers
                </p>
                <div className="flex flex-wrap justify-start gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => goToOffersWithFilter(f.key)}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition border",
                        filter === f.key
                          ? "bg-slate-900 text-white border-slate-900 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.95)]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:text-slate-900"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          filter === f.key ? "bg-rose-300" : "bg-slate-300"
                        )}
                      />
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-start sm:justify-end text-[11px] sm:text-xs">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white font-bold">
                    ✓
                  </span>
                  <span className="text-slate-700 font-medium">Verified Reviews</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[9px] text-white font-bold">
                    ✺
                  </span>
                  <span className="text-slate-700 font-medium">No Spam</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Offers */}
        <section ref={offersRef} id="offers" className="relative py-12 px-4 overflow-hidden">
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.12]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2200&auto=format&fit=crop')",
              ...gridParallax,
            }}
          />
          <div className="absolute inset-0 -z-10 bg-white/80" />

          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
                  Editor’s Top Picks
                </div>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">
                  Curated Dating Platforms We Trust
                </h2>
                <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-xl">
                  Ranked by safety, features, user success, privacy, and overall
                  transparency of each platform&apos;s experience.
                </p>
              </div>

              <div className="text-xs sm:text-sm text-slate-600 md:text-right">
                <p className="font-semibold text-slate-800">
                  Sorted by Trust Score{" "}
                  <span className="text-slate-400">(highest → lowest)</span>
                </p>
                <p className="mt-1 text-slate-500">
                  #1 is the strongest overall balance of safety, quality and value.
                </p>
              </div>
            </div>

            {/* wider cards */}
            <div className="mt-8 space-y-6 max-w-6xl mx-auto w-full px-1 sm:px-2">
              {filtered.map((o, index) => (
                <OfferCard key={o.id || o.name || index} o={o} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-4 pb-14">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-3xl bg-white/95 backdrop-blur-lg border border-slate-200 p-6 shadow-sm">
              <h3 className="text-2xl font-extrabold text-slate-900">
                Frequently Asked Questions
              </h3>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-900">
                <div>
                  <h4 className="font-bold">Are these platforms free?</h4>
                  <p className="text-slate-600">
                    Many offer free signup with optional upgrades.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold">Which is the best for serious dating?</h4>
                  <p className="text-slate-600">
                    Use the “Serious” filter to view long-term focused apps.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold">How do you rank apps?</h4>
                  <p className="text-slate-600">
                    We analyze safety, verification, features, pricing, and user
                    feedback.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold">Is this site for adults?</h4>
                  <p className="text-slate-600">
                    Yes — intended for adults 18+ only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          ref={footerRef}
          className="bg-white/95 backdrop-blur-xl border-t border-slate-200 py-12 px-6 text-sm"
          style={footSmall}
        >
          <div className="mx-auto max-w-7xl text-slate-700">
            <p className="inline-flex items-center gap-2 text-xs uppercase text-slate-600">
              <span className="rounded-full bg-rose-50 px-2 py-1 border border-rose-200 text-rose-700">
                18+
              </span>
              Adult-only content
            </p>

            <p className="mt-4 font-bold text-slate-900">Affiliate Disclosure</p>
            <p className="mt-1 text-slate-600">
              We may earn a commission when you sign up through our links.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <a
                className="hover:text-slate-900 underline underline-offset-4"
                href="/privacy.html"
              >
                Privacy Policy
              </a>
              <a
                className="hover:text-slate-900 underline underline-offset-4"
                href="/terms.html"
              >
                Terms
              </a>
              <a
                className="hover:text-slate-900 underline underline-offset-4"
                href="/cookie.html"
              >
                Cookie Policy
              </a>
              <button
                type="button"
                onClick={() => window.openCookieSettings?.()}
                className="hover:text-slate-900 underline underline-offset-4"
              >
                Cookie Settings
              </button>
            </div>

            <p className="mt-8 text-slate-400 hover:text-slate-700 transition">
              © {new Date().getFullYear()} MatchFinderGuide.com
            </p>
          </div>
        </footer>

        <CookieConsent />
      </main>

      {/* Vercel Analytics */}
      <Analytics />
    </>
  );
}