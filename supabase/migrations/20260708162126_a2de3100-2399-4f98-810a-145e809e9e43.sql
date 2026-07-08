
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  show_in_nav BOOLEAN NOT NULL DEFAULT false,
  nav_order INTEGER NOT NULL DEFAULT 100,
  cover TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  hero JSONB NOT NULL DEFAULT '{"title":""}'::jsonb,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published pages" ON public.pages;
CREATE POLICY "Public can view published pages"
  ON public.pages FOR SELECT
  USING (status = 'Published');

DROP POLICY IF EXISTS "Authenticated can view all pages" ON public.pages;
CREATE POLICY "Authenticated can view all pages"
  ON public.pages FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated can insert pages" ON public.pages;
CREATE POLICY "Authenticated can insert pages"
  ON public.pages FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update pages" ON public.pages;
CREATE POLICY "Authenticated can update pages"
  ON public.pages FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can delete pages" ON public.pages;
CREATE POLICY "Authenticated can delete pages"
  ON public.pages FOR DELETE
  TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_pages_updated_at ON public.pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed: MDL page
INSERT INTO public.pages (slug, title, status, show_in_nav, nav_order, content, hero, sections, seo)
VALUES (
  'mdl',
  'Million Dollar Listing India',
  'Published',
  true,
  10,
$md$Million Dollar Listing India is an Indian luxury real estate reality series based on the successful American franchise *Million Dollar Listing*. It takes viewers behind the scenes of India's ultra-luxury property market, following top brokers as they compete to close multi-crore deals while balancing demanding clients, negotiations, and their personal lives.

## Featured on Million Dollar Listing India — Seasons 1 & 2

Hem Batra is one of only two luxury real estate professionals to be featured in **both Seasons 1 and 2** of *Million Dollar Listing India*, the acclaimed SonyLIV original series that offers an exclusive look into India's luxury real estate market.

Recognized for his expertise in South Delhi's premium real estate landscape, Hem has built a reputation for representing some of the region's most exclusive builder floors, luxury residences, farmhouses, and high-value investment opportunities. His continued presence on the show reflects his credibility, market expertise, and the trust he has earned among discerning buyers, sellers, and investors.

Across both seasons, viewers witness Hem navigating high-value transactions, exclusive listings, complex negotiations, and the expectations of high-net-worth clients — showcasing the professionalism, strategic approach, and commitment that define his work.

With years of experience, a powerful digital presence, and a client-first philosophy, Hem Batra continues to set new benchmarks in luxury real estate. Whether you're buying, selling, or investing in South Delhi, Hem combines deep market knowledge with personalized guidance to deliver exceptional results.

Being featured in both seasons of *Million Dollar Listing India* is a testament to Hem Batra's standing as one of the leading names in India's luxury real estate industry.$md$,
  '{"title":"Million Dollar Listing India","subtitle":"Featured on SonyLIV''s acclaimed luxury real estate series — Seasons 1 & 2."}'::jsonb,
  '[{"id":"mdl-video","type":"video","title":"Watch the feature","url":"https://youtu.be/qN5H2aFLi_w"}]'::jsonb,
  '{"title":"Million Dollar Listing India — Hem Batra","description":"Hem Batra featured in both Seasons 1 & 2 of Million Dollar Listing India on SonyLIV, representing South Delhi''s most exclusive luxury properties."}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  show_in_nav = EXCLUDED.show_in_nav,
  nav_order = EXCLUDED.nav_order,
  content = EXCLUDED.content,
  hero = EXCLUDED.hero,
  sections = EXCLUDED.sections,
  seo = EXCLUDED.seo;

-- Seed: Collaboration page
INSERT INTO public.pages (slug, title, status, show_in_nav, nav_order, content, hero, sections, seo)
VALUES (
  'collaboration',
  'Collaboration',
  'Published',
  true,
  20,
$md$A property collaboration is one of the most effective ways to unlock the true value of your land without undertaking the complexities of construction yourself. Instead of selling your property, you partner with an experienced developer who redevelops it into a modern luxury residence, allowing both parties to benefit from the project's success.

At **South Delhi Farms and Floors**, Hem Batra brings years of market expertise, local knowledge, and strong relationships with South Delhi's leading developers to help property owners make informed decisions. Every property has a different potential, and our approach is tailored to ensure you receive the right collaboration structure based on your location, plot size, redevelopment potential, and long-term objectives.

Our role extends far beyond introducing a builder. We evaluate development opportunities, connect you with credible collaborators, assist in negotiations, review commercial terms, and guide you throughout the transaction with complete transparency. Every recommendation is backed by market insight and a commitment to protecting your interests.

Over the years, we have facilitated collaborations across some of South Delhi's most sought-after neighbourhoods, helping homeowners transform ageing properties into contemporary residences that reflect today's luxury lifestyle while significantly enhancing their property's value.

If you're considering redeveloping your property through a collaboration, South Delhi Farms and Floors offers the expertise, network, and guidance to help you achieve the best possible outcome with confidence.$md$,
  '{"title":"Collaboration","subtitle":"Unlock the full potential of your South Delhi property through a trusted redevelopment partnership."}'::jsonb,
  '[{"id":"collab-cta","type":"cta","title":"Explore a collaboration","body":"Speak with Hem Batra about redeveloping your South Delhi property.","ctaLabel":"Book a Consultation","ctaUrl":"/contact"}]'::jsonb,
  '{"title":"Property Collaboration — South Delhi Farms & Floors","description":"Partner with South Delhi''s leading developers through Hem Batra to redevelop your property into a modern luxury residence."}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  show_in_nav = EXCLUDED.show_in_nav,
  nav_order = EXCLUDED.nav_order,
  content = EXCLUDED.content,
  hero = EXCLUDED.hero,
  sections = EXCLUDED.sections,
  seo = EXCLUDED.seo;
