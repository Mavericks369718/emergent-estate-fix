import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fadeUp } from "@/lib/motion";
import { MapPin, BedDouble, Square, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { api, type PropertyDTO } from "@/lib/api";
import { img } from "@/lib/imageMap";

export function HomeListingsSection() {
  const [properties, setProperties] = useState<PropertyDTO[]>([]);

  useEffect(() => {
    api.listProperties().then((all) => setProperties(all.filter((p) => p.status === "Published"))).catch(() => setProperties([]));
  }, []);

  const featured = properties.find((p) => p.featured) ?? properties[0];
  const others = featured
    ? properties.filter((p) => p.slug !== featured.slug).slice(0, 4)
    : [];

  return (
    <section id="listings" className="relative py-32 md:py-40 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <motion.h2
            {...fadeUp(0)}
            className="text-5xl md:text-7xl lg:text-8xl tracking-[-0.04em] leading-[0.95] font-light"
          >
            Featured <span className="italic-serif">Estates</span>
          </motion.h2>
          <motion.div {...fadeUp(0.1)}>
            <Link
              to="/properties"
              className="text-sm tracking-wide text-secondary-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              data-testid="listings-view-all"
            >
              View entire portfolio <ArrowRight className="h-4 w-4" strokeWidth={1.4} />
            </Link>
          </motion.div>
        </div>

        {featured && (
          <motion.div
            {...fadeUp(0.15)}
            className="mt-12 md:mt-16 relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group"
          >
            <Link
              to="/properties/$slug"
              params={{ slug: featured.slug }}
              className="block"
              data-testid="featured-property-card"
            >
              <div className="aspect-[16/10] md:aspect-[21/9] overflow-hidden">
                <img
                  src={img(featured.cover)}
                  alt={featured.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />
              <div className="grain" />

              <div className="absolute left-0 right-0 bottom-0 p-6 md:p-12">
                <p className="text-xs uppercase tracking-[3px] text-accent mb-4">
                  Signature Listing
                </p>
                <h3 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-[-0.03em] max-w-3xl">
                  {featured.title}
                </h3>
                <div className="mt-8 flex flex-wrap items-center gap-6 md:gap-10 text-sm text-secondary-foreground">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" strokeWidth={1.4} />{" "}
                    {featured.location}, {featured.city}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Square className="h-4 w-4 text-accent" strokeWidth={1.4} /> {featured.sqft} sqft
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-accent" strokeWidth={1.4} /> {featured.bedrooms} Bedrooms
                  </span>
                  <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 group-hover:scale-[1.03] transition-transform duration-500">
                    Request Details <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        <div className="mt-12 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {others.map((p, i) => (
            <motion.article
              {...fadeUp(0.1 + i * 0.07)}
              key={p.slug}
              className="relative rounded-3xl overflow-hidden group bg-card border border-border/60"
              data-testid={`home-property-card-${i}`}
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
                  <p className="text-[11px] uppercase tracking-[2.5px] text-accent">
                    {p.location}
                  </p>
                  <h3 className="mt-1.5 text-xl font-light tracking-[-0.02em]">
                    {p.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Square className="h-3.5 w-3.5" strokeWidth={1.4} />
                      {p.sqft} sqft
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <BedDouble className="h-3.5 w-3.5" strokeWidth={1.4} />
                      {p.bedrooms}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <motion.div {...fadeUp(0.4)} className="mt-12 md:mt-16 flex justify-center">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 rounded-full liquid-glass px-7 py-3.5 text-sm text-foreground hover:scale-[1.02] transition-transform duration-500"
            data-testid="listings-view-all-bottom"
          >
            View all properties <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
