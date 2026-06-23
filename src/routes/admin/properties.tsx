import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X, Save, Star } from "lucide-react";
import { AdminShell, PageHeader, Field } from "@/components/admin/AdminShell";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { GalleryPicker } from "@/components/admin/GalleryPicker";
import { api, type PropertyDTO } from "@/lib/api";
import { cleanupOrphanImages } from "@/lib/imageCleanup";

export const Route = createFileRoute("/admin/properties")({
  component: AdminProperties,
});

const EMPTY: Partial<PropertyDTO> = {
  slug: "", title: "", category: "Farmhouse", status: "Draft", featured: false,
  location: "", city: "", sqft: "", bedrooms: 0, bathrooms: 0, plotSize: "",
  priceLabel: "", shortDescription: "", description: "",
  amenities: [], cover: "", gallery: [], seo: {},
};

function AdminProperties() {
  const [rows, setRows] = useState<PropertyDTO[]>([]);
  const [editing, setEditing] = useState<Partial<PropertyDTO> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [originalGallery, setOriginalGallery] = useState<string[]>([]);
  const [originalCover, setOriginalCover] = useState<string>("");

  const reload = () => api.listProperties().then(setRows).catch(() => setRows([]));
  useEffect(() => { reload(); }, []);

  const openNew = () => { setEditing({ ...EMPTY }); setIsNew(true); setOriginalGallery([]); setOriginalCover(""); };
  const openEdit = (p: PropertyDTO) => { setEditing({ ...p }); setIsNew(false); setOriginalGallery(p.gallery ?? []); setOriginalCover(p.cover ?? ""); };

  const save = async () => {
    if (!editing) return;
    try {
      if (isNew) {
        await api.createProperty(editing);
        toast.success("Property created");
      } else {
        await api.updateProperty(editing.slug!, editing);
        toast.success("Property updated");
      }
      // Detect removed images and cleanup orphans (non-blocking).
      const nextGallery = editing.gallery ?? [];
      const nextCover = editing.cover ?? "";
      const removed = [
        ...originalGallery.filter((u) => !nextGallery.includes(u)),
        ...(originalCover && originalCover !== nextCover ? [originalCover] : []),
      ];
      if (removed.length) cleanupOrphanImages(removed);
      setEditing(null);
      reload();
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    }
  };

  const togglePublish = async (p: PropertyDTO) => {
    try {
      await api.updateProperty(p.slug, { status: p.status === "Published" ? "Draft" : "Published" });
      reload();
    } catch (err: any) { toast.error(err?.message); }
  };

  const toggleFeatured = async (p: PropertyDTO) => {
    try {
      await api.updateProperty(p.slug, { featured: !p.featured });
      reload();
    } catch (err: any) { toast.error(err?.message); }
  };

  const remove = async (p: PropertyDTO) => {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      const orphans = [p.cover, ...(p.gallery ?? [])];
      await api.deleteProperty(p.slug);
      toast.success("Property deleted");
      cleanupOrphanImages(orphans);
      reload();
    } catch (err: any) { toast.error(err?.message); }
  };

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Manage"
        title="Properties"
        action={
          <button onClick={openNew} data-testid="admin-property-new"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:scale-[1.02] transition-transform">
            <Plus className="h-3.5 w-3.5" /> New property
          </button>
        }
      />

      <div className="rounded-3xl bg-card/60 border border-border/60 overflow-hidden" data-testid="admin-properties-table">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[2.5px] text-muted-foreground">
            <tr className="border-b border-border/60">
              <th className="text-left px-5 py-4">Title</th>
              <th className="text-left px-5 py-4">Category</th>
              <th className="text-left px-5 py-4">Status</th>
              <th className="text-left px-5 py-4">Featured</th>
              <th className="text-right px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={p.slug} className="border-b border-border/40 last:border-0" data-testid={`property-row-${i}`}>
                <td className="px-5 py-4">
                  <p className="text-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.slug}</p>
                </td>
                <td className="px-5 py-4 text-secondary-foreground">{p.category}</td>
                <td className="px-5 py-4">
                  <button onClick={() => togglePublish(p)} data-testid={`property-toggle-publish-${i}`}
                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[2px] ${
                      p.status === "Published" ? "bg-accent/20 text-accent" : "bg-muted/30 text-muted-foreground"
                    }`}>
                    {p.status}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => toggleFeatured(p)} data-testid={`property-toggle-featured-${i}`}
                    className={p.featured ? "text-accent" : "text-muted-foreground/40"}>
                    <Star className="h-4 w-4" fill={p.featured ? "currentColor" : "none"} strokeWidth={1.4} />
                  </button>
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => openEdit(p)} data-testid={`property-edit-${i}`}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-card text-secondary-foreground hover:text-foreground transition-colors">
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.4} />
                  </button>
                  <button onClick={() => remove(p)} data-testid={`property-delete-${i}`}
                    className="ml-1 inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-destructive/20 text-secondary-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.4} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No properties yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <PropertyEditor
          value={editing}
          onChange={setEditing}
          onCancel={() => setEditing(null)}
          onSave={save}
          isNew={isNew}
        />
      )}
    </AdminShell>
  );
}

function PropertyEditor({
  value, onChange, onCancel, onSave, isNew,
}: {
  value: Partial<PropertyDTO>;
  onChange: (v: Partial<PropertyDTO>) => void;
  onCancel: () => void;
  onSave: () => void;
  isNew: boolean;
}) {
  const v = value;
  const set = (k: keyof PropertyDTO, val: any) => onChange({ ...v, [k]: val });

  return (
    <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm overflow-y-auto" data-testid="property-editor-modal">
      <div className="max-w-3xl mx-auto my-10 rounded-3xl bg-card border border-border/60 p-8 md:p-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[3px] text-accent">{isNew ? "Create" : "Edit"}</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-light tracking-[-0.02em]">{v.title || "New property"}</h2>
          </div>
          <button onClick={onCancel} className="rounded-full p-2 hover:bg-card/80" data-testid="property-editor-close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Slug" value={v.slug ?? ""} onChange={(x) => set("slug", x)} testId="prop-slug" placeholder="kebab-case-id" />
          <Field label="Title" value={v.title ?? ""} onChange={(x) => set("title", x)} testId="prop-title" />
          <label className="block">
            <span className="block text-[10px] uppercase tracking-[2.5px] text-muted-foreground mb-2">Category</span>
            <select value={v.category ?? "Farmhouse"} onChange={(e) => set("category", e.target.value)} data-testid="prop-category"
              className="w-full rounded-xl bg-input/40 border border-border outline-none px-3.5 py-2.5 text-sm">
              <option>Farmhouse</option>
              <option>Builder Floor</option>
              <option>Golf Villa</option>
              <option>Penthouse</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-[10px] uppercase tracking-[2.5px] text-muted-foreground mb-2">Status</span>
            <select value={v.status ?? "Draft"} onChange={(e) => set("status", e.target.value)} data-testid="prop-status"
              className="w-full rounded-xl bg-input/40 border border-border outline-none px-3.5 py-2.5 text-sm">
              <option>Draft</option>
              <option>Published</option>
              <option>Sold</option>
              <option>Under Offer</option>
            </select>
          </label>
          <Field label="Location" value={v.location ?? ""} onChange={(x) => set("location", x)} testId="prop-location" />
          <Field label="City" value={v.city ?? ""} onChange={(x) => set("city", x)} testId="prop-city" />
          <Field label="Sqft" value={v.sqft ?? ""} onChange={(x) => set("sqft", x)} testId="prop-sqft" />
          <Field label="Plot size" value={v.plotSize ?? ""} onChange={(x) => set("plotSize", x)} testId="prop-plotsize" />
          <Field label="Bedrooms" type="number" value={String(v.bedrooms ?? 0)} onChange={(x) => set("bedrooms", parseInt(x) || 0)} testId="prop-bedrooms" />
          <Field label="Bathrooms" type="number" value={String(v.bathrooms ?? 0)} onChange={(x) => set("bathrooms", parseInt(x) || 0)} testId="prop-bathrooms" />
          <Field label="Price label" value={v.priceLabel ?? ""} onChange={(x) => set("priceLabel", x)} testId="prop-price" />
          <div className="col-span-2">
            <ImagePicker label="Cover image" value={v.cover} folder="properties" onChange={(url) => set("cover", url)} testId="prop-cover" />
          </div>
          <div className="col-span-2">
            <Field label="Short description" value={v.shortDescription ?? ""} onChange={(x) => set("shortDescription", x)} textarea testId="prop-short" />
          </div>
          <div className="col-span-2">
            <Field label="Full description" value={v.description ?? ""} onChange={(x) => set("description", x)} textarea testId="prop-desc" />
          </div>
          <div className="col-span-2">
            <Field label="Amenities (one per line)" value={(v.amenities ?? []).join("\n")} onChange={(x) => set("amenities", x.split("\n").map(s => s.trim()).filter(Boolean))} textarea testId="prop-amenities" />
          </div>
          <div className="col-span-2">
            <GalleryPicker value={v.gallery ?? []} onChange={(g) => set("gallery", g)} folder="properties" max={10} testId="prop-gallery" />
          </div>
          <label className="col-span-2 inline-flex items-center gap-3 text-sm">
            <input type="checkbox" checked={!!v.featured} onChange={(e) => set("featured", e.target.checked)} data-testid="prop-featured" className="h-4 w-4 accent-accent" />
            Mark as featured (only one is shown on home)
          </label>

          {/* SEO */}
          <div className="col-span-2 mt-2 pt-6 border-t border-border/40">
            <p className="text-[11px] uppercase tracking-[3px] text-accent">SEO</p>
          </div>
          <div className="col-span-2">
            <Field label="Meta title" value={v.seo?.title ?? ""} onChange={(x) => set("seo", { ...(v.seo ?? {}), title: x })} testId="prop-seo-title" placeholder="Defaults to property title" />
          </div>
          <div className="col-span-2">
            <Field label="Meta description" value={v.seo?.description ?? ""} onChange={(x) => set("seo", { ...(v.seo ?? {}), description: x })} textarea testId="prop-seo-desc" placeholder="Defaults to short description" />
          </div>
          <div className="col-span-2">
            <ImagePicker label="OG image (social sharing)" value={v.seo?.ogImage} folder="properties" onChange={(url) => set("seo", { ...(v.seo ?? {}), ogImage: url })} testId="prop-seo-og" />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button onClick={onCancel} className="rounded-full liquid-glass px-5 py-2.5 text-sm" data-testid="property-editor-cancel">
            Cancel
          </button>
          <button onClick={onSave} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:scale-[1.02] transition-transform" data-testid="property-editor-save">
            <Save className="h-3.5 w-3.5" /> {isNew ? "Create" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
