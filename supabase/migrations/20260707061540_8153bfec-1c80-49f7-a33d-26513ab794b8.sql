CREATE TABLE IF NOT EXISTS public.site_contact (
  id integer PRIMARY KEY,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  instagram_url text NOT NULL DEFAULT '',
  linkedin_url text NOT NULL DEFAULT '',
  twitter_url text NOT NULL DEFAULT '',
  youtube_url text NOT NULL DEFAULT '',
  whatsapp_url text NOT NULL DEFAULT '',
  facebook_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_contact TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_contact TO authenticated;
GRANT ALL ON public.site_contact TO service_role;

ALTER TABLE public.site_contact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read site_contact" ON public.site_contact FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth insert site_contact" ON public.site_contact FOR INSERT TO authenticated WITH CHECK (id = 1);
CREATE POLICY "auth update site_contact" ON public.site_contact FOR UPDATE TO authenticated USING (id = 1) WITH CHECK (id = 1);

INSERT INTO public.site_contact (id, phone, email, address)
VALUES (1, '+91 11 0000 0000', 'private@southdelhi.estate', 'Aurangzeb Road, New Delhi')
ON CONFLICT (id) DO NOTHING;