import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import farm from "@/assets/card-farmhouse.jpg";
import builder from "@/assets/card-builder.jpg";
import pent from "@/assets/card-penthouse.jpg";

const CARDS = [
  {
    img: farm,
    title: "Farmhouse Estates",
    desc: "Sprawling private estates with landscaped grounds, infinity pools and architectural grandeur.",
  },
  {
    img: builder,
    title: "Builder Floors",
    desc: "Independent ultra-premium floors in Delhi's most coveted neighbourhoods, finished in marble and warmth.",
  },
  {
    img: pent,
    title: "Investment Residences",
    desc: "Skyline penthouses and signature residences engineered for long-term value and prestige.",
  },
];

export function EvolvedSection() {
  return (
    <section className="relative pt-40 md:pt-56 pb-16 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <motion.h2
          {...fadeUp(0)}
          className="text-5xl md:text-7xl lg:text-8xl tracking-[-0.04em] leading-[0.95] font-light max-w-5xl text-balance"
        >
          Luxury has <span className="italic-serif">evolved.</span> Have you?
        </motion.h2>

        <motion.p
          {...fadeUp(0.1)}
          className="mt-8 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed"
        >
          Modern buyers no longer seek square footage alone — they seek privacy,
          architecture, experience and timeless value.
        </motion.p>

        <div className="mt-16 md:mt-24 grid md:grid-cols-3 gap-5 md:gap-6">
          {CARDS.map((c, i) => (
            <motion.article
              {...fadeUp(0.1 + i * 0.1)}
              key={c.title}
              className="liquid-glass rounded-3xl p-3 hover-lift group"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <img
                  src={c.img}
                  alt={c.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              </div>
              <div className="p-6 md:p-7">
                <h3 className="text-2xl md:text-[28px] tracking-[-0.02em] font-light">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {c.desc}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.p
          {...fadeUp(0.2)}
          className="mt-20 md:mt-28 text-center text-2xl md:text-3xl italic-serif text-secondary-foreground max-w-2xl mx-auto"
        >
          True luxury is no longer loud — it is curated.
        </motion.p>
      </div>
    </section>
  );
}
