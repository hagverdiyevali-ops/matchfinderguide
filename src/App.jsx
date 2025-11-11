import React, { useMemo, useState, useEffect, useRef } from "react";
import OFFERS from "./offers.js";
import CookieConsent from "./CookieConsent.jsx";

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
    if (!u.searchParams.get("utm_source")) u.searchParams.set("utm_source", "matchfinderguide");
    if (!u.searchParams.get("utm_medium")) u.searchParams.set("utm_medium", "site");
    if (!u.searchParams.get("utm_campaign")) u.searchParams.set("utm_campaign", "offers_grid");
    return u.toString();
  } catch {
    return url;
  }
}

/* ----------------- Rating Badge: TRUST SCORE BLOCK ----------------- */
function RatingBadge({ rating }) {
  const score = Number(rating)?.toFixed(1) || "0.0";
  return (
    <span
      className="px-3 py-1 rounded-md bg-white/15 
                 backdrop-blur-md border border-white/25
                 text-[11px] font-bold tracking-wide text-white/90"
    >
      {score} TRUST SCORE
    </span>
  );
}

/* ----------------- Top Choice helper ----------------- */
function isTopChoice(index) {
  return index === 0 || index === 1 || index === 2;
}

/* ----------------- Offer Card (no images; centered CTA; short copy) ----------------- */
function OfferCard({ o, index }) {
  const cleanName = (o.name || "").replace(/\.com$/i, "");
  const shortFeatures = Array.isArray(o.features) ? o.features.slice(0, 2) : [];

  return (
    <div
      className={cn(
        "group relative rounded-3xl p-[1px] bg-gradient-to-br",
        o.color || "from-white/25 to-white/8",
        "transition-transform duration-300 hover:scale-[1.02]"
      )}
    >
      {/* Top Choice ribbon (Option A: floating above, left aligned) */}
      {isTopChoice(index) && (
        <div className="absolute -top-3 left-5 z-30">
          <span className="px-3 py-1 rounded-md bg-gradient-to-r from-rose-500 to-pink-600
                           text-[11px] font-bold text-white shadow-lg tracking-wide">
            TOP CHOICE
          </span>
        </div>
      )}

      <div
        className={cn(
          "relative rounded-3xl bg-black/20 backdrop-blur-xl border border-white/20 overflow-hidden",
          "flex flex-col h-full",
          "transition-shadow duration-300",
          "group-hover:shadow-[0_24px_60px_-16px_rgba(0,0,0,0.65)] group-hover:border-white/30"
        )}
      >
        {/* Header */}
        <div className="px-6 pt-6 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-white">{cleanName}</h3>
          <RatingBadge rating={o.rating} />
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-4 flex flex-col grow">
          {o.usp && <p className="text-white/90">{o.usp}</p>}

          {shortFeatures.length > 0 && (
            <ul className="mt-3 text-sm text-white/85 grid gap-1">
              {shortFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
                  {f}
                </li>
              ))}
            </ul>
          )}

          {o.bestFor && (
            <div className="mt-3 flex items-center gap-2 text-sm text-white/90">
              <span className="font-semibold">Best for:</span>
              <span className="px-2 py-1 rounded-full bg-white/10 border border-white/20">
                {o.bestFor}
              </span>
            </div>
          )}

          <div className="mt-6 flex-1" />

          {/* CTA centered */}
          <div className="flex justify-center">
            <a
              href={withUTM(o.affiliateUrl)}
              rel="nofollow sponsored noopener"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold
                         text-rose-700 bg-white shadow-[0_8px_20px_-4px_rgba(255,255,255,0.5)]
                         hover:opacity-95 active:scale-95 transition"
            >
              Visit Site
            </a>
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

