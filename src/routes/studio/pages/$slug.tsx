import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Save, ArrowLeft, ExternalLink, Eye, Pencil, ImagePlus, Plus, Trash2, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AdminShell, PageHeader, Field } from "@/components/admin/AdminShell";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { GalleryPicker } from "@/components/admin/GalleryPicker";
import { api, ApiError, type PageDTO, type PageSection, type SectionPosition } from "@/lib/api";
import { cleanupOrphanImages, extractMarkdownImageUrls } from "@/lib/imageCleanup";

export const Route = createFileRoute("/studio/pages/$slug")({
  loader: async ({ params }) => {
    try {
      const page = await api.getPage(params.slug);
      return { page };
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) throw notFound();
      throw e;
    }
  },
  component: AdminPageEdit,
});

// Stable IDs so we can find-and-replace the optional gallery/cta blocks.
const GALLERY_ID = "page-gallery";
const CTA_ID = "page-cta";
const VIDEO_ID = "page-video";

type GallerySection = Extract<PageSection, { type: "gallery" }>;
type CtaSection = Extract<PageSection, { type: "cta" }>;
type VideoSection = Extract<PageSection, { type: "video" }>;

function findSection<T extends PageSection["type"]>(
  sections: PageSection[],
  type: T,
): Extract<PageSection, { type: T }> | undefined {
  return sections.find((s) => s.type === type) as any;
}

function upsertSection(sections: PageSection[], next: PageSection): PageSection[] {
  const i = sections.findIndex((s) => s.id === next.id);
  if (i === -1) return [...sections, next];
  const copy = sections.slice();
  copy[i] = next;
  return copy;
}

function removeSection(sections: PageSection[], id: string): PageSection[] {
  return sections.filter((s) => s.id !== id);
}

