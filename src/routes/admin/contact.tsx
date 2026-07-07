import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { AdminShell, PageHeader, Field } from "@/components/admin/AdminShell";
import { api, type SiteContactDTO } from "@/lib/api";
import { refreshSiteContact } from "@/lib/useSiteContact";

export const Route = createFileRoute("/admin/contact")({
  component: AdminContact,
});

const EMPTY: SiteContactDTO = {
  phone: "",
  email: "",
  address: "",
  instagram_url: "",
  linkedin_url: "",
  twitter_url: "",
  youtube_url: "",
};

function AdminContact() {
  const [form, setForm] = useState<SiteContactDTO>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .getSiteContact()
      .then((c) => setForm(c))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k: keyof SiteContactDTO, v: string) => setForm({ ...form, [k]: v });

  const save = async () => {
    setBusy(true);
    try {
      await api.updateSiteContact(form);
      await refreshSiteContact();
      toast.success("Contact details updated across the site");
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Site-wide"
        title="Contact details"
        action={
          <button
            onClick={save}
            disabled={busy || loading}
            data-testid="site-contact-save"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:scale-[1.02] disabled:opacity-60 transition-transform"
          >
            <Save className="h-3.5 w-3.5" /> {busy ? "Saving…" : "Save changes"}
          </button>
        }
      />

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl bg-card/60 border border-border/60 p-6 md:p-8 space-y-4">
            <p className="text-[10px] uppercase tracking-[2.5px] text-muted-foreground">
              Contact info
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} testId="sc-phone" placeholder="+91 11 0000 0000" />
              <Field label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} testId="sc-email" placeholder="private@example.com" />
              <div className="sm:col-span-2">
                <Field label="Address" value={form.address} onChange={(v) => set("address", v)} testId="sc-address" placeholder="Street, City" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-card/60 border border-border/60 p-6 md:p-8 space-y-4">
            <p className="text-[10px] uppercase tracking-[2.5px] text-muted-foreground">
              Social links (leave blank to hide the icon)
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Instagram URL" value={form.instagram_url} onChange={(v) => set("instagram_url", v)} testId="sc-instagram" placeholder="https://instagram.com/..." />
              <Field label="LinkedIn URL" value={form.linkedin_url} onChange={(v) => set("linkedin_url", v)} testId="sc-linkedin" placeholder="https://linkedin.com/..." />
              <Field label="X / Twitter URL" value={form.twitter_url} onChange={(v) => set("twitter_url", v)} testId="sc-twitter" placeholder="https://x.com/..." />
              <Field label="YouTube URL" value={form.youtube_url} onChange={(v) => set("youtube_url", v)} testId="sc-youtube" placeholder="https://youtube.com/..." />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Changes appear on the Footer, Contact page, and home Contact section
            immediately after saving.
          </p>
        </div>
      )}
    </AdminShell>
  );
}
