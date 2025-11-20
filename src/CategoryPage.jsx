import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import OFFERS from "./offers.js";
import CookieConsent from "./CookieConsent.jsx";
import { OfferCard } from "./App.jsx";

function getFilteredOffers(variant) {
  let list = Array.isArray(OFFERS) ? OFFERS.slice(0) : [];
  // Trust Score (rating) yüksekten düşüğe
  list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));

  if (variant === "serious") return list.filter((o) => /serious/i.test(o.bestFor));
  if (variant === "casual") return list.filter((o) => /casual/i.test(o.bestFor));
  if (variant === "international") return list.filter((o) => /international/i.test(o.bestFor));

  // general veya bilinmeyen → hepsi
  return list;
}

export default function CategoryPage({ variant, title, subtitle }) {
  const [ageGateURL, setAgeGateURL] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.openAgeGate = (url) => setAgeGateURL(url);
    }
  }, []);

  const filtered = useMemo(() => getFilteredOffers(variant), [variant]);

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
      <main
        className="min-h-screen text-white relative overflow-hidden
                 bg-gradient-to-br from-[#251730] via-[#2a183d] to-[#150a20]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.14]" />

        {/* Navbar (same style as main page) */}
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

              <a href="/#faq" className="hover:text-white/100 text-white/80 hover:underline">
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
                  href="/#faq"
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

        {/* Başlık + liste */}
        <section className="relative py-10 px-4">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-white/80 text-sm sm:text-base">{subtitle}</p>
            )}
            <p className="mt-1 text-xs text-white/60">
              Sorted by <span className="font-semibold">Trust Score</span> (highest to lowest).
            </p>

            <div className="mt-8 space-y-5">
              {filtered.map((o, index) => (
                <OfferCard key={o.id || o.name} o={o} index={index} />
              ))}

              {filtered.length === 0 && (
                <p className="text-white/70 text-sm">
                  No offers found for this category yet.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black/25 backdrop-blur-xl border-t border-white/15 py-10 px-6 text-sm">
          <div className="mx-auto max-w-5xl text-white/80">
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
                <button
                  onClick={acceptAge}
                  className="px-6 py-3 rounded-xl bg-white text-rose-700 font-bold"
                >
                  I am 18+
                </button>
              </div>
            </div>
          </div>
        )}

        <CookieConsent />
      </main>
    </>
  );
}
