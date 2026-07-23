import { type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Home as HomeIcon,
  Newspaper,
  Inbox,
  ImageIcon,
  Settings as SettingsIcon,
  LogOut,
  Loader2,
  FileText,
  UserCog,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminUser, signOutAdmin } from "@/lib/useAdminUser";

const NAV = [
  { to: "/studio", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/studio/properties", label: "Properties", icon: HomeIcon },
  { to: "/studio/blogs", label: "Blogs", icon: Newspaper },
  { to: "/studio/pages", label: "Pages", icon: FileText },
  { to: "/studio/inquiries", label: "Inquiries", icon: Inbox },
  { to: "/studio/media", label: "Media", icon: ImageIcon },
  { to: "/studio/contact", label: "Contact", icon: Phone },
  { to: "/studio/settings", label: "Settings", icon: SettingsIcon },
  { to: "/studio/account", label: "Account", icon: UserCog },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const user = useAdminUser();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }
  if (user === null) {
    // Redirect once on next tick to avoid running navigate during render.
    if (typeof window !== "undefined") {
      queueMicrotask(() => navigate({ to: "/studio/login" }));
    }
    return null;
  }

  const isActive = (to: string, end?: boolean) =>
    end ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="min-h-screen bg-background text-foreground flex" data-testid="admin-shell">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur-xl flex flex-col">
        <Link to="/studio" className="px-6 py-7 border-b border-border/60 block">
          <p className="text-[11px] uppercase tracking-[3px] text-accent">Admin</p>
          <p className="mt-1 text-lg tracking-[-0.02em] italic-serif">South Delhi</p>
        </Link>
        <nav className="flex-1 px-3 py-5 space-y-1" data-testid="admin-nav">
          {NAV.map(({ to, label, icon: Icon, end }) => {
            const active = isActive(to, end);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-secondary-foreground hover:text-foreground hover:bg-card/60"
                }`}
                data-testid={`admin-nav-${label.toLowerCase()}`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.4} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-5 border-t border-border/60 text-xs">
          <p className="text-foreground truncate" data-testid="admin-user-email">{user.email}</p>
          <p className="text-muted-foreground uppercase tracking-[2px] mt-0.5">{user.role}</p>
          <button
            type="button"
            onClick={async () => {
              try {
                await signOutAdmin();
                toast.success("Signed out");
                navigate({ to: "/studio/login" });
              } catch {
                toast.error("Logout failed");
              }
            }}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full liquid-glass px-4 py-2 text-xs hover:scale-[1.02] transition-transform"
            data-testid="admin-logout"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.4} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-8 py-10 overflow-x-hidden">{children}</main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-10 flex items-end justify-between gap-4 flex-wrap">
      <div>
        {eyebrow && (
          <p className="text-[11px] uppercase tracking-[3px] text-accent">{eyebrow}</p>
        )}
        <h1 className="mt-2 text-3xl md:text-4xl tracking-[-0.025em] font-light">
          {title}
        </h1>
      </div>
      {action}
    </header>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  testId,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  testId?: string;
  placeholder?: string;
}) {
  const cls =
    "w-full rounded-xl bg-input/40 border border-border focus:border-accent/60 outline-none px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors duration-300 focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.08)]";
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[2.5px] text-muted-foreground mb-2">
        {label}
      </span>
      {textarea ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
          data-testid={testId}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
          data-testid={testId}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}
