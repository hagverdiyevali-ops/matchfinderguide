import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import OFFERS from "./offers.js";
import CookieConsent from "./CookieConsent.jsx";
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

/* ----------------- Rating Badge: TRUST SCORE BLOCK ----------------- */
function RatingBadge({ rating }) {
  const value = Number(rating) || 0;
  const score = value.toFixed(1);

  // DYNAMIC COLORS BASED ON SCORE
  let label = "Caution";
  let bg = "bg-rose-500/10";
  let border = "border-rose-300/60";
  let chipBg = "bg-rose-400";
  let chipText = "text-black";
  let textMain = "text-rose-50";
  let subText = "May have weaker safety or fewer verified reviews.";

  if (value >= 4.5) {
    label = "Excellent";
    bg = "bg-emerald-500/10";
    border = "border-emerald-300/60";
    chipBg = "bg-emerald-300";
    chipText = "text-[#102512]";
    textMain = "text-emerald-50";
    subText = "Top-tier verified safety & overall reliability.";
  } else if (value >= 4.0) {
    label = "Strong";
    bg = "bg-amber-500/10";
    border = "border-amber-300/60";
    chipBg = "bg-amber-300";
    chipText = "text-[#2a1b0a]";
    textMain = "text-amber-50";
    subText = "Solid trust signals and good user safety.";
  }

  return (
    <div className="flex flex-col items-end text-right leading-tight">
      {/* MAIN BADGE */}
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 border backdrop-blur-md shadow-sm",
          bg,
          border
        )}
      >
        {/* SCORE CIRCLE — smaller, clearer */}
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-extrabold shadow-inner",
            chipBg,
            chipText
          )}
        >
          {score}
        </span>

        {/* LABEL */}
        <span
          className={cn(
            "text-[11px] font-bold tracking-[0.14em] uppercase",
            textMain
          )}
        >
          Trust Score
        </span>
      </div>

      {/* SUBTEXT — compact, more readable */}
      <span className="mt-1 text-[10px] text-white/55 tracking-wide">
        {label} • {subText}
      </span>
    </div>
  );
}

/* ----------------- Top Choice helper ----------------- */
function isTopChoice(index) {
  return index === 0 || index === 1 || index === 2;
}

