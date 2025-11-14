import React, { useState, useEffect } from "react";
import offers from "./offers";
import { Analytics } from "@vercel/analytics/react";   // ✅ NEW

export default function App() {
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setShowCookieBanner(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShowCookieBanner(false);

    // Google Consent Mode v2
    if (window.gtag) {
      window.gtag("consent", "update", {
        ad_user_data: "granted",
        ad_personalization: "granted",
        ad_storage: "granted",
        analytics_storage: "granted",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1d0f26] to-[#2a0f33] text-white relative overflow-hidden">

      {/* HEADER */}
      <header className="py-6 px-6 flex items-center justify-between backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="text-2xl font-bold">❤️ MatchFinderGuide</div>
        <nav className="hidden md:flex gap-8 text-white/70">
          <a href="/privacy.html" className="hover:text-white">Privacy</a>
          <a href="/terms.html" className="hover:text-white">Terms</a>
          <a href="/cookie.html" className="hover:text-white">Cookies</a>
        </nav>
      </header>

      {/* HERO */}
      <section className="text-center py-20 px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
          Find Better Matches — Safely & Confidently
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          Independent rankings based on safety, transparency, verification systems & user satisfaction.
        </p>
      </section>

      {/* OFFER GRID */}
      <section className="px-6 pb-32 max-w-6xl mx-auto grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer, index) => (
          <div
            key={index}
            className="relative rounded-3xl p-6 bg-white/10 border border-white/10 backdrop-blur-xl
                       hover:bg-white/20 transition shadow-xl"
          >
            {/* Highlight top choice */}
            {offer.top && (
              <div className="absolute -top-3 left-4 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                TOP CHOICE
              </div>
            )}

            <div className="text-2xl font-semibold mb-2">{offer.name}</div>

            {/* Trust Score */}
            <div className="inline-block mb-4 px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-sm">
              ⭐ {offer.rating} / 5 Trust Score
            </div>

            <p className="text-white/80 text-sm mb-4">{offer.description}</p>

            <ul className="text-white/60 text-sm space-y-2 mb-6">
              {offer.features.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>

            {/* CTA CENTERED */}
            <div className="flex justify-center">
              <a
                href={offer.link}
                target="_blank"
                rel="nofollow"
                className="bg-pink-600 hover:bg-pink-700 transition text-white px-6 py-3 rounded-xl font-bold shadow-lg"
              >
                Visit Site
              </a>
            </div>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="text-center text-white/50 py-10">
        © {new Date().getFullYear()} MatchFinderGuide — All rights reserved.
      </footer>

      {/* COOKIE BANNER */}
      {showCookieBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md 
                        bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl">
          <div className="text-white text-sm mb-3">
            We use cookies for security, analytics, and improving your experience.
            By using this site, you agree to our{" "}
            <a href="/privacy.html" className="underline">Privacy Policy</a>.
          </div>
          <button
            onClick={acceptCookies}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg font-semibold"
          >
            Accept Cookies
          </button>
        </div>
      )}

      {/* ✅ VERCEL ANALYTICS */}
      <Analytics />

    </div>
  );
}
