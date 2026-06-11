"use client";

import { useEffect, useMemo, useState } from "react";
import { SITE } from "@/lib/config";
import type { Fixture, WcData } from "@/lib/types";
import Flag from "./Flag";

/* ---------- live polling ---------- */

function useWcData(initial: WcData) {
  const [data, setData] = useState(initial);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/wc", { cache: "no-store" });
        if (res.ok) {
          const json: WcData = await res.json();
          if (alive) setData(json);
        }
      } catch {
        // keep showing last good data
      }
    };
    const id = setInterval(load, SITE.refreshSeconds * 1000);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return data;
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/* ---------- fixtures ---------- */

type Filter = "live" | "upcoming" | "results";

function FixtureRow({ f, mounted }: { f: Fixture; mounted: boolean }) {
  const isLive = f.status === "IN_PLAY" || f.status === "PAUSED";
  const isDone = f.status === "FINISHED";
  const kickoff = new Date(f.utcDate);

  // UTC pre-mount (deterministic for hydration), local after
  const dateLabel = kickoff.toLocaleDateString(
    "en-US",
    mounted
      ? { weekday: "short", month: "short", day: "numeric" }
      : { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }
  );
  const timeLabel = mounted
    ? kickoff.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "––:––";

  return (
    <div className={`fixture${isLive ? " is-live" : ""}`}>
      <div className="date">
        {dateLabel}
        <small>{f.group ? `GRP ${f.group}` : f.stage.replace(/_/g, " ")}</small>
      </div>
      <div className="team home">
        <span className="tname">{f.home.name}</span>
        <Flag team={f.home} />
      </div>
      {isLive || isDone ? (
        <div className="score">
          {f.score.home ?? 0} – {f.score.away ?? 0}
        </div>
      ) : (
        <div className="score upcoming">{timeLabel}</div>
      )}
      <div className="team">
        <Flag team={f.away} />
        <span className="tname">{f.away.name}</span>
      </div>
      <div className="meta">
        {isLive ? (
          <span className="minute">
            <span className="dot" />
            {f.status === "PAUSED" ? "HT" : f.minute ? `${f.minute}'` : "LIVE"}
          </span>
        ) : (
          f.venue ?? ""
        )}
      </div>
    </div>
  );
}

function Fixtures({ data, mounted }: { data: WcData; mounted: boolean }) {
  const live = data.fixtures.filter(
    (f) => f.status === "IN_PLAY" || f.status === "PAUSED"
  );
  const upcoming = data.fixtures
    .filter((f) => f.status === "SCHEDULED" || f.status === "TIMED")
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate));
  const results = data.fixtures
    .filter((f) => f.status === "FINISHED")
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate));

  const [filter, setFilter] = useState<Filter | null>(null);
  const active: Filter = filter ?? (live.length > 0 ? "live" : "upcoming");

  const shown =
    active === "live" ? live : active === "upcoming" ? upcoming.slice(0, 12) : results.slice(0, 12);

  return (
    <div className="pane" role="tabpanel">
      <div className="seg" role="group" aria-label="Filter fixtures">
        {(
          [
            ["live", `Live${live.length ? ` · ${live.length}` : ""}`],
            ["upcoming", "Upcoming"],
            ["results", "Results"],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            className={active === key ? "on" : ""}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="empty">
          {active === "live"
            ? "No match in play right now — the wire stays hot, check Upcoming."
            : active === "results"
              ? "No final scores yet. First whistle: June 11."
              : "Schedule loading…"}
        </div>
      ) : (
        shown.map((f) => <FixtureRow key={f.id} f={f} mounted={mounted} />)
      )}
    </div>
  );
}

/* ---------- groups ---------- */

