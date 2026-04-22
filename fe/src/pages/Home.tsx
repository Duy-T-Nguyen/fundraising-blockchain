import HeroSection from '../components/home/HeroSection';
import StatsSection from '../components/home/StatsSection';
import CampaignsSection from '../components/home/CampaignsSection';
import WhyBlockchainSection from '../components/home/WhyBlockchainSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import FooterCTA from '../components/home/FooterCTA';
import Reveal from '../components/common/Reveal';

const Home = () => {
  return (
    <main
      style={{
        background:
          'linear-gradient(180deg, rgba(11, 22, 40, 0.9) 0%, rgba(17, 32, 68, 0.8) 10%, rgba(30, 52, 100, 0.7) 22%, rgba(74, 111, 165, 0.6) 35%, rgba(138, 174, 212, 0.4) 46%, rgba(196, 214, 240, 0.2) 56%, rgba(221, 232, 248, 0.1) 65%, transparent 100%)',
      }}
    >
      <Reveal direction="none">
        <HeroSection />
      </Reveal>

      <Reveal direction="up" delay={100}>
        <WhyBlockchainSection />
      </Reveal>

      <Reveal direction="up" delay={100}>
        <HowItWorksSection />
      </Reveal>

      <Reveal direction="up" delay={100}>
        <CampaignsSection />
      </Reveal>

      <Reveal direction="up" delay={100}>
        <StatsSection />
      </Reveal>

      <Reveal direction="up" delay={100}>
        <FooterCTA />
      </Reveal>
    </main>
  );
};

export default Home;

