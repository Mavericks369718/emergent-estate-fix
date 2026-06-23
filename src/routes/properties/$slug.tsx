import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  BedDouble,
  Bath,
  Square,
  MapPin,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { fadeUp } from "@/lib/motion";
import { api, ApiError } from "@/lib/api";
import { img } from "@/lib/imageMap";

export const Route = createFileRoute("/properties/$slug")({
  loader: async ({ params }) => {
    try {
      const property = await api.getProperty(params.slug);
      return { property };
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) throw notFound();
      throw e;
    }
  },
  component: PropertyDetailPage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.property.seo?.title || loaderData.property.title} — South Delhi Farms & Floors`
          : "Property — South Delhi Farms & Floors",
      },
      {
        name: "description",
        content: loaderData?.property.seo?.description ?? loaderData?.property.shortDescription ?? "",
      },
      ...(loaderData?.property.seo?.ogImage
        ? [{ property: "og:image", content: loaderData.property.seo.ogImage }]
        : []),
    ],
  }),
});

function PropertyDetailPage() {
  const { property } = Route.useLoaderData();
  const [activeImg, setActiveImg] = useState(property.gallery[0] ?? property.cover);

  return (
    <main className="bg-background text-foreground" data-testid="property-detail-page">
      <Navbar />

      {/* Gallery */}
      <section className="relative pt-32 md:pt-44 pb-12 px-4 md:px-6">
        <div className="max-w-[1500px] mx-auto">
          <motion.div {...fadeUp(0)} className="mb-6 md:mb-8 px-2 md:px-6">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[2.5px] text-muted-foreground hover:text-foreground transition-colors"
              data-testid="back-to-properties"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.4} />
              All properties
            </Link>
          </motion.div>

          <motion.div
            {...fadeUp(0.05)}
            className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden"
            data-testid="gallery-hero"
          >
            <div className="aspect-[16/10] md:aspect-[21/9] overflow-hidden">
              <img
                src={img(activeImg)}
                alt={property.title}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/55 via-background/5 to-transparent pointer-events-none" />
            <div className="grain" />
          </motion.div>

          {/* Thumb strip */}
          <motion.div
            {...fadeUp(0.1)}
            className="mt-4 md:mt-5 flex gap-3 overflow-x-auto pb-2"
            data-testid="gallery-strip"
          >
            {property.gallery.map((g, i) => (
              <button
                key={g + i}
                type="button"
                onClick={() => setActiveImg(g)}
                data-testid={`gallery-thumb-${i}`}
                className={`relative shrink-0 h-20 md:h-24 w-32 md:w-40 rounded-xl overflow-hidden border transition-all duration-500 ${
                  activeImg === g
                    ? "border-accent ring-2 ring-accent/40"
                    : "border-border/60 hover:border-foreground/40"
                }`}
              >
                <img src={img(g)} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="relative pb-32 md:pb-40 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[1.45fr_1fr] gap-10 md:gap-14 items-start">
          {/* Left: details */}
          <div className="space-y-14">
            <div>
              <motion.p {...fadeUp(0)} className="text-xs uppercase tracking-[4px] text-accent">
                {property.category}
              </motion.p>
              <motion.h1
                {...fadeUp(0.05)}
                className="mt-5 text-4xl md:text-6xl lg:text-7xl tracking-[-0.035em] leading-[1.02] font-light"
                data-testid="property-detail-title"
              >
                {property.title}
              </motion.h1>
              <motion.p
                {...fadeUp(0.1)}
                className="mt-5 inline-flex items-center gap-2 text-sm text-secondary-foreground"
              >
                <MapPin className="h-4 w-4 text-accent" strokeWidth={1.4} />
                {property.location}, {property.city}
              </motion.p>
              <motion.p
                {...fadeUp(0.13)}
                className="mt-3 text-xs uppercase tracking-[2.5px] text-muted-foreground"
                data-testid="property-price"
              >
                {property.priceLabel}
              </motion.p>
            </div>

            {/* Specs */}
            <motion.div
              {...fadeUp(0.15)}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
              data-testid="property-specs"
            >
              <Spec icon={Square} label="Sqft" value={property.sqft} />
              <Spec icon={BedDouble} label="Bedrooms" value={String(property.bedrooms)} />
              <Spec icon={Bath} label="Bathrooms" value={String(property.bathrooms)} />
              <Spec icon={MapPin} label="Plot" value={property.plotSize} />
            </motion.div>

            {/* Description */}
            <motion.div {...fadeUp(0.18)}>
              <h2 className="text-2xl md:text-3xl font-light tracking-[-0.02em]">
                The <span className="italic-serif">residence</span>
              </h2>
              <p
                className="mt-6 text-base md:text-lg text-secondary-foreground leading-relaxed"
                data-testid="property-description"
              >
                {property.description}
              </p>
            </motion.div>

            {/* Amenities */}
            <motion.div {...fadeUp(0.22)}>
              <h2 className="text-2xl md:text-3xl font-light tracking-[-0.02em]">
                Amenities
              </h2>
              <ul
                className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-3"
                data-testid="amenities-list"
              >
                {property.amenities.map((a, i) => (
                  <li
                    key={a}
                    className="flex items-start gap-3 text-sm text-secondary-foreground"
                    data-testid={`amenity-${i}`}
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <Check className="h-3 w-3" strokeWidth={2} />
                    </span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Right: sticky inquiry */}
          <motion.aside
            {...fadeUp(0.12)}
            className="lg:sticky lg:top-28"
            data-testid="inquiry-card"
          >
            <InquiryForm propertyTitle={property.title} propertySlug={property.slug} />
          </motion.aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-card/60 border border-border/60 p-5">
      <Icon className="h-5 w-5 text-accent" strokeWidth={1.4} />
      <p className="mt-3 text-[11px] uppercase tracking-[2.5px] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-light tracking-[-0.02em]">{value}</p>
    </div>
  );
}

function InquiryForm({
  propertyTitle,
  propertySlug,
}: {
  propertyTitle: string;
  propertySlug: string;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
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
        message: form.message || undefined,
        source: "property",
        property_slug: propertySlug,
      });
      toast.success(`Inquiry sent for ${propertyTitle}. We'll reach out shortly.`);
      setForm({ name: "", email: "", phone: "", message: "" });
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
      className="relative rounded-3xl bg-card/60 border border-border/60 p-7 md:p-8"
      data-testid="inquiry-form"
    >
      <p className="text-[11px] uppercase tracking-[2.5px] text-accent">Private inquiry</p>
      <h3 className="mt-3 text-2xl md:text-3xl font-light tracking-[-0.02em]">
        Request a viewing
      </h3>
      <p className="mt-3 text-sm text-muted-foreground">
        We respond within 24 hours, in absolute discretion.
      </p>

      <div className="mt-7 space-y-4">
        <Field
          label="Name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          testId="inquiry-name"
        />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          testId="inquiry-email"
        />
        <Field
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          testId="inquiry-phone"
        />
        <Field
          label="Message"
          value={form.message}
          onChange={(v) => setForm({ ...form, message: v })}
          textarea
          testId="inquiry-message"
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        data-testid="inquiry-submit"
        className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 text-sm font-medium hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 transition-transform duration-500"
      >
        {sending ? "Sending…" : "Send inquiry"}
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
