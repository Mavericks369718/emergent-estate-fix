import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Mail, Phone, Save } from "lucide-react";
import { AdminShell, PageHeader, Field } from "@/components/admin/AdminShell";
import { useAdminUser } from "@/lib/useAdminUser";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/account")({
  component: AdminAccount,
});

function AdminAccount() {
  const user = useAdminUser();

  // Email
  const [newEmail, setNewEmail] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);

  // Phone
  const [newPhone, setNewPhone] = useState("");
  const [phoneBusy, setPhoneBusy] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  const updateEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    setEmailBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success("Confirmation email sent to " + newEmail);
      setNewEmail("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update email");
    } finally {
      setEmailBusy(false);
    }
  };

  const updatePhone = async () => {
    const trimmed = newPhone.trim();
    if (!/^\+?[0-9\s\-()]{7,20}$/.test(trimmed)) {
      toast.error("Enter a valid phone number (include country code, e.g. +91…)");
      return;
    }
    setPhoneBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ phone: trimmed });
      if (error) throw error;
      toast.success("Phone number updated");
      setNewPhone("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update phone");
    } finally {
      setPhoneBusy(false);
    }
  };

  const updatePassword = async () => {
    if (newPw.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    if (!user?.email) {
      toast.error("No signed-in user");
      return;
    }
    setPwBusy(true);
    try {
      // Re-authenticate to prove ownership before changing password.
      const { error: reAuthErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPw,
      });
      if (reAuthErr) throw new Error("Current password is incorrect");

      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;

      toast.success("Password updated");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <AdminShell>
      <PageHeader eyebrow="Security" title="Your account" />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Change email */}
        <section className="rounded-3xl bg-card/60 border border-border/60 p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Mail className="h-4 w-4" strokeWidth={1.4} />
            </div>
            <div>
              <h2 className="text-lg tracking-[-0.02em]">Change email</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Current: <span className="text-foreground">{user?.email}</span>
              </p>
            </div>
          </div>

          <Field
            label="New email"
            value={newEmail}
            onChange={setNewEmail}
            type="email"
            placeholder="you@company.com"
            testId="account-new-email"
          />
          <p className="text-[11px] text-muted-foreground">
            A confirmation link will be sent to the new address. The change
            takes effect after you click it.
          </p>
          <button
            onClick={updateEmail}
            disabled={emailBusy || !newEmail}
            data-testid="account-email-save"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:scale-[1.02] disabled:opacity-60 transition-transform"
          >
            <Save className="h-3.5 w-3.5" />
            {emailBusy ? "Sending…" : "Send confirmation"}
          </button>
        </section>

        {/* Change phone */}
        <section className="rounded-3xl bg-card/60 border border-border/60 p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Phone className="h-4 w-4" strokeWidth={1.4} />
            </div>
            <div>
              <h2 className="text-lg tracking-[-0.02em]">Change phone</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Current: <span className="text-foreground">{(user as any)?.phone || "—"}</span>
              </p>
            </div>
          </div>

          <Field
            label="New phone (with country code)"
            value={newPhone}
            onChange={setNewPhone}
            type="tel"
            placeholder="+91 98xxxxxxxx"
            testId="account-new-phone"
          />
          <p className="text-[11px] text-muted-foreground">
            Include country code. If SMS OTP is enabled in Cloud, you'll be
            asked to verify the new number.
          </p>
          <button
            onClick={updatePhone}
            disabled={phoneBusy || !newPhone}
            data-testid="account-phone-save"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:scale-[1.02] disabled:opacity-60 transition-transform"
          >
            <Save className="h-3.5 w-3.5" />
            {phoneBusy ? "Updating…" : "Update phone"}
          </button>
        </section>


        {/* Change password */}
        <section className="rounded-3xl bg-card/60 border border-border/60 p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent">
              <KeyRound className="h-4 w-4" strokeWidth={1.4} />
            </div>
            <div>
              <h2 className="text-lg tracking-[-0.02em]">Change password</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Minimum 8 characters. Use a mix of letters, numbers, and symbols.
              </p>
            </div>
          </div>

          <Field
            label="Current password"
            value={currentPw}
            onChange={setCurrentPw}
            type="password"
            testId="account-current-password"
          />
          <Field
            label="New password"
            value={newPw}
            onChange={setNewPw}
            type="password"
            testId="account-new-password"
          />
          <Field
            label="Confirm new password"
            value={confirmPw}
            onChange={setConfirmPw}
            type="password"
            testId="account-confirm-password"
          />

          {newPw && confirmPw && newPw !== confirmPw && (
            <p className="text-[11px] text-destructive">Passwords do not match.</p>
          )}

          <button
            onClick={updatePassword}
            disabled={pwBusy || !currentPw || !newPw || !confirmPw}
            data-testid="account-password-save"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:scale-[1.02] disabled:opacity-60 transition-transform"
          >
            <Save className="h-3.5 w-3.5" />
            {pwBusy ? "Updating…" : "Update password"}
          </button>
        </section>
      </div>
    </AdminShell>
  );
}
