CREATE OR REPLACE FUNCTION public.can_access_booking_photo(_folder text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _bid uuid;
BEGIN
  IF _uid IS NULL OR _folder IS NULL THEN
    RETURN false;
  END IF;

  IF public.is_admin() THEN
    RETURN true;
  END IF;

  -- personal staging folder named after the user's own id
  IF _folder = _uid::text THEN
    RETURN true;
  END IF;

  BEGIN
    _bid := _folder::uuid;
  EXCEPTION WHEN others THEN
    RETURN false;
  END;

  RETURN EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = _bid
      AND (b.customer_id = _uid OR public.is_my_job(b.assigned_driver_id))
  );
END;
$$;

REVOKE ALL ON FUNCTION public.can_access_booking_photo(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_booking_photo(text) TO authenticated, service_role;

DROP POLICY IF EXISTS booking_photos_read ON storage.objects;
DROP POLICY IF EXISTS booking_photos_insert ON storage.objects;
DROP POLICY IF EXISTS booking_photos_update ON storage.objects;

CREATE POLICY booking_photos_read ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'booking-photos' AND public.can_access_booking_photo((storage.foldername(name))[1]));

CREATE POLICY booking_photos_insert ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'booking-photos' AND public.can_access_booking_photo((storage.foldername(name))[1]));

CREATE POLICY booking_photos_update ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'booking-photos' AND owner = auth.uid() AND public.can_access_booking_photo((storage.foldername(name))[1]))
WITH CHECK (bucket_id = 'booking-photos' AND owner = auth.uid() AND public.can_access_booking_photo((storage.foldername(name))[1]));

CREATE OR REPLACE FUNCTION public.enforce_driver_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.name IS DISTINCT FROM OLD.name
     OR NEW.phone IS DISTINCT FROM OLD.phone
     OR NEW.license_number IS DISTINCT FROM OLD.license_number
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Drivers may only update their availability status';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS drivers_self_update_guard ON public.drivers;
CREATE TRIGGER drivers_self_update_guard
BEFORE UPDATE ON public.drivers
FOR EACH ROW EXECUTE FUNCTION public.enforce_driver_self_update();