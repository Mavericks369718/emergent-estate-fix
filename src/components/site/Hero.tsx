import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import hero from "@/assets/hero-farmhouse.jpg";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section id="home" className="relative p-2 sm:p-4 md:p-6">
      <div
        ref={ref}
        className="relative h-[100svh] min-h-[640px] w-full overflow-hidden rounded-[1.5rem] md:rounded-[2rem]"
      >
        {/* Background image with parallax */}
        <motion.div
          style={{ y, scale }}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={hero}
            alt="South Delhi luxury farmhouse exterior at sunset"
            className="h-full w-full object-cover brightness-[0.95] saturate-[1.05]"
            width={1920}
            height={1280}
          />
        </motion.div>

        {/* Layered overlays */}
        <div className="absolute inset-0 bg-background/15" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_hsl(var(--background)/0.55)_100%)] " />
        <div className="grain" />
        <div className="noise-overlay" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-end pb-10 md:pb-16 px-6 md:px-12">
          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="font-medium text-[18vw] md:text-[14vw] lg:text-[11vw] leading-[0.85] tracking-[-0.06em]"
            style={{ color: "#E7DFC9", textShadow: "0 4px 30px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.7)" }}
            data-testid="hero-headline"
          >
            South Delhi
            <span className="block">
              <span className="italic-serif">Luxury</span> Living
              <sup className="text-[0.18em] align-top tracking-normal ml-2 text-secondary-foreground">
                ®
              </sup>
            </span>
          </motion.h1>

          <div className="mt-8 md:mt-12 grid md:grid-cols-2 gap-8 md:gap-16 items-end">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-base md:text-lg max-w-xl leading-relaxed"
              style={{ color: "hsl(var(--hero-subtitle))" }}
            >
              Curating South Delhi's most exclusive farmhouses, builder floors and
              luxury investment residences for a new generation of refined living.
            </motion.p>

            <motion.form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email.trim()) {
                  toast.error("Please enter a valid email.");
                  return;
                }
                try {
                  await api.createInquiry({
                    name: "Hero capture",
                    email,
                    source: "hero",
                  });
                  toast.success("A private advisor will reach out shortly.");
                  setEmail("");
                } catch (err) {
                  const m = err instanceof Error ? err.message : "Something went wrong.";
                  toast.error(m);
                }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="liquid-glass rounded-full p-2 max-w-xl flex items-center gap-2 w-full md:justify-self-end"
              data-testid="hero-email-form"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-transparent outline-none px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground"
                data-testid="hero-email-input"
              />
              <button
                type="submit"
                className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2 hover:scale-[1.03] transition-transform duration-500"
                data-testid="hero-email-submit"
              >
                Schedule Viewing
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
              </button>
            </motion.form>
          </div>
        </div>
      </div>
    </section>
  );
}
