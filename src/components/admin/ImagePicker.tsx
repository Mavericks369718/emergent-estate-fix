import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { img } from "@/lib/imageMap";

type Folder = "properties" | "blogs" | "founder" | "pages" | "misc";

export function ImagePicker({
  value,
  onChange,
  folder = "misc",
  label,
  testId,
}: {
  value?: string;
  onChange: (url: string) => void;
  folder?: Folder;
  label?: string;
  testId?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (file?: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("File exceeds 8 MB.");
      return;
    }
    setBusy(true);
    try {
      const res = await api.uploadImage(file, folder);
      onChange(res.url);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2" data-testid={testId}>
      {label && (
        <p className="text-[10px] uppercase tracking-[2.5px] text-muted-foreground">{label}</p>
      )}
      <div className="flex items-start gap-3">
        {value ? (
          <div className="relative h-20 w-28 shrink-0 rounded-xl overflow-hidden border border-border/60 group">
            <img src={img(value)} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 hover:bg-background flex items-center justify-center"
              data-testid={testId ? `${testId}-clear` : undefined}
            >
              <X className="h-3 w-3" strokeWidth={1.6} />
            </button>
          </div>
        ) : (
          <div className="h-20 w-28 shrink-0 rounded-xl border border-dashed border-border/60 bg-input/20 flex items-center justify-center text-muted-foreground text-[10px] uppercase tracking-[2px]">
            empty
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              data-testid={testId ? `${testId}-upload` : undefined}
              className="inline-flex items-center gap-2 rounded-full liquid-glass px-4 py-2 text-xs hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" strokeWidth={1.6} />}
              {busy ? "Uploading…" : value ? "Replace" : "Upload"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files?.[0])}
              data-testid={testId ? `${testId}-input` : undefined}
            />
          </div>
          <input
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="image key or https://… URL"
            className="w-full rounded-xl bg-input/30 border border-border/60 outline-none px-3 py-2 text-xs text-secondary-foreground placeholder:text-muted-foreground/50"
            data-testid={testId ? `${testId}-text` : undefined}
          />
        </div>
      </div>
    </div>
  );
}
