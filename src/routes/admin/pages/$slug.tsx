import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Save, ArrowLeft, ExternalLink, Eye, Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AdminShell, PageHeader, Field } from "@/components/admin/AdminShell";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { api, ApiError, type PageDTO } from "@/lib/api";
import { cleanupOrphanImages, extractMarkdownImageUrls } from "@/lib/imageCleanup";

export const Route = createFileRoute("/admin/pages/$slug")({
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

function AdminPageEdit() {
  const { page: initial } = Route.useLoaderData() as { page: PageDTO };
  const navigate = useNavigate();
  const [page, setPage] = useState<PageDTO>(initial);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const lastSavedAt = useRef<number>(Date.now());

  // Re-sync ONCE if the loader gives us a different slug (back/forward nav).
  useEffect(() => { setPage(initial); }, [initial.slug]);

  const set = (patch: Partial<PageDTO>) => setPage((p) => ({ ...p, ...patch }));

  const save = async () => {
    setBusy(true);
    const prevCover = page.cover;
    const prevOg = page.seo?.ogImage ?? "";
    const prevHero = page.hero?.image ?? "";
    const prevMdImgs = extractMarkdownImageUrls(initial.content);
    try {
      const saved = await api.updatePage(page.slug, {
        title: page.title,
        status: page.status,
        showInNav: page.showInNav,
        navOrder: page.navOrder,
        cover: page.cover,
        content: page.content,
        hero: { ...page.hero, title: page.title }, // keep hero.title in sync
        seo: page.seo,
      });
      const nextMdImgs = extractMarkdownImageUrls(saved.content);
      const removed = [
        ...(prevCover && prevCover !== saved.cover ? [prevCover] : []),
        ...(prevOg && prevOg !== (saved.seo?.ogImage ?? "") ? [prevOg] : []),
        ...(prevHero && prevHero !== (saved.hero?.image ?? "") ? [prevHero] : []),
        ...prevMdImgs.filter((u) => !nextMdImgs.includes(u)),
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

  // Save on Ctrl/Cmd+S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); save(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Edit page"
        title={page.title || page.slug}
        action={
          <div className="flex gap-2">
            <button onClick={() => navigate({ to: "/admin/pages" })} className="rounded-full liquid-glass px-4 py-2 text-sm inline-flex items-center gap-2" data-testid="page-edit-back">
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
          <Field label="Slug" value={page.slug} onChange={() => { /* slug is immutable post-create */ }} testId="page-slug-readonly" placeholder="/pages/<slug>" />
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

      {/* Content (Markdown) */}
      <section className="rounded-3xl bg-card/60 border border-border/60 p-6 md:p-8 mb-6" data-testid="page-content-editor">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] uppercase tracking-[3px] text-accent">Content</p>
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

        {tab === "write" ? (
          <>
            <textarea
              value={page.content}
              onChange={(e) => set({ content: e.target.value })}
              placeholder={"# Heading\n\nWrite your page in **Markdown**.\n\n## Smaller heading\n\n- Bullet point\n- Another point\n\n[Link](https://example.com)"}
              rows={20}
              data-testid="page-content-input"
              className="w-full rounded-xl bg-input/40 border border-border focus:border-accent/60 outline-none px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 leading-relaxed resize-y min-h-[400px]"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Markdown shortcuts: <code className="text-foreground"># Heading</code>, <code className="text-foreground">**bold**</code>, <code className="text-foreground">_italic_</code>, <code className="text-foreground">- list</code>, <code className="text-foreground">[link](url)</code>, <code className="text-foreground">![image alt](url)</code>. Press <kbd className="text-foreground">Ctrl/Cmd&nbsp;+&nbsp;S</kbd> to save.
            </p>
          </>
        ) : (
          <article className="rounded-xl bg-background/50 border border-border/40 p-6 prose-page" data-testid="page-content-preview-pane">
            <MarkdownView source={page.content} />
          </article>
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
