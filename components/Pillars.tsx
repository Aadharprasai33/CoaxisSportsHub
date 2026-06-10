"use client";

import type { PointerEvent } from "react";

const PILLARS = [
  {
    ico: "⚽",
    title: (
      <>
        Highlights <span>&</span> Analysis
      </>
    ),
    body: "The plays that matter, cut to the bone. Buzzer beaters, screamers, comebacks — the moments worth replaying, with the context behind them.",
  },
  {
    ico: "🎯",
    title: (
      <>
        Player <span>Spotlights</span>
      </>
    ),
    body: "Stats, stories and the numbers behind greatness. Who's carrying their team, who's breaking out, who's writing history this summer.",
  },
  {
    ico: "🔥",
    title: (
      <>
        Viral <span>Moments</span>
      </>
    ),
    body: "The clips everyone is talking about before everyone is talking about them. Daily doses of sporting excellence, built for your feed.",
  },
];

function tilt(e: PointerEvent<HTMLDivElement>) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.setProperty("--ry", `${x * 7}deg`);
  el.style.setProperty("--rx", `${-y * 7}deg`);
}

function untilt(e: PointerEvent<HTMLDivElement>) {
  e.currentTarget.style.setProperty("--rx", "0deg");
  e.currentTarget.style.setProperty("--ry", "0deg");
}

export default function Pillars() {
  return (
    <section id="about">
      <div className="sec-head">
        <span className="secnum">02</span>
        <h2>What We Do</h2>
        <span className="sub">What lands on the channel, every week</span>
      </div>
      <div className="pillars">
        {PILLARS.map((p, i) => (
          <div
            key={i}
            className="pillar"
            data-ico={p.ico}
            onPointerMove={tilt}
            onPointerLeave={untilt}
          >
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
