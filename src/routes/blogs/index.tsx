import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { fadeUp } from "@/lib/motion";
import { api, type BlogDTO } from "@/lib/api";
import { img } from "@/lib/imageMap";

const BLOG_TAGS: ("All" | "Market" | "Lifestyle" | "Investment" | "Design")[] = [
  "All", "Market", "Lifestyle", "Investment", "Design",
];

export const Route = createFileRoute("/blogs/")({
  loader: async () => {
    const all = await api.listBlogs();
    const blogs = all.filter((b) => b.status === "Published");
    return { blogs };
  },
  component: BlogsIndexPage,
  head: () => ({
    meta: [
      { title: "The Journal — South Delhi Farms & Floors" },
      {
        name: "description",
        content:
          "Essays on luxury real estate, architecture, design and the slow craft of curated living.",
      },
    ],
  }),
});

type Tag = (typeof BLOG_TAGS)[number];

function BlogsIndexPage() {
  const { blogs } = Route.useLoaderData() as { blogs: BlogDTO[] };
  const [tag, setTag] = useState<Tag>("All");

  const posts = useMemo(
    () => blogs.filter((p) => tag === "All" || p.tag === tag),
    [tag, blogs],
  );

  return (
    <main className="bg-background text-foreground" data-testid="blogs-page">
      <Navbar />

      <section className="relative pt-40 md:pt-56 pb-16 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <motion.p {...fadeUp(0)} className="text-xs uppercase tracking-[4px] text-accent">
            The Journal
          </motion.p>
          <motion.h1
            {...fadeUp(0.05)}
            className="mt-6 text-5xl md:text-7xl lg:text-[8rem] tracking-[-0.045em] leading-[0.95] font-light max-w-5xl"
            data-testid="blogs-heading"
          >
            Perspectives on <span className="italic-serif">luxury</span>.
          </motion.h1>

          <motion.div
            {...fadeUp(0.12)}
            className="mt-14 md:mt-20 flex flex-wrap items-center gap-2 md:gap-3"
            data-testid="blog-filters"
          >
            {BLOG_TAGS.map((t) => {
              const active = tag === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  data-testid={`blog-filter-${t.toLowerCase()}`}
                  className={`rounded-full px-5 py-2.5 text-sm transition-all duration-500 border ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "liquid-glass text-secondary-foreground border-border/60 hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              );
            })}
            <span
              className="ml-auto text-xs uppercase tracking-[2.5px] text-muted-foreground"
              data-testid="blog-count"
            >
              {posts.length} {posts.length === 1 ? "Essay" : "Essays"}
            </span>
          </motion.div>
        </div>
      </section>

      <section className="relative pb-32 md:pb-40 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={tag}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            >
              {posts.map((post, i) => (
                <motion.div
                  key={post.slug}
                  layout
                  initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  data-testid={`blog-card-${i}`}
                >
                  <Link
                    to="/blogs/$slug"
                    params={{ slug: post.slug }}
                    className="group block rounded-3xl bg-card/60 border border-border/60 overflow-hidden hover-lift h-full"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={img(post.cover)}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                      />
                    </div>
                    <div className="p-6 md:p-7">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-[2.5px] text-accent">
                          {post.tag}
                        </span>
                        <ArrowUpRight
                          className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-500"
                          strokeWidth={1.4}
                        />
                      </div>
                      <h3 className="mt-4 text-xl md:text-[22px] italic-serif text-foreground leading-tight">
                        {post.title}
                      </h3>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {post.excerpt}
                      </p>
                      <p className="mt-5 text-[11px] uppercase tracking-[2.5px] text-muted-foreground">
                        {post.author} · {post.readTime}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {posts.length === 0 && (
            <p className="text-center text-muted-foreground py-24" data-testid="blog-empty">
              No essays under this tag yet.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
