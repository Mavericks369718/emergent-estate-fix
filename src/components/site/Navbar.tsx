import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { api } from "@/lib/api";

const BASE_LINKS: { label: string; to: string }[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Properties", to: "/properties" },
  { label: "Blogs", to: "/blogs" },
];
const TAIL_LINK = { label: "Contact", to: "/contact" };

// Module-level promise cache so all Navbar instances share one round-trip
// to Supabase and we don't refetch on every public-page navigation.
type NavPage = { slug: string; title: string; navOrder: number };
let navPagesPromise: Promise<NavPage[]> | null = null;
function fetchNavPagesOnce(): Promise<NavPage[]> {
  if (!navPagesPromise) {
    navPagesPromise = api.navPages().catch(() => [] as NavPage[]);
  }
  return navPagesPromise;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [navPages, setNavPages] = useState<{ slug: string; title: string; navOrder: number }[]>([]);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    fetchNavPagesOnce().then(setNavPages);
  }, []);

  const NAV_LABEL_OVERRIDES: Record<string, string> = {
    mdl: "MDL",
    collaboration: "Collaborate",
  };

  const NAV_LINKS = [
    ...BASE_LINKS,
    ...navPages.map((p) => ({
      label: NAV_LABEL_OVERRIDES[p.slug] ?? p.title,
      to: `/pages/${p.slug}`,
    })),
    TAIL_LINK,
  ];

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <>
      <motion.header
        initial={{ y: -32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 pt-4 md:pt-6"
        data-testid="site-navbar"
      >
        <nav
          className={`mx-auto flex items-center justify-between gap-4 rounded-full px-5 md:px-7 py-3 transition-all duration-700 ${
            scrolled ? "max-w-5xl liquid-glass" : "max-w-6xl liquid-glass"
          }`}
        >
          {/* Left: Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 text-foreground shrink-0"
            data-testid="nav-logo"
          >
            <Logo className="h-8 w-8 text-foreground" />
            <span className="hidden sm:block text-[13px] tracking-[0.18em] uppercase font-medium">
              South Delhi
              <span className="block text-[10px] tracking-[0.32em] text-muted-foreground -mt-0.5">
                Farms · Floors
              </span>
            </span>
          </Link>

          {/* Center nav */}
          <ul className="hidden lg:flex items-center gap-1 text-sm">
            {NAV_LINKS.map((l, i) => {
              const active = isActive(l.to);
              return (
                <li key={l.label} className="flex items-center">
                  <Link
                    to={l.to}
                    className={`relative px-3 py-1.5 transition-colors duration-500 group ${
                      active ? "text-foreground" : "text-secondary-foreground hover:text-foreground"
                    }`}
                    data-testid={`nav-link-${l.label.toLowerCase()}`}
                  >
                    {l.label}
                    <span
                      className={`absolute left-3 right-3 -bottom-0.5 h-px origin-left bg-accent/70 transition-transform duration-500 ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                  {i < NAV_LINKS.length - 1 && (
                    <span className="text-muted-foreground/40 text-[6px]">•</span>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Right CTA */}
          <div className="flex items-center gap-2">
            <Link
              to="/contact"
              className="hidden md:inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-[13px] font-medium hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(231,225,210,0.18)] transition-all duration-500"
              data-testid="nav-cta-book-tour"
            >
              Book a Private Tour
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
            </Link>

            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full liquid-glass text-foreground"
              data-testid="nav-mobile-toggle"
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <X className="h-5 w-5" strokeWidth={1.4} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="m"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Menu className="h-5 w-5" strokeWidth={1.4} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </motion.header>

      <MobileMenu open={open} onClose={() => setOpen(false)} links={NAV_LINKS} />
    </>
  );
}
