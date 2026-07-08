import { createFileRoute, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { fadeUp } from "@/lib/motion";
import { api, ApiError, type PageDTO, type PageSection } from "@/lib/api";
import { img } from "@/lib/imageMap";
import { focalStyle } from "@/lib/imageFocal";
import { MarkdownView } from "@/routes/admin/pages/$slug";

export const Route = createFileRoute("/pages/$slug")({
  loader: async ({ params }) => {
    try {
      const page = await api.getPage(params.slug);
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
        : loaderData?.page.cover
          ? [{ property: "og:image", content: loaderData.page.cover }]
          : []),
    ],
  }),
});

function findSection<T extends PageSection["type"]>(
  sections: PageSection[],
  type: T,
): Extract<PageSection, { type: T }> | undefined {
  return sections.find((s) => s.type === type) as any;
}

function DynamicPage() {
  const { page } = Route.useLoaderData() as { page: PageDTO };
  const heroTitle = page.hero?.title?.trim() || page.title;
  const heroSubtitle = page.hero?.subtitle?.trim() ?? "";
  const gallery = findSection(page.sections, "gallery");
  const cta = findSection(page.sections, "cta");
  const video = findSection(page.sections, "video");
  const isExternal = (u: string) => /^https?:\/\//i.test(u);
  const youtubeId = (u: string) => {
    const m = u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  };

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
            className="mt-6 text-5xl md:text-7xl tracking-[-0.045em] leading-[0.95] font-light max-w-4xl break-words"
            data-testid="page-title"
          >
            {heroTitle}
          </motion.h1>
          {heroSubtitle && (
            <motion.p
              {...fadeUp(0.1)}
              className="mt-6 text-lg md:text-xl text-secondary-foreground max-w-3xl leading-relaxed"
              data-testid="page-subtitle"
            >
              {heroSubtitle}
            </motion.p>
          )}
          {page.cover && (
            <motion.div
              {...fadeUp(0.15)}
              className="mt-12 md:mt-16 relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden"
              data-testid="page-cover"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img src={img(page.cover)} alt={heroTitle} className="h-full w-full object-cover" style={focalStyle(page.cover)} loading="eager" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-transparent" />
              <div className="grain" />
            </motion.div>
          )}
        </div>
      </section>

      {/* Content (Markdown) */}
      {page.content?.trim() ? (
        <section className="relative px-6 md:px-12 pb-16 md:pb-24" data-testid="page-content">
          <motion.div
            {...fadeUp(0.05)}
            className="max-w-[820px] mx-auto prose-page"
          >
            <MarkdownView source={page.content} />
          </motion.div>
        </section>
      ) : (
        <section className="relative px-6 md:px-12 pb-16 text-center" data-testid="page-empty">
          <p className="text-muted-foreground">This page is empty. Add content in the admin panel.</p>
        </section>
      )}

      {/* Optional video block */}
      {video && youtubeId(video.url) && (
        <section className="relative px-6 md:px-12 pb-16 md:pb-24" data-testid="page-video">
          <div className="max-w-[1100px] mx-auto">
            {video.title && (
              <h2 className="text-3xl md:text-4xl font-light tracking-[-0.02em] mb-8 italic-serif text-center">
                {video.title}
              </h2>
            )}
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId(video.url)}`}
                title={video.title || heroTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
            {video.caption && (
              <p className="mt-4 text-center text-sm text-muted-foreground">{video.caption}</p>
            )}
          </div>
        </section>
      )}


      {/* Optional gallery block */}
      {gallery && gallery.images?.length > 0 && (
        <section className="relative px-6 md:px-12 pb-16 md:pb-24" data-testid="page-gallery">
          <div className="max-w-[1100px] mx-auto">
            {gallery.title && (
              <h2 className="text-3xl md:text-4xl font-light tracking-[-0.02em] mb-8 italic-serif">
                {gallery.title}
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {gallery.images.map((url, i) => (
                <div key={`${url}-${i}`} className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-card/60">
                  <img
                    src={img(url)}
                    alt={`${gallery.title || heroTitle} image ${i + 1}`}
                    className="h-full w-full object-cover"
                    style={focalStyle(url)}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Optional CTA block */}
      {cta && (
        <section className="relative px-6 md:px-12 pb-24 md:pb-32" data-testid="page-cta">
          <div className="max-w-[1100px] mx-auto rounded-[1.5rem] md:rounded-[2rem] border border-border/60 bg-card/60 p-8 md:p-14 text-center">
            <h2 className="text-3xl md:text-5xl font-light tracking-[-0.02em] break-words">{cta.title}</h2>
            {cta.body && (
              <p className="mt-4 max-w-2xl mx-auto text-base md:text-lg text-secondary-foreground leading-relaxed">
                {cta.body}
              </p>
            )}
            <div className="mt-8">
              <a
                href={cta.ctaUrl}
                {...(isExternal(cta.ctaUrl) ? { target: "_blank", rel: "noreferrer" } : {})}
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm hover:scale-[1.02] transition-transform"
              >
                {cta.ctaLabel} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
