// Supabase JS client — single instance shared across the app.
// Uses the publishable/anon key for end-user requests; auth is handled via supabase.auth.
import { createClient } from "@supabase/supabase-js";

// Pinned to the original South Delhi Estate Supabase project.
// Lovable Cloud injects its own VITE_SUPABASE_* env vars at build/preview time,
// which would point the app at an empty database. Hardcoding the original project
// keeps the app talking to the database that already has listings, blogs, pages,
// and the admin user. These are publishable (anon) values — safe to commit.
const URL = "https://adhdxazbzcrqufksunox.supabase.co";
const KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkaGR4YXpiemNycXVma3N1bm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNDc0ODksImV4cCI6MjA5NzYyMzQ4OX0.RymH4aUg5h1SChUKU89QNLW_Kl0YhxrwPZiDQHOpcqw";

export const SUPABASE_BUCKET =
  (import.meta.env.VITE_SUPABASE_BUCKET as string) || "estate-images";

// Supabase Realtime requires a WebSocket on the global object. Node 20 (used
// for SSR here) ships without one, so polyfill `globalThis.WebSocket` with
// the `ws` package before instantiating the client. We never actually
// subscribe to realtime on the server — this just prevents the constructor
// from throwing during module load.
const isServer = typeof window === "undefined";
if (isServer && typeof (globalThis as any).WebSocket === "undefined") {
  // Top-level await is supported by Vite/Rolldown ESM.
  const mod = await import("ws");
  // `ws` exports a CJS `WebSocket` class; both default and named exports exist.
  (globalThis as any).WebSocket = (mod as any).WebSocket ?? (mod as any).default;
}

export const supabase = createClient(URL, KEY, {
  auth: {
    persistSession: !isServer,
    autoRefreshToken: !isServer,
    detectSessionInUrl: false,
    storageKey: "sde.auth",
  },
});
