// Focal point encoded as URL hash fragment: `…/path.jpg#focal=50,30`
// (percent X,Y from top-left). Zero schema changes — pure string convention.

export type Focal = { x: number; y: number };

export const DEFAULT_FOCAL: Focal = { x: 50, y: 50 };

export function parseFocal(url?: string | null): Focal {
  if (!url) return DEFAULT_FOCAL;
  const i = url.indexOf("#focal=");
  if (i < 0) return DEFAULT_FOCAL;
  const m = url.slice(i + 7).match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (!m) return DEFAULT_FOCAL;
  const x = clamp(parseFloat(m[1]), 0, 100);
  const y = clamp(parseFloat(m[2]), 0, 100);
  return { x, y };
}

export function stripFocal(url?: string | null): string {
  if (!url) return "";
  const i = url.indexOf("#focal=");
  return i < 0 ? url : url.slice(0, i);
}

export function withFocal(url: string, focal: Focal): string {
  const base = stripFocal(url);
  if (focal.x === 50 && focal.y === 50) return base;
  return `${base}#focal=${round(focal.x)},${round(focal.y)}`;
}

export function focalStyle(url?: string | null): React.CSSProperties {
  const f = parseFocal(url);
  return { objectPosition: `${f.x}% ${f.y}%` };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, isNaN(n) ? 50 : n));
}
function round(n: number) {
  return Math.round(n * 10) / 10;
}

// Read intrinsic dimensions of a File (browser only).
export function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: im.naturalWidth, height: im.naturalHeight });
    };
    im.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    im.src = url;
  });
}

export type ImageKind = "propertyCover" | "propertyGallery" | "blogCover" | "pageHero" | "misc";

const SPECS: Record<ImageKind, { min: [number, number]; rec: [number, number]; ratio: number; tol: number; label: string }> = {
  propertyCover:   { min: [1200, 675],  rec: [1600, 900],  ratio: 16 / 9, tol: 0.15, label: "Property cover (16:9, ≥1200×675)" },
  propertyGallery: { min: [1200, 900],  rec: [1600, 1200], ratio: 4 / 3,  tol: 0.25, label: "Gallery image (4:3, ≥1200×900)" },
  blogCover:       { min: [1200, 675],  rec: [1600, 900],  ratio: 16 / 9, tol: 0.15, label: "Blog cover (16:9, ≥1200×675)" },
  pageHero:        { min: [1600, 900],  rec: [1920, 1080], ratio: 16 / 9, tol: 0.15, label: "Page hero (16:9, ≥1600×900)" },
  misc:            { min: [800, 600],   rec: [1600, 1200], ratio: 4 / 3,  tol: 0.6,  label: "Image" },
};

export function validateImage(dim: { width: number; height: number }, kind: ImageKind): {
  ok: boolean;
  warnings: string[];
  spec: (typeof SPECS)[ImageKind];
} {
  const spec = SPECS[kind];
  const warnings: string[] = [];
  if (dim.width < spec.min[0] || dim.height < spec.min[1]) {
    warnings.push(`Low resolution ${dim.width}×${dim.height}. Recommended ${spec.rec[0]}×${spec.rec[1]}.`);
  }
  const r = dim.width / dim.height;
  const diff = Math.abs(r - spec.ratio) / spec.ratio;
  if (diff > spec.tol) {
    warnings.push(`Unusual aspect ratio ${r.toFixed(2)}:1 (expected ~${spec.ratio.toFixed(2)}:1). Image will be cropped.`);
  }
  return { ok: warnings.length === 0, warnings, spec };
}

export const IMAGE_SPECS = SPECS;
