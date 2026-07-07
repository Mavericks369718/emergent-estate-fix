// Small hook + module-level cache so every component (Navbar, Footer, Contact
// page, home contact section) reads the same live values. When the admin
// saves a change, call `refreshSiteContact()` and all subscribers re-render.
import { useEffect, useState } from "react";
import { api, type SiteContactDTO } from "./api";

export const DEFAULT_CONTACT: SiteContactDTO = {
  phone: "+91 11 0000 0000",
  email: "private@southdelhi.estate",
  address: "Aurangzeb Road, New Delhi",
  instagram_url: "",
  linkedin_url: "",
  twitter_url: "",
  youtube_url: "",
};

let cache: SiteContactDTO | null = null;
let inflight: Promise<void> | null = null;
const listeners = new Set<(v: SiteContactDTO) => void>();

function load() {
  if (inflight) return inflight;
  inflight = api
    .getSiteContact()
    .then((v) => {
      cache = v;
      listeners.forEach((l) => l(v));
    })
    .catch(() => {
      cache = DEFAULT_CONTACT;
      listeners.forEach((l) => l(DEFAULT_CONTACT));
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useSiteContact(): SiteContactDTO {
  const [data, setData] = useState<SiteContactDTO>(cache ?? DEFAULT_CONTACT);
  useEffect(() => {
    listeners.add(setData);
    if (cache) setData(cache);
    else void load();
    return () => {
      listeners.delete(setData);
    };
  }, []);
  return data;
}

export async function refreshSiteContact() {
  cache = null;
  await load();
}
