// Frontend API client — Supabase-only. Keeps the same interface as the old
// FastAPI client so existing components/routes need no changes.
import { supabase, SUPABASE_BUCKET } from "./supabase";

// -------------------- Types (DTOs) --------------------

export interface SeoDTO {
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface PropertyDTO {
  id: string;
  slug: string;
  title: string;
  category: "Farmhouse" | "Builder Floor" | "Golf Villa" | "Penthouse";
  status: "Draft" | "Published" | "Sold" | "Under Offer";
  featured: boolean;
  location: string;
  city: string;
  sqft: string;
  bedrooms: number;
  bathrooms: number;
  plotSize: string;
  priceLabel: string;
  shortDescription: string;
  description: string;
  amenities: string[];
  cover: string;
  gallery: string[];
  seo: SeoDTO;
}

export interface BlogBlockDTO {
  type: "h2" | "p";
  text: string;
}

export interface BlogDTO {
  id: string;
  slug: string;
  title: string;
  tag: "Market" | "Lifestyle" | "Investment" | "Design";
  cover: string;
  excerpt: string;
  body: BlogBlockDTO[];
  author: string;
  authorRole: string;
  publishedAt: string;
  readTime: string;
  status: "Draft" | "Published";
  seo: SeoDTO;
}

export interface FounderStatDTO { value: string; label: string; }
export interface FounderDTO {
  name: string;
  role: string;
  portrait: string;
  tagline: string;
  bio: string[];
  quote: string;
  stats: FounderStatDTO[];
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface InquiryDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  interest?: string;
  message?: string;
  source: "contact" | "newsletter" | "property" | "hero";
  property_slug?: string;
  status: "new" | "read" | "replied" | "archived";
  created_at: string;
}

export interface PageHero {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
}

export type PageSection =
  | { id: string; type: "text"; eyebrow?: string; h2?: string; body: { type: "h2" | "p"; text: string }[] }
  | { id: string; type: "gallery"; eyebrow?: string; title?: string; images: string[] }
  | { id: string; type: "feature"; eyebrow?: string; title: string; body?: string; image?: string; ctaLabel?: string; ctaUrl?: string; layout?: "left" | "right" }
  | { id: string; type: "stats"; eyebrow?: string; title?: string; items: { value: string; label: string }[] }
  | { id: string; type: "cta"; eyebrow?: string; title: string; body?: string; ctaLabel: string; ctaUrl: string }
  | { id: string; type: "faq"; eyebrow?: string; title?: string; items: { q: string; a: string }[] };

export interface PageDTO {
  id?: string;
  slug: string;
  title: string;
  status: "Draft" | "Published";
  showInNav: boolean;
  navOrder: number;
  cover: string;     // featured image (URL)
  content: string;   // Markdown body — primary content
  hero: PageHero;
  sections: PageSection[]; // legacy/optional advanced blocks
  seo: SeoDTO;
}

export interface MediaDTO {
  id: string;
  url: string;
  path: string;
  folder: string;
  filename: string;
  size_bytes: number;
  content_type: string;
  created_at: string;
}

// -------------------- Error class (kept for back-compat) --------------------
class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, detail: unknown, message: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}
export { ApiError };

function bail(error: any, fallback = "Request failed"): never {
  const msg = error?.message || fallback;
  const status = error?.status || error?.code === "PGRST116" ? 404 : 500;
  throw new ApiError(status, error, msg);
}

// -------------------- Row mappers (DB columns → DTOs) --------------------

const propertyFromRow = (r: any): PropertyDTO => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  category: r.category,
  status: r.status,
  featured: !!r.featured,
  location: r.location ?? "",
  city: r.city ?? "",
  sqft: r.sqft ?? "",
  bedrooms: r.bedrooms ?? 0,
  bathrooms: r.bathrooms ?? 0,
  plotSize: r.plot_size ?? "",
  priceLabel: r.price_label ?? "",
  shortDescription: r.short_description ?? "",
  description: r.description ?? "",
  amenities: r.amenities ?? [],
  cover: r.cover ?? "",
  gallery: r.gallery ?? [],
  seo: r.seo ?? {},
});

