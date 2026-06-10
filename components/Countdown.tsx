"use client";

import { useEffect, useMemo, useState } from "react";
import { SITE } from "@/lib/config";
import type { Fixture } from "@/lib/types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Counts down to the next match. Before mount it renders the same
 * placeholders the server rendered (no hydration drift), then ticks.
 * When a match is live it flips into LIVE mode.
 */
export default function Countdown({ fixtures }: { fixtures: Fixture[] }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const upcoming = useMemo(
    () =>
      fixtures
        .filter((f) => f.status === "SCHEDULED" || f.status === "TIMED")
        .sort((a, b) => a.utcDate.localeCompare(b.utcDate)),
    [fixtures]
  );
  const live = fixtures.find((f) => f.status === "IN_PLAY" || f.status === "PAUSED");

  // deterministic pre-mount target (same on server and client)
  const target = useMemo(() => {
    if (now === null) return upcoming[0] ?? null;
    return upcoming.find((f) => new Date(f.utcDate).getTime() > now) ?? null;
  }, [upcoming, now]);

  if (live) {
    return (
      <div className="countdown-wrap">
        <div className="countdown">
          <div className="kick-label">
            <div className="small">World Cup 2026 · Match Live</div>
            <div className="match">
              {live.home.name} {live.score.home ?? 0}–{live.score.away ?? 0} {live.away.name}
            </div>
            <div className="venue">{live.venue ?? "Follow every moment below"}</div>
          </div>
          <span className="live-pill">
            <span className="dot" />
            Live now
          </span>
        </div>
      </div>
    );
  }

  const targetTime = target
    ? new Date(target.utcDate).getTime()
    : new Date(SITE.kickoffUTC).getTime();
  const diff = now === null ? null : Math.max(0, targetTime - now);

  const d = diff === null ? "--" : pad(Math.floor(diff / 864e5));
  const h = diff === null ? "--" : pad(Math.floor(diff / 36e5) % 24);
  const m = diff === null ? "--" : pad(Math.floor(diff / 6e4) % 60);
  const s = diff === null ? "--" : pad(Math.floor(diff / 1e3) % 60);

  const matchLabel = target
    ? `${target.home.name} vs ${target.away.name}`
    : "World Cup 2026";
  const venueLabel =
    target && now !== null
      ? `${target.venue ?? "Venue TBC"} · ${new Date(target.utcDate).toLocaleString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })} your time`
      : target?.venue ?? "";

  return (
    <div className="countdown-wrap">
      <div className="countdown">
        <div className="kick-label">
          <div className="small">
            {target === upcoming[0] && upcoming.length > 0
              ? "Next kickoff · World Cup 2026"
              : "Kickoff · World Cup 2026"}
          </div>
          <div className="match">{matchLabel}</div>
          <div className="venue">{venueLabel}</div>
        </div>
        <div className="clock" aria-live="off">
          {[
            [d, "Days"],
            [h, "Hrs"],
            [m, "Min"],
            [s, "Sec"],
          ].map(([num, lab]) => (
            <div className="cell" key={lab}>
              {/* key re-mounts the digit so the tick animation replays */}
              <div className="num" key={num}>
                {num}
              </div>
              <div className="lab">{lab}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
