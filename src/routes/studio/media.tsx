import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2, Copy, Search, Loader2 } from "lucide-react";
import { AdminShell, PageHeader } from "@/components/admin/AdminShell";
import { api, type MediaDTO } from "@/lib/api";

export const Route = createFileRoute("/studio/media")({
  component: AdminMedia,
});

const FOLDERS = ["All", "properties", "blogs", "founder", "pages", "misc"] as const;
type Folder = (typeof FOLDERS)[number];

function AdminMedia() {
  const [rows, setRows] = useState<MediaDTO[]>([]);
  const [folder, setFolder] = useState<Folder>("All");
  const [filter, setFilter] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reload = () => {
    api.listMedia(folder === "All" ? undefined : folder).then(setRows).catch(() => setRows([]));
  };
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [folder]);

  const onPick = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let ok = 0; let fail = 0;
    for (const f of Array.from(files)) {
      try {
        await api.uploadImage(f, folder === "All" ? "misc" : folder);
        ok++;
      } catch (e: any) {
        fail++;
        toast.error(`${f.name}: ${e?.message || "upload failed"}`);
      }
    }
    setUploading(false);
    if (ok) toast.success(`${ok} uploaded`);
    if (fail === 0) reload();
    else reload();
  };

  const remove = async (m: MediaDTO) => {
    if (!confirm(`Delete ${m.filename || m.path}? This will remove it from storage permanently.`)) return;
    try {
      await api.deleteUpload(m.path);
      toast.success("Removed");
      reload();
    } catch (e: any) { toast.error(e?.message || "Delete failed"); }
  };

  const copy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  const visible = rows.filter((r) =>
    filter ? (r.filename + " " + r.path).toLowerCase().includes(filter.toLowerCase()) : true
  );

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Library"
        title="Media"
        action={
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            data-testid="media-upload-btn"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:scale-[1.02] disabled:opacity-60 transition-transform"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? "Uploading…" : "Upload"}
          </button>
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => onPick(e.target.files)}
        data-testid="media-file-input"
      />

      <div className="flex flex-wrap items-center gap-3 mb-6" data-testid="media-toolbar">
        <div className="flex flex-wrap gap-2" data-testid="media-folder-filters">
          {FOLDERS.map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              data-testid={`media-folder-${f}`}
              className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[2.5px] transition-colors ${
                folder === f
                  ? "bg-primary text-primary-foreground"
                  : "liquid-glass text-secondary-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="ml-auto inline-flex items-center gap-2 rounded-full bg-input/40 border border-border px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.4} />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search filename…"
            data-testid="media-search"
            className="bg-transparent outline-none text-xs text-foreground w-44"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-3xl bg-card/30 border border-dashed border-border/60 p-16 text-center text-muted-foreground" data-testid="media-empty">
          No images yet. Click <span className="text-foreground">Upload</span> to add JPEG / PNG / WEBP (up to 8 MB each).
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" data-testid="media-grid">
          {visible.map((m, i) => (
            <article
              key={m.id}
              className="group rounded-2xl bg-card/60 border border-border/60 overflow-hidden"
              data-testid={`media-card-${i}`}
            >
              <div className="aspect-square overflow-hidden bg-input/30">
                <img
                  src={m.url}
                  alt={m.filename}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-3 space-y-2">
                <p className="text-[11px] truncate text-foreground" title={m.filename}>{m.filename || m.path.split("/").pop()}</p>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[2px] text-muted-foreground">
                  <span>{m.folder}</span>
                  <span>{(m.size_bytes / 1024).toFixed(0)} KB</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => copy(m.url)}
                    data-testid={`media-copy-${i}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full liquid-glass px-2 py-1.5 text-[10px] uppercase tracking-[2px] hover:text-foreground"
                  >
                    <Copy className="h-3 w-3" strokeWidth={1.4} /> Copy URL
                  </button>
                  <button
                    onClick={() => remove(m)}
                    data-testid={`media-delete-${i}`}
                    className="inline-flex items-center justify-center rounded-full p-1.5 hover:bg-destructive/20 text-secondary-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" strokeWidth={1.4} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
