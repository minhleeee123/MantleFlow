import React from 'react';
import HeroSection from './HeroSection';
import TerminalPreview from './TerminalPreview';
import FeatureGrid from './FeatureGrid';
import TechTicker from './TechTicker';
import StatsSection from './StatsSection';
import HowItWorks from './HowItWorks';
import FAQSection from './FAQSection';
import Footer from './Footer';
import EyeFollowMascot from './EyeFollowMascot';

interface LandingPageProps {
  onStart?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-y-auto scroll-smooth animate-page-enter" style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
      <EyeFollowMascot />
      <HeroSection onStart={onStart} />
      <StatsSection />
      <TechTicker />
      <HowItWorks />
      <TerminalPreview />
      <FeatureGrid />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <div className="py-24 px-6 bg-neo-primary border-b-2 border-black dark:border-white text-center shrink-0 relative overflow-hidden">
        {/* Decorative Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-[pulse_4s_ease-in-out_infinite]"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black text-white uppercase mb-8 tracking-tight drop-shadow-md">
            Ready to Upgrade Your Strategy?
          </h2>
          <p className="text-white/90 font-bold text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the revolution of AI-powered decentralized trading. <br />
            Secure, Smart, and Brutally Efficient.
          </p>
          <div className="flex justify-center gap-4 relative z-10">
            <button
              onClick={onStart}
              className="bg-black text-white px-12 py-5 font-black uppercase text-xl border-2 border-white shadow-neo-dark hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
            >
              Get Started Now
            </button>
          </div>




        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;