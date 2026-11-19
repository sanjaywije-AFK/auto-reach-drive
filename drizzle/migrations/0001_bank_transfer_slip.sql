ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_slip_path text,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS payment_slip_uploaded_at timestamptz;