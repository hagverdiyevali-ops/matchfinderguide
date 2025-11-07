// src/offers.js
// All offers live here. Add/remove freely.
// "bestFor" should include keywords like: Serious, Casual, International, Mature (18+)

const OFFERS = [
  /* ============================
     ✅ Your Real Offer #1
     ============================ */
  {
    id: "ofs-101",
    name: "Single Slavic",
    rating: 5.0,
    bestFor: "Casual",
    usp: "Meet authentic Slavic singles looking for fun, meaningful conversations, and exciting new connections.",
    features: [
      "Real verified profiles",
      "Instant match & chat",
      "Private photo requests",
      "Modern swipe-style interface"
    ],
    color: "from-white/38 to-white/8",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=900&auto=format&fit=crop",
    bg:
      "https://images.unsplash.com/photo-1502720705749-3c5494588377?q=80&w=1600&auto=format&fit=crop",
    affiliateUrl:
      "https://www.ds88trk.com/3RKF314/6SZ1L47/?sub1=matchfinderguide",
  },

  /* ============================
     ✅ New Offers
     ============================ */

  // 1) NordFlirt
  {
    id: "ofs-201",
    name: "NordFlirt",
    rating: 4.9,
    bestFor: "International & Casual",
    usp: "Connect with Northern European singles seeking genuine chats and easygoing dating.",
    features: [
      "Quick match suggestions",
      "Location-smart discovery",
      "Profile verification",
      "Clean, modern interface"
    ],
    color: "from-white/38 to-white/8",
    image:
      "https://images.unsplash.com/photo-1520974722031-1e434b216229?q=80&w=900&auto=format&fit=crop",
    bg:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
    affiliateUrl:
      "https://find.sereneromance.today/click?affid=16096&offerid=9032&sub1=YOUR_CLICK_ID&sub3=YOUR_SOURCE&sub5=YOUR_SUB_SOURCE",
  },

  // 2) JessieDates
  {
    id: "ofs-202",
    name: "JessieDates",
    rating: 4.7,
    bestFor: "Casual & New Connections",
    usp: "Simple, friendly dating app feel with fast chats and flexible discovery.",
    features: [
      "Instant chat & likes",
      "Smart filters",
      "Photo & profile checks",
      "Mobile-first experience"
    ],
    color: "from-white/38 to-white/8",
    image:
      "https://images.unsplash.com/photo-1502720705749-3c5494588377?q=80&w=900&auto=format&fit=crop",
    bg:
      "https://images.unsplash.com/photo-1512310604669-443f26c35f36?q=80&w=1600&auto=format&fit=crop",
    affiliateUrl:
      "https://find.truelovepath.online/click?affid=16096&offerid=8601&lp=e6af6bd262&sub1=YOUR_CLICK_ID&sub3=YOUR_SOURCE",
  },

  // 3) MilfsDiscovery (note: brand name may be sensitive for Google Search; content kept neutral)
  {
    id: "ofs-203",
    name: "MilfsDiscovery",
    rating: 4.6,
    bestFor: "Mature (18+) & Casual",
    usp: "Meet mature adults open to conversation-first dating in a private, respectful environment.",
    features: [
      "Discreet profile controls",
      "Private chat requests",
      "Verification and reporting tools",
      "Clear community guidelines"
    ],
    color: "from-white/38 to-white/8",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=900&auto=format&fit=crop",
    bg:
      "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop",
    affiliateUrl:
      "https://eclipse.trkvrtn.com/click?affid=16096&offerid=7773&sub1=YOUR_CLICK_ID&sub3=YOUR_SOURCE&sub5=YOUR_SUB_SOURCE",
  },

  // 4) BeHappy2Day.com
  {
    id: "ofs-204",
    name: "BeHappy2Day.com",
    rating: 4.5,
    bestFor: "International & Serious",
    usp: "Global introductions with translation support and focused profiles for long-term goals.",
    features: [
      "Live translation options",
      "Video calls and chat",
      "Verified member badges",
      "Anti-fraud protection"
    ],
    color: "from-white/38 to-white/8",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=900&auto=format&fit=crop",
    bg:
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1600&auto=format&fit=crop",
    affiliateUrl:
      "https://www.affiliate2day.com/idevaffiliate.php?id=30088_4",
  },

  // 5) AsianSingles2day.com
  {
    id: "ofs-205",
    name: "AsianSingles2day.com",
    rating: 4.3,
    bestFor: "Asian & International",
    usp: "Meet Asian singles worldwide with verified profiles and built-in translation.",
    features: [
      "Profile verification",
      "Live translate & video",
      "Secure messaging",
      "Regional discovery"
    ],
    color: "from-white/38 to-white/8",
    image:
      "https://images.unsplash.com/photo-1526045612212-70caf35c14df?q=80&w=900&auto=format&fit=crop",
    bg:
      "https://images.unsplash.com/photo-1487412912498-0447578fcca8?q=80&w=1600&auto=format&fit=crop",
    affiliateUrl:
      "https://www.affiliate2day.com/idevaffiliate.php?id=30088_10",
  },

  // 6) OneWife.com
  {
    id: "ofs-206",
    name: "OneWife.com",
    rating: 4.2,
    bestFor: "International & Long-Term",
    usp: "Serious-minded singles looking for committed relationships across borders.",
    features: [
      "Detailed profiles",
      "Identity checks",
      "Video introductions",
      "Fraud-monitoring team"
    ],
    color: "from-white/38 to-white/8",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop",
    bg:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1600&auto=format&fit=crop",
    affiliateUrl:
      "https://www.affiliate2day.com/idevaffiliate.php?id=30088_9",
  },

  // 7) AllTverladies.com
  {
    id: "ofs-207",
    name: "AllTverladies.com",
    rating: 4.0,
    bestFor: "International",
    usp: "Discover international singles with curated profiles and proactive support.",
    features: [
      "Curated introductions",
      "In-app translation",
      "Photo & ID checks",
      "Helpful customer support"
    ],
    color: "from-white/38 to-white/8",
    image:
      "https://images.unsplash.com/photo-1520974722031-1e434b216229?q=80&w=900&auto=format&fit=crop",
    bg:
      "https://images.unsplash.com/photo-1517840933437-c41356892b15?q=80&w=1600&auto=format&fit=crop",
    affiliateUrl:
      "https://www.affiliate2day.com/idevaffiliate.php?id=30088_15",
  },
];

export default OFFERS;
