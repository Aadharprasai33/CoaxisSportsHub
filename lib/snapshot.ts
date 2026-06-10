import type { Fixture, GroupTable, Scorer, Team, WcData } from "./types";

/* ============================================================
   WC26 SNAPSHOT — used whenever the live API key is missing
   or unreachable. Edit freely; shapes match lib/types.ts.
   ============================================================ */

const T = (name: string, iso: string, tla: string): Team => ({ name, iso, tla });

export const TEAMS = {
  mexico: T("Mexico", "mx", "MEX"),
  southKorea: T("South Korea", "kr", "KOR"),
  southAfrica: T("South Africa", "za", "RSA"),
  czechia: T("Czechia", "cz", "CZE"),
  canada: T("Canada", "ca", "CAN"),
  switzerland: T("Switzerland", "ch", "SUI"),
  qatar: T("Qatar", "qa", "QAT"),
  bosnia: T("Bosnia & Herz.", "ba", "BIH"),
  brazil: T("Brazil", "br", "BRA"),
  morocco: T("Morocco", "ma", "MAR"),
  scotland: T("Scotland", "gb-sct", "SCO"),
  haiti: T("Haiti", "ht", "HAI"),
  usa: T("USA", "us", "USA"),
  paraguay: T("Paraguay", "py", "PAR"),
  australia: T("Australia", "au", "AUS"),
  turkiye: T("Türkiye", "tr", "TUR"),
  germany: T("Germany", "de", "GER"),
  ecuador: T("Ecuador", "ec", "ECU"),
  ivoryCoast: T("Ivory Coast", "ci", "CIV"),
  curacao: T("Curaçao", "cw", "CUW"),
  netherlands: T("Netherlands", "nl", "NED"),
  japan: T("Japan", "jp", "JPN"),
  tunisia: T("Tunisia", "tn", "TUN"),
  sweden: T("Sweden", "se", "SWE"),
  belgium: T("Belgium", "be", "BEL"),
  egypt: T("Egypt", "eg", "EGY"),
  iran: T("Iran", "ir", "IRN"),
  newZealand: T("New Zealand", "nz", "NZL"),
  spain: T("Spain", "es", "ESP"),
  uruguay: T("Uruguay", "uy", "URU"),
  saudiArabia: T("Saudi Arabia", "sa", "KSA"),
  capeVerde: T("Cape Verde", "cv", "CPV"),
  france: T("France", "fr", "FRA"),
  senegal: T("Senegal", "sn", "SEN"),
  norway: T("Norway", "no", "NOR"),
  iraq: T("Iraq", "iq", "IRQ"),
  argentina: T("Argentina", "ar", "ARG"),
  algeria: T("Algeria", "dz", "ALG"),
  austria: T("Austria", "at", "AUT"),
  jordan: T("Jordan", "jo", "JOR"),
  portugal: T("Portugal", "pt", "POR"),
  colombia: T("Colombia", "co", "COL"),
  uzbekistan: T("Uzbekistan", "uz", "UZB"),
  drCongo: T("DR Congo", "cd", "COD"),
  england: T("England", "gb-eng", "ENG"),
  croatia: T("Croatia", "hr", "CRO"),
  ghana: T("Ghana", "gh", "GHA"),
  panama: T("Panama", "pa", "PAN"),
} as const;

const GROUP_DRAW: Record<string, Team[]> = {
  A: [TEAMS.mexico, TEAMS.southKorea, TEAMS.southAfrica, TEAMS.czechia],
  B: [TEAMS.canada, TEAMS.switzerland, TEAMS.qatar, TEAMS.bosnia],
  C: [TEAMS.brazil, TEAMS.morocco, TEAMS.scotland, TEAMS.haiti],
  D: [TEAMS.usa, TEAMS.paraguay, TEAMS.australia, TEAMS.turkiye],
  E: [TEAMS.germany, TEAMS.ecuador, TEAMS.ivoryCoast, TEAMS.curacao],
  F: [TEAMS.netherlands, TEAMS.japan, TEAMS.tunisia, TEAMS.sweden],
  G: [TEAMS.belgium, TEAMS.egypt, TEAMS.iran, TEAMS.newZealand],
  H: [TEAMS.spain, TEAMS.uruguay, TEAMS.saudiArabia, TEAMS.capeVerde],
  I: [TEAMS.france, TEAMS.senegal, TEAMS.norway, TEAMS.iraq],
  J: [TEAMS.argentina, TEAMS.algeria, TEAMS.austria, TEAMS.jordan],
  K: [TEAMS.portugal, TEAMS.colombia, TEAMS.uzbekistan, TEAMS.drCongo],
  L: [TEAMS.england, TEAMS.croatia, TEAMS.ghana, TEAMS.panama],
};

