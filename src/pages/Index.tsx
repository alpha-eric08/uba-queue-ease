
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import BenefitsSection from '@/components/home/BenefitsSection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <HowItWorksSection />
      <BenefitsSection />
    </Layout>
  );
};

export default Index;
