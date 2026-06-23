import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, X, Loader2, ArrowLeft, ArrowRight, Crosshair } from "lucide-react";
import { api } from "@/lib/api";
import { img } from "@/lib/imageMap";
import { focalStyle, readImageSize, validateImage } from "@/lib/imageFocal";
import { FocalEditor } from "./FocalEditor";

type Folder = "properties" | "blogs" | "founder" | "pages" | "misc";

export function GalleryPicker({
  value,
  onChange,
  folder = "properties",
  label = "Gallery",
  max = 10,
  testId,
}: {
  value?: string[];
  onChange: (urls: string[]) => void;
  folder?: Folder;
  label?: string;
  max?: number;
  testId?: string;
}) {
  const list = value ?? [];
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const setAt = (i: number, url: string) => {
    const next = [...list];
    next[i] = url;
    onChange(next);
  };

  const remaining = Math.max(0, max - list.length);

  const handleFiles = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files).slice(0, remaining);
    if (incoming.length === 0) {
      toast.error(`Maximum ${max} images allowed.`);
      return;
    }
    if (incoming.length < files.length) {
      toast.message(`Only ${incoming.length} of ${files.length} uploaded (max ${max}).`);
    }
    setBusy(true);
    const next = [...list];
    let fail = 0;
    for (const file of incoming) {
      if (file.size > 8 * 1024 * 1024) {
        toast.error(`${file.name}: exceeds 8 MB.`);
        fail++;
        continue;
      }
      try {
        const dim = await readImageSize(file).catch(() => null);
        if (dim) {
          const v = validateImage(dim, "propertyGallery");
          v.warnings.forEach((w) => toast.warning(`${file.name}: ${w}`));
        }
        const res = await api.uploadImage(file, folder);
        next.push(res.url);
      } catch (e: any) {
        fail++;
        toast.error(`${file.name}: ${e?.message || "upload failed"}`);
      }
    }
    onChange(next);
    setBusy(false);
    if (incoming.length - fail > 0) toast.success(`${incoming.length - fail} added`);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (i: number) => {
    const next = list.filter((_, idx) => idx !== i);
    onChange(next);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= list.length || from === to) return;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const onDragStart = (i: number) => setDragIdx(i);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (i: number) => {
    if (dragIdx === null) return;
    move(dragIdx, i);
    setDragIdx(null);
  };

  const addByUrl = () => {
    const url = window.prompt("Paste image URL or storage key:");
    if (!url) return;
    if (list.length >= max) {
      toast.error(`Maximum ${max} images.`);
      return;
    }
    onChange([...list, url.trim()]);
  };

  return (
    <div className="space-y-3" data-testid={testId}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[2.5px] text-muted-foreground">
          {label} — {list.length}/{max}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addByUrl}
            disabled={list.length >= max}
            className="text-[10px] uppercase tracking-[2px] text-muted-foreground hover:text-foreground disabled:opacity-40"
            data-testid={testId ? `${testId}-add-url` : undefined}
          >
            + URL
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy || list.length >= max}
            data-testid={testId ? `${testId}-upload` : undefined}
            className="inline-flex items-center gap-2 rounded-full liquid-glass px-3.5 py-1.5 text-xs hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" strokeWidth={1.6} />}
            {busy ? "Uploading…" : "Add images"}
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        data-testid={testId ? `${testId}-input` : undefined}
      />

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-input/20 p-6 text-center text-xs text-muted-foreground">
          No gallery images yet. Click <span className="text-foreground">Add images</span> to upload up to {max}.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {list.map((u, i) => (
            <div
              key={`${u}-${i}`}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(i)}
              className={`group relative aspect-square rounded-xl overflow-hidden border border-border/60 bg-input/20 ${
                dragIdx === i ? "opacity-50" : ""
              }`}
              data-testid={testId ? `${testId}-item-${i}` : undefined}
            >
              <img src={img(u)} alt="" className="h-full w-full object-cover" style={focalStyle(u)} />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/85 backdrop-blur-sm px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    className="p-1 rounded-full hover:bg-card disabled:opacity-30"
                    data-testid={testId ? `${testId}-left-${i}` : undefined}
                    aria-label="Move left"
                  >
                    <ArrowLeft className="h-3 w-3" strokeWidth={1.6} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === list.length - 1}
                    className="p-1 rounded-full hover:bg-card disabled:opacity-30"
                    data-testid={testId ? `${testId}-right-${i}` : undefined}
                    aria-label="Move right"
                  >
                    <ArrowRight className="h-3 w-3" strokeWidth={1.6} />
                  </button>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setEditingIdx(i)}
                    className="p-1 rounded-full hover:bg-card"
                    data-testid={testId ? `${testId}-adjust-${i}` : undefined}
                    aria-label="Adjust focal point"
                  >
                    <Crosshair className="h-3 w-3" strokeWidth={1.6} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="p-1 rounded-full hover:bg-destructive/30 text-secondary-foreground hover:text-destructive"
                    data-testid={testId ? `${testId}-remove-${i}` : undefined}
                    aria-label="Remove"
                  >
                    <X className="h-3 w-3" strokeWidth={1.6} />
                  </button>
                </div>
              </div>
              <span className="absolute top-1 left-1 rounded-full bg-background/80 px-1.5 text-[9px] uppercase tracking-[1.5px]">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {editingIdx !== null && list[editingIdx] && (
        <FocalEditor
          url={list[editingIdx]}
          onSave={(u) => setAt(editingIdx, u)}
          onClose={() => setEditingIdx(null)}
        />
      )}
    </div>
  );
}
