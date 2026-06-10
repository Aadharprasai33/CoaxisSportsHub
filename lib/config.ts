/* ============================================================
   COAXIS SPORTS · SITE CONFIG — edit everything here
   ============================================================ */

export const SITE = {
  name: "Coaxis Sports",
  tagline: "Highlights. Stories. Greatness.",
  url: "https://coaxis-sports-hub.vercel.app", // live on Vercel

  socials: {
    youtube: "https://www.youtube.com/@CoaxisSportshub",
    instagram: "https://www.instagram.com/coaxissports",
    tiktok: "https://www.tiktok.com/@coaxissportshub",
  },

  /** YouTube uploads playlist (UU + channel id) — auto-shows latest uploads. */
  uploadsPlaylist: "UUdIw8MswIhxkP6hLJ9K-F_A",

  /** Opening match kickoff (UTC): June 11, 2026 · 3:00 PM ET. */
  kickoffUTC: "2026-06-11T19:00:00Z",

  /** How often the browser re-pulls /api/wc (seconds). */
  refreshSeconds: 60,
} as const;
