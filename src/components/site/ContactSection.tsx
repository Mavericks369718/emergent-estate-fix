import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { fadeUp } from "@/lib/motion";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useSiteContact } from "@/lib/useSiteContact";
import bg from "@/assets/contact-night.jpg";

export function ContactSection() {
  const contact = useSiteContact();
  const telHref = contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : "#";
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name) { toast.error("Please enter your name."); return; }
    if (name.length > 100) { toast.error("Name must be under 100 characters."); return; }
    if (!email) { toast.error("Please enter your email."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Please enter a valid email address."); return; }
    if (email.length > 255) { toast.error("Email is too long."); return; }
    if (!message) { toast.error("Please share a short message."); return; }
    if (message.length > 1000) { toast.error("Message must be under 1000 characters."); return; }
    if (form.phone && form.phone.length > 40) { toast.error("Phone number is too long."); return; }
    if (form.interest && form.interest.length > 150) { toast.error("Property interest is too long."); return; }

    setBusy(true);
    try {
      await api.createInquiry({
        name,
        email,
        phone: form.phone.trim() || undefined,
        interest: form.interest.trim() || undefined,
        message,
        source: "contact",
      });
      toast.success("Thank you — we'll be in touch shortly.");
      setSent(true);
      setForm({ name: "", email: "", phone: "", interest: "", message: "" });
    } catch (err: any) {
      toast.error(err?.message || "Could not send your inquiry. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative py-32 md:py-40 px-6 md:px-12 border-t border-border/40"
    >
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-10 md:gap-14">
        {/* Left */}
        <motion.div
          {...fadeUp(0)}
          className="relative rounded-3xl overflow-hidden p-8 md:p-12 min-h-[520px] flex flex-col justify-between"
        >
          <img
            src={bg}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/55 to-background/95" />
          <div className="grain" />

          <div className="relative">
            <p className="text-xs uppercase tracking-[3px] text-accent">Contact</p>
            <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-light tracking-[-0.03em] leading-[1.05] max-w-md">
              Let's find your <span className="italic-serif">next</span> address.
            </h2>
          </div>

          <div className="relative mt-12 space-y-5 text-sm text-secondary-foreground">
            {contact.phone && (
              <a href={telHref} className="flex items-center gap-3 hover:text-foreground transition-colors">
                <Phone className="h-4 w-4 text-accent" strokeWidth={1.4} /> {contact.phone}
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:text-foreground transition-colors">
                <Mail className="h-4 w-4 text-accent" strokeWidth={1.4} /> {contact.email}
              </a>
            )}
            {contact.address && (
              <p className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-accent" strokeWidth={1.4} /> {contact.address}
              </p>
            )}
          </div>
        </motion.div>

        {/* Right form */}
        <motion.form
          {...fadeUp(0.1)}
          onSubmit={onSubmit}
          className="rounded-3xl bg-card/60 border border-border/60 p-8 md:p-12"
          data-testid="contact-form"
        >
          <h3 className="text-2xl md:text-3xl font-light tracking-[-0.02em]">
            Private inquiry
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            All enquiries are handled in absolute discretion.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={update("name")} required maxLength={100} testId="contact-name" />
            <Input label="Email" type="email" value={form.email} onChange={update("email")} required maxLength={255} testId="contact-email" />
            <Input label="Phone" type="tel" value={form.phone} onChange={update("phone")} maxLength={40} testId="contact-phone" />
            <Input label="Property Interest" value={form.interest} onChange={update("interest")} maxLength={150} testId="contact-interest" />
            <div className="sm:col-span-2">
              <Input label="Message" textarea value={form.message} onChange={update("message")} required maxLength={1000} testId="contact-message" />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            data-testid="contact-submit"
            className="mt-8 w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-sm font-medium hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 transition-transform duration-500"
          >
            {busy ? "Sending…" : sent ? "Request received" : "Request Consultation"}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
          </button>
        </motion.form>
      </div>
    </section>
  );
}

function Input({
  label,
  type = "text",
  textarea = false,
  value,
  onChange,
  required,
  maxLength,
  testId,
}: {
  label: string;
  type?: string;
  textarea?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  maxLength?: number;
  testId?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[2.5px] text-muted-foreground mb-2">
        {label}{required ? " *" : ""}
      </span>
      {textarea ? (
        <textarea
          rows={4}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          data-testid={testId}
          className="w-full rounded-2xl bg-input/40 border border-border focus:border-accent/60 outline-none px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-500 focus:shadow-[0_0_0_4px_hsl(var(--accent)/0.08)]"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          data-testid={testId}
          className="w-full rounded-2xl bg-input/40 border border-border focus:border-accent/60 outline-none px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-500 focus:shadow-[0_0_0_4px_hsl(var(--accent)/0.08)]"
        />
      )}
    </label>
  );
}
