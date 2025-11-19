import React, { useEffect, useMemo, useState } from "react";
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

  return (
    <>
      <main
        className="min-h-screen text-white relative overflow-hidden
                 bg-gradient-to-br from-[#251730] via-[#2a183d] to-[#150a20]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.14]" />

        {/* Header (dropdown ile aynı logo) */}
        <header className="sticky top-0 z-30 bg-black/35 backdrop-blur-xl border-b border-white/15">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <a className="flex items-center gap-3 font-extrabold" href="/">
              <img src="/logo.svg" className="h-8 w-8" alt="MatchFinderGuide" />
              MatchFinderGuide
            </a>
          </div>
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
