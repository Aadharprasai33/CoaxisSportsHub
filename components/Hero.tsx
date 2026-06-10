"use client";

import Image from "next/image";
import type { CSSProperties, PointerEvent } from "react";
import { SITE } from "@/lib/config";
import logo from "@/public/logo.png";
import { InstagramIcon, TikTokIcon, YouTubeIcon } from "./icons";

function KineticRow({ word, ghost }: { word: string; ghost?: boolean }) {
  return (
    <span className={`row ${ghost ? "ghost" : "solid"}`}>
      {word.split("").map((ch, i) => (
        <span className="ltr" key={i} style={{ "--i": i } as CSSProperties}>
          {ch}
        </span>
      ))}
      <span className="scan" aria-hidden="true">
        {word}
      </span>
    </span>
  );
}

/** Buttons lean toward the cursor on devices that have one. */
function magnet(e: PointerEvent<HTMLAnchorElement>) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
  const y = ((e.clientY - r.top) / r.height - 0.5) * 8;
  el.style.setProperty("--mx", `${x}px`);
  el.style.setProperty("--my", `${y}px`);
}

function demagnet(e: PointerEvent<HTMLAnchorElement>) {
  e.currentTarget.style.setProperty("--mx", "0px");
  e.currentTarget.style.setProperty("--my", "0px");
}

export default function Hero() {
  return (
    <header className="hero">
      <div className="hud" aria-hidden="true">
        <span className="blip" />
        SIGNAL LOCKED · WC26
      </div>
      <div className="hero-badge" aria-hidden="true">
        <Image
          src={logo}
          alt=""
          priority
          sizes="(max-width: 900px) 116px, 280px"
        />
      </div>
      <span className="eyebrow">Sports · Highlights · Stories of Greatness</span>
      <h1 aria-label="Coaxis Sports Hub">
        <KineticRow word="COAXIS" />
        <KineticRow word="SPORTS" ghost />
      </h1>
      <p className="tagline">
        Your destination for the moments that make you jump off your seat —
        last-second winners, championship glory and the plays that define
        greatness. <b>Right now: World Cup 2026, tracked live, all in one place.</b>
      </p>
      <nav className="socials" aria-label="Coaxis Sports social links">
        <a
          className="btn gold"
          href={SITE.socials.youtube}
          target="_blank"
          rel="noopener noreferrer"
          onPointerMove={magnet}
          onPointerLeave={demagnet}
        >
          <YouTubeIcon />
          YouTube
        </a>
        <a
          className="btn"
          href={SITE.socials.instagram}
          target="_blank"
          rel="noopener noreferrer"
          onPointerMove={magnet}
          onPointerLeave={demagnet}
        >
          <InstagramIcon />
          Instagram
        </a>
        <a
          className="btn"
          href={SITE.socials.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          onPointerMove={magnet}
          onPointerLeave={demagnet}
        >
          <TikTokIcon />
          TikTok
        </a>
      </nav>
    </header>
  );
}
