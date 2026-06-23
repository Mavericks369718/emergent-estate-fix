// Supabase JS client — single instance shared across the app.
// Uses anon key for end-user requests; auth is handled via supabase.auth.
import { createClient } from "@supabase/supabase-js";

const env = import.meta.env as any;
const URL = env.VITE_SUPABASE_URL as string;
const KEY = env.VITE_SUPABASE_ANON_KEY as string;
export const SUPABASE_BUCKET = (env.VITE_SUPABASE_BUCKET as string) || "estate-images";

if (!URL || !KEY) {
  console.error("[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

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
