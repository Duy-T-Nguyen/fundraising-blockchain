import ResourcesHero from '../components/resources/ResourcesHero';
import HowPlatformWorks from '../components/resources/HowPlatformWorks';
import BlockchainTransparency from '../components/resources/BlockchainTransparency';
import FAQ from '../components/resources/FAQ';
import LinksDocs from '../components/resources/LinksDocs';
import FooterCTA from '../components/home/FooterCTA';
import Reveal from '../components/common/Reveal';

const Resources = () => {
  return (
    <div className="bg-[#0f1115] min-h-screen">
      <Reveal direction="none">
        <ResourcesHero />
      </Reveal>

      <div className="space-y-12 pb-24">
        <Reveal direction="up" threshold={0.05}>
          <HowPlatformWorks />
        </Reveal>

        <Reveal direction="up" threshold={0.05}>
          <BlockchainTransparency />
        </Reveal>

        <Reveal direction="up" threshold={0.05}>
          <FAQ />
        </Reveal>

        <Reveal direction="up" threshold={0.05}>
          <LinksDocs />
        </Reveal>
      </div>

      <FooterCTA />
    </div>
  );
};

export default Resources;