const propertyToRow = (p: Partial<PropertyDTO>) => ({
  ...(p.slug !== undefined && { slug: p.slug }),
  ...(p.title !== undefined && { title: p.title }),
  ...(p.category !== undefined && { category: p.category }),
  ...(p.status !== undefined && { status: p.status }),
  ...(p.featured !== undefined && { featured: p.featured }),
  ...(p.location !== undefined && { location: p.location }),
  ...(p.city !== undefined && { city: p.city }),
  ...(p.sqft !== undefined && { sqft: p.sqft }),
  ...(p.bedrooms !== undefined && { bedrooms: p.bedrooms }),
  ...(p.bathrooms !== undefined && { bathrooms: p.bathrooms }),
  ...(p.plotSize !== undefined && { plot_size: p.plotSize }),
  ...(p.priceLabel !== undefined && { price_label: p.priceLabel }),
  ...(p.shortDescription !== undefined && { short_description: p.shortDescription }),
  ...(p.description !== undefined && { description: p.description }),
  ...(p.amenities !== undefined && { amenities: p.amenities }),
  ...(p.cover !== undefined && { cover: p.cover }),
  ...(p.gallery !== undefined && { gallery: p.gallery }),
  ...(p.seo !== undefined && { seo: p.seo }),
});

const blogFromRow = (r: any): BlogDTO => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  tag: r.tag,
  cover: r.cover ?? "",
  excerpt: r.excerpt ?? "",
  body: r.body ?? [],
  author: r.author ?? "",
  authorRole: r.author_role ?? "",
  publishedAt: r.published_at,
  readTime: r.read_time ?? "",
  status: r.status,
  seo: r.seo ?? {},
});

const blogToRow = (b: Partial<BlogDTO>) => ({
  ...(b.slug !== undefined && { slug: b.slug }),
  ...(b.title !== undefined && { title: b.title }),
  ...(b.tag !== undefined && { tag: b.tag }),
  ...(b.cover !== undefined && { cover: b.cover }),
  ...(b.excerpt !== undefined && { excerpt: b.excerpt }),
  ...(b.body !== undefined && { body: b.body }),
  ...(b.author !== undefined && { author: b.author }),
  ...(b.authorRole !== undefined && { author_role: b.authorRole }),
  ...(b.publishedAt !== undefined && { published_at: b.publishedAt }),
  ...(b.readTime !== undefined && { read_time: b.readTime }),
  ...(b.status !== undefined && { status: b.status }),
  ...(b.seo !== undefined && { seo: b.seo }),
});

const pageFromRow = (r: any): PageDTO => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  status: r.status,
  showInNav: !!r.show_in_nav,
  navOrder: r.nav_order ?? 100,
  cover: r.cover ?? "",
  content: r.content ?? "",
  hero: r.hero ?? { title: "" },
  sections: r.sections ?? [],
  seo: r.seo ?? {},
});

const pageToRow = (p: Partial<PageDTO>) => ({
  ...(p.slug !== undefined && { slug: p.slug }),
  ...(p.title !== undefined && { title: p.title }),
  ...(p.status !== undefined && { status: p.status }),
  ...(p.showInNav !== undefined && { show_in_nav: p.showInNav }),
  ...(p.navOrder !== undefined && { nav_order: p.navOrder }),
  ...(p.cover !== undefined && { cover: p.cover }),
  ...(p.content !== undefined && { content: p.content }),
  ...(p.hero !== undefined && { hero: p.hero }),
  ...(p.sections !== undefined && { sections: p.sections }),
  ...(p.seo !== undefined && { seo: p.seo }),
});

// -------------------- API surface --------------------

