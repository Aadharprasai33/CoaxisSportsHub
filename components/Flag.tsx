import type { Team } from "@/lib/types";

/**
 * Team flag/crest. Live API data ships crest URLs; snapshot data ships
 * ISO codes rendered via flagcdn (emoji flags don't render on Windows).
 */
export default function Flag({ team }: { team: Team }) {
  if (team.crest) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="crestimg" src={team.crest} alt="" loading="lazy" width={22} height={22} />
    );
  }
  if (team.iso) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="flagimg"
        src={`https://flagcdn.com/w40/${team.iso}.png`}
        srcSet={`https://flagcdn.com/w80/${team.iso}.png 2x`}
        alt=""
        loading="lazy"
        width={24}
        height={17}
      />
    );
  }
  return <span className="tla">{team.tla ?? "?"}</span>;
}
