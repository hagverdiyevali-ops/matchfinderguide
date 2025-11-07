import React, { useEffect, useState, useCallback, useRef } from "react";

const STORAGE_KEY = "cookieConsent"; // 'granted' | 'denied'

export default function CookieConsent({ onVisibleChange }) {
  const [visible, setVisible] = useState(false);
  const barRef = useRef(null);

  // Notify parent when visibility changes (to lift mobile CTA)
  useEffect(() => {
    onVisibleChange?.(visible);
  }, [visible, onVisibleChange]);

  // Show banner only if not decided yet
  useEffect(() => {
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      if (!val) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "granted");
      localStorage.setItem("cookieConsentAt", new Date().toISOString());
    } catch {}
    setVisible(false);
  }, []);

  const decline = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "denied");
      localStorage.setItem("cookieConsentAt", new Date().toISOString());
    } catch {}
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 bottom-0 z-[60]" // above mobile CTA
      role="dialog"
      aria-live="polite"
    >
      <div className="mx-auto max-w-7xl px-4 pb-4">
        <div className="rounded-2xl border border-white/20 bg-black/70 backdrop-blur-xl text-white shadow-2xl">
          <div className="p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm sm:text-[15px] leading-relaxed">
              We use essential cookies to run this site and optional cookies to
              improve performance. See our{" "}
              <a href="/cookie.html" className="underline underline-offset-4 hover:text-white">
                Cookie Policy
              </a>{" "}
              and{" "}
              <a href="/privacy.html" className="underline underline-offset-4 hover:text-white">
                Privacy Policy
              </a>
              .
            </div>

            <div className="flex gap-2 sm:gap-3 justify-end">
              <button
                onClick={decline}
                className="px-4 py-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/15 font-semibold text-sm"
              >
                Decline
              </button>
              <button
                onClick={accept}
                className="px-4 py-2 rounded-xl bg-white text-rose-700 font-bold hover:opacity-95"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
