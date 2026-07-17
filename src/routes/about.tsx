import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Quote } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { fadeUp } from "@/lib/motion";
import { api, type FounderDTO } from "@/lib/api";
import { img } from "@/lib/imageMap";
import legacy from "@/assets/legacy-courtyard.jpg";

export const Route = createFileRoute("/about")({
  loader: async () => {
    const founders = await api.listFounders();
    const founder = founders[0] ?? (await api.getFounder(1));
    return { founder, founders };
  },

  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — South Delhi Farms & Floors" },
      {
        name: "description",
        content:
          "The brand, the principal, and the philosophy behind South Delhi's most discreet luxury real estate practice.",
      },
    ],
  }),
});

function AboutPage() {
  const { founder } = Route.useLoaderData() as { founder: FounderDTO };
  return (
    <main className="bg-background text-foreground" data-testid="about-page">
      <Navbar />

      <section className="relative pt-40 md:pt-56 pb-24 md:pb-32 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <motion.p
            {...fadeUp(0)}
            className="text-xs uppercase tracking-[4px] text-accent"
            data-testid="about-eyebrow"
          >
            The House
          </motion.p>
          <motion.h1
            {...fadeUp(0.05)}
            className="mt-6 text-5xl md:text-7xl lg:text-[8rem] tracking-[-0.045em] leading-[0.95] font-light max-w-5xl"
            data-testid="about-heading"
          >
            Curated, never <span className="italic-serif">listed</span>.
          </motion.h1>

          <div className="mt-16 md:mt-24 grid lg:grid-cols-[1fr_1.05fr] gap-12 md:gap-20 items-start">
            <motion.div
              {...fadeUp(0.12)}
              className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] md:rounded-[2rem]"
            >
              <img
                src={legacy}
                alt="South Delhi luxury courtyard at twilight"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/65 via-transparent to-transparent" />
              <div className="grain" />
            </motion.div>

            <motion.div
              {...fadeUp(0.18)}
              className="space-y-7 text-lg leading-relaxed text-secondary-foreground"
              data-testid="about-story"
            >
              <p>
                South Delhi Farms & Floors is not a real estate agency in the
                conventional sense. We do not maintain a public catalogue. We do
                not advertise on hoardings. We do not pursue volume. We exist for
                a small circle of principals — families, founders and stewards of
                capital — for whom the choice of a residence is a matter of
                legacy, not transaction.
              </p>
              <p>
                Every address on our roster is hand-selected by the principal of
                the firm, walked personally, and quietly photographed. Most
                introductions are made on the same evening you write to us. Many
                of our properties never appear in any portfolio at all — they are
                offered, in person, to one family.
              </p>
              <p>
                It is a deliberately slow practice in a fast industry, and the
                only one we are interested in running.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        className="relative py-24 md:py-36 px-6 md:px-12 border-t border-border/40"
        data-testid="about-founder"
      >
        <div className="max-w-[1400px] mx-auto">
          <motion.p {...fadeUp(0)} className="text-xs uppercase tracking-[4px] text-accent">
            The Principal
          </motion.p>

          <div className="mt-10 md:mt-14 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 md:gap-16 items-start">
            <motion.div
              {...fadeUp(0.08)}
              className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-card/60 border border-border/60"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={img(founder.portrait)}
                  alt={founder.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  data-testid="founder-portrait"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent pointer-events-none" />
              <div className="absolute inset-x-5 bottom-5 liquid-glass rounded-2xl p-5">
                <p className="text-[11px] uppercase tracking-[2.5px] text-accent">
                  {founder.role}
                </p>
                <h2
                  className="mt-1.5 text-2xl md:text-3xl tracking-[-0.02em] font-light"
                  data-testid="founder-name"
                >
                  {founder.name}
                </h2>
              </div>
            </motion.div>

            <div className="space-y-10">
              <motion.p
                {...fadeUp(0.12)}
                className="text-2xl md:text-3xl lg:text-4xl tracking-[-0.025em] leading-[1.18] font-light text-foreground"
                data-testid="founder-tagline"
              >
                {founder.tagline}
              </motion.p>

              <motion.div
                {...fadeUp(0.16)}
                className="space-y-6 text-base md:text-lg text-secondary-foreground leading-relaxed"
                data-testid="founder-bio"
              >
                {founder.bio.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </motion.div>

              <motion.figure
                {...fadeUp(0.2)}
                className="relative liquid-glass rounded-3xl p-7 md:p-9"
                data-testid="founder-quote"
              >
                <Quote className="h-7 w-7 text-accent" strokeWidth={1.2} />
                <blockquote className="mt-4 text-xl md:text-2xl italic-serif leading-snug text-foreground">
                  "{founder.quote}"
                </blockquote>
                <figcaption className="mt-5 text-xs uppercase tracking-[2.5px] text-muted-foreground">
                  — {founder.name}, {founder.role}
                </figcaption>
              </motion.figure>

              <motion.div {...fadeUp(0.24)}>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-sm font-medium hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(231,225,210,0.18)] transition-all duration-500"
                  data-testid="founder-cta"
                >
                  Speak with the founder
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                </Link>
              </motion.div>
            </div>
          </div>

          <div
            className="mt-20 md:mt-28 grid sm:grid-cols-3 gap-5 md:gap-6"
            data-testid="founder-stats"
          >
            {founder.stats.map((s, i) => (
              <motion.div
                key={s.label}
                {...fadeUp(0.05 + i * 0.07)}
                className="relative rounded-3xl bg-card/60 border border-border/60 p-8 md:p-10 hover-lift overflow-hidden group"
                data-testid={`founder-stat-${i}`}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                <p className="text-5xl md:text-6xl italic-serif text-foreground tracking-[-0.03em]">
                  {s.value}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[2.5px] text-muted-foreground">
                  {s.label}
                </p>
                <div className="mt-8 h-px w-10 bg-accent/60" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
