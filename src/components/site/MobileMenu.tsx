import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import bg from "@/assets/footer-mansion.jpg";

type NavLink = { label: string; to: string };

export function MobileMenu({
  open,
  onClose,
  links,
}: {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-40 lg:hidden"
          data-testid="mobile-menu"
        >
          <div className="absolute inset-0 bg-background" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(20px) brightness(0.6)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background/95" />
          <div className="grain" />

          <nav className="relative h-full flex flex-col justify-center px-8 pt-24 pb-12">
            <ul className="space-y-2">
              {links.map((l, i) => (
                <motion.li
                  key={l.label}
                  initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  transition={{
                    duration: 0.7,
                    delay: 0.15 + i * 0.07,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    to={l.to}
                    onClick={onClose}
                    className="block text-5xl sm:text-6xl tracking-[-0.04em] font-light text-foreground py-2"
                    data-testid={`mobile-nav-link-${l.label.toLowerCase()}`}
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12"
            >
              <Link
                to="/contact"
                onClick={onClose}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm"
                data-testid="mobile-cta-book-tour"
              >
                Book a Private Tour <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
