-- 1. Signup role escalation: always assign 'customer'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name',''), COALESCE(NEW.email,''), NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  -- Never trust client-supplied role metadata: everyone starts as a customer.
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $function$;

-- 2. Booking column overreach guard
CREATE OR REPLACE FUNCTION public.enforce_booking_update_scope()
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
     OR NEW.reference IS DISTINCT FROM OLD.reference
     OR NEW.customer_id IS DISTINCT FROM OLD.customer_id
     OR NEW.assigned_driver_id IS DISTINCT FROM OLD.assigned_driver_id
     OR NEW.assigned_service_center_id IS DISTINCT FROM OLD.assigned_service_center_id
     OR NEW.estimated_price IS DISTINCT FROM OLD.estimated_price
     OR NEW.service_cost IS DISTINCT FROM OLD.service_cost
     OR NEW.pickup_fee IS DISTINCT FROM OLD.pickup_fee
     OR NEW.additional_charges IS DISTINCT FROM OLD.additional_charges
     OR NEW.discount IS DISTINCT FROM OLD.discount
     OR NEW.amount_charged IS DISTINCT FROM OLD.amount_charged
     OR NEW.profit IS DISTINCT FROM OLD.profit
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.payment_method IS DISTINCT FROM OLD.payment_method
     OR NEW.admin_notes IS DISTINCT FROM OLD.admin_notes
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only administrators can change pricing, payment, assignment or internal fields on a booking';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_booking_update_scope() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS bookings_update_scope_guard ON public.bookings;
CREATE TRIGGER bookings_update_scope_guard
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_update_scope();

-- 3. Driver PII: move licence numbers to an admin-only table
CREATE TABLE IF NOT EXISTS public.driver_private (
  driver_id uuid PRIMARY KEY REFERENCES public.drivers(id) ON DELETE CASCADE,
  license_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.driver_private TO authenticated;
GRANT ALL ON public.driver_private TO service_role;

ALTER TABLE public.driver_private ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS driver_private_admin_all ON public.driver_private;
CREATE POLICY driver_private_admin_all ON public.driver_private
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS driver_private_updated ON public.driver_private;
CREATE TRIGGER driver_private_updated
BEFORE UPDATE ON public.driver_private
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.driver_private (driver_id, license_number)
SELECT id, license_number FROM public.drivers WHERE license_number IS NOT NULL
ON CONFLICT (driver_id) DO NOTHING;

ALTER TABLE public.drivers DROP COLUMN IF EXISTS license_number;

-- 4. Restrict driver row visibility
DROP POLICY IF EXISTS drivers_select ON public.drivers;
CREATE POLICY drivers_select ON public.drivers
FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.assigned_driver_id = drivers.id
      AND b.customer_id = auth.uid()
  )
);