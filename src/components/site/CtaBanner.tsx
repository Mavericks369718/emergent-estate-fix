import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import bg from "@/assets/contact-night.jpg";

export function CtaBanner() {
  return (
    <section className="relative px-6 md:px-12 pb-24 md:pb-32">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          {...fadeUp(0)}
          className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border border-border/60"
        >
          <img
            src={bg}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/60 to-background/95" />
          <div className="grain" />

          <div className="relative p-10 md:p-16 lg:p-20 grid lg:grid-cols-[1.4fr_1fr] gap-10 md:gap-14 items-end">
            <div>
              <p className="text-[11px] uppercase tracking-[3px] text-accent">
                Private invitation
              </p>
              <h2 className="mt-5 text-4xl md:text-6xl lg:text-7xl font-light tracking-[-0.03em] leading-[1.02]">
                Let&apos;s find your <span className="italic-serif">next</span> address.
              </h2>
              <p className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
                A confidential conversation with our principal — by appointment only.
                Most introductions are made on the same evening you write to us.
              </p>
            </div>

            <div className="flex lg:justify-end">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-4 text-sm font-medium hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(231,225,210,0.18)] transition-all duration-500"
                data-testid="cta-banner-btn"
              >
                Begin a private conversation
                <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
