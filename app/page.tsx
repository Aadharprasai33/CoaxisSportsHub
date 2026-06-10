import Backdrop from "@/components/Backdrop";
import Bio from "@/components/Bio";
import Countdown from "@/components/Countdown";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import JumpToWc from "@/components/JumpToWc";
import LatestDrops from "@/components/LatestDrops";
import MatchCenter from "@/components/MatchCenter";
import Mission from "@/components/Mission";
import Nav from "@/components/Nav";
import Pillars from "@/components/Pillars";
import Reveal from "@/components/Reveal";
import RoadToFinal from "@/components/RoadToFinal";
import Ticker from "@/components/Ticker";
import { buildRoadmap } from "@/lib/roadmap";
import { getWcData } from "@/lib/wc";

export const revalidate = 60;

export default async function Home() {
  const data = await getWcData();

  return (
    <>
      <Backdrop />
      <Ticker items={data.ticker} />
      <main id="top">
        <Nav />
        <Hero />
        <Countdown fixtures={data.fixtures} />
        <Reveal>
          <MatchCenter initial={data} />
        </Reveal>
        <RoadToFinal stages={buildRoadmap(data.fixtures)} />
        <Reveal>
          <Bio />
        </Reveal>
        <Reveal>
          <Pillars />
        </Reveal>
        <Reveal>
          <Mission />
        </Reveal>
        <Reveal>
          <LatestDrops />
        </Reveal>
      </main>
      <Footer />
      <JumpToWc />
    </>
  );
}