function AdminPageEdit() {
  const { page: initial } = Route.useLoaderData() as { page: PageDTO };
  const navigate = useNavigate();
  const [page, setPage] = useState<PageDTO>(initial);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [insertingImage, setInsertingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const insertInputRef = useRef<HTMLInputElement>(null);
  const lastSavedAt = useRef<number>(Date.now());

  useEffect(() => { setPage(initial); }, [initial.slug]);

  const set = (patch: Partial<PageDTO>) => setPage((p) => ({ ...p, ...patch }));
  const setHero = (patch: Partial<PageDTO["hero"]>) =>
    setPage((p) => ({ ...p, hero: { ...p.hero, ...patch } }));

  const gallery = findSection(page.sections, "gallery") as GallerySection | undefined;
  const cta = findSection(page.sections, "cta") as CtaSection | undefined;
  const video = findSection(page.sections, "video") as VideoSection | undefined;

  const save = async () => {
    setBusy(true);
    const prevCover = page.cover;
    const prevOg = page.seo?.ogImage ?? "";
    const prevHero = page.hero?.image ?? "";
    const prevMdImgs = extractMarkdownImageUrls(initial.content);
    const prevGallery = (findSection(initial.sections, "gallery") as GallerySection | undefined)?.images ?? [];
    try {
      const saved = await api.updatePage(page.slug, {
        title: page.title,
        status: page.status,
        showInNav: page.showInNav,
        navOrder: page.navOrder,
        cover: page.cover,
        content: page.content,
        hero: page.hero,
        sections: page.sections,
        seo: page.seo,
      });
      const nextMdImgs = extractMarkdownImageUrls(saved.content);
      const nextGallery = (findSection(saved.sections, "gallery") as GallerySection | undefined)?.images ?? [];
      const removed = [
        ...(prevCover && prevCover !== saved.cover ? [prevCover] : []),
        ...(prevOg && prevOg !== (saved.seo?.ogImage ?? "") ? [prevOg] : []),
        ...(prevHero && prevHero !== (saved.hero?.image ?? "") ? [prevHero] : []),
        ...prevMdImgs.filter((u) => !nextMdImgs.includes(u)),
        ...prevGallery.filter((u) => !nextGallery.includes(u)),
      ];
      if (removed.length) cleanupOrphanImages(removed);
      setPage(saved);
      lastSavedAt.current = Date.now();
      toast.success("Page saved");
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); save(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Insert markdown image at cursor (or at end) after uploading a file.
  const handleInsertImage = async (file: File | null | undefined) => {
    if (!file) return;
    setInsertingImage(true);
    try {
      const res = await api.uploadImage(file, "pages");
      const snippet = `\n\n![${file.name.replace(/\.[a-z0-9]+$/i, "")}](${res.url})\n\n`;
      const ta = textareaRef.current;
      const current = page.content || "";
      let next = current + snippet;
      let cursor = next.length;
      if (ta) {
        const start = ta.selectionStart ?? current.length;
        const end = ta.selectionEnd ?? current.length;
        next = current.slice(0, start) + snippet + current.slice(end);
        cursor = start + snippet.length;
      }
      set({ content: next });
      // restore focus + caret after React re-renders
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) { el.focus(); el.setSelectionRange(cursor, cursor); }
      });
      toast.success("Image inserted");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setInsertingImage(false);
      if (insertInputRef.current) insertInputRef.current.value = "";
    }
  };

  const addGallery = () => {
    if (gallery) return;
    set({ sections: upsertSection(page.sections, { id: GALLERY_ID, type: "gallery", title: "Gallery", images: [] }) });
  };
  const updateGallery = (patch: Partial<GallerySection>) => {
    if (!gallery) return;
    set({ sections: upsertSection(page.sections, { ...gallery, ...patch }) });
  };
  const removeGalleryBlock = () => {
    set({ sections: removeSection(page.sections, GALLERY_ID) });
  };

  const addCta = () => {
    if (cta) return;
    set({ sections: upsertSection(page.sections, {
      id: CTA_ID, type: "cta", title: "Get in touch", body: "", ctaLabel: "Contact us", ctaUrl: "/contact",
    })});
  };
  const updateCta = (patch: Partial<CtaSection>) => {
    if (!cta) return;
    set({ sections: upsertSection(page.sections, { ...cta, ...patch }) });
  };
  const removeCtaBlock = () => {
    set({ sections: removeSection(page.sections, CTA_ID) });
  };

  const addVideo = () => {
    if (video) return;
    set({ sections: upsertSection(page.sections, {
      id: VIDEO_ID, type: "video", title: "Watch the feature", url: "", caption: "",
    })});
  };
  const updateVideo = (patch: Partial<VideoSection>) => {
    if (!video) return;
    set({ sections: upsertSection(page.sections, { ...video, ...patch }) });
  };
  const removeVideoBlock = () => {
    set({ sections: removeSection(page.sections, VIDEO_ID) });
  };


  return (
    <AdminShell>
      <PageHeader
        eyebrow="Edit page"
        title={page.title || page.slug}
        action={
          <div className="flex gap-2">
            <button onClick={() => navigate({ to: "/studio/pages" })} className="rounded-full liquid-glass px-4 py-2 text-sm inline-flex items-center gap-2" data-testid="page-edit-back">
              <ArrowLeft className="h-3.5 w-3.5" /> All pages
            </button>
            <a href={`/pages/${page.slug}`} target="_blank" rel="noreferrer"
              className="rounded-full liquid-glass px-4 py-2 text-sm inline-flex items-center gap-2"
              data-testid="page-edit-preview-live">
              <ExternalLink className="h-3.5 w-3.5" /> View live
            </a>
            <button onClick={save} disabled={busy} data-testid="page-edit-save"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:scale-[1.02] disabled:opacity-60 transition-transform">
              <Save className="h-3.5 w-3.5" /> {busy ? "Saving…" : "Save"}
            </button>
          </div>
        }
      />

      {/* Meta */}
      <section className="rounded-3xl bg-card/60 border border-border/60 p-6 md:p-8 mb-6 space-y-5" data-testid="page-meta">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Title" value={page.title} onChange={(x) => set({ title: x })} testId="page-title-input" />
          <Field label="Slug" value={page.slug} onChange={() => {}} testId="page-slug-readonly" placeholder="/pages/<slug>" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="block text-[10px] uppercase tracking-[2.5px] text-muted-foreground mb-2">Status</span>
            <select value={page.status} onChange={(e) => set({ status: e.target.value as any })} data-testid="page-status-select"
              className="w-full rounded-xl bg-input/40 border border-border outline-none px-3.5 py-2.5 text-sm">
              <option>Draft</option><option>Published</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-3 text-sm pt-7">
            <input type="checkbox" checked={page.showInNav} onChange={(e) => set({ showInNav: e.target.checked })} data-testid="page-shownav" className="h-4 w-4 accent-accent" />
            Show in main navigation
          </label>
          <Field label="Nav order" type="number" value={String(page.navOrder)} onChange={(x) => set({ navOrder: parseInt(x) || 100 })} testId="page-navorder" />
        </div>
        <ImagePicker label="Featured image (shown at top of the page)" value={page.cover} folder="pages" onChange={(url) => set({ cover: url })} testId="page-cover" kind="pageHero" />
      </section>

      {/* Hero */}
      <section className="rounded-3xl bg-card/60 border border-border/60 p-6 md:p-8 mb-6 space-y-5" data-testid="page-hero">
        <p className="text-[11px] uppercase tracking-[3px] text-accent">Hero</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Hero title (optional — falls back to page title)"
            value={page.hero?.title ?? ""}
            onChange={(x) => setHero({ title: x })}
            testId="page-hero-title"
            placeholder={page.title}
          />
          <Field
            label="Hero subtitle"
            value={page.hero?.subtitle ?? ""}
            onChange={(x) => setHero({ subtitle: x })}
            testId="page-hero-subtitle"
            placeholder="A short tagline shown under the title"
          />
        </div>
      </section>

      {/* Content (Markdown) */}
      <section className="rounded-3xl bg-card/60 border border-border/60 p-6 md:p-8 mb-6" data-testid="page-content-editor">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <p className="text-[11px] uppercase tracking-[3px] text-accent">Content</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => insertInputRef.current?.click()}
              disabled={insertingImage}
              data-testid="page-content-insert-image"
              className="inline-flex items-center gap-1.5 rounded-full liquid-glass px-3 py-1.5 text-xs disabled:opacity-60"
            >
              {insertingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />}
              {insertingImage ? "Uploading…" : "Insert image"}
            </button>
            <input
              ref={insertInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleInsertImage(e.target.files?.[0])}
            />
            <div className="flex items-center gap-1 rounded-full bg-input/30 p-1">
              <button onClick={() => setTab("write")} data-testid="page-content-tab-write"
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${tab==="write" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Pencil className="h-3 w-3" /> Write
              </button>
              <button onClick={() => setTab("preview")} data-testid="page-content-tab-preview"
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${tab==="preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Eye className="h-3 w-3" /> Preview
              </button>
            </div>
          </div>
        </div>

        {tab === "write" ? (
          <>
            <textarea
              ref={textareaRef}
              value={page.content}
              onChange={(e) => set({ content: e.target.value })}
              placeholder={"# Heading\n\nWrite your page in **Markdown**.\n\n## Smaller heading\n\n- Bullet point\n- Another point\n\n[Link](https://example.com)"}
              rows={20}
              data-testid="page-content-input"
              className="w-full rounded-xl bg-input/40 border border-border focus:border-accent/60 outline-none px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 leading-relaxed resize-y min-h-[400px]"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Markdown shortcuts: <code className="text-foreground"># Heading</code>, <code className="text-foreground">**bold**</code>, <code className="text-foreground">_italic_</code>, <code className="text-foreground">- list</code>, <code className="text-foreground">[link](url)</code>. Use <strong className="text-foreground">Insert image</strong> above to upload and embed pictures inline. Press <kbd className="text-foreground">Ctrl/Cmd&nbsp;+&nbsp;S</kbd> to save.
            </p>
          </>
        ) : (
          <article className="rounded-xl bg-background/50 border border-border/40 p-6 prose-page" data-testid="page-content-preview-pane">
            <MarkdownView source={page.content} />
          </article>
        )}
      </section>

      {/* Optional Gallery block */}
      <section className="rounded-3xl bg-card/60 border border-border/60 p-6 md:p-8 mb-6" data-testid="page-gallery-block">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[3px] text-accent">Gallery block (optional)</p>
            <p className="text-xs text-muted-foreground mt-1">Shown as a grid after the main content.</p>
          </div>
          {gallery ? (
            <button onClick={removeGalleryBlock} data-testid="page-gallery-remove"
              className="inline-flex items-center gap-1.5 rounded-full liquid-glass px-3 py-1.5 text-xs text-destructive">
              <Trash2 className="h-3 w-3" /> Remove gallery
            </button>
          ) : (
            <button onClick={addGallery} data-testid="page-gallery-add"
              className="inline-flex items-center gap-1.5 rounded-full liquid-glass px-3 py-1.5 text-xs">
              <Plus className="h-3 w-3" /> Add gallery
            </button>
          )}
        </div>
        {gallery && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Gallery heading" value={gallery.title ?? ""} onChange={(x) => updateGallery({ title: x })} testId="page-gallery-title" placeholder="Gallery" />
              <PositionSelect value={gallery.position ?? "below"} onChange={(p) => updateGallery({ position: p })} testId="page-gallery-position" />
            </div>
            <GalleryPicker
              label="Images"
              value={gallery.images}
              onChange={(images) => updateGallery({ images })}
              folder="pages"
              testId="page-gallery-images"
              max={12}
            />
          </div>
        )}
      </section>

      {/* Optional CTA block */}
      <section className="rounded-3xl bg-card/60 border border-border/60 p-6 md:p-8 mb-6" data-testid="page-cta-block">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[3px] text-accent">Call-to-action block (optional)</p>
            <p className="text-xs text-muted-foreground mt-1">A prompt with a button shown near the bottom of the page.</p>
          </div>
          {cta ? (
            <button onClick={removeCtaBlock} data-testid="page-cta-remove"
              className="inline-flex items-center gap-1.5 rounded-full liquid-glass px-3 py-1.5 text-xs text-destructive">
              <Trash2 className="h-3 w-3" /> Remove CTA
            </button>
          ) : (
            <button onClick={addCta} data-testid="page-cta-add"
              className="inline-flex items-center gap-1.5 rounded-full liquid-glass px-3 py-1.5 text-xs">
              <Plus className="h-3 w-3" /> Add CTA
            </button>
          )}
        </div>
        {cta && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Heading" value={cta.title} onChange={(x) => updateCta({ title: x })} testId="page-cta-title" />
            <Field label="Button label" value={cta.ctaLabel} onChange={(x) => updateCta({ ctaLabel: x })} testId="page-cta-label" />
            <div className="sm:col-span-2">
              <Field label="Supporting text" value={cta.body ?? ""} onChange={(x) => updateCta({ body: x })} textarea testId="page-cta-body" placeholder="One short sentence under the heading" />
            </div>
            <Field label="Button URL" value={cta.ctaUrl} onChange={(x) => updateCta({ ctaUrl: x })} testId="page-cta-url" placeholder="/contact" />
            <PositionSelect value={cta.position ?? "below"} onChange={(p) => updateCta({ position: p })} testId="page-cta-position" />
          </div>
        )}
      </section>

      {/* Optional Video block */}
      <section className="rounded-3xl bg-card/60 border border-border/60 p-6 md:p-8 mb-6" data-testid="page-video-block">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[3px] text-accent">Video block (optional)</p>
            <p className="text-xs text-muted-foreground mt-1">Embeds a YouTube video below the main content. Paste any YouTube URL (youtu.be, watch?v=, embed, or shorts).</p>
          </div>
          {video ? (
            <button onClick={removeVideoBlock} data-testid="page-video-remove"
              className="inline-flex items-center gap-1.5 rounded-full liquid-glass px-3 py-1.5 text-xs text-destructive">
              <Trash2 className="h-3 w-3" /> Remove video
            </button>
          ) : (
            <button onClick={addVideo} data-testid="page-video-add"
              className="inline-flex items-center gap-1.5 rounded-full liquid-glass px-3 py-1.5 text-xs">
              <Plus className="h-3 w-3" /> Add video
            </button>
          )}
        </div>
        {video && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Heading (optional)" value={video.title ?? ""} onChange={(x) => updateVideo({ title: x })} testId="page-video-title" placeholder="Watch the feature" />
            <Field label="Caption (optional)" value={video.caption ?? ""} onChange={(x) => updateVideo({ caption: x })} testId="page-video-caption" placeholder="Shown under the video" />
            <div className="sm:col-span-2">
              <Field label="YouTube URL" value={video.url} onChange={(x) => updateVideo({ url: x })} testId="page-video-url" placeholder="https://youtu.be/…" />
            </div>
            <PositionSelect value={video.position ?? "below"} onChange={(p) => updateVideo({ position: p })} testId="page-video-position" />
          </div>
        )}
      </section>



      {/* SEO */}
      <section className="rounded-3xl bg-card/60 border border-border/60 p-6 md:p-8 space-y-4" data-testid="page-seo">
        <p className="text-[11px] uppercase tracking-[3px] text-accent">SEO (for Google & social sharing)</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Meta title" value={page.seo.title ?? ""} onChange={(x) => set({ seo: { ...page.seo, title: x } })} testId="seo-title" placeholder="Defaults to page title" />
          <ImagePicker label="OG image (social sharing)" value={page.seo.ogImage} onChange={(url) => set({ seo: { ...page.seo, ogImage: url } })} folder="pages" testId="seo-og" kind="pageHero" />
        </div>
        <Field label="Meta description" value={page.seo.description ?? ""} onChange={(x) => set({ seo: { ...page.seo, description: x } })} textarea testId="seo-desc" placeholder="One concise sentence shown in Google results" />
      </section>
    </AdminShell>
  );
}

