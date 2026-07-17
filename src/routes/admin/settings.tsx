import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Plus, Trash2 } from "lucide-react";
import { AdminShell, PageHeader, Field } from "@/components/admin/AdminShell";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { api, type FounderDTO } from "@/lib/api";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const emptyFounder = (): FounderDTO => ({
  name: "",
  role: "",
  portrait: "",
  tagline: "",
  bio: [""],
  quote: "",
  stats: [],
});

function AdminSettings() {
  const [founder1, setFounder1] = useState<FounderDTO | null>(null);
  const [founder2, setFounder2] = useState<FounderDTO | null>(null);
  const [activeId, setActiveId] = useState<1 | 2>(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getFounder(1).then(setFounder1).catch(() => setFounder1(emptyFounder()));
    api.getFounder(2).then(setFounder2).catch(() => setFounder2(emptyFounder()));
  }, []);

  if (!founder1 || !founder2) {
    return (
      <AdminShell>
        <PageHeader eyebrow="Brand" title="Settings" />
        <p className="text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  const founder = activeId === 1 ? founder1 : founder2;
  const setFounder = activeId === 1 ? setFounder1 : setFounder2;
  const set = (k: keyof FounderDTO, v: any) => setFounder({ ...founder, [k]: v });

  const save = async () => {
    setBusy(true);
    try {
      await api.updateFounder(founder, activeId);
      toast.success(`Founder ${activeId} saved`);
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Brand"
        title="Founder details"
        action={
          <button
            onClick={save}
            disabled={busy}
            data-testid="settings-save"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:scale-[1.02] disabled:opacity-60 transition-transform"
          >
            <Save className="h-3.5 w-3.5" /> {busy ? "Saving…" : "Save changes"}
          </button>
        }
      />

      <div className="mb-5 inline-flex rounded-full liquid-glass p-1">
        {[1, 2].map((n) => (
          <button
            key={n}
            onClick={() => setActiveId(n as 1 | 2)}
            className={`px-4 py-1.5 text-xs uppercase tracking-[2px] rounded-full transition-colors ${
              activeId === n ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Founder {n}
          </button>
        ))}
      </div>

      <div className="rounded-3xl bg-card/60 border border-border/60 p-6 md:p-8 space-y-6" data-testid="founder-settings-form">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name" value={founder.name} onChange={(x) => set("name", x)} testId="founder-name-input" />
          <Field label="Role" value={founder.role} onChange={(x) => set("role", x)} testId="founder-role-input" />
          <div className="sm:col-span-2">
            <ImagePicker label="Portrait" value={founder.portrait} folder="founder" onChange={(url) => set("portrait", url)} testId="founder-portrait" />
          </div>
        </div>
        <Field label="Tagline" value={founder.tagline} onChange={(x) => set("tagline", x)} textarea testId="founder-tagline-input" />
        <Field label="Quote" value={founder.quote} onChange={(x) => set("quote", x)} textarea testId="founder-quote-input" />

        <div>
          <p className="text-[10px] uppercase tracking-[2.5px] text-muted-foreground mb-3">Bio paragraphs</p>
          <div className="space-y-3">
            {founder.bio.map((p, i) => (
              <div key={i} className="flex gap-2">
                <textarea
                  rows={3}
                  value={p}
                  onChange={(e) => set("bio", founder.bio.map((x, idx) => idx === i ? e.target.value : x))}
                  className="flex-1 rounded-xl bg-input/40 border border-border outline-none px-3.5 py-2.5 text-sm"
                  data-testid={`founder-bio-${i}`}
                />
                {founder.bio.length > 1 && (
                  <button onClick={() => set("bio", founder.bio.filter((_, idx) => idx !== i))}
                    className="rounded-full p-2 hover:bg-destructive/20 text-secondary-foreground hover:text-destructive h-fit">
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.4} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => set("bio", [...founder.bio, ""])}
              className="inline-flex items-center gap-2 rounded-full liquid-glass px-4 py-2 text-xs"
              data-testid="founder-bio-add">
              <Plus className="h-3 w-3" /> Add paragraph
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[2.5px] text-muted-foreground mb-3">Stat cards</p>
          <div className="space-y-3">
            {founder.stats.map((s, i) => (
              <div key={i} className="grid sm:grid-cols-[1fr_2fr_auto] gap-2 items-end">
                <Field label="Value" value={s.value} onChange={(x) => set("stats", founder.stats.map((y, idx) => idx === i ? { ...y, value: x } : y))} testId={`founder-stat-value-${i}`} />
                <Field label="Label" value={s.label} onChange={(x) => set("stats", founder.stats.map((y, idx) => idx === i ? { ...y, label: x } : y))} testId={`founder-stat-label-${i}`} />
                <button onClick={() => set("stats", founder.stats.filter((_, idx) => idx !== i))}
                  className="rounded-full p-2 hover:bg-destructive/20 text-secondary-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.4} />
                </button>
              </div>
            ))}
            <button onClick={() => set("stats", [...founder.stats, { value: "", label: "" }])}
              className="inline-flex items-center gap-2 rounded-full liquid-glass px-4 py-2 text-xs"
              data-testid="founder-stat-add">
              <Plus className="h-3 w-3" /> Add stat
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Tip: Founder 2 only appears on the About page after you fill in a name and save. Leave all fields blank to hide it.
        </p>
      </div>
    </AdminShell>
  );
}
