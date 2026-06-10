# Coaxis Sports — WC26 Live Hub

Bio-link site for [@CoaxisSportshub](https://www.youtube.com/@CoaxisSportshub) with a live
World Cup 2026 match center: fixtures, group tables and the Golden Boot race in one place.

Built with Next.js (App Router) + TypeScript. No UI libraries — all effects are hand-rolled
canvas/CSS, tuned to load fast inside Instagram/TikTok in-app browsers.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

## Live data (recommended before June 11)

The match center runs on built-in snapshot data until you give it a key:

1. Register free at https://www.football-data.org/client/register (the free tier covers the World Cup).
2. Copy the API token from the confirmation email.
3. Locally: create `.env.local` with `FOOTBALL_DATA_API_KEY=your_token`.
4. On Vercel: Project → Settings → Environment Variables → add `FOOTBALL_DATA_API_KEY`, then redeploy.

Once set, scores, tables and scorers refresh automatically (server cache 60s, browser re-pulls
every 60s). If the API ever fails, the site silently falls back to the snapshot — it never breaks.

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

…or push the folder to GitHub and import it at https://vercel.com/new. After deploying,
update `SITE.url` in `lib/config.ts` to your real domain.

## Editing content

Everything an editor needs lives in two files:

- `lib/config.ts` — social links, uploads playlist, kickoff time, refresh interval.
- `lib/snapshot.ts` — fallback fixtures/groups/scorers/ticker (only shown when no API key).

## Structure

```
app/            layout, page, globals.css, /api/wc route
components/     Backdrop (canvas), Ticker, Hero, Countdown, MatchCenter, …
lib/            config, types, snapshot data, football-data fetch + normalize
```

## Ideas for later

- Knockout bracket view once the Round of 32 is set
- `/api/og` dynamic share image with tonight's score
- Newsletter / link tree extras under the hero
