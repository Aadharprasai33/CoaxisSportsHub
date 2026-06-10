import { SNAPSHOT } from "./snapshot";
import type {
  Fixture,
  FixtureStatus,
  GroupTable,
  Scorer,
  Team,
  WcData,
} from "./types";

/* ============================================================
   Live data: football-data.org v4 · competition 2000 (World Cup)
   Free tier covers the WC. Server-side fetches are cached 60s,
   so visitor traffic never burns through the rate limit.
   ============================================================ */

const API = "https://api.football-data.org/v4/competitions/2000";

async function fd(path: string, key: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}${path}`, {
    headers: { "X-Auth-Token": key },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`football-data ${path} → ${res.status}`);
  return res.json();
}

/* ---------- normalizers (football-data shapes → ours) ---------- */

type FdTeam = { name?: string; shortName?: string; tla?: string; crest?: string };

function team(t: FdTeam | undefined): Team {
  return {
    name: t?.shortName || t?.name || "TBD",
    tla: t?.tla,
    crest: t?.crest,
  };
}

function groupLetter(g: unknown): string | undefined {
  // API sends "GROUP_A"; some endpoints send "Group A"
  if (typeof g !== "string") return undefined;
  const m = g.match(/([A-L])$/i);
  return m ? m[1].toUpperCase() : undefined;
}

const KNOWN_STATUS: FixtureStatus[] = [
  "SCHEDULED",
  "TIMED",
  "IN_PLAY",
  "PAUSED",
  "FINISHED",
  "POSTPONED",
  "SUSPENDED",
  "CANCELLED",
];

function normalizeFixtures(json: Record<string, unknown>): Fixture[] {
  const matches = (json.matches as Record<string, unknown>[]) ?? [];
  return matches.map((m) => {
    const score = (m.score as { fullTime?: { home?: number; away?: number } }) ?? {};
    const status = KNOWN_STATUS.includes(m.status as FixtureStatus)
      ? (m.status as FixtureStatus)
      : "SCHEDULED";
    return {
      id: String(m.id),
      utcDate: String(m.utcDate),
      group: groupLetter(m.group),
      stage: String(m.stage ?? "GROUP_STAGE"),
      status,
      home: team(m.homeTeam as FdTeam),
      away: team(m.awayTeam as FdTeam),
      score: {
        home: score.fullTime?.home ?? null,
        away: score.fullTime?.away ?? null,
      },
      minute: typeof m.minute === "number" ? m.minute : null,
      venue: typeof m.venue === "string" ? m.venue : undefined,
    };
  });
}

function normalizeGroups(json: Record<string, unknown>): GroupTable[] {
  const standings = (json.standings as Record<string, unknown>[]) ?? [];
  return standings
    .filter((s) => s.type === "TOTAL" && groupLetter(s.group))
    .map((s) => ({
      name: groupLetter(s.group)!,
      rows: ((s.table as Record<string, unknown>[]) ?? []).map((r) => ({
        pos: Number(r.position),
        team: team(r.team as FdTeam),
        played: Number(r.playedGames),
        won: Number(r.won),
        draw: Number(r.draw),
        lost: Number(r.lost),
        gf: Number(r.goalsFor),
        ga: Number(r.goalsAgainst),
        gd: Number(r.goalDifference),
        pts: Number(r.points),
      })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeScorers(json: Record<string, unknown>): Scorer[] {
  const scorers = (json.scorers as Record<string, unknown>[]) ?? [];
  return scorers.map((s) => {
    const player = s.player as { name?: string };
    return {
      name: player?.name ?? "Unknown",
      team: team(s.team as FdTeam),
      goals: Number(s.goals ?? 0),
      assists: typeof s.assists === "number" ? s.assists : undefined,
    };
  });
}

/* ---------- ticker built from live data ---------- */

function buildTicker(fixtures: Fixture[], scorers: Scorer[]): string[] {
  const lines: string[] = [];
  const live = fixtures.filter((f) => f.status === "IN_PLAY" || f.status === "PAUSED");
  for (const f of live.slice(0, 4)) {
    lines.push(
      `<b>LIVE</b> ${f.home.name} ${f.score.home ?? 0}–${f.score.away ?? 0} ${f.away.name}`
    );
  }
  const finished = fixtures
    .filter((f) => f.status === "FINISHED")
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate));
  for (const f of finished.slice(0, 4)) {
    lines.push(`FT: ${f.home.name} <b>${f.score.home}–${f.score.away}</b> ${f.away.name}`);
  }
  const top = scorers[0];
  if (top && top.goals > 0) {
    lines.push(`Golden Boot: <b>${top.name}</b> leads with ${top.goals} goal${top.goals > 1 ? "s" : ""}`);
  }
  const next = fixtures
    .filter((f) => f.status === "SCHEDULED" || f.status === "TIMED")
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate));
  for (const f of next.slice(0, 3)) {
    lines.push(`Up next: <b>${f.home.name} vs ${f.away.name}</b>`);
  }
  lines.push("Follow <b>@CoaxisSportshub</b> for daily WC26 highlights & stories");
  return lines.length > 2 ? lines : SNAPSHOT.ticker;
}

/* ---------- entry point ---------- */

export async function getWcData(): Promise<WcData> {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (key) {
    try {
      const [matchesJson, standingsJson, scorersJson] = await Promise.all([
        fd("/matches", key),
        fd("/standings", key),
        fd("/scorers?limit=12", key),
      ]);
      const fixtures = normalizeFixtures(matchesJson);
      const scorers = normalizeScorers(scorersJson);
      return {
        source: "live",
        updatedAt: new Date().toISOString(),
        fixtures,
        groups: normalizeGroups(standingsJson),
        scorers,
        ticker: buildTicker(fixtures, scorers),
      };
    } catch {
      // fall through to snapshot — the show must go on
    }
  }
  return { ...SNAPSHOT, updatedAt: new Date().toISOString() };
}
