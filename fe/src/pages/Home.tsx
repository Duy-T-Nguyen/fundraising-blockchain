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
          'linear-gradient(180deg, #0b1628 0%, #112044 10%, #1e3464 22%, #4a6fa5 35%, #8aaed4 46%, #c4d6f0 56%, #dde8f8 65%, #eef3fc 75%, #f6f9fe 88%, #ffffff 100%)',
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

