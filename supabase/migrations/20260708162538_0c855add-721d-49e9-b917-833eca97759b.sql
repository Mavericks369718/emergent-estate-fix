
-- Public read of estate-images (used on the public site)
DROP POLICY IF EXISTS "Public can read estate-images" ON storage.objects;
CREATE POLICY "Public can read estate-images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'estate-images');

-- Authenticated (admin) can upload
DROP POLICY IF EXISTS "Authenticated can upload estate-images" ON storage.objects;
CREATE POLICY "Authenticated can upload estate-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'estate-images');

-- Authenticated (admin) can update
DROP POLICY IF EXISTS "Authenticated can update estate-images" ON storage.objects;
CREATE POLICY "Authenticated can update estate-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'estate-images')
  WITH CHECK (bucket_id = 'estate-images');

-- Authenticated (admin) can delete
DROP POLICY IF EXISTS "Authenticated can delete estate-images" ON storage.objects;
CREATE POLICY "Authenticated can delete estate-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'estate-images');
