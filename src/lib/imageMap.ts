// Maps backend image keys (e.g. "listing-1") to bundled frontend assets.
// In Phase 4 these will be replaced by full Supabase Storage URLs; this map
// keeps backwards-compat so any string starting with http(s):// is used as-is.

import featured from "@/assets/featured-estate.jpg";
import l1 from "@/assets/listing-1.jpg";
import l2 from "@/assets/listing-2.jpg";
import l3 from "@/assets/listing-3.jpg";
import l4 from "@/assets/listing-4.jpg";
import cardFarm from "@/assets/card-farmhouse.jpg";
import cardBuilder from "@/assets/card-builder.jpg";
import cardPent from "@/assets/card-penthouse.jpg";
import b1 from "@/assets/blog-1.jpg";
import b2 from "@/assets/blog-2.jpg";
import b3 from "@/assets/blog-3.jpg";
import legacy from "@/assets/legacy-courtyard.jpg";
import contactNight from "@/assets/contact-night.jpg";
import heroFarm from "@/assets/hero-farmhouse.jpg";
import footerMansion from "@/assets/footer-mansion.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

const MAP: Record<string, string> = {
  "featured-estate": featured,
  "listing-1": l1,
  "listing-2": l2,
  "listing-3": l3,
  "listing-4": l4,
  "card-farmhouse": cardFarm,
  "card-builder": cardBuilder,
  "card-penthouse": cardPent,
  "blog-1": b1,
  "blog-2": b2,
  "blog-3": b3,
  "legacy-courtyard": legacy,
  "contact-night": contactNight,
  "hero-farmhouse": heroFarm,
  "footer-mansion": footerMansion,
  "avatar-1": avatar1,
  "avatar-2": avatar2,
  "avatar-3": avatar3,
};

/** Resolve a backend image reference to a usable URL. */
export function img(key: string | undefined | null): string {
  if (!key) return "";
  if (key.startsWith("http://") || key.startsWith("https://") || key.startsWith("data:")) {
    return key;
  }
  return MAP[key] ?? key;
}