/** Pre-tournament tables: everyone on zero, draw order preserved. */
const groups: GroupTable[] = Object.entries(GROUP_DRAW).map(([name, teams]) => ({
  name,
  rows: teams.map((team, i) => ({
    pos: i + 1,
    team,
    played: 0,
    won: 0,
    draw: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    pts: 0,
  })),
}));

const F = (
  id: string,
  utcDate: string,
  group: string,
  home: Team,
  away: Team,
  venue: string
): Fixture => ({
  id,
  utcDate,
  group,
  stage: "GROUP_STAGE",
  status: "TIMED",
  home,
  away,
  score: { home: null, away: null },
  venue,
});

const fixtures: Fixture[] = [
  F("s1", "2026-06-11T19:00:00Z", "A", TEAMS.mexico, TEAMS.southAfrica, "Estadio Azteca · Mexico City"),
  F("s2", "2026-06-12T02:00:00Z", "A", TEAMS.southKorea, TEAMS.czechia, "Estadio Akron · Zapopan"),
  F("s3", "2026-06-12T19:00:00Z", "B", TEAMS.canada, TEAMS.bosnia, "Toronto Stadium · Toronto"),
  F("s4", "2026-06-13T01:00:00Z", "D", TEAMS.usa, TEAMS.paraguay, "SoFi Stadium · Inglewood"),
  F("s5", "2026-06-13T19:00:00Z", "B", TEAMS.qatar, TEAMS.switzerland, "Levi's Stadium · Santa Clara"),
  F("s6", "2026-06-13T22:00:00Z", "C", TEAMS.brazil, TEAMS.morocco, "MetLife Stadium · E. Rutherford"),
  F("s7", "2026-06-14T01:00:00Z", "C", TEAMS.haiti, TEAMS.scotland, "Gillette Stadium · Foxborough"),
  F("s8", "2026-06-17T20:00:00Z", "K", TEAMS.portugal, TEAMS.drCongo, "NRG Stadium · Houston"),
];

/** Golden Boot contenders — counts go live once the API takes over. */
const scorers: Scorer[] = [
  { name: "Kylian Mbappé", team: TEAMS.france, goals: 0 },
  { name: "Erling Haaland", team: TEAMS.norway, goals: 0 },
  { name: "Harry Kane", team: TEAMS.england, goals: 0 },
  { name: "Lionel Messi", team: TEAMS.argentina, goals: 0 },
  { name: "Cristiano Ronaldo", team: TEAMS.portugal, goals: 0 },
  { name: "Vinícius Júnior", team: TEAMS.brazil, goals: 0 },
];

const ticker: string[] = [
  "<b>48 teams · 104 matches · 16 host cities</b> — the biggest World Cup ever",
  "Opening match: <b>Mexico vs South Africa</b> · Estadio Azteca · June 11",
  "USA open vs <b>Paraguay</b> at SoFi Stadium · June 12",
  "Defending champions <b>Argentina</b> begin vs Algeria in Group J",
  "<b>Final: July 19</b> · MetLife Stadium · New Jersey",
  "Iraq are back at a World Cup for the first time since <b>1986</b>",
  "Follow <b>@CoaxisSportshub</b> for daily WC26 highlights & stories",
];

export const SNAPSHOT: WcData = {
  source: "snapshot",
  updatedAt: "2026-06-09T00:00:00Z",
  fixtures,
  groups,
  scorers,
  ticker,
};
