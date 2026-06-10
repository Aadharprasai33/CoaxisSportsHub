import CountUp from "./CountUp";

const STATS: { to: number; suffix?: string; label: string }[] = [
  { to: 48, label: "nations on one stage" },
  { to: 104, label: "matches tracked live" },
  { to: 16, label: "host cities, 3 countries" },
  { to: 5, suffix: "B+", label: "fans speaking one language" },
];

export default function Mission() {
  return (
    <section id="aim" className="mission">
      <div className="sec-head">
        <span className="secnum">03</span>
        <h2>Our Aim</h2>
        <span className="sub">Why this channel exists</span>
      </div>
      <div className="shout" aria-label="One world, one game">
        <span className="a">ONE WORLD.</span>
        <span className="b">ONE GAME.</span>
      </div>
      <p className="creed">
        Sport is the only language spoken in every country on Earth. A
        last-minute winner sounds exactly the same in Mexico City, Lagos,
        Kathmandu and Seoul. <b>Coaxis Sports Hub exists to bottle that
        feeling</b> — to pull fans from every timezone into one stand,
        celebrating greatness together. No tribes, no gatekeeping, no
        &quot;you had to be there.&quot; <b>We bring the there to you</b> — and
        this summer, the whole planet is in the stands.
      </p>
      <div className="stats">
        {STATS.map((s) => (
          <div className="stat" key={s.label}>
            <div className="statnum">
              <CountUp to={s.to} suffix={s.suffix} />
            </div>
            <div className="statlab">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
