import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fadeUp } from "@/lib/motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { api, type BlogDTO } from "@/lib/api";
import { img } from "@/lib/imageMap";

export function HomeBlogsSection() {
  const [posts, setPosts] = useState<BlogDTO[]>([]);

  useEffect(() => {
    api.listBlogs().then((r) => setPosts(r.filter((b) => b.status === "Published").slice(0, 4))).catch(() => setPosts([]));
  }, []);

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
          {posts.map((post, i) => (
            <motion.div
              {...fadeUp(0.1 + i * 0.07)}
              key={post.slug}
              data-testid={`home-blog-card-${i}`}
            >
              <Link
                to="/blogs/$slug"
                params={{ slug: post.slug }}
                className="group block rounded-3xl bg-card/60 border border-border/60 overflow-hidden hover-lift"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={img(post.cover)}
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
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp(0.4)} className="mt-12 md:mt-16 flex justify-center">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 rounded-full liquid-glass px-7 py-3.5 text-sm text-foreground hover:scale-[1.02] transition-transform duration-500"
            data-testid="blogs-view-all"
          >
            View all essays <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
