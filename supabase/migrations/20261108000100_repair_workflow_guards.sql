-- Policies execute these read-only helpers as the authenticated caller.
-- Trigger functions remain unavailable as RPCs; anonymous callers gain no access.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_my_job(uuid) TO authenticated;

-- license_number now lives in driver_private, not drivers.
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
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Drivers may only update their availability status';
  END IF;

  RETURN NEW;
END;
$$;


-- Generated columns are unavailable in BEFORE triggers. PostgreSQL itself
-- prevents direct writes to profit; guard the underlying financial fields here.
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
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.payment_method IS DISTINCT FROM OLD.payment_method
     OR NEW.admin_notes IS DISTINCT FROM OLD.admin_notes
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only administrators can change pricing, payment, assignment or internal fields on a booking';
  END IF;

  RETURN NEW;
END;
$$;

