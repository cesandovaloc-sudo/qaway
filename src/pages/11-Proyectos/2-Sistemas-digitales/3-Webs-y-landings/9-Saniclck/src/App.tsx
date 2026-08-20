import { Hero } from "./components/Hero";
import {
  CategorySection, ServicesSection, FeatureBanners, ProjectsSection,
  QualityBar, TestimonialSection, FAQSection, CTASection, Footer,
} from "./components/Sections";

export default function App() {
  return (
    <>
      <Hero />
      <main>
        <CategorySection />
        <ServicesSection />
        <FeatureBanners />
        <ProjectsSection />
        <QualityBar />
        <TestimonialSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
