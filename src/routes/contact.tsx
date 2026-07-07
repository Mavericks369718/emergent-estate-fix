import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { fadeUp } from "@/lib/motion";
import { api } from "@/lib/api";
import { useSiteContact } from "@/lib/useSiteContact";
import bg from "@/assets/contact-night.jpg";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — South Delhi Farms & Floors" },
      {
        name: "description",
        content:
          "Begin a private conversation with our principal. All enquiries are handled in absolute discretion.",
      },
    ],
  }),
});

function ContactPage() {
  const contact = useSiteContact();
  const telHref = contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : "#";
  return (
    <main className="bg-background text-foreground" data-testid="contact-page">
      <Navbar />


      <section className="relative pt-40 md:pt-56 pb-16 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <motion.p
            {...fadeUp(0)}
            className="text-xs uppercase tracking-[4px] text-accent"
          >
            Private Inquiry
          </motion.p>
          <motion.h1
            {...fadeUp(0.05)}
            className="mt-6 text-5xl md:text-7xl lg:text-[8rem] tracking-[-0.045em] leading-[0.95] font-light max-w-5xl"
            data-testid="contact-page-heading"
          >
            Let&apos;s find your <span className="italic-serif">next</span> address.
          </motion.h1>
        </div>
      </section>

      <section className="relative pb-32 md:pb-40 px-6 md:px-12 border-t border-border/40 pt-12 md:pt-16">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-10 md:gap-14">
          {/* Left card */}
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
              <p className="text-xs uppercase tracking-[3px] text-accent">Office</p>
              <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-light tracking-[-0.03em] leading-[1.05] max-w-md italic-serif">
                Discretion by design.
              </h2>
              <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">
                Most introductions are made on the same evening you write to us.
                Every enquiry is read personally by the principal.
              </p>
            </div>

            <div className="relative mt-12 space-y-5 text-sm text-secondary-foreground">
              {contact.phone && (
                <a
                  href={telHref}
                  className="flex items-center gap-3 hover:text-foreground transition-colors"
                  data-testid="contact-info-phone"
                >
                  <Phone className="h-4 w-4 text-accent" strokeWidth={1.4} /> {contact.phone}
                </a>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 hover:text-foreground transition-colors"
                  data-testid="contact-info-email"
                >
                  <Mail className="h-4 w-4 text-accent" strokeWidth={1.4} /> {contact.email}
                </a>
              )}
              {contact.address && (
                <p className="flex items-center gap-3" data-testid="contact-address">
                  <MapPin className="h-4 w-4 text-accent" strokeWidth={1.4} /> {contact.address}
                </p>
              )}
            </div>
          </motion.div>

          {/* Right form */}
          <motion.div {...fadeUp(0.1)}>
            <ContactForm />
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please share your name and email.");
      return;
    }
    setSending(true);
    try {
      await api.createInquiry({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        interest: form.interest || undefined,
        message: form.message || undefined,
        source: "contact",
      });
      toast.success("Request received. We'll be in touch within 24 hours.");
      setForm({ name: "", email: "", phone: "", interest: "", message: "" });
    } catch (err) {
      const m = err instanceof Error ? err.message : "Failed to send. Please try again.";
      toast.error(m);
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-card/60 border border-border/60 p-8 md:p-12"
      data-testid="contact-form"
    >
      <h3 className="text-2xl md:text-3xl font-light tracking-[-0.02em]">
        Begin a conversation
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        All enquiries are handled in absolute discretion.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <Field
          label="Name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          testId="contact-name"
        />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          testId="contact-form-email"
        />
        <Field
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          testId="contact-form-phone"
        />
        <Field
          label="Property Interest"
          value={form.interest}
          onChange={(v) => setForm({ ...form, interest: v })}
          testId="contact-interest"
        />
        <div className="sm:col-span-2">
          <Field
            label="Message"
            value={form.message}
            onChange={(v) => setForm({ ...form, message: v })}
            textarea
            testId="contact-message"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={sending}
        data-testid="contact-form-submit"
        className="mt-8 w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-sm font-medium hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 transition-transform duration-500"
      >
        {sending ? "Sending…" : "Request Consultation"}
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  testId?: string;
}) {
  const cls =
    "w-full rounded-2xl bg-input/40 border border-border focus:border-accent/60 outline-none px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-500 focus:shadow-[0_0_0_4px_hsl(var(--accent)/0.08)]";
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[2.5px] text-muted-foreground mb-2">
        {label}
      </span>
      {textarea ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
          data-testid={testId}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
          data-testid={testId}
        />
      )}
    </label>
  );
}
