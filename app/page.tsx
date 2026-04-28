import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import SplitStatement from "@/components/SplitStatement";
import FeatureTracks from "@/components/FeatureTracks";
import HowItWorks from "@/components/HowItWorks";
import ScenarioGrid from "@/components/ScenarioGrid";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <FeaturedProperties />
        <SplitStatement />
        <FeatureTracks />
        <HowItWorks />
        <ScenarioGrid />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