// Markdown render map — defined once at module level so React doesn't unmount
// each element on every keystroke.
const MD_COMPONENTS = {
  h1: (props: any) => <h1 className="text-4xl md:text-5xl font-light tracking-[-0.03em] mt-0 mb-6" {...props} />,
  h2: (props: any) => <h2 className="text-2xl md:text-3xl font-light tracking-[-0.02em] mt-10 mb-4 italic-serif" {...props} />,
  h3: (props: any) => <h3 className="text-xl md:text-2xl font-light tracking-[-0.01em] mt-8 mb-3" {...props} />,
  p:  (props: any) => <p  className="text-base md:text-lg text-secondary-foreground leading-[1.85] mb-5" {...props} />,
  ul: (props: any) => <ul className="list-disc pl-6 mb-5 space-y-2 text-secondary-foreground" {...props} />,
  ol: (props: any) => <ol className="list-decimal pl-6 mb-5 space-y-2 text-secondary-foreground" {...props} />,
  li: (props: any) => <li className="text-base md:text-lg leading-[1.7]" {...props} />,
  a:  (props: any) => <a className="text-accent underline-offset-4 hover:underline" target={(props.href || "").startsWith("http") ? "_blank" : undefined} rel="noreferrer" {...props} />,
  blockquote: (props: any) => <blockquote className="border-l-2 border-accent/60 pl-5 italic-serif text-foreground text-xl my-6" {...props} />,
  img: (props: any) => <img className="rounded-2xl my-6 w-full" loading="lazy" {...props} />,
  code: (props: any) => <code className="rounded bg-input/40 px-1.5 py-0.5 text-sm" {...props} />,
  hr:  () => <hr className="my-10 border-border/60" />,
};
const MD_PLUGINS = [remarkGfm];

export function MarkdownView({ source }: { source: string }) {
  return (
    <ReactMarkdown remarkPlugins={MD_PLUGINS} components={MD_COMPONENTS}>
      {source}
    </ReactMarkdown>
  );
}

function PositionSelect({
  value,
  onChange,
  testId,
}: {
  value: SectionPosition;
  onChange: (p: SectionPosition) => void;
  testId?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[2.5px] text-muted-foreground mb-2">
        Placement on page
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SectionPosition)}
        data-testid={testId}
        className="w-full rounded-xl bg-input/40 border border-border outline-none px-3.5 py-2.5 text-sm"
      >
        <option value="above">Above the main content</option>
        <option value="below">Below the main content</option>
      </select>
    </label>
  );
}
