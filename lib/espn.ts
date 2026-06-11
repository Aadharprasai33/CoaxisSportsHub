import type { Fixture, FixtureStatus, GroupTable, Team } from "./types";

/* ============================================================
   ESPN public feed — the free LIVE source for WC26.
   These are ESPN's own (undocumented) site endpoints: no key,
   no auth, the same JSON their app runs on. We use them as the
   primary live source; lib/wc.ts falls back to football-data
   then the snapshot if ESPN is ever unreachable.

   Shapes confirmed against the live feed on opening day:
   - scoreboard?dates=RANGE → all 104 fixtures w/ live status
   - standings              → 12 group tables
   Events carry no group/round label, so groups are derived from
   the standings and knockout rounds from the fixed schedule date.
   ============================================================ */

const SCOREBOARD =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
const STANDINGS =
  "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings";

/** WC26 runs Jun 11 – Jul 19, 2026 — one call covers the tournament. */
const DATE_RANGE = "20260611-20260719";

/* ---------- minimal shapes of the bits we read ---------- */

type EspnTeamRaw = {
  displayName?: string;
  shortDisplayName?: string;
  name?: string;
  abbreviation?: string;
  logo?: string;
  logos?: { href?: string }[];
};
type EspnStat = { name?: string; value?: number };
type EspnCompetitor = {
  homeAway?: string;
  score?: string | number;
  team?: EspnTeamRaw;
};
type EspnEvent = {
  id?: string | number;
  date?: string;
  status?: { type?: { state?: string; name?: string }; displayClock?: string };
  competitions?: {
    competitors?: EspnCompetitor[];
    venue?: { fullName?: string };
  }[];
};
type EspnEntry = { team?: EspnTeamRaw; stats?: EspnStat[] };
type EspnGroupChild = {
  name?: string;
  abbreviation?: string;
  standings?: { entries?: EspnEntry[] };
};

async function ej(url: string, revalidate: number): Promise<Record<string, unknown>> {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error(`espn ${url} → ${res.status}`);
  return res.json();
}

/* ---------- helpers ---------- */

function groupLetter(name: string | undefined): string | undefined {
  const m = name?.match(/([A-L])\s*$/i);
  return m ? m[1].toUpperCase() : undefined;
}

function statVal(stats: EspnStat[] | undefined, name: string): number {
  const s = stats?.find((x) => x.name === name);
  return typeof s?.value === "number" ? s.value : 0;
}