/* ----------------- Page ----------------- */
export default function App() {
  const [filter, setFilter] = useState("all");

  const heroRef = useRef(null);
  const offersRef = useRef(null);
  const footerRef = useRef(null);

  const heroParallax = useParallax(heroRef, 0.32);
  const gridParallax = useParallax(offersRef, 0.22);
  const footSmall = useParallax(footerRef, 0.1);
  const footWide = useParallax(footerRef, 0.08);

  const filtered = useMemo(() => {
    let list = Array.isArray(OFFERS) ? OFFERS.slice(0) : [];
    list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)); // high → low
    if (filter === "serious") return list.filter((o) => /serious/i.test(o.bestFor));
    if (filter === "casual") return list.filter((o) => /casual/i.test(o.bestFor));
    if (filter === "international") return list.filter((o) => /international/i.test(o.bestFor));
    return list;
  }, [filter]);

  return (
    <main
      className="min-h-screen text-white relative overflow-hidden
                 bg-gradient-to-br from-[#251730] via-[#2a183d] to-[#150a20]"
    >
      {/* subtle grain */}
      <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.14]" />

      {/* navbar */}
      <header className="sticky top-0 z-30 bg-black/25 backdrop-blur-xl border-b border-white/15">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <a className="flex items-center gap-3 font-extrabold" href="/">
            <img src="/logo.svg" className="h-8 w-8" alt="MatchFinderGuide logo" />
            MatchFinderGuide
          </a>
          <nav className="hidden sm:flex gap-6 text-sm">
            <a href="#offers" className="hover:underline">Offers</a>
            <a href="#faq" className="hover:underline">FAQ</a>
            <a href="/privacy.html" className="hover:underline">Privacy</a>
            <a href="/terms.html" className="hover:underline">Terms</a>
            <button
              onClick={() => window.openCookieSettings?.()}
              className="hover:underline"
              type="button"
            >
              Cookie Settings
            </button>
          </nav>
        </div>
      </header>

      {/* hero */}
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
            <p className="mb-2 inline-flex items-center gap-2 text-xs uppercase text-white/80">
              <span className="rounded-full bg-white/10 px-2 py-1 border border-white/20">18+</span>
              Adult-only dating comparisons
            </p>
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
              Find Better Matches — Safely & Confidently
            </h1>
            <p className="mt-3 text-white/85 text-lg">
              We compare trusted dating apps so you can pick the right one.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#offers"
                className="rounded-2xl px-6 py-3 bg-white text-rose-700 font-bold shadow-lg hover:opacity-95"
              >
                See Top Picks
              </a>
              <a
                href="#faq"
                className="rounded-2xl px-6 py-3 bg-white/10 border border-white/25 backdrop-blur-md text-white font-bold hover:bg-white/20"
              >
                How We Compare
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* filters */}
      <section className="bg-black/25 backdrop-blur-lg border-y border-white/15">
        <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap justify-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition border",
                  filter === f.key
                    ? "bg-white text-rose-700 border-white shadow-lg"
                    : "bg-white/10 text-white border-white/25 hover:bg-white/20"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3 justify-center text-xs text-white/75">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">Verified Reviews</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">No Spam</span>
          </div>
        </div>
      </section>

      {/* offers grid */}
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
          <h2 className="text-3xl font-extrabold">Editor’s Top Picks</h2>
          <p className="mt-2 text-white/80">
            Ranked by safety, features, user success, privacy, and transparency.
          </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch">
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
                <p className="text-white/75">Many offer free signup with optional upgrades.</p>
              </div>
              <div>
                <h4 className="font-bold">Which is best for serious dating?</h4>
                <p className="text-white/75">Use the “Serious” filter to view long-term focused apps.</p>
              </div>
              <div>
                <h4 className="font-bold">How do you rank apps?</h4>
                <p className="text-white/75">We analyze safety, verification, features, pricing, and user feedback.</p>
              </div>
              <div>
                <h4 className="font-bold">Is this site for adults?</h4>
                <p className="text-white/75">Yes — intended for adults 18+ only.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer ref={footerRef} className="bg-black/25 backdrop-blur-xl border-t border-white/15 py-12 px-6 text-sm">
        <div className="mx-auto max-w-7xl text-white/80">
          <p className="inline-flex items-center gap-2 text-xs uppercase text-white/75">
            <span className="rounded-full bg-white/10 px-2 py-1 border border-white/20">18+</span>
            Adult-only content
          </p>
          <p className="mt-4 font-bold text-white">Affiliate Disclosure</p>
          <p className="mt-1">We may earn a commission when you sign up through our links.</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a className="hover:text-white underline underline-offset-4" href="/privacy.html">Privacy Policy</a>
            <a className="hover:text-white underline underline-offset-4" href="/terms.html">Terms</a>
            <a className="hover:text-white underline underline-offset-4" href="/cookie.html">Cookie Policy</a>
            <a className="hover:text-white underline underline-offset-4" href="/contact.html">Contact</a>
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

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </main>
  );
}
