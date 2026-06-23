import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock, User } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { fadeUp } from "@/lib/motion";
import { api, ApiError } from "@/lib/api";
import { img } from "@/lib/imageMap";

export const Route = createFileRoute("/blogs/$slug")({
  loader: async ({ params }) => {
    try {
      const [post, all] = await Promise.all([api.getBlog(params.slug), api.listBlogs()]);
      const related = all.filter((b) => b.slug !== post.slug).slice(0, 3);
      return { post, related };
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) throw notFound();
      throw e;
    }
  },
  component: BlogReaderPage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.post.seo?.title || loaderData.post.title} — South Delhi Farms & Floors`
          : "Essay — South Delhi Farms & Floors",
      },
      { name: "description", content: loaderData?.post.seo?.description ?? loaderData?.post.excerpt ?? "" },
      ...(loaderData?.post.seo?.ogImage
        ? [{ property: "og:image", content: loaderData.post.seo.ogImage }]
        : []),
    ],
  }),
});

function BlogReaderPage() {
  const { post, related } = Route.useLoaderData();

  return (
    <main className="bg-background text-foreground" data-testid="blog-reader-page">
      <Navbar />

      <section className="relative pt-32 md:pt-44 pb-12 px-4 md:px-6">
        <div className="max-w-[1500px] mx-auto">
          <motion.div {...fadeUp(0)} className="mb-6 md:mb-8 px-2 md:px-6">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[2.5px] text-muted-foreground hover:text-foreground transition-colors"
              data-testid="back-to-blogs"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.4} />
              The Journal
            </Link>
          </motion.div>

          <motion.div
            {...fadeUp(0.05)}
            className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden"
          >
            <div className="aspect-[16/10] md:aspect-[21/9] overflow-hidden">
              <img
                src={img(post.cover)}
                alt={post.title}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/30 to-background/40" />
            <div className="grain" />

            <div className="absolute left-0 right-0 bottom-0 p-6 md:p-12">
              <p className="text-[11px] uppercase tracking-[3px] text-accent">{post.tag}</p>
              <h1
                className="mt-4 text-3xl md:text-5xl lg:text-6xl font-light tracking-[-0.03em] max-w-4xl leading-[1.05]"
                data-testid="blog-title"
              >
                {post.title}
              </h1>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.1)}
            className="mt-8 md:mt-10 px-2 md:px-6 flex flex-wrap items-center gap-5 md:gap-8 text-xs uppercase tracking-[2.5px] text-muted-foreground"
            data-testid="blog-meta"
          >
            <span className="inline-flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-accent" strokeWidth={1.4} />
              {post.author} · {post.authorRole}
            </span>
            <span>
              {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-accent" strokeWidth={1.4} />
              {post.readTime}
            </span>
          </motion.div>
        </div>
      </section>

      <section className="relative pb-24 md:pb-32 px-6 md:px-12">
        <div className="max-w-[820px] mx-auto" data-testid="blog-body">
          <p className="text-xl md:text-2xl italic-serif text-secondary-foreground leading-snug">
            {post.excerpt}
          </p>

          <div className="mt-12 space-y-6 text-base md:text-lg text-secondary-foreground leading-[1.85]">
            {post.body.map((block: any, i: number) =>
              block.type === "h2" ? (
                <h2
                  key={i}
                  className="mt-12 text-2xl md:text-3xl font-light tracking-[-0.02em] text-foreground italic-serif"
                  data-testid={`blog-h2-${i}`}
                >
                  {block.text}
                </h2>
              ) : (
                <p key={i} data-testid={`blog-p-${i}`}>
                  {block.text}
                </p>
              ),
            )}
          </div>

          <motion.div
            {...fadeUp(0.05)}
            className="mt-20 md:mt-24 relative rounded-3xl bg-card/60 border border-border/60 p-8 md:p-10 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
            <p className="text-[11px] uppercase tracking-[3px] text-accent">By appointment</p>
            <h3 className="mt-3 text-2xl md:text-3xl font-light tracking-[-0.02em]">
              Speak with our principal, in <span className="italic-serif">private</span>.
            </h3>
            <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
              If this essay resonates with your search, we'd be glad to introduce you
              to an address that does too.
            </p>
            <Link
              to="/contact"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm hover:scale-[1.02] transition-transform duration-500"
              data-testid="blog-cta"
            >
              Begin a conversation
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="relative pb-32 md:pb-40 px-6 md:px-12 border-t border-border/40 pt-24 md:pt-32">
        <div className="max-w-[1400px] mx-auto" data-testid="related-blogs">
          <motion.h2
            {...fadeUp(0)}
            className="text-3xl md:text-5xl font-light tracking-[-0.03em]"
          >
            More from the <span className="italic-serif">Journal</span>
          </motion.h2>

          <div className="mt-12 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {related.map((r: any, i: number) => (
              <motion.div
                key={r.slug}
                {...fadeUp(0.05 + i * 0.07)}
                data-testid={`related-blog-${i}`}
              >
                <Link
                  to="/blogs/$slug"
                  params={{ slug: r.slug }}
                  className="group block rounded-3xl bg-card/60 border border-border/60 overflow-hidden hover-lift h-full"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={img(r.cover)}
                      alt={r.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.06]"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-[2.5px] text-accent">
                        {r.tag}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.4} />
                    </div>
                    <h3 className="mt-4 text-xl italic-serif text-foreground leading-tight">
                      {r.title}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground">{r.excerpt}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
