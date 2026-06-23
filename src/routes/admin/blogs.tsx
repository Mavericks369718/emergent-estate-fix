import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X, Save, ArrowUp, ArrowDown } from "lucide-react";
import { AdminShell, PageHeader, Field } from "@/components/admin/AdminShell";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { api, type BlogDTO, type BlogBlockDTO } from "@/lib/api";
import { cleanupOrphanImages } from "@/lib/imageCleanup";

export const Route = createFileRoute("/admin/blogs")({
  component: AdminBlogs,
});

const EMPTY: Partial<BlogDTO> = {
  slug: "", title: "", tag: "Market", cover: "", excerpt: "",
  body: [{ type: "p", text: "" }],
  author: "", authorRole: "", publishedAt: new Date().toISOString(),
  readTime: "4 min read", status: "Draft", seo: {},
};

function AdminBlogs() {
  const [rows, setRows] = useState<BlogDTO[]>([]);
  const [editing, setEditing] = useState<Partial<BlogDTO> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const reload = () => api.listBlogs().then(setRows).catch(() => setRows([]));
  useEffect(() => { reload(); }, []);

  const save = async () => {
    if (!editing) return;
    try {
      if (isNew) {
        await api.createBlog(editing);
        toast.success("Essay created");
      } else {
        await api.updateBlog(editing.slug!, editing);
        toast.success("Essay updated");
      }
      setEditing(null);
      reload();
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    }
  };

  const togglePublish = async (b: BlogDTO) => {
    try {
      await api.updateBlog(b.slug, { status: b.status === "Published" ? "Draft" : "Published" });
      reload();
    } catch (err: any) { toast.error(err?.message); }
  };

  const remove = async (b: BlogDTO) => {
    if (!confirm(`Delete "${b.title}"?`)) return;
    try {
      await api.deleteBlog(b.slug);
      toast.success("Essay deleted");
      reload();
    } catch (err: any) { toast.error(err?.message); }
  };

  return (
    <AdminShell>
      <PageHeader eyebrow="Manage" title="Essays"
        action={
          <button onClick={() => { setEditing({ ...EMPTY }); setIsNew(true); }} data-testid="admin-blog-new"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:scale-[1.02] transition-transform">
            <Plus className="h-3.5 w-3.5" /> New essay
          </button>
        }
      />

      <div className="rounded-3xl bg-card/60 border border-border/60 overflow-hidden" data-testid="admin-blogs-table">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[2.5px] text-muted-foreground">
            <tr className="border-b border-border/60">
              <th className="text-left px-5 py-4">Title</th>
              <th className="text-left px-5 py-4">Tag</th>
              <th className="text-left px-5 py-4">Author</th>
              <th className="text-left px-5 py-4">Status</th>
              <th className="text-right px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b, i) => (
              <tr key={b.slug} className="border-b border-border/40 last:border-0" data-testid={`blog-row-${i}`}>
                <td className="px-5 py-4">
                  <p className="text-foreground italic-serif">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.slug}</p>
                </td>
                <td className="px-5 py-4 text-secondary-foreground">{b.tag}</td>
                <td className="px-5 py-4 text-secondary-foreground">{b.author}</td>
                <td className="px-5 py-4">
                  <button onClick={() => togglePublish(b)} data-testid={`blog-toggle-publish-${i}`}
                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[2px] ${
                      b.status === "Published" ? "bg-accent/20 text-accent" : "bg-muted/30 text-muted-foreground"
                    }`}>
                    {b.status}
                  </button>
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => { setEditing({ ...b }); setIsNew(false); }} data-testid={`blog-edit-${i}`}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-card text-secondary-foreground hover:text-foreground transition-colors">
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.4} />
                  </button>
                  <button onClick={() => remove(b)} data-testid={`blog-delete-${i}`}
                    className="ml-1 inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-destructive/20 text-secondary-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.4} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No essays yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <BlogEditor value={editing} onChange={setEditing} onCancel={() => setEditing(null)} onSave={save} isNew={isNew} />
      )}
    </AdminShell>
  );
}

function BlogEditor({
  value, onChange, onCancel, onSave, isNew,
}: {
  value: Partial<BlogDTO>;
  onChange: (v: Partial<BlogDTO>) => void;
  onCancel: () => void;
  onSave: () => void;
  isNew: boolean;
}) {
  const v = value;
  const set = (k: keyof BlogDTO, val: any) => onChange({ ...v, [k]: val });
  const body = v.body ?? [];

  const updateBlock = (i: number, patch: Partial<BlogBlockDTO>) => {
    const next = body.map((b, idx) => (idx === i ? { ...b, ...patch } : b));
    set("body", next);
  };
  const addBlock = (type: "h2" | "p") => set("body", [...body, { type, text: "" }]);
  const removeBlock = (i: number) => set("body", body.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= body.length) return;
    const next = [...body];
    [next[i], next[j]] = [next[j], next[i]];
    set("body", next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm overflow-y-auto" data-testid="blog-editor-modal">
      <div className="max-w-3xl mx-auto my-10 rounded-3xl bg-card border border-border/60 p-8 md:p-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[3px] text-accent">{isNew ? "Create" : "Edit"}</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-light tracking-[-0.02em] italic-serif">{v.title || "New essay"}</h2>
          </div>
          <button onClick={onCancel} className="rounded-full p-2 hover:bg-card/80" data-testid="blog-editor-close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Slug" value={v.slug ?? ""} onChange={(x) => set("slug", x)} testId="blog-slug" />
          <Field label="Title" value={v.title ?? ""} onChange={(x) => set("title", x)} testId="blog-title-input" />
          <label className="block">
            <span className="block text-[10px] uppercase tracking-[2.5px] text-muted-foreground mb-2">Tag</span>
            <select value={v.tag ?? "Market"} onChange={(e) => set("tag", e.target.value)} data-testid="blog-tag-select"
              className="w-full rounded-xl bg-input/40 border border-border outline-none px-3.5 py-2.5 text-sm">
              <option>Market</option><option>Lifestyle</option><option>Investment</option><option>Design</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-[10px] uppercase tracking-[2.5px] text-muted-foreground mb-2">Status</span>
            <select value={v.status ?? "Draft"} onChange={(e) => set("status", e.target.value)} data-testid="blog-status-select"
              className="w-full rounded-xl bg-input/40 border border-border outline-none px-3.5 py-2.5 text-sm">
              <option>Draft</option><option>Published</option>
            </select>
          </label>
          <Field label="Read time" value={v.readTime ?? ""} onChange={(x) => set("readTime", x)} testId="blog-readtime" placeholder="5 min read" />
          <div className="col-span-2">
            <ImagePicker label="Cover image" value={v.cover} folder="blogs" onChange={(url) => set("cover", url)} testId="blog-cover" />
          </div>
          <Field label="Author" value={v.author ?? ""} onChange={(x) => set("author", x)} testId="blog-author" />
          <Field label="Author role" value={v.authorRole ?? ""} onChange={(x) => set("authorRole", x)} testId="blog-author-role" />
          <label className="block col-span-2">
            <span className="block text-[10px] uppercase tracking-[2.5px] text-muted-foreground mb-2">Published date</span>
            <input
              type="datetime-local"
              value={(v.publishedAt ?? "").slice(0, 16)}
              onChange={(e) => set("publishedAt", new Date(e.target.value).toISOString())}
              data-testid="blog-published-at"
              className="w-full rounded-xl bg-input/40 border border-border outline-none px-3.5 py-2.5 text-sm"
            />
          </label>
          <div className="col-span-2">
            <Field label="Excerpt" value={v.excerpt ?? ""} onChange={(x) => set("excerpt", x)} textarea testId="blog-excerpt" />
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] uppercase tracking-[3px] text-accent">Body blocks</p>            <div className="flex gap-2">
              <button onClick={() => addBlock("h2")} data-testid="blog-add-h2" className="rounded-full liquid-glass px-3 py-1.5 text-xs">+ H2</button>
              <button onClick={() => addBlock("p")} data-testid="blog-add-p" className="rounded-full liquid-glass px-3 py-1.5 text-xs">+ Paragraph</button>
            </div>
          </div>
          <div className="space-y-3" data-testid="blog-body-blocks">
            {body.map((block, i) => (
              <div key={i} className="rounded-2xl bg-input/30 border border-border/60 p-4" data-testid={`blog-block-${i}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-[2.5px] text-accent">{block.type === "h2" ? "Heading" : "Paragraph"}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(i, -1)} className="rounded-full p-1.5 hover:bg-card" data-testid={`blog-block-up-${i}`}>
                      <ArrowUp className="h-3 w-3" strokeWidth={1.4} />
                    </button>
                    <button onClick={() => move(i, 1)} className="rounded-full p-1.5 hover:bg-card" data-testid={`blog-block-down-${i}`}>
                      <ArrowDown className="h-3 w-3" strokeWidth={1.4} />
                    </button>
                    <button onClick={() => removeBlock(i)} className="rounded-full p-1.5 hover:bg-destructive/20 text-secondary-foreground hover:text-destructive" data-testid={`blog-block-remove-${i}`}>
                      <Trash2 className="h-3 w-3" strokeWidth={1.4} />
                    </button>
                  </div>
                </div>
                <textarea
                  rows={block.type === "h2" ? 1 : 4}
                  value={block.text}
                  onChange={(e) => updateBlock(i, { text: e.target.value })}
                  data-testid={`blog-block-text-${i}`}
                  className="w-full rounded-lg bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60"
                  placeholder={block.type === "h2" ? "Section heading" : "Paragraph text"}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="mt-8 pt-6 border-t border-border/40 space-y-4">
          <p className="text-[11px] uppercase tracking-[3px] text-accent">SEO</p>
          <Field label="Meta title" value={v.seo?.title ?? ""} onChange={(x) => set("seo", { ...(v.seo ?? {}), title: x })} testId="blog-seo-title" placeholder="Defaults to blog title" />
          <Field label="Meta description" value={v.seo?.description ?? ""} onChange={(x) => set("seo", { ...(v.seo ?? {}), description: x })} textarea testId="blog-seo-desc" placeholder="Defaults to excerpt" />
          <ImagePicker label="OG image (social sharing)" value={v.seo?.ogImage} folder="blogs" onChange={(url) => set("seo", { ...(v.seo ?? {}), ogImage: url })} testId="blog-seo-og" />
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button onClick={onCancel} className="rounded-full liquid-glass px-5 py-2.5 text-sm" data-testid="blog-editor-cancel">Cancel</button>
          <button onClick={onSave} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:scale-[1.02] transition-transform" data-testid="blog-editor-save">
            <Save className="h-3.5 w-3.5" /> {isNew ? "Create" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}