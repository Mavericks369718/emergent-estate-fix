import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.login(email, password);
      toast.success("Welcome back");
      navigate({ to: "/admin" });
    } catch (err) {
      const m = err instanceof ApiError ? err.message : "Login failed";
      toast.error(m);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6" data-testid="admin-login-page">
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <Link to="/" className="inline-block text-[11px] uppercase tracking-[3px] text-muted-foreground hover:text-foreground transition-colors">
          ← Back to site
        </Link>
        <div className="mt-6 rounded-3xl bg-card/60 border border-border/60 p-8 md:p-10 backdrop-blur-xl">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Lock className="h-4 w-4" strokeWidth={1.4} />
          </div>
          <h1 className="mt-6 text-3xl md:text-4xl font-light tracking-[-0.025em]">
            Admin <span className="italic-serif">access</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in to the private console.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4" data-testid="admin-login-form">
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[2.5px] text-muted-foreground mb-2">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="admin-login-email"
                className="w-full rounded-xl bg-input/40 border border-border focus:border-accent/60 outline-none px-3.5 py-3 text-sm text-foreground transition-colors duration-300 focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.08)]"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[2.5px] text-muted-foreground mb-2">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="admin-login-password"
                className="w-full rounded-xl bg-input/40 border border-border focus:border-accent/60 outline-none px-3.5 py-3 text-sm text-foreground transition-colors duration-300 focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.08)]"
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              data-testid="admin-login-submit"
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100 transition-transform duration-500"
            >
              {busy ? "Signing in…" : "Sign in"}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
