"use client";

import { useEffect, useState } from "react";

/** Floating quick-jump to the WC26 match center; hides while it's on screen. */
export default function JumpToWc() {
  const [off, setOff] = useState(false);

  useEffect(() => {
    const target = document.getElementById("wc26");
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => setOff(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <a className={`jumpwc${off ? " off" : ""}`} href="#wc26">
      <span className="dot" />
      WC26 Live
    </a>
  );
}