export const api = {
  // -------------------- Properties --------------------
  listProperties: async (category?: string): Promise<PropertyDTO[]> => {
    let q = supabase.from("listings").select("*").order("display_order", { ascending: true });
    if (category && category !== "All") q = q.eq("category", category);
    const { data, error } = await q;
    if (error) bail(error);
    return (data || []).map(propertyFromRow);
  },

  getProperty: async (slug: string): Promise<PropertyDTO> => {
    const { data, error } = await supabase.from("listings").select("*").eq("slug", slug).maybeSingle();
    if (error) bail(error);
    if (!data) throw new ApiError(404, "not_found", "Property not found");
    return propertyFromRow(data);
  },

  createProperty: async (body: Partial<PropertyDTO>): Promise<PropertyDTO> => {
    const { data, error } = await supabase.from("listings").insert(propertyToRow(body)).select("*").single();
    if (error) bail(error);
    return propertyFromRow(data);
  },

  updateProperty: async (slug: string, body: Partial<PropertyDTO>): Promise<PropertyDTO> => {
    const { data, error } = await supabase.from("listings").update(propertyToRow(body)).eq("slug", slug).select("*").single();
    if (error) bail(error);
    return propertyFromRow(data);
  },

  deleteProperty: async (slug: string) => {
    const { error } = await supabase.from("listings").delete().eq("slug", slug);
    if (error) bail(error);
    return { ok: true };
  },

  // -------------------- Blogs --------------------
  listBlogs: async (tag?: string): Promise<BlogDTO[]> => {
    let q = supabase.from("blogs").select("*").order("published_at", { ascending: false });
    if (tag && tag !== "All") q = q.eq("tag", tag);
    const { data, error } = await q;
    if (error) bail(error);
    return (data || []).map(blogFromRow);
  },

  getBlog: async (slug: string): Promise<BlogDTO> => {
    const { data, error } = await supabase.from("blogs").select("*").eq("slug", slug).maybeSingle();
    if (error) bail(error);
    if (!data) throw new ApiError(404, "not_found", "Essay not found");
    return blogFromRow(data);
  },

  createBlog: async (body: Partial<BlogDTO>): Promise<BlogDTO> => {
    const { data, error } = await supabase.from("blogs").insert(blogToRow(body)).select("*").single();
    if (error) bail(error);
    return blogFromRow(data);
  },

  updateBlog: async (slug: string, body: Partial<BlogDTO>): Promise<BlogDTO> => {
    const { data, error } = await supabase.from("blogs").update(blogToRow(body)).eq("slug", slug).select("*").single();
    if (error) bail(error);
    return blogFromRow(data);
  },

  deleteBlog: async (slug: string) => {
    const { error } = await supabase.from("blogs").delete().eq("slug", slug);
    if (error) bail(error);
    return { ok: true };
  },

  // -------------------- Pages --------------------
  listPages: async (): Promise<PageDTO[]> => {
    const { data, error } = await supabase.from("pages").select("*").order("nav_order", { ascending: true });
    if (error) bail(error);
    return (data || []).map(pageFromRow);
  },

  navPages: async () => {
    // Public navbar — only Published pages with showInNav=true.
    const { data, error } = await supabase
      .from("pages")
      .select("slug,title,nav_order,status,show_in_nav")
      .eq("status", "Published")
      .eq("show_in_nav", true)
      .order("nav_order", { ascending: true });
    if (error) bail(error);
    return (data || []).map((r: any) => ({ slug: r.slug, title: r.title, navOrder: r.nav_order }));
  },

  getPage: async (slug: string): Promise<PageDTO> => {
    const { data, error } = await supabase.from("pages").select("*").eq("slug", slug).maybeSingle();
    if (error) bail(error);
    if (!data) throw new ApiError(404, "not_found", "Page not found");
    return pageFromRow(data);
  },

  createPage: async (body: Partial<PageDTO>): Promise<PageDTO> => {
    const { data, error } = await supabase.from("pages").insert(pageToRow(body)).select("*").single();
    if (error) bail(error);
    return pageFromRow(data);
  },

  updatePage: async (slug: string, body: Partial<PageDTO>): Promise<PageDTO> => {
    const { data, error } = await supabase.from("pages").update(pageToRow(body)).eq("slug", slug).select("*").single();
    if (error) bail(error);
    return pageFromRow(data);
  },

  deletePage: async (slug: string) => {
    const { error } = await supabase.from("pages").delete().eq("slug", slug);
    if (error) bail(error);
    return { ok: true };
  },

  // -------------------- Founder --------------------
  getFounder: async (): Promise<FounderDTO> => {
    const { data, error } = await supabase.from("founder_settings").select("*").eq("id", 1).maybeSingle();
    if (error) bail(error);
    if (!data) {
      // Sensible defaults so the About page never breaks.
      return { name: "", role: "", portrait: "", tagline: "", bio: [""], quote: "", stats: [] };
    }
    return {
      name: data.name ?? "",
      role: data.role ?? "",
      portrait: data.portrait ?? "",
      tagline: data.tagline ?? "",
      bio: data.bio ?? [],
      quote: data.quote ?? "",
      stats: data.stats ?? [],
    };
  },

  updateFounder: async (body: FounderDTO): Promise<FounderDTO> => {
    const row = {
      id: 1,
      name: body.name,
      role: body.role,
      portrait: body.portrait,
      tagline: body.tagline,
      bio: body.bio,
      quote: body.quote,
      stats: body.stats,
    };
    const { data, error } = await supabase
      .from("founder_settings")
      .upsert(row, { onConflict: "id" })
      .select("*")
      .single();
    if (error) bail(error);
    return {
      name: data.name,
      role: data.role,
      portrait: data.portrait,
      tagline: data.tagline,
      bio: data.bio,
      quote: data.quote,
      stats: data.stats,
    };
  },

  // -------------------- Inquiries --------------------
  createInquiry: async (body: {
    name: string;
    email: string;
    phone?: string;
    interest?: string;
    message?: string;
    source: "contact" | "newsletter" | "property" | "hero";
    property_slug?: string;
  }) => {
    // NOTE: no `.select()` chain — RLS only allows authenticated SELECT on
    // inquiries; chaining a SELECT-after-INSERT (return=representation) would
    // make the whole request fail for anon visitors.
    const { error } = await supabase.from("inquiries").insert({
      name: body.name,
      email: body.email,
      phone: body.phone ?? null,
      interest: body.interest ?? null,
      message: body.message ?? null,
      source: body.source,
      property_slug: body.property_slug ?? null,
    });
    if (error) bail(error);
    return { ok: true };
  },

  listInquiries: async (status?: string): Promise<InquiryDTO[]> => {
    let q = supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) bail(error);
    return (data || []) as InquiryDTO[];
  },

  updateInquiryStatus: async (id: string, status: "new" | "read" | "replied" | "archived"): Promise<InquiryDTO> => {
    const { data, error } = await supabase.from("inquiries").update({ status }).eq("id", id).select("*").single();
    if (error) bail(error);
    return data as InquiryDTO;
  },

  // -------------------- Auth (Supabase) --------------------
  login: async (email: string, password: string): Promise<UserDTO> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new ApiError(401, error, error.message || "Invalid credentials");
    const u = data.user!;
    return {
      id: u.id,
      email: u.email ?? "",
      name: (u.user_metadata?.name as string) || (u.email?.split("@")[0] ?? "Admin"),
      role: "admin",
      created_at: u.created_at,
    };
  },

  logout: async () => {
    await supabase.auth.signOut();
    return { ok: true };
  },

  me: async (): Promise<UserDTO> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new ApiError(401, "no_session", "Not signed in");
    const u = session.user;
    return {
      id: u.id,
      email: u.email ?? "",
      name: (u.user_metadata?.name as string) || (u.email?.split("@")[0] ?? "Admin"),
      role: "admin",
      created_at: u.created_at,
    };
  },

  // -------------------- Dashboard stats --------------------
  stats: async () => {
    const [props, blogs, inq] = await Promise.all([
      supabase.from("listings").select("status", { count: "exact" }),
      supabase.from("blogs").select("status", { count: "exact" }),
      supabase.from("inquiries").select("status,created_at", { count: "exact" }),
    ]);
    const propRows = (props.data || []) as { status: string }[];
    const blogRows = (blogs.data || []) as { status: string }[];
    const inqRows  = (inq.data  || []) as { status: string; created_at: string }[];

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    return {
      properties_total:    propRows.length,
      properties_published: propRows.filter((p) => p.status === "Published").length,
      properties_drafts:    propRows.filter((p) => p.status === "Draft").length,
      blogs_total:         blogRows.length,
      blogs_published:     blogRows.filter((b) => b.status === "Published").length,
      blogs_drafts:        blogRows.filter((b) => b.status === "Draft").length,
      inquiries_total:     inqRows.length,
      inquiries_new:       inqRows.filter((i) => i.status === "new").length,
      inquiries_this_week: inqRows.filter((i) => i.created_at >= weekAgo).length,
      admins_total: 1,
    };
  },

  // -------------------- Media / Uploads --------------------
  uploadImage: async (file: File, folder: string = "misc") => {
    if (file.size > 8 * 1024 * 1024) throw new ApiError(400, "too_big", "File exceeds 8 MB.");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const filename = `${crypto.randomUUID().slice(0, 8)}-${Date.now()}.${ext}`;
    const path = `${folder}/${filename}`;
    const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type || undefined,
      upsert: false,
    });
    if (error) bail(error);
    const { data: { publicUrl } } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);

    // Register in media library (optional — failure is non-blocking)
    await supabase.from("media").insert({
      url: publicUrl,
      path,
      folder,
      filename: file.name,
      size_bytes: file.size,
      content_type: file.type || "",
    });

    return { url: publicUrl, path, size: file.size, content_type: file.type || "" };
  },

  deleteUpload: async (path: string) => {
    const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove([path]);
    if (error) bail(error);
    await supabase.from("media").delete().eq("path", path);
    return { ok: true };
  },

  listMedia: async (folder?: string): Promise<MediaDTO[]> => {
    let q = supabase.from("media").select("*").order("created_at", { ascending: false });
    if (folder && folder !== "All") q = q.eq("folder", folder);
    const { data, error } = await q;
    if (error) bail(error);
    return (data || []) as MediaDTO[];
  },
};
