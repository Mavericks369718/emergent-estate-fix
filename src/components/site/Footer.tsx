import { motion } from "framer-motion";
import { Instagram, Linkedin, Twitter, Youtube, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { Logo } from "./Logo";
import { api } from "@/lib/api";
import { useSiteContact } from "@/lib/useSiteContact";
import bg from "@/assets/footer-mansion.jpg";

const EXPLORE: { label: string; to: string }[] = [
  { label: "Home", to: "/" },
  { label: "Properties", to: "/properties" },
  { label: "About", to: "/about" },
  { label: "Blogs", to: "/blogs" },
  { label: "Contact", to: "/contact" },
];

const OFFICE: { label: string; to: string }[] = [
  { label: "Contact", to: "/contact" },
  { label: "Privacy Policy", to: "/contact" },
  { label: "Terms", to: "/contact" },
  { label: "Careers", to: "/contact" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const contact = useSiteContact();
  const socials = [
    { Icon: Instagram, href: contact.instagram_url, label: "Instagram" },
    { Icon: Linkedin, href: contact.linkedin_url, label: "LinkedIn" },
    { Icon: Twitter, href: contact.twitter_url, label: "X" },
    { Icon: Youtube, href: contact.youtube_url, label: "YouTube" },
  ].filter((s) => s.href && s.href.trim() !== "");
  return (
    <footer className="relative px-4 md:px-6 pb-6" data-testid="site-footer">
      <div className="grid md:grid-cols-2 gap-4 md:gap-5">
        {/* Left card */}
        <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden min-h-[420px] md:min-h-[520px] p-8 md:p-10 flex flex-col justify-between">
          <img src={bg} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/40 to-background/95" />
          <div className="grain" />

          <Link to="/" className="relative flex items-center gap-3 text-foreground">
            <Logo className="h-9 w-9" />
            <div className="text-[13px] tracking-[0.18em] uppercase">
              South Delhi
              <span className="block text-[10px] tracking-[0.32em] text-muted-foreground -mt-0.5">
                Farms · Floors
              </span>
            </div>
          </Link>

          <div className="relative">
            <p className="max-w-md text-2xl md:text-3xl italic-serif text-foreground leading-snug">
              Curating extraordinary addresses for a life of prestige.
            </p>
            <div className="mt-8 flex items-center gap-3">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="liquid-glass h-11 w-11 rounded-full inline-flex items-center justify-center text-foreground hover:-translate-y-0.5 transition-transform duration-500"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.4} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right card */}
        <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-secondary/60 border border-border/60 p-8 md:p-10 min-h-[420px] md:min-h-[520px] flex flex-col">
          {/* Floating badge */}
          <motion.div
            initial={{ rotate: -8, opacity: 0, y: 10 }}
            whileInView={{ rotate: -8, opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-6 top-6 md:right-10 md:top-10"
          >
            <div className="liquid-glass rounded-2xl px-4 py-3 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-accent/80 grid place-items-center">
                <Logo className="h-4 w-4 text-background" />
              </div>
              <span className="text-[10px] uppercase tracking-[2.5px] text-foreground">
                Private Access
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-8 mt-2">
            <div>
              <p className="text-[11px] uppercase tracking-[2.5px] text-muted-foreground mb-4">
                Explore
              </p>
              <ul className="space-y-3 text-sm text-secondary-foreground">
                {EXPLORE.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="hover:text-foreground transition-colors"
                      data-testid={`footer-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[2.5px] text-muted-foreground mb-4">
                Office
              </p>
              <ul className="space-y-3 text-sm text-secondary-foreground">
                {OFFICE.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-auto pt-10">
            <p className="text-2xl md:text-3xl italic-serif text-foreground leading-tight">
              Luxury moves quietly.
              <br />
              Own what lasts.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email.trim()) {
                  toast.error("Please enter a valid email.");
                  return;
                }
                try {
                  await api.createInquiry({
                    name: "Newsletter Subscriber",
                    email,
                    source: "newsletter",
                  });
                  toast.success("You're on the private list.");
                  setEmail("");
                } catch (err) {
                  const m = err instanceof Error ? err.message : "Subscription failed.";
                  toast.error(m);
                }
              }}
              className="mt-6 liquid-glass rounded-full p-1.5 flex items-center gap-2 max-w-md"
              data-testid="footer-newsletter-form"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-transparent outline-none px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                data-testid="footer-newsletter-email"
              />
              <button
                type="submit"
                className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm inline-flex items-center gap-1.5"
                data-testid="footer-newsletter-submit"
              >
                Subscribe <ArrowRight className="h-3 w-3" strokeWidth={1.6} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="relative mt-6 overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border border-border/50">
        <svg
          viewBox="0 0 1000 220"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto block"
          aria-hidden
        >
          <text
            x="50%"
            y="68%"
            textAnchor="middle"
            fontFamily="Cormorant Garamond, serif"
            fontStyle="italic"
            fontWeight="500"
            fontSize="220"
            fill="hsl(var(--foreground))"
            opacity="0.08"
            letterSpacing="-6"
          >
            South Delhi
          </text>
        </svg>
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-6 text-[11px] text-muted-foreground tracking-wide">
          <span>© {new Date().getFullYear()} South Delhi Farms & Floors</span>
          <span>Crafted with discretion</span>
        </div>
      </div>
    </footer>
  );
}
