import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowRight, BedDouble, Square, MapPin } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { fadeUp } from "@/lib/motion";
import { api, type PropertyDTO } from "@/lib/api";
import { img } from "@/lib/imageMap";

const PROPERTY_CATEGORIES: (
  | "All"
  | "Farmhouse"
  | "Builder Floor"
  | "Golf Villa"
  | "Penthouse"
)[] = ["All", "Farmhouse", "Builder Floor", "Golf Villa", "Penthouse"];

export const Route = createFileRoute("/properties/")({
  loader: async () => {
    const all = await api.listProperties();
    const properties = all.filter((p) => p.status === "Published");
    return { properties };
  },
  component: PropertiesIndexPage,
  head: () => ({
    meta: [
      { title: "Properties — South Delhi Farms & Floors" },
      {
        name: "description",
        content:
          "The full curated portfolio — farmhouses, builder floors, golf villas and penthouse residences across South Delhi and the NCR.",
      },
    ],
  }),
});

type Filter = (typeof PROPERTY_CATEGORIES)[number];

function PropertiesIndexPage() {
  const { properties } = Route.useLoaderData() as { properties: PropertyDTO[] };
  const [filter, setFilter] = useState<Filter>("All");

  const items = useMemo(
    () => properties.filter((p) => filter === "All" || p.category === filter),
    [filter, properties],
  );

  return (
    <main className="bg-background text-foreground" data-testid="properties-page">
      <Navbar />

      <section className="relative pt-40 md:pt-56 pb-16 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <motion.p {...fadeUp(0)} className="text-xs uppercase tracking-[4px] text-accent">
            The Portfolio
          </motion.p>
          <motion.h1
            {...fadeUp(0.05)}
            className="mt-6 text-5xl md:text-7xl lg:text-[8rem] tracking-[-0.045em] leading-[0.95] font-light max-w-5xl"
            data-testid="properties-heading"
          >
            Hand-selected <span className="italic-serif">residences</span>.
          </motion.h1>
          <motion.p
            {...fadeUp(0.1)}
            className="mt-8 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            A small, deliberately edited roster. Every address is walked personally
            by the principal and offered only to qualified families.
          </motion.p>

          <motion.div
            {...fadeUp(0.15)}
            className="mt-14 md:mt-20 flex flex-wrap items-center gap-2 md:gap-3"
            data-testid="property-filters"
          >
            {PROPERTY_CATEGORIES.map((c) => {
              const active = filter === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  data-testid={`filter-${c.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`rounded-full px-5 py-2.5 text-sm transition-all duration-500 border ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "liquid-glass text-secondary-foreground border-border/60 hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              );
            })}
            <span
              className="ml-auto text-xs uppercase tracking-[2.5px] text-muted-foreground"
              data-testid="property-count"
            >
              {items.length} {items.length === 1 ? "Residence" : "Residences"}
            </span>
          </motion.div>
        </div>
      </section>

      <section className="relative pb-32 md:pb-40 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            >
              {items.map((p, i) => (
                <motion.article
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="relative rounded-3xl overflow-hidden group bg-card border border-border/60"
                  data-testid={`property-card-${i}`}
                >
                  <Link to="/properties/$slug" params={{ slug: p.slug }} className="block">
                    <div className="aspect-[4/5] overflow-hidden">
                      <img
                        src={img(p.cover)}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
                    <div className="absolute inset-x-3 bottom-3 liquid-glass rounded-2xl p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] uppercase tracking-[2.5px] text-accent">
                          {p.category}
                        </p>
                        {p.featured && (
                          <span className="text-[10px] uppercase tracking-[2.5px] text-foreground">
                            Signature
                          </span>
                        )}
                      </div>
                      <h3
                        className="mt-1.5 text-xl font-light tracking-[-0.02em]"
                        data-testid="property-title"
                      >
                        {p.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" strokeWidth={1.4} />
                        {p.location}, {p.city}
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Square className="h-3.5 w-3.5" strokeWidth={1.4} />
                          {p.sqft} sqft
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <BedDouble className="h-3.5 w-3.5" strokeWidth={1.4} />
                          {p.bedrooms}
                        </span>
                        <span className="ml-auto inline-flex items-center gap-1 text-foreground">
                          View <ArrowRight className="h-3 w-3" strokeWidth={1.6} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>

          {items.length === 0 && (
            <p className="text-center text-muted-foreground py-24" data-testid="property-empty">
              No residences match this category yet.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
