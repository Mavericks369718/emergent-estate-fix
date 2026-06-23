import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, ExternalLink } from "lucide-react";
import { AdminShell, PageHeader } from "@/components/admin/AdminShell";
import { api, type InquiryDTO } from "@/lib/api";

const STATUSES: ("All" | "new" | "read" | "replied" | "archived")[] = [
  "All", "new", "read", "replied", "archived",
];

export const Route = createFileRoute("/admin/inquiries")({
  component: AdminInquiries,
});

function AdminInquiries() {
  const [rows, setRows] = useState<InquiryDTO[]>([]);
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("All");

  const reload = () => {
    const f = filter === "All" ? undefined : filter;
    api.listInquiries(f).then(setRows).catch(() => setRows([]));
  };
  useEffect(() => { reload(); }, [filter]);

  const setStatus = async (id: string, status: "new" | "read" | "replied" | "archived") => {
    try {
      await api.updateInquiryStatus(id, status);
      reload();
    } catch (err: any) { toast.error(err?.message); }
  };

  return (
    <AdminShell>
      <PageHeader eyebrow="Inbox" title="Inquiries" />

      <div className="flex flex-wrap gap-2 mb-6" data-testid="inquiry-status-filters">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            data-testid={`inquiry-filter-${s}`}
            className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[2.5px] transition-colors ${
              filter === s ? "bg-primary text-primary-foreground" : "liquid-glass text-secondary-foreground hover:text-foreground"
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3" data-testid="admin-inquiries-list">
        {rows.map((r, i) => (
          <article key={r.id} className="rounded-3xl bg-card/60 border border-border/60 p-6" data-testid={`inquiry-${i}`}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[2px] ${
                    r.status === "new" ? "bg-accent/20 text-accent" :
                    r.status === "read" ? "bg-muted/30 text-muted-foreground" :
                    r.status === "replied" ? "bg-green-900/30 text-green-300" :
                    "bg-muted/20 text-muted-foreground/70"
                  }`}>{r.status}</span>
                  <span className="text-[10px] uppercase tracking-[2px] text-muted-foreground">{r.source}</span>
                  {r.property_slug && (
                    <span className="text-[10px] uppercase tracking-[2px] text-secondary-foreground">→ {r.property_slug}</span>
                  )}
                  <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                </div>
                <h3 className="mt-3 text-xl font-light tracking-[-0.02em]" data-testid={`inquiry-name-${i}`}>{r.name}</h3>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-secondary-foreground">
                  <a href={`mailto:${r.email}`} className="inline-flex items-center gap-2 hover:text-foreground">
                    <Mail className="h-3.5 w-3.5 text-accent" strokeWidth={1.4} />{r.email}
                  </a>
                  {r.phone && (
                    <a href={`tel:${r.phone}`} className="inline-flex items-center gap-2 hover:text-foreground">
                      <Phone className="h-3.5 w-3.5 text-accent" strokeWidth={1.4} />{r.phone}
                    </a>
                  )}
                </div>
                {r.message && <p className="mt-4 text-sm text-secondary-foreground leading-relaxed max-w-2xl whitespace-pre-wrap">{r.message}</p>}
                {r.interest && <p className="mt-2 text-xs text-muted-foreground">Interest: {r.interest}</p>}
              </div>

              <div className="flex flex-wrap gap-2">
                {(["read", "replied", "archived"] as const).map((s) => (
                  <button key={s} onClick={() => setStatus(r.id, s)}
                    data-testid={`inquiry-set-${s}-${i}`}
                    className="rounded-full liquid-glass px-3 py-1.5 text-[11px] uppercase tracking-[2px] text-secondary-foreground hover:text-foreground transition-colors">
                    Mark {s}
                  </button>
                ))}
                {r.property_slug && (
                  <a href={`/properties/${r.property_slug}`} target="_blank" rel="noreferrer"
                    className="rounded-full liquid-glass px-3 py-1.5 text-[11px] uppercase tracking-[2px] inline-flex items-center gap-1.5 text-secondary-foreground hover:text-foreground">
                    Property <ExternalLink className="h-3 w-3" strokeWidth={1.4} />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
        {rows.length === 0 && (
          <p className="text-center text-muted-foreground py-16">No inquiries under this filter.</p>
        )}
      </div>
    </AdminShell>
  );
}
