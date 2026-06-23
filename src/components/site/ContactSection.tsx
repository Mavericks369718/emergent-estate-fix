import { motion } from "framer-motion";
import { useState } from "react";
import { fadeUp } from "@/lib/motion";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import bg from "@/assets/contact-night.jpg";

export function ContactSection() {
  const [sent, setSent] = useState(false);

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
            <a href="tel:+911100000000" className="flex items-center gap-3 hover:text-foreground transition-colors">
              <Phone className="h-4 w-4 text-accent" strokeWidth={1.4} /> +91 11 0000 0000
            </a>
            <a href="mailto:private@southdelhi.estate" className="flex items-center gap-3 hover:text-foreground transition-colors">
              <Mail className="h-4 w-4 text-accent" strokeWidth={1.4} /> private@southdelhi.estate
            </a>
            <p className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-accent" strokeWidth={1.4} /> Aurangzeb Road, New Delhi
            </p>
          </div>
        </motion.div>

        {/* Right form */}
        <motion.form
          {...fadeUp(0.1)}
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="rounded-3xl bg-card/60 border border-border/60 p-8 md:p-12"
        >
          <h3 className="text-2xl md:text-3xl font-light tracking-[-0.02em]">
            Private inquiry
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            All enquiries are handled in absolute discretion.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <Input label="Name" />
            <Input label="Email" type="email" />
            <Input label="Phone" type="tel" />
            <Input label="Property Interest" />
            <div className="sm:col-span-2">
              <Input label="Message" textarea />
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-sm font-medium hover:scale-[1.02] transition-transform duration-500"
          >
            {sent ? "Request received" : "Request Consultation"}
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
}: {
  label: string;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[2.5px] text-muted-foreground mb-2">
        {label}
      </span>
      {textarea ? (
        <textarea
          rows={4}
          className="w-full rounded-2xl bg-input/40 border border-border focus:border-accent/60 outline-none px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-500 focus:shadow-[0_0_0_4px_hsl(var(--accent)/0.08)]"
        />
      ) : (
        <input
          type={type}
          className="w-full rounded-2xl bg-input/40 border border-border focus:border-accent/60 outline-none px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-500 focus:shadow-[0_0_0_4px_hsl(var(--accent)/0.08)]"
        />
      )}
    </label>
  );
}