/* ----------------- Offer Card ----------------- */
export function OfferCard({ o, index }) {
  const cleanName = (o.name || "").replace(/\.com$/i, "");
  const shortFeatures = Array.isArray(o.features) ? o.features.slice(0, 2) : [];
  const category = o.bestFor
    ? o.bestFor.charAt(0).toUpperCase() + o.bestFor.slice(1)
    : null;

  function handleClick(e) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.openAgeGate?.(withUTM(o.affiliateUrl));
    }
  }

  const isTop = isTopChoice(index);

  return (
    <div
      className={cn(
        "group relative rounded-3xl p-[1px] bg-gradient-to-br",
        isTop
          ? "from-rose-300/70 via-pink-300/60 to-amber-200/50"
          : o.color || "from-white/20 to-white/5",
        "transition-transform duration-300 hover:scale-[1.01]"
      )}
    >
      {/* TOP CHOICE ribbon – ABOVE everything */}
      {isTop && (
        <div className="pointer-events-none absolute -top-3 left-5 z-40">
          <div
            className="
              inline-flex items-center gap-2
              px-4 py-1.5 rounded-full
              bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300
              text-[11px] font-extrabold tracking-wide uppercase text-black
              shadow-[0_4px_18px_rgba(255,120,150,0.55)]
              border border-white/40
              backdrop-blur-md
            "
          >
            <span className="h-2 w-2 rounded-full bg-black/30" />
            Top Choice
          </div>
        </div>
      )}

      {/* Glow overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_55%)] opacity-80 z-10" />

      {/* Content shell */}
      <div
        className={cn(
          "relative z-20 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/15 overflow-hidden",
          "flex flex-col sm:flex-row gap-4 sm:gap-6 p-5 sm:p-6",
          "group-hover:border-white/25 group-hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]"
        )}
      >
        {/* Left: Rank + Logo + Name */}
        <div className="flex sm:flex-col items-start gap-4 min-w-[0] sm:w-2/5">
          <div className="flex items-center sm:items-start gap-3">
            {/* Rank + logo column */}
            <div className="flex flex-col items-center gap-2">
              {/* Rank pill */}
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 border border-white/25 shadow-inner">
                <span className="text-sm font-semibold text-white/90">
                  #{index + 1}
                </span>
              </div>

              {/* Logo / visual slot */}
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/5 border border-white/20 overflow-hidden shadow-inner flex items-center justify-center">
                {o.logo ? (
                  <img
                    src={o.logo}
                    alt={`${cleanName} logo`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-lg sm:text-xl font-bold text-white/85">
                    {cleanName?.[0] || "?"}
                  </span>
                )}
              </div>
            </div>

            {/* Name + label */}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/55">
                Ranking
              </span>
              <h3 className="mt-0.5 text-lg sm:text-xl font-extrabold text-white leading-snug">
                {cleanName}
              </h3>

              {/* Category chip (desktop inline under name) */}
              {category && (
                <div className="hidden sm:block mt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/20 px-3 py-1 text-[11px] text-white/85">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
                    Best for: <span className="font-medium">{category}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col justify-between flex-1 min-w-[0]">
          {/* Top row: USP + Trust score */}
          <div className="flex justify-between items-start gap-3">
            <div className="text-sm text-white/85">
              {o.usp && <p>{o.usp}</p>}

              {/* Category chip on mobile */}
              {category && (
                <div className="mt-3 sm:hidden">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/20 px-3 py-1 text-[11px] text-white/85">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
                    Best for: <span className="font-medium">{category}</span>
                  </span>
                </div>
              )}
            </div>
            <RatingBadge rating={o.rating} />
          </div>

          {/* Features */}
          {shortFeatures.length > 0 && (
            <ul className="mt-3 text-[13px] text-white/80 grid gap-1.5">
              {shortFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-300" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}

          {/* CTA */}
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={handleClick}
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold
                         bg-gradient-to-r from-rose-200 via-pink-200 to-amber-200 text-[#2a1028]
                         shadow-[0_18px_45px_-24px_rgba(0,0,0,0.9)]
                         hover:brightness-105 active:scale-95 transition"
            >
              Visit Site
              <span className="ml-2 text-xs">↗</span>
            </button>

            <p className="text-[11px] text-white/55 sm:ml-1">
              External partner site · 18+ only
            </p>
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
  const [filter, setFilter] = useState("all");
  const [ageGateURL, setAgeGateURL] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false); // NEW: mobile menu

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.openAgeGate = (url) => setAgeGateURL(url);
    }
  }, []);

  const heroRef = useRef(null);
  const offersRef = useRef(null);
  const footerRef = useRef(null);

  const heroParallax = useParallax(heroRef, 0.32);
  const gridParallax = useParallax(offersRef, 0.22);
  const footSmall = useParallax(footerRef, 0.1);
  const footWide = useParallax(footerRef, 0.08);

  const filtered = useMemo(() => {
    let list = Array.isArray(OFFERS) ? OFFERS.slice(0) : [];
    list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    if (filter === "serious") return list.filter((o) => /serious/i.test(o.bestFor));
    if (filter === "casual") return list.filter((o) => /casual/i.test(o.bestFor));
    if (filter === "international")
      return list.filter((o) => /international/i.test(o.bestFor));
    return list;
  }, [filter]);

  function acceptAge() {
    if (ageGateURL) window.location.href = ageGateURL;
  }

  function closeAgeGate() {
    setAgeGateURL(null);
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <>
      <main className="min-h-screen text-white relative overflow-hidden bg-[#060313]">
        {/* Site-wide romantic background */}
        {/* Base vertical gradient */}
        <div className="pointer-events-none absolute inset-0 -z-40 bg-gradient-to-b from-[#1b0828] via-[#0a0514] to-[#04020a]" />
        {/* Pink glow top-right */}
        <div className="pointer-events-none absolute -top-40 -right-32 h-[420px] w-[420px] -z-30 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,153,213,0.65),transparent_60%)] blur-3xl opacity-80" />
        {/* Purple glow left-middle */}
        <div className="pointer-events-none absolute top-1/3 -left-40 h-[420px] w-[420px] -z-30 rounded-full bg-[radial-gradient(circle_at_center,rgba(126,112,255,0.6),transparent_60%)] blur-3xl opacity-70" />
        {/* Subtle couple photo texture */}
        <div className="pointer-events-none absolute inset-0 -z-20 bg-[url('https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-soft-light opacity-[0.22]" />
        {/* Fine grain for depth */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.22]" />

        {/* Navbar */}
        <header className="sticky top-0 z-30 bg-black/35 backdrop-blur-xl border-b border-white/15">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
            {/* Brand */}
            <Link
              className="flex items-center gap-3 font-extrabold"
              to="/"
              onClick={closeMobileMenu}
            >
              <div className="h-9 w-9 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center shadow">
                <img src="/logo.svg" className="h-6 w-6" alt="MatchFinderGuide" />
              </div>
              <span className="tracking-tight text-sm sm:text-base">
                MatchFinder<span className="text-rose-300">Guide</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-5 text-sm">
              {/* Categories dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/10 border border-white/25 hover:bg-white/15 text-xs font-semibold tracking-wide"
                >
                  <span>Categories</span>
                  <span className="text-[10px]">▾</span>
                </button>

                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-black/95 border border-white/15 
                             shadow-xl py-2 opacity-0 translate-y-1 invisible
                             group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible
                             transition"
                >
                  <Link
                    to="/general"
                    className="block px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 hover:text-white"
                  >
                    All / General
                  </Link>
                  <Link
                    to="/serios"
                    className="block px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 hover:text-white"
                  >
                    Serious Dating
                  </Link>
                  <Link
                    to="/international"
                    className="block px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 hover:text-white"
                  >
                    International Dating
                  </Link>
                  <Link
                    to="/casual"
                    className="block px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 hover:text-white"
                  >
                    Casual Dating
                  </Link>
                </div>
              </div>

              <span className="w-px h-5 bg-white/25" />

              <a
                href="#faq"
                className="hover:text-white/100 text-white/80 hover:underline"
              >
                FAQ
              </a>
              <a
                href="/privacy.html"
                className="hover:text-white/100 text-white/80 hover:underline"
              >
                Privacy
              </a>
              <a
                href="/terms.html"
                className="hover:text-white/100 text-white/80 hover:underline"
              >
                Terms
              </a>
              <button
                onClick={() => window.openCookieSettings?.()}
                className="hover:text-white/100 text-white/80 hover:underline"
                type="button"
              >
                Cookie Settings
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              type="button"
              className="sm:hidden inline-flex items-center justify-center rounded-full border border-white/30 bg-black/60 px-3 py-2 text-xs text-white/80"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? "Close" : "Menu"}
            </button>
          </div>

          {/* Mobile dropdown menu */}
          {mobileOpen && (
            <div className="sm:hidden border-t border-white/15 bg-black/90 px-4 py-4 text-sm space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">
                  Categories
                </p>
                <Link
                  to="/general"
                  onClick={closeMobileMenu}
                  className="block text-white/90 hover:text-white"
                >
                  All / General
                </Link>
                <Link
                  to="/serios"
                  onClick={closeMobileMenu}
                  className="block text-white/90 hover:text-white"
                >
                  Serious Dating
                </Link>
                <Link
                  to="/international"
                  onClick={closeMobileMenu}
                  className="block text-white/90 hover:text-white"
                >
                  International Dating
                </Link>
                <Link
                  to="/casual"
                  onClick={closeMobileMenu}
                  className="block text-white/90 hover:text-white"
                >
                  Casual Dating
                </Link>
              </div>

              <div className="h-px bg-white/15" />

              <div className="space-y-2">
                <a
                  href="#faq"
                  onClick={closeMobileMenu}
                  className="block text-white/80 hover:text-white"
                >
                  FAQ
                </a>
                <a
                  href="/privacy.html"
                  onClick={closeMobileMenu}
                  className="block text-white/80 hover:text-white"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms.html"
                  onClick={closeMobileMenu}
                  className="block text-white/80 hover:text-white"
                >
                  Terms
                </a>
                <button
                  type="button"
                  onClick={() => {
                    window.openCookieSettings?.();
                    closeMobileMenu();
                  }}
                  className="block text-left text-white/80 hover:text-white"
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
            className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.25]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1517840933437-c41356892b15?q=80&w=2000&auto=format&fit=crop')",
              ...heroParallax,
            }}
          />
          <div className="mx-auto max-w-5xl px-4 pt-14 pb-14">
            <div className="rounded-[28px] bg-black/25 border border-white/20 backdrop-blur-xl px-6 sm:px-10 py-10 text-center">
              <div className="mb-4 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 border border-white/25 shadow-sm backdrop-blur-md">
                <span className="rounded-full bg-white/10 px-2.5 py-1 border border-white/30 text-[11px] font-semibold tracking-[0.18em] uppercase text-white/90">
                  18+
                </span>
                <span className="text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase text-white/75">
                  Adult-only dating comparisons
                </span>
              </div>

              <div className="mt-1 space-y-3">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
                  Find Better Matches —{" "}
                  <span className="bg-gradient-to-r from-rose-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                    Safely &amp; Confidently
                  </span>
                </h1>
                <p className="max-w-2xl mx-auto text-white/80 text-sm sm:text-base md:text-lg leading-relaxed">
                  <span className="font-semibold text-white">
                    Independent, policy-compliant comparisons.
                  </span>{" "}
                  We highlight trusted dating apps and filter out low-quality, spammy
                  platforms so you can focus on real connections that fit what you&apos;re
                  looking for.
                </p>
              </div>

              <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="#offers"
                  className="inline-flex items-center justify-center rounded-2xl px-7 py-3.5 
               bg-gradient-to-r from-rose-200 via-pink-200 to-amber-200 
               text-[#2a1028] font-semibold text-sm sm:text-base
               shadow-[0_18px_45px_-24px_rgba(0,0,0,0.9)]
               hover:brightness-105 active:scale-95 transition"
                >
                  See Top Picks
                  <span className="ml-2 text-xs">↗</span>
                </a>
                <a
                  href="#faq"
                  className="inline-flex items-center justify-center rounded-2xl px-7 py-3.5 
               bg-white/5 border border-white/35 text-white/90 
               text-sm sm:text-base font-semibold
               hover:bg-white/10 hover:text-white active:scale-95 transition"
                >
                  How We Compare
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-y border-white/15 bg-black/20">
          <div className="mx-auto max-w-7xl px-4 py-7">
            <div className="rounded-3xl bg-black/35 border border-white/20 backdrop-blur-xl px-4 sm:px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Left: filter pills */}
              <div className="flex flex-col gap-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">
                  Filter offers
                </p>
                <div className="flex flex-wrap justify-start gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition border",
                        filter === f.key
                          ? "bg-white text-rose-700 border-white shadow-[0_12px_30px_-18px_rgba(0,0,0,0.95)]"
                          : "bg-white/5 text-white/85 border-white/25 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          filter === f.key ? "bg-rose-500" : "bg-white/50"
                        )}
                      />
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: trust badges */}
              <div className="flex flex-wrap gap-2 justify-start sm:justify-end text-[11px] sm:text-xs">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/90 text-[9px] text-black font-bold">
                    ✓
                  </span>
                  <span className="text-white/85 font-medium">Verified Reviews</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/40 bg-sky-500/10 px-3 py-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-400/90 text-[9px] text-black font-bold">
                    ✺
                  </span>
                  <span className="text-white/85 font-medium">No Spam</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Offers */}
        <section ref={offersRef} id="offers" className="relative py-12 px-4 overflow-hidden">
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.22]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2200&auto=format&fit=crop')",
              ...gridParallax,
            }}
          />
          <div className="absolute inset-0 -z-10 bg-black/25" />

          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
                  Editor’s Top Picks
                </div>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold">
                  Curated Dating Platforms We Trust
                </h2>
                <p className="mt-2 text-white/80 text-sm sm:text-base max-w-xl">
                  Ranked by safety, features, user success, privacy, and overall
                  transparency of each platform&apos;s experience.
                </p>
              </div>

              <div className="text-xs sm:text-sm text-white/70 md:text-right">
                <p className="font-semibold text-white/85">
                  Sorted by Trust Score{" "}
                  <span className="text-white/55">(highest → lowest)</span>
                </p>
                <p className="mt-1 text-white/60">
                  #1 is the strongest overall balance of safety, quality and value.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6 max-w-5xl mx-auto w-full px-2 sm:px-4">
              {filtered.map((o, index) => (
                <OfferCard key={o.id || o.name} o={o} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-4 pb-14">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-3xl bg-black/25 backdrop-blur-lg border border-white/20 p-6">
              <h3 className="text-2xl font-extrabold">Frequently Asked Questions</h3>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-white/95">
                <div>
                  <h4 className="font-bold">Are these platforms free?</h4>
                  <p className="text-white/75">
                    Many offer free signup with optional upgrades.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold">Which is the best for serious dating?</h4>
                  <p className="text-white/75">
                    Use the “Serious” filter to view long-term focused apps.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold">How do you rank apps?</h4>
                  <p className="text-white/75">
                    We analyze safety, verification, features, pricing, and user feedback.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold">Is this site for adults?</h4>
                  <p className="text-white/75">
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
          className="bg-black/25 backdrop-blur-xl border-t border-white/15 py-12 px-6 text-sm"
        >
          <div className="mx-auto max-w-7xl text-white/80">
            <p className="inline-flex items-center gap-2 text-xs uppercase text-white/75">
              <span className="rounded-full bg-white/10 px-2 py-1 border border-white/20">
                18+
              </span>
              Adult-only content
            </p>

            <p className="mt-4 font-bold text-white">Affiliate Disclosure</p>
            <p className="mt-1">
              We may earn a commission when you sign up through our links.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <a
                className="hover:text-white underline underline-offset-4"
                href="/privacy.html"
              >
                Privacy Policy
              </a>
              <a
                className="hover:text-white underline underline-offset-4"
                href="/terms.html"
              >
                Terms
              </a>
              <a
                className="hover:text-white underline underline-offset-4"
                href="/cookie.html"
              >
                Cookie Policy
              </a>
              <button
                type="button"
                onClick={() => window.openCookieSettings?.()}
                className="hover:text-white underline underline-offset-4"
              >
                Cookie Settings
              </button>
            </div>

            <p className="mt-8 text-white/50 hover:text-white transition">
              © {new Date().getFullYear()} MatchFinderGuide.com
            </p>
          </div>
        </footer>

        {/* Age Gate Modal */}
        {ageGateURL && (
          <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center px-6 backdrop-blur-sm">
            <div className="max-w-md w-full bg-[#1b0f23] border border-white/20 rounded-3xl p-8 text-center">
              <h2 className="text-2xl font-extrabold mb-3">Adults Only (18+)</h2>
              <p className="text-white/80">
                This offer contains adult-oriented material.
                <br />
                Please confirm that you are 18 years of age or older.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={closeAgeGate}
                  className="px-6 py-3 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20"
                >
                  Cancel
                </button>
                {/* 🔥 GTM için gerçek link */}
                <a
                  href={ageGateURL || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeAgeGate}
                  className="px-6 py-3 rounded-xl bg-white text-rose-700 font-bold inline-flex items-center justify-center"
                >
                  I am 18+
                </a>
              </div>
            </div>
          </div>
        )}

        <CookieConsent />
      </main>

      {/* Vercel Analytics */}
      <Analytics />
    </>
  );
}
