import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { EvolvedSection } from "@/components/site/EvolvedSection";
import { LegacySection } from "@/components/site/LegacySection";
import { MdlSection } from "@/components/site/MdlSection";
import { HomeListingsSection } from "@/components/site/HomeListingsSection";
import { HomeBlogsSection } from "@/components/site/HomeBlogsSection";
import { CtaBanner } from "@/components/site/CtaBanner";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      {
        title:
          "South Delhi Farms & Floors — Luxury Farmhouses, Builder Floors & Estates",
      },
      {
        name: "description",
        content:
          "Curating South Delhi's most exclusive farmhouses, builder floors and luxury investment residences. Private tours, advisory and acquisition.",
      },
      { property: "og:title", content: "South Delhi Farms & Floors" },
      {
        property: "og:description",
        content:
          "Ultra-luxury Indian real estate — farmhouses, builder floors and signature residences in South Delhi.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function Index() {
  return (
    <main id="home" className="bg-background text-foreground" data-testid="home-page">
      <Navbar />
      <Hero />
      <EvolvedSection />
      <LegacySection />
      <MdlSection />
      <HomeListingsSection />
      <HomeBlogsSection />
      <CtaBanner />
      <Footer />
    </main>
  );
}
