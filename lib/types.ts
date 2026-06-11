export type Team = {
  name: string;
  /** Short code shown when no flag renders (e.g. "MEX"). */
  tla?: string;
  /** ISO 3166 code for flagcdn (snapshot data), e.g. "mx", "gb-eng". */
  iso?: string;
  /** Crest/flag image URL (live API data). */
  crest?: string;
};

export type FixtureStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "SUSPENDED"
  | "CANCELLED";

export type Fixture = {
  id: string;
  utcDate: string;
  /** "A" … "L" for group stage, undefined for knockouts. */
  group?: string;
  stage: string;
  status: FixtureStatus;
  home: Team;
  away: Team;
  score: { home: number | null; away: number | null };
  minute?: number | null;
  venue?: string;
};

export type TableRow = {
  pos: number;
  team: Team;
  played: number;
  won: number;
  draw: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
};

export type GroupTable = {
  /** "A" … "L" */
  name: string;
  rows: TableRow[];
};

export type Scorer = {
  name: string;
  team: Team;
  goals: number;
  assists?: number;
};

export type WcData = {
  source: "espn" | "live" | "snapshot";
  updatedAt: string;
  fixtures: Fixture[];
  groups: GroupTable[];
  scorers: Scorer[];
  ticker: string[];
};
