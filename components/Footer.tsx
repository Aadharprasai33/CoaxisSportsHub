import Image from "next/image";
import { SITE } from "@/lib/config";
import logo from "@/public/logo.png";
import { InstagramIcon, TikTokIcon, YouTubeIcon } from "./icons";

export default function Footer() {
  return (
    <footer>
      <Image className="foot-logo" src={logo} alt="" width={56} height={56} />
      <span className="mark">
        COAXIS <span>SPORTS HUB</span>
      </span>
      <p>Because every great play deserves to be celebrated.</p>
      <div className="foot-socials">
        <a
          href={SITE.socials.youtube}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
        >
          <YouTubeIcon />
        </a>
        <a
          href={SITE.socials.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <InstagramIcon />
        </a>
        <a
          href={SITE.socials.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
        >
          <TikTokIcon />
        </a>
      </div>
    </footer>
  );
}
