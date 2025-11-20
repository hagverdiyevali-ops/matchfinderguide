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
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 border backdrop-blur-md shadow-sm",
          bg,
          border
        )}
      >
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-extrabold shadow-inner",
            chipBg,
            chipText
          )}
        >
          {score}
        </span>
        <span
          className={cn(
            "text-[11px] font-bold tracking-[0.14em] uppercase",
            textMain
          )}
        >
          Trust Score
        </span>
      </div>
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

      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_55%)] opacity-80 z-10" />

      <div
        className={cn(
          "relative z-20 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/15 overflow-hidden",
          "flex flex-col sm:flex-row gap-4 sm:gap-6 p-5 sm:p-6",
          "group-hover:border-white/25 group-hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]"
        )}
      >
        <div className="flex sm:flex-col items-start gap-4 min-w-[0] sm:w-2/5">
          <div className="flex items-center sm:items-start gap-3">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 border border-white/25 shadow-inner">
                <span className="text-sm font-semibold text-white/90">
                  #{index + 1}
                </span>
              </div>

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

            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/55">
                Ranking
              </span>
              <h3 className="mt-0.5 text-lg sm:text-xl font-extrabold text-white leading-snug">
                {cleanName}
              </h3>

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

        <div className="flex flex-col justify-between flex-1 min-w-[0]">
          <div className="flex justify-between items-start gap-3">
            <div className="text-sm text-white/85">
              {o.usp && <p>{o.usp}</p>}

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
  const [mobileOpen, setMobileOpen] = useState(false);

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

  function closeAgeGate() {
    setAgeGateURL(null);
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <>
      <main className="min-h-screen text-white relative overflow-hidden bg-[#060313]">
        {/* background stuff ... (aynı kaldı) */}
        <div className="pointer-events-none absolute inset-0 -z-40 bg-gradient-to-b from-[#1b0828] via-[#0a0514] to-[#04020a]" />
        <div className="pointer-events-none absolute -top-40 -right-32 h-[420px] w-[420px] -z-30 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,153,213,0.65),transparent_60%)] blur-3xl opacity-80" />
        <div className="pointer-events-none absolute top-1/3 -left-40 h-[420px] w-[420px] -z-30 rounded-full bg-[radial-gradient(circle_at_center,rgba(126,112,255,0.6),transparent_60%)] blur-3xl opacity-70" />
        <div className="pointer-events-none absolute inset-0 -z-20 bg-[url('https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-soft-light opacity-[0.22]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.22]" />

        {/* Navbar ... (aynı) */}
        {/* ---- NAVBAR KISMINI SENDEKİYLE AYNEN BIRAKTIM, DEĞİŞMEDİ ---- */}

        {/* ... burada navbar, hero, filters, offers, FAQ, footer seninkiyle aynı kaldı ...
            sadece Age Gate modal kısmını aşağıda değiştirdik */}
        {/* Hero Section */}
        {/* (hero, filters, offers, faq, footer kodlarını değiştirmedim; senin gönderdiğinle aynı bırakabilirsin) */}

        {/* ... hero, filters, offers, faq, footer code burada ... */}
        {/* Ben kısaltmak için tekrar yazmıyorum, sende ne varsa aynen kalacak. 
            Önemli değişiklik sadece Age Gate modal. */}

        {/* Footer */}
        {/* footerRef kullandığın bölüm sende nasılsa öyle kalabilir */}

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
                {/* 🔥 IMPORTANT: THIS IS NOW A REAL LINK */}
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

      <Analytics />
    </>
  );
}
