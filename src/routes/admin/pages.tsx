import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import { AdminShell, PageHeader } from "@/components/admin/AdminShell";
import { api, type PageDTO } from "@/lib/api";
import { cleanupOrphanImages, extractMarkdownImageUrls } from "@/lib/imageCleanup";

export const Route = createFileRoute("/admin/pages")({
  component: AdminPages,
});

function AdminPages() {
  const [rows, setRows] = useState<PageDTO[]>([]);
  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const reload = () => api.listPages().then(setRows).catch(() => setRows([]));
  useEffect(() => { reload(); }, []);

  const create = async () => {
    const slug = newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!slug || !newTitle.trim()) {
      toast.error("Slug and title are required.");
      return;
    }
    try {
      await api.createPage({
        slug, title: newTitle, status: "Draft", showInNav: false, navOrder: 100,
        cover: "",
        content: `# ${newTitle}\n\nStart writing your page content here. Use **bold**, _italic_, and headings (## Heading) just like you would in Word.`,
        hero: { title: newTitle },
        sections: [], seo: {},
      });
      toast.success("Page created — click the pencil to start editing.");
      setNewSlug(""); setNewTitle(""); setCreating(false);
      reload();
    } catch (e: any) {
      toast.error(e?.message || "Create failed");
    }
  };

  const togglePublish = async (p: PageDTO) => {
    try {
      await api.updatePage(p.slug, { status: p.status === "Published" ? "Draft" : "Published" });
      reload();
    } catch (e: any) { toast.error(e?.message); }
  };

  const toggleNav = async (p: PageDTO) => {
    try {
      await api.updatePage(p.slug, { showInNav: !p.showInNav });
      reload();
    } catch (e: any) { toast.error(e?.message); }
  };

  const remove = async (p: PageDTO) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    try {
      await api.deletePage(p.slug);
      toast.success("Page deleted");
      reload();
    } catch (e: any) { toast.error(e?.message); }
  };

  return (
    <AdminShell>
      <PageHeader
        eyebrow="CMS"
        title="Pages"
        action={
          <button onClick={() => setCreating(true)} data-testid="admin-page-new"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:scale-[1.02] transition-transform">
            <Plus className="h-3.5 w-3.5" /> New page
          </button>
        }
      />

      {creating && (
        <div className="rounded-3xl bg-card/60 border border-border/60 p-6 mb-8" data-testid="page-create-form">
          <p className="text-[11px] uppercase tracking-[3px] text-accent">New page</p>
          <div className="mt-4 grid sm:grid-cols-[1fr_2fr_auto_auto] gap-3 items-end">
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[2.5px] text-muted-foreground mb-2">Slug</span>
              <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="services"
                data-testid="page-new-slug"
                className="w-full rounded-xl bg-input/40 border border-border outline-none px-3 py-2.5 text-sm" />
            </label>
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[2.5px] text-muted-foreground mb-2">Title</span>
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Services"
                data-testid="page-new-title"
                className="w-full rounded-xl bg-input/40 border border-border outline-none px-3 py-2.5 text-sm" />
            </label>
            <button onClick={create} data-testid="page-new-submit" className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:scale-[1.02] transition-transform">
              Create
            </button>
            <button onClick={() => setCreating(false)} className="rounded-full liquid-glass px-5 py-2.5 text-sm">Cancel</button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">URL will be /pages/{newSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-") || "your-slug"}</p>
        </div>
      )}

      <div className="rounded-3xl bg-card/60 border border-border/60 overflow-hidden" data-testid="admin-pages-table">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[2.5px] text-muted-foreground">
            <tr className="border-b border-border/60">
              <th className="text-left px-5 py-4">Title</th>
              <th className="text-left px-5 py-4">Slug</th>
              <th className="text-left px-5 py-4">In Nav</th>
              <th className="text-left px-5 py-4">Status</th>
              <th className="text-right px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={p.slug} className="border-b border-border/40 last:border-0" data-testid={`page-row-${i}`}>
                <td className="px-5 py-4 text-foreground">{p.title}</td>
                <td className="px-5 py-4 text-secondary-foreground"><code className="text-xs">/pages/{p.slug}</code></td>
                <td className="px-5 py-4">
                  <button onClick={() => toggleNav(p)} data-testid={`page-toggle-nav-${i}`}
                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[2px] ${p.showInNav ? "bg-accent/20 text-accent" : "bg-muted/30 text-muted-foreground"}`}>
                    {p.showInNav ? "Visible" : "Hidden"}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => togglePublish(p)} data-testid={`page-toggle-publish-${i}`}
                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[2px] ${p.status === "Published" ? "bg-accent/20 text-accent" : "bg-muted/30 text-muted-foreground"}`}>
                    {p.status}
                  </button>
                </td>
                <td className="px-5 py-4 text-right">
                  <a href={`/pages/${p.slug}`} target="_blank" rel="noreferrer" data-testid={`page-preview-${i}`}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-card text-secondary-foreground hover:text-foreground transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.4} />
                  </a>
                  <Link to="/admin/pages/$slug" params={{ slug: p.slug }} data-testid={`page-edit-${i}`}
                    className="ml-1 inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-card text-secondary-foreground hover:text-foreground transition-colors">
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.4} />
                  </Link>
                  <button onClick={() => remove(p)} data-testid={`page-delete-${i}`}
                    className="ml-1 inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-destructive/20 text-secondary-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.4} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No pages yet. Click "New page" to add one — for example /pages/services, /pages/careers, /pages/press.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
