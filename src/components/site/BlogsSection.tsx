import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { ArrowUpRight } from "lucide-react";
import b1 from "@/assets/blog-1.jpg";
import b2 from "@/assets/blog-2.jpg";
import b3 from "@/assets/blog-3.jpg";

const POSTS = [
  {
    img: b1,
    tag: "Market",
    title: "South Delhi Luxury Trends in 2026",
    excerpt: "How private estates are outperforming traditional asset classes.",
  },
  {
    img: b2,
    tag: "Lifestyle",
    title: "Why Farmhouses Define Modern Prestige",
    excerpt: "The new architecture of privacy, light and landscape.",
  },
  {
    img: b3,
    tag: "Investment",
    title: "Architecture as an Investment",
    excerpt: "Reading value through material, provenance and proportion.",
  },
  {
    img: b1,
    tag: "Design",
    title: "Timeless Interior Design",
    excerpt: "Editorial restraint over decoration — the new Indian luxury home.",
  },
];

export function BlogsSection() {
  return (
    <section id="blogs" className="relative py-28 md:py-36 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <motion.h2
          {...fadeUp(0)}
          className="text-5xl md:text-7xl lg:text-8xl tracking-[-0.04em] leading-[0.95] font-light max-w-5xl"
        >
          Perspectives on Modern <span className="italic-serif">Luxury</span>
        </motion.h2>

        <div className="mt-16 md:mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {POSTS.map((post, i) => (
            <motion.a
              {...fadeUp(0.1 + i * 0.07)}
              href="#"
              key={post.title}
              className="group block rounded-3xl bg-card/60 border border-border/60 overflow-hidden hover-lift"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={post.img}
                  alt={post.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[2.5px] text-accent">
                    {post.tag}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-500"
                    strokeWidth={1.4}
                  />
                </div>
                <h3 className="mt-4 text-xl italic-serif text-foreground leading-tight">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
