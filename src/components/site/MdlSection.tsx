import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { TrendingUp, Crown, Users } from "lucide-react";

const ITEMS = [
  {
    icon: TrendingUp,
    title: "Investment Advisory",
    desc: "Strategic guidance on luxury real estate as a long-horizon, capital-appreciating asset class.",
  },
  {
    icon: Crown,
    title: "Luxury Acquisition",
    desc: "Sourcing of off-market trophy estates through a private network of vetted owners.",
  },
  {
    icon: Users,
    title: "Private Client Network",
    desc: "Discreet access to family offices, NRIs and global collectors of significant residences.",
  },
];

export function MdlSection() {
  return (
    <section id="mdl" className="relative py-28 md:py-36 px-6 md:px-12 border-t border-border/40">
      <div className="max-w-[1400px] mx-auto">
        <motion.span
          {...fadeUp(0)}
          className="block text-xs uppercase tracking-[4px] text-accent"
        >
          MDL
        </motion.span>
        <motion.p
          {...fadeUp(0.05)}
          className="mt-4 text-sm md:text-base uppercase tracking-[2px] text-muted-foreground"
        >
          Market Development & Luxury Advisory
        </motion.p>
        <motion.h2
          {...fadeUp(0.1)}
          className="mt-8 max-w-4xl text-4xl md:text-6xl lg:text-7xl tracking-[-0.03em] leading-[1.05] font-light"
        >
          The advisory network behind South Delhi's most{" "}
          <span className="italic-serif">exclusive</span> addresses.
        </motion.h2>

        <div className="mt-16 md:mt-24 grid md:grid-cols-3 gap-5 md:gap-6">
          {ITEMS.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                {...fadeUp(0.15 + i * 0.08)}
                key={it.title}
                className="relative group rounded-3xl bg-card/60 border border-border/60 p-8 md:p-10 overflow-hidden hover-lift"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                     style={{
                       background:
                         "radial-gradient(400px circle at 50% 0%, hsl(var(--accent) / 0.18), transparent 60%)",
                     }}
                />
                <Icon className="h-8 w-8 text-accent" strokeWidth={1.2} />
                <h3 className="mt-6 text-2xl md:text-[26px] font-light tracking-[-0.02em]">
                  {it.title}
                </h3>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {it.desc}
                </p>
                <div className="mt-10 h-px w-12 bg-accent/60" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
