import { useEffect } from 'react';
import ResourcesHero from '../components/resources/ResourcesHero';
import HowPlatformWorks from '../components/resources/HowPlatformWorks';
import BlockchainTransparency from '../components/resources/BlockchainTransparency';
import FAQ from '../components/resources/FAQ';
import LinksDocs from '../components/resources/LinksDocs';
import FooterCTA from '../components/home/FooterCTA';

const Resources = () => {
  // Scroll to top when page loaded
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#0f1115] min-h-screen">
      <ResourcesHero />
      <div className="space-y-12 pb-24">
        <HowPlatformWorks />
        <BlockchainTransparency />
        <FAQ />
        <LinksDocs />
      </div>

      <FooterCTA />
    </div>
  );
};

export default Resources;
