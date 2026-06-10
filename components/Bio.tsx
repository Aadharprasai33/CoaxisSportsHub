import Image from "next/image";
import logo from "@/public/logo.png";

export default function Bio() {
  return (
    <section id="bio">
      <div className="sec-head">
        <span className="secnum">01</span>
        <h2>Who We Are</h2>
        <span className="sub">The crew behind the badge</span>
      </div>
      <div className="bio-grid">
        <div className="bio-badge">
          <Image
            src={logo}
            alt="Coaxis Sports Hub badge"
            sizes="(max-width: 900px) 180px, 300px"
          />
        </div>
        <div className="bio-copy">
          <p>
            <b>Coaxis Sports Hub</b> started with one conviction: the greatest
            sports moments deserve more than a replay — they deserve a stage.
            We hunt down the goals, the buzzer-beaters, the photo finishes and
            the stories behind them, and cut them into films you can feel.
          </p>
          <p>
            Born on YouTube, built for every feed. From the biggest finals on
            Earth to the moments nobody saw coming — <b>if it made the world
            jump off its seat, it lands here.</b>
          </p>
          <span className="stamp">Est. on the love of the game</span>
        </div>
      </div>
    </section>
  );
}
