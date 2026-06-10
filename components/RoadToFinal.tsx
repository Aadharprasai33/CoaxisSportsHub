"use client";

import { useEffect, useRef } from "react";
import type { RoadStage } from "@/lib/roadmap";
import Flag from "./Flag";

/* ============================================================
   Road to the Final — scroll-driven timeline. A gold spine
   fills as the visitor scrolls; each stage lights up when the
   fill reaches its node. Slots show TBD until a team books
   its place, then the chip flips to the flag + name.
   ============================================================ */

const STATUS_BADGE: Record<RoadStage["status"], string> = {
  done: "Complete",
  live: "Live now",
  current: "We are here",
  upcoming: "",
};

function StageChips({ stage }: { stage: RoadStage }) {
  if (stage.note) {
    return <p className="road-note">{stage.note}</p>;
  }
  const open = stage.slots - stage.teams.length;
  return (
    <div className="road-chips">
      {stage.teams.map((t) => (
        <span className="road-chip" key={t.name}>
          <Flag team={t} />
          {t.name}
        </span>
      ))}
      {open > 0 &&
        (stage.slots <= 8 ? (
          Array.from({ length: open }, (_, i) => (
            <span className="road-chip tbd" key={`tbd-${i}`}>
              TBD
            </span>
          ))
        ) : (
          <span className="road-chip tbd">
            TBD · {open} spot{open > 1 ? "s" : ""}
          </span>
        ))}
    </div>
  );
}

export default function RoadToFinal({ stages }: { stages: RoadStage[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const currentIdx = Math.max(
    0,
    stages.findIndex((s) => s.status === "current" || s.status === "live")
  );
  const current = stages[currentIdx];
  const doneCount = stages.filter((s) => s.status === "done").length;
  const tournamentPct = Math.round((doneCount / (stages.length - 1)) * 100);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const stops = Array.from(
      track.querySelectorAll<HTMLElement>(".road-stop")
    );
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      // Spine starts filling when the track enters the lower quarter
      // of the viewport and tops out before the track leaves it.
      const progress = Math.min(
        1,
        Math.max(0, (vh * 0.78 - rect.top) / Math.max(1, rect.height - vh * 0.3))
      );
      track.style.setProperty("--fill", progress.toFixed(4));
      const fillPx = progress * rect.height;
      for (const stop of stops) {
        stop.classList.toggle("on", stop.offsetTop + 28 <= fillPx);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [stages]);

  return (
    <section id="road">
      <div className="sec-head">
        <span className="secnum">RD</span>
        <h2>Road to the Final</h2>
        <span className="sub">
          Scroll the bracket — every stage fills in as teams punch their ticket
        </span>
      </div>

      <div className="road-grid">
        <aside className="road-status">
          <div className="road-status-card">
            <span className="road-eyebrow">Where the Cup stands</span>
            <strong className="road-now">{current?.label ?? "—"}</strong>
            <span className="road-dates">{current?.dates}</span>
            {current && current.total > 0 && (
              <span className="road-count">
                {current.played} / {current.total} matches played
              </span>
            )}
            <div className="road-meter" aria-hidden>
              <i style={{ width: `${tournamentPct}%` }} />
            </div>
            <span className="road-meter-label">
              {tournamentPct}% of the road travelled
            </span>
          </div>
        </aside>

        <div className="road-track" ref={trackRef}>
          <div className="road-spine" aria-hidden>
            <i />
          </div>
          {stages.map((s) => (
            <div className={`road-stop ${s.status}`} key={s.key}>
              <span className="road-node" aria-hidden>
                {s.key === "CHAMPION" ? "★" : ""}
              </span>
              <div className="road-card">
                <div className="road-card-head">
                  <h3>{s.label}</h3>
                  <span className="road-dates">{s.dates}</span>
                  {STATUS_BADGE[s.status] && (
                    <span className={`road-badge ${s.status}`}>
                      {s.status === "live" && <span className="dot" />}
                      {STATUS_BADGE[s.status]}
                    </span>
                  )}
                </div>
                {s.key === "CHAMPION" && s.teams.length === 0 ? (
                  <p className="road-note">
                    🏆 TBD — crowned July 19 at MetLife Stadium
                  </p>
                ) : (
                  <StageChips stage={s} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
