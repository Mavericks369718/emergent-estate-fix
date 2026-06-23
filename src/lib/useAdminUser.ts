// Shared admin auth hook — listens to Supabase session ONCE per app, caches
// the user in a module-level subscription so every component that uses it
// shares the same value (no duplicate api.me round-trips, no unmount flicker).
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "admin";
  created_at: string;
};

// `undefined` = still loading. `null` = signed out. Otherwise the user.
let cached: AdminUser | null | undefined = undefined;
const listeners = new Set<(u: AdminUser | null | undefined) => void>();
let bootstrapped = false;

function toUser(session: Session | null | undefined): AdminUser | null {
  if (!session?.user) return null;
  const u = session.user;
  return {
    id: u.id,
    email: u.email ?? "",
    name: (u.user_metadata?.name as string) || (u.email?.split("@")[0] ?? "Admin"),
    role: "admin",
    created_at: u.created_at,
  };
}

function setCached(value: AdminUser | null | undefined) {
  cached = value;
  for (const l of listeners) l(value);
}

function bootstrap() {
  if (bootstrapped || typeof window === "undefined") return;
  bootstrapped = true;
  supabase.auth.getSession().then(({ data }) => setCached(toUser(data.session)));
  supabase.auth.onAuthStateChange((_event, session) => setCached(toUser(session)));
}

export function useAdminUser() {
  const [user, setUser] = useState<AdminUser | null | undefined>(cached);

  useEffect(() => {
    bootstrap();
    listeners.add(setUser);
    // If cached is already populated by the time this mounts, sync immediately.
    if (cached !== undefined) setUser(cached);
    return () => { listeners.delete(setUser); };
  }, []);

  return user;
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
  setCached(null);
}
