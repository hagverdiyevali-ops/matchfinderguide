// src/webcamOffers.js

const WEBCAM_OFFERS = [
  /* 1️⃣ NABO MATCH */
  {
    name: "Nabo Match",
    rating: 5.0,
    bestFor: "seriøs dating",
    usp: "En ren og fokusert datingplattform designet for langsiktige forbindelser.",
    features: ["Relasjonsfokusert fellesskap", "Enkel onboarding-prosess", "Optimalisert for desktop og mobil"],
    affiliateUrl:
      "https://find.sereneromance.today/click?affid=16096&offerid=9283&sub1={click_id}&sub2={gclid}&sub3={source}&sub5={sub_source}&lp=8f47617c6f",
    color: "from-rose-400/25 to-pink-700/20",
    preview: "/previews-webcam/nabomatch.png",

    // NEW FLAGS
    randomChat: false,
    freePrivateShows: false,
    instantMatch: false,
  },

  /* 2️⃣ LYSTPASEX */
  {
    name: "LystPaSex",
    rating: 4.8,
    bestFor: "tilfeldige møter",
    usp: "Rask registreringsplattform for dating med fokus på umiddelbare forbindelser og matcher i nærheten.",
    features: ["Rask registrering", "Stedsbaserte treff", "Mobiloptimalisert opplevelse"],
    affiliateUrl:
      "https://jndabb.afftrk06.com/?utm_source=2b9d283c183e14fc&s1=235083&s2=229745&s3={click_id}&s5={sub_source}&click_id={click_id}",
    color: "from-fuchsia-500/25 to-purple-800/20",
    preview: "/previews-webcam/lystpasex.png",

    randomChat: false,
    freePrivateShows: false,
    instantMatch: true,
  },

  /* 3️⃣ FUCKFINDER */
  {
    name: "FuckFinder",
    rating: 4.8,
    bestFor: "uformelle møter",
    usp: "Direkte og dristig datingplattform fokusert på raske matcher uten forpliktelser.",
    features: ["Svært rask registrering", "Eksplisitt intensjonsmatching", "Fungerer bra på mobil"],
    affiliateUrl: "https://trustedoffers.pro/a/o2KXjsvvm8IVQnJ?sub1={click_id}&sub2={gclid}&sub3={source}&sub5={sub_source}",
    color: "from-red-500/30 to-rose-800/20",
    preview: "/previews-webcam/fuckfinder.png",

    randomChat: false,
    freePrivateShows: false,
    instantMatch: true,
  },

  /* 4️⃣ ONENIGHTFRIEND */
  {
    name: "OneNightFriend",
    rating: 4.6,
    bestFor: "engangsstand",
    usp: "Uformell datingside designet for spontane møter og kortvarig moro.",
    features: ["Stedsbasert matching", "Rask profiloppsett", "Diskret og brukervennlig"],
    affiliateUrl: "https://top-deal.me/a/qx5LlTXzo2hQ8zg?sub1={click_id}&sub2={gclid}&sub3={source}&sub5={sub_source}",
    color: "from-orange-400/30 to-red-700/20",
    preview: "/previews-webcam/Onenightfriend.png",

    randomChat: false,
    freePrivateShows: false,
    instantMatch: true,
  },

  /* 5️⃣ KUKOST */
  {
    name: "KuKost",
    rating: 4.5,
    bestFor: "fri tilgang",
    usp: "Enkel og grei webkameraside som tilbyr rask tilgang til liverom.",
    features: ["Gratis grunnleggende tilgang", "Utøvere på nett døgnet rundt", "Fungerer problemfritt på mobil"],
    affiliateUrl:
      "https://go.cm-trk6.com/aff_nl?offer_id=12909&aff_id=92400&lands=133&url_id=23334&aff_sub1={click_id}&aff_sub2={gclid}&aff_sub3={source}&aff_sub5={sub_source}",
    color: "from-red-600/30 to-black/20",
    preview: "/previews-webcam/kukost.png",

    randomChat: false,
    freePrivateShows: true,
    instantMatch: true,
  },

  /* 6️⃣ LUST STATION */
  {
    name: "Lust Station",
    rating: 4.4,
    bestFor: "variasjon",
    usp: "En mangfoldig webkameraplattform med mange kategorier og liverom å utforske.",
    features: ["Bredt utvalg av utøvere", "Alternativer for gruppe- og privatchat", "Nybegynnervennlig layout"],
    affiliateUrl:
      "https://go.cm-trk6.com/aff_nl?offer_id=13670&aff_id=92400&lands=123&aff_sub1={click_id}&aff_sub2={gclid}&aff_sub3={source}&aff_sub5={sub_source}",
    color: "from-emerald-300/25 to-blue-800/20",
    preview: "/previews-webcam/lust-station.png",

    randomChat: false,
    freePrivateShows: true,
    instantMatch: false,
  },

  /* 7️⃣ BENaughty */
  {
    name: "BeNaughty",
    rating: 4.3,
    bestFor: "flørting og uformell dating",
    usp: "Leken datingplattform med en stor, aktiv brukerbase og umiddelbare matcher.",
    features: ["Stort globalt publikum", "Flørt-først-matching", "Sterk mobilopplevelse"],
    affiliateUrl: "https://top-deal.me/a/o2KXjsvB0MfVQnB?sub1={click_id}&sub2={gclid}&sub3={source}&sub5={sub_source}",
    color: "from-pink-500/30 to-fuchsia-700/20",
    preview: "/previews-webcam/BeNaughty.png",

    randomChat: false,
    freePrivateShows: false,
    instantMatch: true,
  },

  /* 8️⃣ SECRET DATING CLUB */
  {
    name: "SecretDatingClub",
    rating: 4.2,
    bestFor: "diskrete affærer",
    usp: "Personvernfokusert datingside for diskrete forbindelser og anonym surfing.",
    features: ["Diskré profiler", "Personvern først", "Anonyme nettleseralternativer"],
    affiliateUrl: "https://top-deal.me/a/68yKBhGp0BFmrE2?sub1={click_id}&sub2={gclid}&sub3={source}&sub5={sub_source}",
    color: "from-slate-700/40 to-black/30",
    preview: "/previews-webcam/SecretDatingClub.png",

    randomChat: false,
    freePrivateShows: false,
    instantMatch: false,
  },

  /* 9️⃣ INSTACAMS */
  {
    name: "InstaCams",
    rating: 4.1,
    bestFor: "live chat",
    usp: "Pålitelige strømmer og en smidig opplevelse – flott for livechat når som helst.",
    features: ["HD-strømmer og pålitelig kvalitet", "Enkel navigering for nybegynnere", "Private rom tilgjengelig når som helst"],
    affiliateUrl:
      "https://go.cm-trk6.com/aff_c?offer_id=12348&aff_id=92400&url_id=21759&aff_sub1={click_id}&aff_sub2={gclid}&aff_sub3={source}&aff_sub5={sub_source}",
    color: "from-purple-500/30 to-pink-500/20",
    preview: "/previews-webcam/instacams.png",

    randomChat: false,
    freePrivateShows: true,
    instantMatch: false,
  },

  /* 🔟 MYUKRAINIANGIRLS */
  {
    name: "MyUkrainianGirls",
    rating: 4.9,
    bestFor: "internasjonal dating",
    usp: "Internasjonal datingplattform fokusert på meningsfulle forbindelser med verifiserte profiler.",
    features: ["Profilbasert matching", "Internasjonal brukerbase", "Private meldinger og live-interaksjon"],
    affiliateUrl:
      "https://find.gentletouch.today/click?affid=16096&offerid=9297&sub1={click_id}&sub2={gclid}&sub3={source}&sub5={sub_source}&lp=0e8cbef5c5",
    color: "from-sky-500/25 to-indigo-700/20",
    preview: "/previews-webcam/myukrainiangirls.png",

    randomChat: true,
    freePrivateShows: false,
    instantMatch: true,
  },

  /* 1️⃣1️⃣ JERK-ROULETTE */
  {
    name: "Jerk-Roulette",
    rating: 3.8,
    bestFor: "tilfeldig chat",
    usp: "Rask og tilfeldig webkamerachat med et moderne og brukervennlig grensesnitt.",
    features: ["Øyeblikkelig tilfeldig matching", "Stor, aktiv brukerbase", "Enkel registrering – begynn å chatte raskt"],
    affiliateUrl:
      "https://go.cm-trk6.com/aff_c?offer_id=13753&aff_id=92400&url_id=25740&aff_sub1={click_id}&aff_sub2={gclid}&aff_sub3={source}&aff_sub5={sub_source}",
    color: "from-slate-800/40 to-slate-900/20",
    preview: "/previews-webcam/jerkroulette.png",

    randomChat: true,
    freePrivateShows: true,
    instantMatch: true,
  },

  /* 1️⃣2️⃣ NORDFLIRT */
  {
    name: "NordFlirt",
    rating: 4.9,
    bestFor: "nordiske singler",
    usp: "Datingplattform skreddersydd for nordiske og europeiske single som søker ekte matches.",
    features: ["Nordisk fokusert målgruppe", "Enkelt og intuitivt brukergrensesnitt", "Sikre kommunikasjonsverktøy"],
    affiliateUrl:
      "https://find.sereneromance.today/click?affid=16096&offerid=9032&sub1={click_id}&sub2={gclid}&sub3={source}&sub5={sub_source}&lp=a3481aed61",
    color: "from-cyan-400/25 to-blue-900/20",
    preview: "/previews-webcam/nordflirt.png",

    randomChat: false,
    freePrivateShows: false,
    instantMatch: false,
  },

    /* 1️⃣3 Stripchat */
  {
    name: "Stripchat",
    rating: 4.2,
    bestFor: "+18 sendinger",
    usp: "Stripchat er stedet hvor du finner live sexkameraer. Denne tjenesten inneholder tusenvis av kategorier, slik at alle vil finne noe som passer for seg selv.",
    features: ["videochat", "tusenvis av kategorier", "live sexcams"],
    affiliateUrl:
      "https://top-deal.me/a/VOrn7CPWMjIJkGK?sub1={click_id}&sub2={gclid}&sub3={source}&sub5={sub_source}",
    color: "from-red-600/30 to-black/20",
    preview: "/previews-webcam/stripchat.png",

    randomChat: false,
    freePrivateShows: true,
    instantMatch: true,
},

    /* 1️⃣4 Noordzeemeisjes */
  {
    name: "Noordzeemeisjes",
    rating: 4.4,
    bestFor: "live chat",
    usp: "Rask og tilfeldig webkamerachat med et moderne og brukervennlig grensesnitt.",
    features: ["Bredt utvalg av utøvere", "Alternativer for gruppe- og privatchat", "Nybegynnervennlig layout"],
    affiliateUrl:
      "https://top-deal.me/a/pYKLki9AqHG2PM?sub1={click_id}&sub2={gclid}&sub3={source}&sub5={sub_source}",
    color: "from-purple-500/30 to-pink-500/20",
    preview: "/previews-webcam/Noordzeemeisjes.png",

    randomChat: true,
    freePrivateShows: true,
    instantMatch: false,
},

    /* 1️⃣4 xxxflirting */
  {
    name: "xxxflirting",
    rating: 4.7,
    bestFor: "tilfeldig chat",
    usp: "Leken datingplattform med en stor, aktiv brukerbase og umiddelbare matcher.",
    features: ["Stedsbasert matching", "Rask profiloppsett", "Diskret og brukervennlig"],
    affiliateUrl:
      "https://top-deal.me/a/L9DWvcYzBCmgBV?sub1={click_id}&sub2={gclid}&sub3={source}&sub5={sub_source}",
    color: "from-pink-500/30 to-fuchsia-700/20",
    preview: "/previews-webcam/xxxflirting.png",

    randomChat: true,
    freePrivateShows: true,
    instantMatch: true,
},

  /* 1️⃣5 NABO MATCH */
  {
    name: "JessieDates",
    rating: 4.7,
    bestFor: "diskrete affærer",
    usp: "Personvernfokusert datingside for diskrete forbindelser og anonym surfing.",
    features: ["Øyeblikkelig tilfeldig matching", "Stor, aktiv brukerbase", "Enkel registrering – begynn å chatte raskt"],
    affiliateUrl:
      "https://find.truelovepath.online/click?affid=16096&offerid=8601&sub1={click_id}&sub2={gclid}&sub3={source}&sub5={sub_source}&lp=e6af6bd262",
    color: "from-rose-400/25 to-pink-700/20",
    preview: "/previews-webcam/JessieDates.png",

    // NEW FLAGS
    randomChat: true,
    freePrivateShows: false,
    instantMatch: true,
  },

  /* 16 GRANNIESTOMEET */
{
  name: "GranniesToMeet",
  rating: 4.6,
  bestFor: "moden dating & webcam",
  usp: "Dating- og webcamplattform fokusert på modne kvinner og brukere som søker direkte og uformelle forbindelser.",
  features: [
    "Modne profiler (40+)",
    "Direkte chat og webcam",
    "Rask registrering",
    "Private meldinger"
  ],
  affiliateUrl:
    "https://go.cm-trk6.com/aff_nl?offer_id=10566&aff_id=92400&lands=123&aff_sub1={click_id}&aff_sub2={gclid}&aff_sub3={source}&aff_sub5=search-traffic&source=matchfinderguide.com",
  color: "from-rose-500/25 to-orange-600/20",
  preview: "/previews-webcam/GranniesToMeet.png",

  randomChat: false,
  freePrivateShows: false,
  instantMatch: true,
}

];

export default WEBCAM_OFFERS;