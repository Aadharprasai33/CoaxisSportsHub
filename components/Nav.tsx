import Image from "next/image";
import logo from "@/public/logo.png";

const LINKS: [string, string][] = [
  ["#road", "Road to the Final"],
  ["#bio", "Who We Are"],
  ["#about", "What We Do"],
  ["#aim", "Our Aim"],
  ["#videos", "Drops"],
];

export default function Nav() {
  return (
    <div className="nav">
      <a className="nav-brand" href="#top" aria-label="Coaxis Sports Hub — top">
        <Image src={logo} alt="" width={42} height={42} priority />
        <span>
          COAXIS <b>SPORTS HUB</b>
        </span>
      </a>
      <nav className="nav-links" aria-label="Sections">
        <a className="hot" href="#wc26">
          <span className="dot" />
          WC26 Live
        </a>
        {LINKS.map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
    </div>
  );
}