function Groups({ data }: { data: WcData }) {
  const [active, setActive] = useState("A");
  const group = data.groups.find((g) => g.name === active) ?? data.groups[0];

  return (
    <div className="pane" role="tabpanel">
      <div className="group-pills">
        {data.groups.map((g) => (
          <button
            key={g.name}
            className={`gpill${g.name === active ? " active" : ""}`}
            onClick={() => setActive(g.name)}
            aria-label={`Group ${g.name}`}
          >
            {g.name}
          </button>
        ))}
      </div>
      {group && (
        <table>
          <thead>
            <tr>
              <th>Group {group.name}</th>
              <th className="n">P</th>
              <th className="n">W</th>
              <th className="n">D</th>
              <th className="n">L</th>
              <th className="n">GD</th>
              <th className="n">Pts</th>
            </tr>
          </thead>
          <tbody>
            {group.rows.map((r) => (
              <tr key={r.team.name} className={r.pos <= 2 ? "q" : ""}>
                <td className="teamcell">
                  <span className="pos">{r.pos}</span>
                  <Flag team={r.team} />
                  {r.team.name}
                </td>
                <td className="n">{r.played}</td>
                <td className="n">{r.won}</td>
                <td className="n">{r.draw}</td>
                <td className="n">{r.lost}</td>
                <td className="n">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                <td className="n pts">{r.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="legend">
        <i />
        Top 2 advance to the Round of 32 · 8 best third-placed teams also qualify
      </div>
    </div>
  );
}

/* ---------- golden boot ---------- */

function GoldenBoot({ data }: { data: WcData }) {
  const list = [...data.scorers].sort((a, b) => b.goals - a.goals);
  const max = Math.max(1, ...list.map((s) => s.goals));
  const started = list.some((s) => s.goals > 0);

  return (
    <div className="pane" role="tabpanel">
      {list.map((s, i) => (
        <div className="boot-row" key={s.name}>
          <div className="rank">{String(i + 1).padStart(2, "0")}</div>
          <div className="who">
            <Flag team={s.team} />
            <div>
              <div className="name">{s.name}</div>
              <div className="nat">
                {s.team.name}
                {s.assists !== undefined ? ` · ${s.assists} assists` : ""}
              </div>
            </div>
          </div>
          <div className="bar">
            <i style={{ width: `${(s.goals / max) * 100}%` }} />
          </div>
          <div className="goals">{started ? s.goals : "—"}</div>
        </div>
      ))}
      <p className="note">
        {started
          ? "Golden Boot race — updates as goals go in."
          : "The contenders. Goal counts go live the moment the first ball hits the net on June 11."}
      </p>
    </div>
  );
}

/* ---------- shell ---------- */

const TABS = [
  ["fixtures", "Fixtures"],
  ["groups", "Groups"],
  ["boot", "Golden Boot"],
] as const;

type TabKey = (typeof TABS)[number][0];

export default function MatchCenter({ initial }: { initial: WcData }) {
  const data = useWcData(initial);
  const mounted = useMounted();
  const [tab, setTab] = useState<TabKey>("fixtures");

  const liveCount = useMemo(
    () =>
      data.fixtures.filter((f) => f.status === "IN_PLAY" || f.status === "PAUSED")
        .length,
    [data.fixtures]
  );

  const refreshed =
    mounted && data.updatedAt
      ? new Date(data.updatedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  return (
    <section id="wc26">
      <div className="sec-head">
        <span className="secnum">WC</span>
        <h2>WC26 Match Center</h2>
        <span className="live-pill">
          <span className="dot" />
          {liveCount > 0 ? `${liveCount} live now` : "Live Hub"}
        </span>
        <span className="sub">
          Fixtures · Tables · Golden Boot — one place, updated through the tournament
        </span>
      </div>

      <div className="match-center">
        <div className="tabs" role="tablist" aria-label="Match center sections">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              className={`tab${tab === key ? " active" : ""}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "fixtures" && <Fixtures data={data} mounted={mounted} />}
        {tab === "groups" && <Groups data={data} />}
        {tab === "boot" && <GoldenBoot data={data} />}

        <div className="updated">
          Data feed: <b>{data.source === "snapshot" ? "snapshot" : "live"}</b> · last refresh <b>{refreshed}</b>
        </div>
      </div>
    </section>
  );
}
