import React, { useEffect, useState, useCallback } from "react";

/**
 * Minimal Consent Mode v2 helper
 */
function updateGtagConsent(status) {
  // status: 'granted' | 'denied'
  const payload = {
    ad_storage: status,
    analytics_storage: status,
    ad_user_data: status,
    ad_personalization: status,
  };
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", payload);
  }
}

const LS_KEY = "mfg.cookieConsent"; // MatchFinderGuide

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  const applySavedConsent = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if (!saved) {
        // First visit: default to "denied" and show banner
        updateGtagConsent("denied");
        setVisible(true);
        return;
      }
      // Apply saved choice silently
      updateGtagConsent(saved.status === "granted" ? "granted" : "denied");
      setVisible(false);
    } catch {
      updateGtagConsent("denied");
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    applySavedConsent();
    // Expose a global hook to reopen the banner
    if (typeof window !== "undefined") {
      window.openCookieSettings = () => setVisible(true);
    }
  }, [applySavedConsent]);

  function acceptAll() {
    localStorage.setItem(LS_KEY, JSON.stringify({ status: "granted", ts: Date.now() }));
    updateGtagConsent("granted");
    setVisible(false);
  }

  function rejectAll() {
    localStorage.setItem(LS_KEY, JSON.stringify({ status: "denied", ts: Date.now() }));
    updateGtagConsent("denied");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4">
      <div className="mx-auto max-w-5xl rounded-2xl border border-white/20 bg-black/70 backdrop-blur-xl p-4 text-white shadow-2xl">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="text-sm leading-relaxed">
            <p className="font-semibold">Cookies & Consent</p>
            <p className="text-white/85">
              We use cookies for analytics and ads (Consent Mode v2). Choose “Accept” to enable
              analytics and personalized advertising, or “Reject” to continue with strictly necessary cookies.
              See our <a href="/privacy.html" className="underline hover:text-white">Privacy</a> and{" "}
              <a href="/cookie.html" className="underline hover:text-white">Cookie Policy</a>.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={rejectAll}
              className="px-4 py-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 font-semibold"
            >
              Reject
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 rounded-xl bg-white text-rose-700 font-bold shadow hover:opacity-95"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
