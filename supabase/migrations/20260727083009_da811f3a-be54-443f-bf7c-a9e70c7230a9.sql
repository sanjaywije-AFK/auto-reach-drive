CREATE POLICY "booking_photos_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'booking-photos');
CREATE POLICY "booking_photos_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'booking-photos');
CREATE POLICY "booking_photos_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'booking-photos') WITH CHECK (bucket_id = 'booking-photos');
CREATE POLICY "booking_photos_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'booking-photos' AND owner = auth.uid());