function num(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function team(t: EspnTeamRaw | undefined): Team {
  const crest = t?.logo || t?.logos?.[0]?.href;
  return {
    name: t?.shortDisplayName || t?.displayName || t?.name || "TBD",
    tla: t?.abbreviation,
    crest: crest || undefined,
  };
}

/** ESPN status state/name → our FixtureStatus. */
function mapStatus(type: { state?: string; name?: string } | undefined): FixtureStatus {
  const state = type?.state;
  const name = String(type?.name ?? "");
  if (state === "post") return name.includes("POSTPONED") ? "POSTPONED" : "FINISHED";
  if (state === "in") return name.includes("HALFTIME") ? "PAUSED" : "IN_PLAY";
  return "TIMED"; // pre
}

/* Knockout rounds are fixed in size (16→8→4→2, then 3rd-place + final).
   Pinning them to the tail of the date-sorted schedule labels every stage
   exactly — no hard-coded calendar dates the feed might shift under us. */
const KNOCKOUT_FROM_END: [string, number][] = [
  ["FINAL", 1],
  ["THIRD_PLACE", 1],
  ["SEMI_FINAL", 2],
  ["QUARTER_FINAL", 4],
  ["ROUND_OF_16", 8],
  ["ROUND_OF_32", 16],
];

/** index→stage for a date-sorted fixture list of length n. */
function stageByIndex(n: number): string[] {
  const stages = new Array<string>(n).fill("GROUP_STAGE");
  let cursor = n;
  for (const [stage, count] of KNOCKOUT_FROM_END) {
    const start = Math.max(0, cursor - count);
    for (let i = start; i < cursor; i++) stages[i] = stage;
    cursor = start;
  }
  return stages;
}

function minuteFrom(status: EspnEvent["status"]): number | null {
  const m = status?.displayClock?.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

/* ---------- standings → groups (+ team→group map) ---------- */

function normalizeStandings(json: Record<string, unknown>): {
  groups: GroupTable[];
  teamGroup: Map<string, string>;
} {
  const children = (json.children as EspnGroupChild[]) ?? [];
  const teamGroup = new Map<string, string>();
  const groups: GroupTable[] = children
    .map((c) => {
      const letter = groupLetter(c.name) ?? groupLetter(c.abbreviation);
      const entries = c.standings?.entries ?? [];
      const rows = entries.map((e) => {
        if (letter && e.team?.abbreviation) teamGroup.set(e.team.abbreviation, letter);
        return {
          pos: statVal(e.stats, "rank"),
          team: team(e.team),
          played: statVal(e.stats, "gamesPlayed"),
          won: statVal(e.stats, "wins"),
          draw: statVal(e.stats, "ties"),
          lost: statVal(e.stats, "losses"),
          gf: statVal(e.stats, "pointsFor"),
          ga: statVal(e.stats, "pointsAgainst"),
          gd: statVal(e.stats, "pointDifferential"),
          pts: statVal(e.stats, "points"),
        };
      });
      rows.sort((a, b) => (a.pos || 99) - (b.pos || 99));
      if (rows.every((r) => !r.pos)) rows.forEach((r, i) => (r.pos = i + 1));
      return { name: letter ?? "?", rows };
    })
    .filter((g) => g.name !== "?")
    .sort((a, b) => a.name.localeCompare(b.name));
  return { groups, teamGroup };
}

/* ---------- scoreboard → fixtures ---------- */

function normalizeFixtures(
  json: Record<string, unknown>,
  teamGroup: Map<string, string>
): Fixture[] {
  const events = (json.events as EspnEvent[]) ?? [];
  const fixtures: Fixture[] = events.map((e) => {
    const comp = e.competitions?.[0] ?? {};
    const cs = comp.competitors ?? [];
    const home = cs.find((c) => c.homeAway === "home");
    const away = cs.find((c) => c.homeAway === "away");
    const status = mapStatus(e.status?.type);
    const live = status === "IN_PLAY" || status === "PAUSED" || status === "FINISHED";
    return {
      id: String(e.id),
      utcDate: String(e.date),
      group: undefined,
      stage: "GROUP_STAGE",
      status,
      home: team(home?.team),
      away: team(away?.team),
      score: {
        home: live ? num(home?.score) : null,
        away: live ? num(away?.score) : null,
      },
      minute: status === "IN_PLAY" ? minuteFrom(e.status) : null,
      venue: comp.venue?.fullName,
    };
  });

  // Label stages by position in the date-sorted schedule, then tag each
  // group-stage fixture with its group (knockouts stay ungrouped).
  fixtures.sort((a, b) => a.utcDate.localeCompare(b.utcDate));
  const stages = stageByIndex(fixtures.length);
  fixtures.forEach((f, i) => {
    f.stage = stages[i];
    if (f.stage === "GROUP_STAGE" && f.home.tla) {
      f.group = teamGroup.get(f.home.tla);
    }
  });
  return fixtures;
}

/* ---------- entry point ---------- */

export type EspnNormalized = { fixtures: Fixture[]; groups: GroupTable[] };

export async function getEspnData(revalidate = 30): Promise<EspnNormalized> {
  // Scoreboard is required; standings is best-effort (fixtures still work
  // without group letters if it hiccups).
  const [sbJson, stJson] = await Promise.all([
    ej(`${SCOREBOARD}?dates=${DATE_RANGE}&limit=400`, revalidate),
    ej(STANDINGS, revalidate).catch(() => null),
  ]);
  const { groups, teamGroup } = stJson
    ? normalizeStandings(stJson)
    : { groups: [] as GroupTable[], teamGroup: new Map<string, string>() };
  return { fixtures: normalizeFixtures(sbJson, teamGroup), groups };
}
