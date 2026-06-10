"use client";

import { useState } from "react";
import { SITE } from "@/lib/config";

/**
 * Click-to-load facade: the YouTube iframe (~1MB of JS) only loads when
 * tapped — critical for first paint inside IG/TikTok in-app browsers.
 */
export default function LatestDrops() {
  const [loaded, setLoaded] = useState(false);

  return (
    <section id="videos">
      <div className="sec-head">
        <span className="secnum">04</span>
        <h2>Latest Drops</h2>
        <span className="sub">Auto-updates with every upload</span>
      </div>
      <div className="video-shell">
        {loaded ? (
          <iframe
            title="Coaxis Sports latest uploads"
            src={`https://www.youtube.com/embed/videoseries?list=${SITE.uploadsPlaylist}&autoplay=1`}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            className="video-facade"
            onClick={() => setLoaded(true)}
            aria-label="Play latest Coaxis Sports uploads"
          >
            <span className="play">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="vlabel">▸ Roll the latest uploads</span>
          </button>
        )}
      </div>
      <div className="video-cta">
        <a
          className="btn gold"
          href={SITE.socials.youtube}
          target="_blank"
          rel="noopener noreferrer"
        >
          Subscribe on YouTube
        </a>
      </div>
    </section>
  );
}
