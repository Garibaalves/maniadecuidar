import {
  AboutSection,
  ContactSection,
  FAQSection,
  Footer,
  GallerySection,
  Hero,
  LocationSection,
  Navbar,
  ServicesSection,
  DifferentialsSection,
  TestimonialsSection,
  FloatingButtons,
} from "@/components/landing/landing-sections";

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <main className="min-h-screen pt-24 md:pt-28">
        <Hero />
        <ServicesSection />
        <DifferentialsSection />
        <AboutSection />
        <GallerySection />
        <TestimonialsSection />
        <ContactSection />
        <LocationSection />
        <FAQSection />
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}
