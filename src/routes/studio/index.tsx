import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AdminShell, PageHeader } from "@/components/admin/AdminShell";
import { api } from "@/lib/api";
import { ArrowUpRight, Home, Newspaper, Inbox, ImageIcon } from "lucide-react";

export const Route = createFileRoute("/studio/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof api.stats>> | null>(null);
  useEffect(() => {
    api.stats().then(setStats).catch(() => setStats(null));
  }, []);

  const cards = [
    { label: "Properties", value: stats?.properties_total ?? "—", sub: `${stats?.properties_published ?? 0} published · ${stats?.properties_drafts ?? 0} draft`, to: "/studio/properties", icon: Home },
    { label: "Essays", value: stats?.blogs_total ?? "—", sub: `${stats?.blogs_published ?? 0} published · ${stats?.blogs_drafts ?? 0} draft`, to: "/studio/blogs", icon: Newspaper },
    { label: "New inquiries", value: stats?.inquiries_new ?? "—", sub: `${stats?.inquiries_this_week ?? 0} this week · ${stats?.inquiries_total ?? 0} total`, to: "/studio/inquiries", icon: Inbox },
    { label: "Media library", value: "—", sub: "Reusable image library", to: "/studio/media", icon: ImageIcon },
  ];

  return (
    <AdminShell>
      <PageHeader eyebrow="Overview" title="Dashboard" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="admin-dashboard-cards">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to as any}
            className="group rounded-3xl bg-card/60 border border-border/60 p-6 hover-lift transition-transform"
            data-testid={`stat-${c.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="flex items-center justify-between">
              <c.icon className="h-5 w-5 text-accent" strokeWidth={1.4} />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.4} />
            </div>
            <p className="mt-6 text-5xl font-light tracking-[-0.03em] italic-serif">{c.value}</p>
            <p className="mt-3 text-[11px] uppercase tracking-[2.5px] text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-xs text-secondary-foreground">{c.sub}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
