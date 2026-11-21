CREATE OR REPLACE FUNCTION public.enforce_booking_update_scope()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_admin() THEN RETURN NEW; END IF;
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
  -- Customers (not the assigned driver) may not move the job status.
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT public.is_my_job(OLD.assigned_driver_id) THEN
    RAISE EXCEPTION 'Only the assigned driver or an administrator can change the booking status';
  END IF;
  -- Only the customer may change their payment slip.
  IF (NEW.payment_slip_path IS DISTINCT FROM OLD.payment_slip_path
      OR NEW.payment_reference IS DISTINCT FROM OLD.payment_reference
      OR NEW.payment_slip_uploaded_at IS DISTINCT FROM OLD.payment_slip_uploaded_at)
     AND OLD.customer_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the customer can submit a payment slip';
  END IF;
  RETURN NEW;
END; $$;