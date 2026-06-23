import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { MapPin, BedDouble, Square, ArrowRight } from "lucide-react";
import featured from "@/assets/featured-estate.jpg";
import l1 from "@/assets/listing-1.jpg";
import l2 from "@/assets/listing-2.jpg";
import l3 from "@/assets/listing-3.jpg";
import l4 from "@/assets/listing-4.jpg";

const PROPERTIES = [
  { img: l1, title: "Farmhouses", location: "Westend Greens", sqft: "12,400", beds: 6 },
  { img: l2, title: "Penthouse Residences", location: "Lutyens' Delhi", sqft: "6,200", beds: 4 },
  { img: l3, title: "Builder Floors", location: "Vasant Vihar", sqft: "4,800", beds: 4 },
  { img: l4, title: "Golf Villas", location: "DLF Camellias", sqft: "9,100", beds: 5 },
];

export function ListingsSection() {
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
          <motion.a
            {...fadeUp(0.1)}
            href="#contact"
            className="text-sm tracking-wide text-secondary-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
          >
            View entire portfolio <ArrowRight className="h-4 w-4" strokeWidth={1.4} />
          </motion.a>
        </div>

        {/* Featured */}
        <motion.div
          {...fadeUp(0.15)}
          className="mt-12 md:mt-16 relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group"
        >
          <div className="aspect-[16/10] md:aspect-[21/9] overflow-hidden">
            <img
              src={featured}
              alt="Featured South Delhi luxury estate"
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
              The <span className="italic-serif">Sandstone</span> Estate
            </h3>
            <div className="mt-8 flex flex-wrap items-center gap-6 md:gap-10 text-sm text-secondary-foreground">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" strokeWidth={1.4} /> Chattarpur, South Delhi
              </span>
              <span className="inline-flex items-center gap-2">
                <Square className="h-4 w-4 text-accent" strokeWidth={1.4} /> 18,500 sqft
              </span>
              <span className="inline-flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-accent" strokeWidth={1.4} /> 7 Bedrooms
              </span>
              <a
                href="#contact"
                className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 hover:scale-[1.03] transition-transform duration-500"
              >
                Request Details <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="mt-12 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {PROPERTIES.map((p, i) => (
            <motion.article
              {...fadeUp(0.1 + i * 0.07)}
              key={p.title}
              className="relative rounded-3xl overflow-hidden group bg-card border border-border/60"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={p.img}
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
                    {p.beds}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
