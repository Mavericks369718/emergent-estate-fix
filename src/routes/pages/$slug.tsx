import { createFileRoute, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { fadeUp } from "@/lib/motion";
import { api, ApiError, type PageDTO } from "@/lib/api";
import { img } from "@/lib/imageMap";
import { MarkdownView } from "@/routes/admin/pages/$slug";

export const Route = createFileRoute("/pages/$slug")({
  loader: async ({ params }) => {
    try {
      const page = await api.getPage(params.slug);
      // Public route: only Published pages are visible.
      if (page.status !== "Published") throw notFound();
      return { page };
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) throw notFound();
      throw e;
    }
  },
  component: DynamicPage,
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.page.seo.title || loaderData.page.title} — South Delhi Farms & Floors` : "Page" },
      { name: "description", content: loaderData?.page.seo.description ?? "" },
      ...(loaderData?.page.seo.ogImage
        ? [{ property: "og:image", content: loaderData.page.seo.ogImage }]
        : []),
    ],
  }),
});

function DynamicPage() {
  const { page } = Route.useLoaderData() as { page: PageDTO };

  return (
    <main className="bg-background text-foreground" data-testid="dynamic-page">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-40 md:pt-56 pb-12 px-6 md:px-12">
        <div className="max-w-[1100px] mx-auto">
          <motion.p {...fadeUp(0)} className="text-xs uppercase tracking-[4px] text-accent">
            South Delhi
          </motion.p>
          <motion.h1
            {...fadeUp(0.05)}
            className="mt-6 text-5xl md:text-7xl tracking-[-0.045em] leading-[0.95] font-light max-w-4xl"
            data-testid="page-title"
          >
            {page.title}
          </motion.h1>
          {page.cover && (
            <motion.div
              {...fadeUp(0.15)}
              className="mt-12 md:mt-16 relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden"
              data-testid="page-cover"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img src={img(page.cover)} alt={page.title} className="h-full w-full object-cover" loading="eager" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-transparent" />
              <div className="grain" />
            </motion.div>
          )}
        </div>
      </section>

      {/* Content (Markdown) */}
      {page.content?.trim() ? (
        <section className="relative px-6 md:px-12 pb-24 md:pb-32" data-testid="page-content">
          <motion.div
            {...fadeUp(0.05)}
            className="max-w-[820px] mx-auto prose-page"
          >
            <MarkdownView source={page.content} />
          </motion.div>
        </section>
      ) : (
        <section className="relative px-6 md:px-12 pb-24 text-center" data-testid="page-empty">
          <p className="text-muted-foreground">This page is empty. Add content in the admin panel.</p>
        </section>
      )}

      <Footer />
    </main>
  );
}
