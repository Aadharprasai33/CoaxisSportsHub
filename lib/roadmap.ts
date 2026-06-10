import type { Fixture, Team } from "./types";

/* ============================================================
   Road to the Final — derives the knockout bracket timeline
   from whatever fixtures the feed knows about. Teams appear on
   a stage the moment the API publishes them in a fixture there;
   until then the slot reads TBD.
   ============================================================ */

export type StageStatus = "done" | "live" | "current" | "upcoming";

export type RoadStage = {
  key: string;
  label: string;
  dates: string;
  /** Total team slots at this stage (48, 32, 16, 8, 4, 2, 1). */
  slots: number;
  /** Teams confirmed at this stage so far (deduped, no TBD). */
  teams: Team[];
  status: StageStatus;
  /** Finished fixtures / known fixtures at this stage. */
  played: number;
  total: number;
  /** Extra line shown instead of team chips (group stage). */
  note?: string;
};

const STAGE_DEFS: { key: string; label: string; dates: string; slots: number }[] = [
  { key: "GROUP", label: "Group Stage", dates: "Jun 11 – 27", slots: 48 },
  { key: "R32", label: "Round of 32", dates: "Jun 28 – Jul 3", slots: 32 },
  { key: "R16", label: "Round of 16", dates: "Jul 4 – 7", slots: 16 },
  { key: "QF", label: "Quarter-finals", dates: "Jul 9 – 11", slots: 8 },
  { key: "SF", label: "Semi-finals", dates: "Jul 14 – 15", slots: 4 },
  { key: "FINAL", label: "The Final", dates: "Jul 19 · MetLife Stadium", slots: 2 },
  { key: "CHAMPION", label: "World Champion", dates: "Jul 19", slots: 1 },
];

/** Map football-data stage strings (and variants) onto our keys. */
function stageKey(stage: string): string | null {
  const s = stage.toUpperCase();
  if (s.includes("GROUP")) return "GROUP";
  if (s.includes("32")) return "R32";
  if (s.includes("16")) return "R16";
  if (s.includes("QUARTER")) return "QF";
  if (s.includes("SEMI")) return "SF";
  if (s === "FINAL") return "FINAL"; // exact — THIRD_PLACE etc. stay out
  return null;
}

function isReal(t: Team): boolean {
  return Boolean(t.name) && t.name !== "TBD";
}

function finalWinner(finals: Fixture[]): Team | null {
  const f = finals.find((m) => m.status === "FINISHED");
  if (!f || f.score.home === null || f.score.away === null) return null;
  if (f.score.home === f.score.away) return null; // decided on pens — feed has no winner field
  return f.score.home > f.score.away ? f.home : f.away;
}

export function buildRoadmap(fixtures: Fixture[]): RoadStage[] {
  const byStage = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const key = stageKey(f.stage);
    if (!key) continue;
    const list = byStage.get(key) ?? [];
    list.push(f);
    byStage.set(key, list);
  }

  const stages: RoadStage[] = STAGE_DEFS.map((def) => {
    const list =
      byStage.get(def.key === "CHAMPION" ? "FINAL" : def.key) ?? [];
    const teams: Team[] = [];
    if (def.key === "CHAMPION") {
      const winner = finalWinner(list);
      if (winner) teams.push(winner);
    } else {
      const seen = new Set<string>();
      for (const f of list) {
        for (const t of [f.home, f.away]) {
          if (isReal(t) && !seen.has(t.name)) {
            seen.add(t.name);
            teams.push(t);
          }
        }
      }
    }
    const played = list.filter((f) => f.status === "FINISHED").length;
    const live = list.some(
      (f) => f.status === "IN_PLAY" || f.status === "PAUSED"
    );
    return {
      ...def,
      teams,
      played,
      total: def.key === "CHAMPION" ? 0 : list.length,
      status: live ? ("live" as const) : ("upcoming" as const),
      note:
        def.key === "GROUP"
          ? "48 teams · 12 groups · top 2 + 8 best third-placed advance"
          : undefined,
    };
  });

  /* A stage is done when its fixtures exist and are all finished
     (champion: when a winner is known). Current = first not-done. */
  let currentSet = false;
  for (const s of stages) {
    const done =
      s.key === "CHAMPION"
        ? s.teams.length === 1
        : s.total > 0 && s.played === s.total;
    if (done) {
      s.status = "done";
    } else if (s.status !== "live" && !currentSet) {
      s.status = "current";
      currentSet = true;
    }
    if (s.status === "live") currentSet = true;
  }

  return stages;
}
