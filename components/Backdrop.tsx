"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  tw: number; // twinkle phase
  gold: boolean;
};

/**
 * Living stadium backdrop: pitch lines drawn in light, an energy pulse
 * lapping the center circle, and dust particles drifting through the
 * floodlights. Pointer + scroll parallax. One canvas, capped DPR,
 * pauses when hidden, static under prefers-reduced-motion.
 */
export default function Backdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let particles: Particle[] = [];
    let px = 0; // smoothed pointer parallax
    let py = 0;
    let tx = 0; // target parallax
    let ty = 0;

    function resize() {
      if (!canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.round((w * h) / 26000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.8,
        vy: -(0.08 + Math.random() * 0.25),
        vx: (Math.random() - 0.5) * 0.12,
        tw: Math.random() * Math.PI * 2,
        gold: Math.random() < 0.3,
      }));
    }

    function drawPitch(t: number) {
      if (!ctx) return;
      const cx = w * 0.5;
      const cy = h * 0.52;
      const R = Math.min(w, h) * 0.3;

      ctx.strokeStyle = "rgba(64, 99, 255, 0.16)";
      ctx.lineWidth = 1.5;

      // center circle + spot
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(64, 99, 255, 0.22)";
      ctx.fill();

      // halfway line
      ctx.beginPath();
      ctx.moveTo(cx, -50);
      ctx.lineTo(cx, h + 50);
      ctx.stroke();

      // penalty boxes bleeding off both edges
      const boxH = h * 0.62;
      const boxY = cy - boxH / 2;
      ctx.strokeRect(-w * 0.14, boxY, w * 0.3, boxH);
      ctx.strokeRect(-w * 0.14, cy - boxH * 0.27, w * 0.15, boxH * 0.54);
      ctx.strokeRect(w * 0.84, boxY, w * 0.3, boxH);
      ctx.strokeRect(w * 0.99, cy - boxH * 0.27, w * 0.15, boxH * 0.54);

      // box arcs
      ctx.beginPath();
      ctx.arc(w * 0.16, cy, R * 0.55, -Math.PI * 0.42, Math.PI * 0.42);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w * 0.84, cy, R * 0.55, Math.PI * 0.58, Math.PI * 1.42);
      ctx.stroke();

      // energy pulse lapping the center circle
      const a = t * 0.00045;
      const gx = cx + R * Math.cos(a);
      const gy = cy + R * Math.sin(a);
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, 46);
      grad.addColorStop(0, "rgba(255, 213, 107, 0.5)");
      grad.addColorStop(0.35, "rgba(240, 180, 41, 0.14)");
      grad.addColorStop(1, "rgba(240, 180, 41, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gx, gy, 46, 0, Math.PI * 2);
      ctx.fill();

      // counter-rotating royal pulse
      const b = -t * 0.0003 + Math.PI;
      const bx = cx + R * Math.cos(b);
      const by = cy + R * Math.sin(b);
      const grad2 = ctx.createRadialGradient(bx, by, 0, bx, by, 38);
      grad2.addColorStop(0, "rgba(64, 99, 255, 0.45)");
      grad2.addColorStop(1, "rgba(64, 99, 255, 0)");
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(bx, by, 38, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawParticles(t: number) {
      if (!ctx) return;
      for (const p of particles) {
        p.y += p.vy;
        p.x += p.vx;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        const alpha = 0.25 + 0.35 * Math.abs(Math.sin(p.tw + t * 0.001));
        ctx.fillStyle = p.gold
          ? `rgba(240, 180, 41, ${alpha})`
          : `rgba(100, 130, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function frame(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      px += (tx - px) * 0.04;
      py += (ty - py) * 0.04;
      ctx.save();
      ctx.translate(px * 18, py * 12 - window.scrollY * 0.04);
      drawPitch(t);
      ctx.restore();
      drawParticles(t);
      raf = requestAnimationFrame(frame);
    }

    function onPointer(e: PointerEvent) {
      tx = (e.clientX / w - 0.5) * 2;
      ty = (e.clientY / h - 0.5) * 2;
    }

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        raf = requestAnimationFrame(frame);
      }
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduced) {
      // single static render
      drawPitch(0);
      drawParticles(0);
    } else {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <canvas id="backdrop" ref={ref} aria-hidden="true" style={{ opacity: 0.6 }} />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
