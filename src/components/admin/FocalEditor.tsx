import { useMemo, useRef, useState, useEffect } from "react";
import { X, Crosshair, RotateCcw } from "lucide-react";
import { img } from "@/lib/imageMap";
import {
  parseFocal,
  stripFocal,
  withFocal,
  focalStyle,
  type Focal,
  DEFAULT_FOCAL,
} from "@/lib/imageFocal";

type Device = { id: "desktop" | "tablet" | "mobile"; label: string; w: number; h: number; ratio: string };

const DEVICES: Device[] = [
  { id: "desktop", label: "Desktop", w: 320, h: 180, ratio: "16/9" },
  { id: "tablet",  label: "Tablet",  w: 240, h: 180, ratio: "4/3" },
  { id: "mobile",  label: "Mobile",  w: 160, h: 200, ratio: "4/5" },
];

export function FocalEditor({
  url,
  onSave,
  onClose,
}: {
  url: string;
  onSave: (newUrl: string) => void;
  onClose: () => void;
}) {
  const initial = useMemo(() => parseFocal(url), [url]);
  const [focal, setFocal] = useState<Focal>(initial);
  const stageRef = useRef<HTMLDivElement>(null);
  const cleanUrl = stripFocal(url);
  const resolved = img(cleanUrl);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const point = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    const x = ((point.clientX - r.left) / r.width) * 100;
    const y = ((point.clientY - r.top) / r.height) * 100;
    setFocal({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const save = () => {
    onSave(withFocal(cleanUrl, focal));
    onClose();
  };

  const style = focalStyle(`${cleanUrl}#focal=${focal.x},${focal.y}`);

  return (
    <div
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="focal-editor"
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] overflow-auto rounded-3xl bg-card border border-border/60 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div>
            <p className="text-[10px] uppercase tracking-[2.5px] text-muted-foreground">Adjust image</p>
            <h3 className="text-sm mt-1 flex items-center gap-2">
              <Crosshair className="h-3.5 w-3.5" strokeWidth={1.6} />
              Click the image to set the focal point
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-input/40"
            aria-label="Close"
            data-testid="focal-close"
          >
            <X className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>

        <div className="p-6 grid lg:grid-cols-[1fr_280px] gap-6">
          {/* Stage */}
          <div>
            <div
              ref={stageRef}
              onClick={setFromEvent}
              className="relative w-full rounded-2xl overflow-hidden bg-input/20 border border-border/60 cursor-crosshair select-none"
              style={{ aspectRatio: "16/10" }}
              data-testid="focal-stage"
            >
              <img
                src={resolved}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full object-contain pointer-events-none"
              />
              <div
                className="absolute h-6 w-6 -ml-3 -mt-3 rounded-full border-2 border-primary bg-primary/30 shadow-[0_0_0_2px_rgba(0,0,0,0.4)] pointer-events-none transition-[left,top] duration-100"
                style={{ left: `${focal.x}%`, top: `${focal.y}%` }}
                data-testid="focal-dot"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span data-testid="focal-coords">
                Focal point: {focal.x.toFixed(0)}%, {focal.y.toFixed(0)}%
              </span>
              <button
                type="button"
                onClick={() => setFocal(DEFAULT_FOCAL)}
                className="inline-flex items-center gap-1.5 hover:text-foreground"
                data-testid="focal-reset"
              >
                <RotateCcw className="h-3 w-3" strokeWidth={1.6} /> Reset to center
              </button>
            </div>
          </div>

          {/* Previews */}
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[2.5px] text-muted-foreground">Preview</p>
            {DEVICES.map((d) => (
              <div key={d.id} data-testid={`focal-preview-${d.id}`}>
                <p className="text-[10px] uppercase tracking-[2px] text-muted-foreground mb-1.5">
                  {d.label} · {d.ratio}
                </p>
                <div
                  className="w-full rounded-xl overflow-hidden bg-input/20 border border-border/60"
                  style={{ aspectRatio: d.ratio }}
                >
                  <img src={resolved} alt="" className="h-full w-full object-cover" style={style} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-xs uppercase tracking-[2px] hover:text-foreground text-muted-foreground"
            data-testid="focal-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-xs uppercase tracking-[2px] hover:scale-[1.02] transition-transform"
            data-testid="focal-save"
          >
            Save focal point
          </button>
        </div>
      </div>
    </div>
  );
}
