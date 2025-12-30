// src/App.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import OFFERS from "./offers.js";
import CookieConsent from "./CookieConsent.jsx";
import WebcamPage from "./WebcamPage.jsx";
import { Analytics } from "@vercel/analytics/react";

/* ----------------- helpers ----------------- */
const cn = (...c) => c.filter(Boolean).join(" ");

/**
 * Tracking keys (shared with WebcamPage.jsx)
 */
const CLICK_ID_KEY = "mfg_click_id";
const GCLID_KEY = "mfg_gclid";

/** safe uuid generator for browsers */
function generateId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {}
  // fallback
  return `cid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getOrCreateClickId() {
  try {
    const existing = localStorage.getItem(CLICK_ID_KEY);
    if (existing) return existing;
    const id = generateId();
    localStorage.setItem(CLICK_ID_KEY, id);
    return id;
  } catch {
    return generateId();
  }
}

function storeGclidFromUrlOnce() {
  try {
    const params = new URLSearchParams(window.location.search || "");
    const gclid = params.get("gclid");
    if (gclid) localStorage.setItem(GCLID_KEY, gclid);
  } catch {}
}

/**
 * Main page outbound links:
 * Keep this ONLY for UTMs.
 * (WebcamPage handles partner macros: {click_id} / {gclid} via aff_sub1/aff_sub2)
 */
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
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1">
        <div className="flex items-center gap-0.5 leading-none">{stars}</div>
        <span className="text-[11px] font-semibold text-slate-700">
          {value.toFixed(1)} / 5
        </span>
      </div>
      <span className="text-[10px] text-slate-400 uppercase tracking-[0.16em]">
        Tillitsscore
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
            Toppvalg
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.7),transparent_55%)] opacity-80 z-10" />

      <div
        className={cn(
          "relative z-20 rounded-3xl bg-white/95 backdrop-blur-sm border border-slate-200 overflow-hidden",
          "p-5 sm:p-6",
          "group-hover:shadow-[0_24px_60px_-30px_rgba(15,23,42,0.6)]"
        )}
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch">
          <div className="flex-shrink-0 w-full sm:w-40 md:w-48">
            <div className="h-32 xs:h-28 sm:h-24 md:h-28 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt={`${cleanName} forhåndsvisning`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-50 via-slate-50 to-sky-50">
                  <span className="text-xs font-semibold text-slate-500">
                    Forhåndsvisning
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-[0] flex flex-col gap-4">
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
                      Passer best for{" "}
                      <span className="font-medium">{category}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 sm:mt-0 self-start sm:self-auto">
                <RatingStars rating={o.rating} />
              </div>
            </div>

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
                Besøk datingside <span className="ml-2 text-xs">↗</span>
              </a>

              <p className="text-[11px] text-slate-500 sm:ml-1">
                Ekstern partnerside · Kun 18+
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
    "En trygg plattform med aktive medlemmer og moderne funksjoner.";
  const score = Number(o.rating) || 0;

  const previewSrc = o.preview || o.heroImage || o.hero || null;

  return (
    <div className="relative">
      {index === 0 && (
        <div className="absolute -top-4 left-0 z-10 rounded-md bg-slate-900 text-white text-[11px] px-3 py-1 flex items-center gap-1 shadow-sm">
          <span>👍</span>
          <span className="font-semibold">Vår anbefaling</span>
        </div>
      )}

      <div className="flex h-full flex-col rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-1 flex-row items-stretch gap-3 sm:gap-4 px-4 py-4 border-l-4 border-rose-400">
          <div className="flex-shrink-0 w-24 md:w-28">
            <div className="w-full h-20 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt={`${cleanName} forhåndsvisning`}
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

          <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
            <div>
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
                Besøk → 
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
  { key: "all", label: "Alle" },
  { key: "serious", label: "Seriøs" },
  { key: "casual", label: "Uformell" },
  { key: "international", label: "Internasjonal" },
];

/* ------------------------------------------------
   MAIN DATING HOMEPAGE (full UI)
--------------------------------------------------*/
function MainDatingPage() {
  const [filter, setFilter] = useState("all");
  const [mobileOpen, setMobileOpen] = useState(false);

  const heroRef = useRef(null);
  const offersRef = useRef(null);
  const footerRef = useRef(null);

  const heroParallax = useParallax(heroRef, 0.18);
  const gridParallax = useParallax(offersRef, 0.22);
  const footSmall = useParallax(footerRef, 0.1);

  const sortedByRating = useMemo(() => {
    let list = Array.isArray(OFFERS) ? OFFERS.slice(0) : [];
    list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    return list;
  }, []);

  const filtered = useMemo(() => {
    if (filter === "serious")
      return sortedByRating.filter((o) => /seriøs|serious/i.test(o.bestFor));
    if (filter === "casual")
      return sortedByRating.filter((o) =>
        /uformell|casual|diskret/i.test(o.bestFor)
      );
    if (filter === "international")
      return sortedByRating.filter((o) => /internasjonal|international/i.test(o.bestFor));
    return sortedByRating;
  }, [filter, sortedByRating]);

  const topThree = sortedByRating.slice(0, 3);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function goToOffersWithFilter(key) {
    setFilter(key);
    setMobileOpen(false);
    const el = document.getElementById("offers");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen text-slate-900 relative overflow-hidden bg-gradient-to-b from-rose-50 via-white to-slate-50">
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
                <span>Kategorier</span>
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
                  Alle datingsider
                </button>
                <button
                  type="button"
                  onClick={() => goToOffersWithFilter("serious")}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  Seriøs dating
                </button>
                <button
                  type="button"
                  onClick={() => goToOffersWithFilter("international")}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  Internasjonal dating
                </button>
                <button
                  type="button"
                  onClick={() => goToOffersWithFilter("casual")}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  Uformell / diskret
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
              href="#blog"
              className="hover:text-slate-900 text-slate-600 hover:underline"
            >
              Blogg
            </a>
            <a
              href="/privacy.html"
              className="hover:text-slate-900 text-slate-600 hover:underline"
            >
              Personvern
            </a>
            <a
              href="/terms.html"
              className="hover:text-slate-900 text-slate-600 hover:underline"
            >
              Vilkår
            </a>
            <button
              onClick={() => window.openCookieSettings?.()}
              className="hover:text-slate-900 text-slate-600 hover:underline"
              type="button"
            >
              Cookie-innstillinger
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="sm:hidden inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? "Lukk" : "Meny"}
          </button>
        </div>

        {mobileOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-4 text-sm space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                Kategorier
              </p>
              <button
                type="button"
                onClick={() => goToOffersWithFilter("all")}
                className="block w-full text-left text-slate-700 hover:text-slate-900"
              >
                Alle datingsider
              </button>
              <button
                type="button"
                onClick={() => goToOffersWithFilter("serious")}
                className="block w-full text-left text-slate-700 hover:text-slate-900"
              >
                Seriøs dating
              </button>
              <button
                type="button"
                onClick={() => goToOffersWithFilter("international")}
                className="block w-full text-left text-slate-700 hover:text-slate-900"
              >
                Internasjonal dating
              </button>
              <button
                type="button"
                onClick={() => goToOffersWithFilter("casual")}
                className="block w-full text-left text-slate-700 hover:text-slate-900"
              >
                Uformell / diskret
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
                href="#blog"
                onClick={closeMobileMenu}
                className="block text-slate-600 hover:text-slate-900"
              >
                Blogg
              </a>
              <a
                href="/privacy.html"
                onClick={closeMobileMenu}
                className="block text-slate-600 hover:text-slate-900"
              >
                Personvern
              </a>
              <a
                href="/terms.html"
                onClick={closeMobileMenu}
                className="block text-slate-600 hover:text-slate-900"
              >
                Vilkår
              </a>
              <button
                type="button"
                onClick={() => {
                  window.openCookieSettings?.();
                  closeMobileMenu();
                }}
                className="block text-left text-slate-600 hover:text-slate-900"
              >
                Cookie-innstillinger
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
              <div>
                <div className="mb-3 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-rose-50 border border-rose-200 shadow-sm">
                  <span className="rounded-full bg-white px-2.5 py-1 border border-rose-200 text-[11px] font-semibold tracking-[0.18em] uppercase text-rose-700">
                    18+
                  </span>
                  <span className="text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase text-rose-700/80">
                    Nettdating og datingsider (kun for voksne)
                  </span>
                </div>

                <div className="mt-1 space-y-3">
                  <h1 className="text-2xl sm:text-4xl md:text-[2.6rem] font-extrabold leading-snug sm:leading-tight tracking-tight text-slate-900">
                    Finn riktig datingside i Norge —{" "}
                    <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                      trygt, enkelt og effektivt
                    </span>
                  </h1>
                  <p className="max-w-xl text-slate-600 text-sm sm:text-base md:text-[0.98rem] leading-relaxed mt-1.5">
                    Leter du etter <span className="font-semibold text-slate-900">online dating i Norge</span>,{" "}
                    <span className="font-semibold text-slate-900">beste datingsider</span> eller{" "}
                    <span className="font-semibold text-slate-900">seriøs dating</span>? Vi sammenligner datingsider og
                    dating-apper med fokus på sikkerhet, kvalitet, verifisering og brukeropplevelse — så du kan velge det
                    som passer deg (seriøst, uformelt eller internasjonalt).
                  </p>

                  <p className="max-w-xl text-slate-600 text-[13px] leading-relaxed">
                    Tips: Mange datingsider tilbyr gratis registrering. Bruk filtrene under for å finne{" "}
                    <span className="font-semibold text-slate-900">dating nettsider i Norge</span> som matcher målet ditt.
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
                    Se topp datingsider
                    <span className="ml-2 text-xs">↗</span>
                  </a>
                  <a
                    href="#faq"
                    className="inline-flex items-center justify-center rounded-2xl px-7 py-3 
                         bg-slate-50 border border-slate-200 text-slate-800 
                         text-sm sm:text-base font-semibold
                         hover:bg-white active:scale-95 transition"
                  >
                    Hvordan vi sammenligner
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="h-44 sm:h-48 md:h-52 rounded-[24px] bg-rose-50 border border-rose-100 overflow-hidden shadow-[0_16px_40px_-28px_rgba(15,23,42,0.8)]">
                  <img
                    src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80"
                    alt="Nettdating: et par som nyter tiden sammen"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-white/90">
                    <p className="font-medium">Ekte mennesker. Ekte forbindelser.</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 border border-white/30 text-[10px] uppercase tracking-[0.18em]">
                      Utvalgte datingsider
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      Populært i Norge
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      Nettdating · datingsider · dating-apper
                    </p>
                    <p className="mt-1 text-[12px] text-slate-600">
                      Finn plattform etter mål: seriøs, uformell eller internasjonal.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      Video-funksjoner
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      Videodating · videochat · cam-to-cam
                    </p>
                    <p className="mt-1 text-[12px] text-slate-600">
                      Velg datingsider som tilbyr video for tryggere første inntrykk.
                    </p>
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
                Våre topp 3 datingsider
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Valgt etter tillitsscore, sikkerhet og total kvalitet.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {topThree.map((o, index) => (
                <TopStripCard
                  key={o.id || o.name || index}
                  o={o}
                  index={index}
                />
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
                Filtrer datingsider
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
                <span className="text-slate-700 font-medium">
                  Verifiseringsfokus
                </span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[9px] text-white font-bold">
                  ✺
                </span>
                <span className="text-slate-700 font-medium">
                  Anti-spam filter
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Offers */}
      <section
        ref={offersRef}
        id="offers"
        className="relative py-12 px-4 overflow-hidden"
      >
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
                Kuraterte toppvalg
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">
                Beste datingsider og dating-apper (utvalg)
              </h2>
              <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-xl">
                Rangert etter sikkerhet, funksjoner, brukererfaring, personvern og
                hvor “ekte” plattformen føles. Perfekt for deg som søker{" "}
                <span className="font-semibold text-slate-900">dating sites Norway</span>,{" "}
                <span className="font-semibold text-slate-900">norwegian dating site</span> eller{" "}
                <span className="font-semibold text-slate-900">anmeldelser av datingsider</span>.
              </p>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 md:text-right">
              <p className="font-semibold text-slate-800">
                Sortert etter tillitsscore{" "}
                <span className="text-slate-400">(høyest → lavest)</span>
              </p>
              <p className="mt-1 text-slate-500">
                #1 er best total balanse av trygghet, kvalitet og verdi.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-6 max-w-6xl mx-auto w-full px-1 sm:px-2">
            {filtered.map((o, index) => (
              <OfferCard key={o.id || o.name || index} o={o} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 pb-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-white/95 backdrop-blur-lg border border-slate-200 p-6 shadow-sm">
            <h3 className="text-2xl font-extrabold text-slate-900">
              Ofte stilte spørsmål (nettdating)
            </h3>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-900">
              <div>
                <h4 className="font-bold">Finnes det datingsider som er gratis?</h4>
                <p className="text-slate-600">
                  Mange datingsider har gratis registrering og grunnfunksjoner, med valgfrie oppgraderinger.
                </p>
              </div>
              <div>
                <h4 className="font-bold">Hvilken datingside er best for seriøs dating i Norge?</h4>
                <p className="text-slate-600">
                  Bruk filteret “Seriøs” for å se datingsider som passer bedre for langvarige forhold.
                </p>
              </div>
              <div>
                <h4 className="font-bold">Hvordan rangerer dere datingsider?</h4>
                <p className="text-slate-600">
                  Vi ser på sikkerhet, verifisering, spam-nivå, funksjoner, prisstruktur, og generell brukeropplevelse.
                </p>
              </div>
              <div>
                <h4 className="font-bold">Hva med videodating / videochat?</h4>
                <p className="text-slate-600">
                  Video kan gi tryggere første møte. Se etter videochat- eller cam-to-cam-funksjoner når det er relevant.
                </p>
              </div>
              <div>
                <h4 className="font-bold">Er dette en datingside?</h4>
                <p className="text-slate-600">
                  Nei — dette er en sammenligningsside (dating sites in Norway / online dating Norway). Vi peker videre til eksterne plattformer.
                </p>
              </div>
              <div>
                <h4 className="font-bold">Er siden kun for voksne?</h4>
                <p className="text-slate-600">
                  Ja — innholdet er ment for 18+.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG (bottom of page) */}
      <section id="blog" className="px-4 pb-14">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-white/95 backdrop-blur-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  Blogg
                </p>
                <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Tips om datingsider i Norge, nettdating og videodating
                </h3>
                <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-2xl">
                  Korte guider som matcher vanlige søk som{" "}
                  <span className="font-semibold text-slate-900">beste datingsider</span>,{" "}
                  <span className="font-semibold text-slate-900">dating nettsider Norge</span>,{" "}
                  <span className="font-semibold text-slate-900">seriøs dating Norge</span> og{" "}
                  <span className="font-semibold text-slate-900">videochat / videodating</span>.
                </p>
              </div>

              <a
                href="#offers"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold
                         bg-slate-900 text-white border border-slate-900
                         hover:brightness-110 active:scale-95 transition"
              >
                Se datingsider
              </a>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {/* Post 1 */}
              <article className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="text-lg font-extrabold text-slate-900">
                  Beste datingsider i Norge: hva bør du se etter?
                </h4>
                <p className="mt-2 text-slate-600 text-sm">
                  Når du søker “best dating sites Norway” eller “beste datingsider”, se etter verifisering, tydelige regler,
                  og aktive medlemmer. Ikke bare designet — trygghet og kvalitet gir bedre matcher.
                </p>
                <ul className="mt-3 text-[13px] text-slate-700 grid gap-1.5">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-300" />
                    <span>Verifiserte profiler og anti-spam</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-300" />
                    <span>Gode filtre (alder, sted, interesser)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-300" />
                    <span>Klare priser og enkel avmelding</span>
                  </li>
                </ul>
              </article>

              {/* Post 2 */}
              <article className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="text-lg font-extrabold text-slate-900">
                  Seriøs vs. uformell nettdating: velg riktig kategori
                </h4>
                <p className="mt-2 text-slate-600 text-sm">
                  “Seriøs dating Norge” handler ofte om langsiktige mål og bedre profilkvalitet. “Uformell dating” passer
                  for deg som vil ta det rolig, prate, og se an kjemi uten press.
                </p>
                <p className="mt-3 text-[13px] text-slate-700">
                  Bruk filtrene våre for å sammenligne datingsider som passer ditt mål — seriøst, uformelt eller internasjonalt.
                </p>
              </article>

              {/* Post 3 */}
              <article className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="text-lg font-extrabold text-slate-900">
                  Videodating og videochat: tryggere første møte
                </h4>
                <p className="mt-2 text-slate-600 text-sm">
                  Søk som “videodating”, “beste videochat” og “cam to cam chat” viser at mange vil se og høre personen før
                  de møtes. Video kan redusere falske profiler og skape bedre førsteinntrykk.
                </p>
                <p className="mt-3 text-[13px] text-slate-700">
                  Tips: Start med en kort videosamtale på plattformen, og del aldri sensitiv informasjon tidlig.
                </p>
              </article>

              {/* Post 4 */}
              <article className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="text-lg font-extrabold text-slate-900">
                  Anmeldelser av datingsider: slik leser du dem smart
                </h4>
                <p className="mt-2 text-slate-600 text-sm">
                  Ikke se kun på “stjerner”. Les etter mønstre: spam-problemer, kundestøtte, prisstruktur, og om folk faktisk
                  finner matcher. Det er ofte mer nyttig enn én enkelt score.
                </p>
                <p className="mt-3 text-[13px] text-slate-700">
                  Vi rangerer plattformer etter flere faktorer — spesielt trygghet og kvalitet — ikke bare popularitet.
                </p>
              </article>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-5">
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Affiliate-disclaimer:</span>{" "}
                Vi kan tjene provisjon hvis du registrerer deg via lenkene våre. Det påvirker ikke hvordan vi skriver tekstene,
                men hjelper oss å holde siden i gang.
              </p>
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
            Kun for voksne
          </p>

          <p className="mt-4 font-bold text-slate-900">Affiliate-informasjon</p>
          <p className="mt-1 text-slate-600">
            Vi kan tjene provisjon når du registrerer deg via lenkene våre.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <a
              className="hover:text-slate-900 underline underline-offset-4"
              href="/privacy.html"
            >
              Personvern
            </a>
            <a
              className="hover:text-slate-900 underline underline-offset-4"
              href="/terms.html"
            >
              Vilkår
            </a>
            <a
              className="hover:text-slate-900 underline underline-offset-4"
              href="/cookie.html"
            >
              Cookie-policy
            </a>
            <button
              type="button"
              onClick={() => window.openCookieSettings?.()}
              className="hover:text-slate-900 underline underline-offset-4"
            >
              Cookie-innstillinger
            </button>
          </div>

          <p className="mt-8 text-slate-400 hover:text-slate-700 transition">
            © {new Date().getFullYear()} MatchFinderGuide.com
          </p>
        </div>
      </footer>

      <CookieConsent />
    </main>
  );
}

/* ------------------------------------------------
   ROOT APP: GEO + BOT SWITCHER
--------------------------------------------------*/
export default function App() {
  const [countryCode, setCountryCode] = useState(null);
  const [geoReady, setGeoReady] = useState(false);
  const [isBot, setIsBot] = useState(false);

  useEffect(() => {
    // Ensure click_id exists immediately
    getOrCreateClickId();

    // Store gclid from landing URL (if present)
    storeGclidFromUrlOnce();

    // Detect Google-related bots
    try {
      const ua = navigator.userAgent || "";
      const botRegex =
        /(Googlebot|Mediapartners-Google|AdsBot-Google|APIs-Google|Google-InspectionTool)/i;
      setIsBot(botRegex.test(ua));
    } catch {
      setIsBot(false);
    }

    // Fetch 2-letter country code
    fetch("https://ipapi.co/country/", { cache: "no-store" })
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => {
        if (text && typeof text === "string") {
          setCountryCode(text.trim().toUpperCase());
        } else {
          setCountryCode("XX");
        }
      })
      .catch(() => {
        setCountryCode("XX");
      })
      .finally(() => {
        setGeoReady(true);
      });
  }, []);

  const isNorway = countryCode === "NO";
  const shouldShowWebcam = geoReady && isNorway && !isBot;

  return (
    <>
      {shouldShowWebcam ? <WebcamPage /> : <MainDatingPage />}
      <Analytics />
    </>
  );
}