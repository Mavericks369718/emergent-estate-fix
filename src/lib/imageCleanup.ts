// Orphan-image cleanup: removes a Supabase Storage object + media row only
// when no other content references it (property cover/gallery, blog cover,
// page cover/content/sections).
import { supabase, SUPABASE_BUCKET } from "./supabase";
import { stripFocal } from "./imageFocal";

/**
 * Best-effort cleanup. Accepts URL or storage-key strings. For each input:
 *  1. Skip if it's not a Supabase-managed asset (e.g. a bundled key like
 *     "listing-1", an external URL, or empty).
 *  2. Look up the matching `media` row by url or path.
 *  3. Scan every referencing surface for the URL. If found anywhere, keep.
 *  4. Otherwise delete the storage object + media row.
 *
 * Failures are swallowed and logged — we never block a CMS save on cleanup.
 */
/** Extract every image URL from a Markdown blob — `![alt](url)` and raw `<img src="…">`. */
export function extractMarkdownImageUrls(md: string | undefined | null): string[] {
  if (!md) return [];
  const urls: string[] = [];
  const mdRe = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const imgRe = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = mdRe.exec(md))) urls.push(m[1]);
  while ((m = imgRe.exec(md))) urls.push(m[1]);
  return urls;
}

export async function cleanupOrphanImages(candidates: (string | undefined | null)[]) {
  const unique = Array.from(
    new Set(
      (candidates || [])
        .filter((s): s is string => !!s && typeof s === "string")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );
  for (const ref of unique) {
    try {
      await cleanupOne(ref);
    } catch (err) {
      console.warn("[cleanupOrphanImages] skipped", ref, err);
    }
  }
}

async function cleanupOne(ref: string) {
  // Find a media row. Try by URL first, then by path.
  const byUrl = await supabase.from("media").select("id,path,url").eq("url", ref).maybeSingle();
  let row = byUrl.data;
  if (!row) {
    const byPath = await supabase.from("media").select("id,path,url").eq("path", ref).maybeSingle();
    row = byPath.data;
  }
  // If there's no media record and it doesn't look like a storage URL, it's
  // probably a bundled key or external URL — nothing to clean.
  if (!row) {
    if (!ref.includes("/storage/v1/object/public/")) return;
  }

  const url = stripFocal(row?.url ?? ref);
  const path = row?.path ?? extractPath(stripFocal(ref));

  // Check every referencing surface in parallel.
  const [listings, blogs, pages] = await Promise.all([
    supabase.from("listings").select("cover,gallery"),
    supabase.from("blogs").select("cover"),
    supabase.from("pages").select("cover,content,sections,hero"),
  ]);

  const haystack: string[] = [];
  for (const r of listings.data || []) {
    if (r.cover) haystack.push(String(r.cover));
    if (Array.isArray(r.gallery)) haystack.push(...r.gallery.map(String));
  }
  for (const r of blogs.data || []) {
    if (r.cover) haystack.push(String(r.cover));
  }
  for (const r of pages.data || []) {
    if (r.cover) haystack.push(String(r.cover));
    if (r.content) haystack.push(String(r.content));
    if (r.sections) haystack.push(JSON.stringify(r.sections));
    if (r.hero) haystack.push(JSON.stringify(r.hero));
  }

  const referenced = haystack.some((h) => h.includes(url) || (path && h.includes(path)));
  if (referenced) return;

  // Orphan — purge storage + media row.
  if (path) {
    await supabase.storage.from(SUPABASE_BUCKET).remove([path]);
  }
  if (row?.id) {
    await supabase.from("media").delete().eq("id", row.id);
  }
}

function extractPath(url: string): string | null {
  const marker = "/storage/v1/object/public/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const rest = url.slice(idx + marker.length); // "<bucket>/folder/file"
  const slash = rest.indexOf("/");
  return slash === -1 ? null : rest.slice(slash + 1);
}
