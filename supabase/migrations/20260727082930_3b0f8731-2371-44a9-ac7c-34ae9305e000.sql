-- ENUMS
CREATE TYPE public.app_role AS ENUM ('customer','admin','driver');
CREATE TYPE public.booking_status AS ENUM (
  'Booking Requested','Booking Confirmed','Driver Assigned','On the Way to Pickup',
  'Vehicle Picked Up','At Service Center','Service In Progress','Ready for Delivery',
  'Out for Delivery','Delivered','Completed','Cancelled'
);
CREATE TYPE public.service_category AS ENUM ('Pickup & Service','Doorstep Minor Maintenance','Emergency Assistance','Vehicle Inspection');
CREATE TYPE public.service_center_type AS ENUM ('Authorized','Trusted Partner','Customer Preferred');
CREATE TYPE public.payment_status AS ENUM ('Pending','Paid','Partially Paid');
CREATE TYPE public.payment_method AS ENUM ('Cash','Bank Transfer','Online Payment');
CREATE TYPE public.lifecycle_status AS ENUM ('Lead','First-Time Customer','Repeat Customer','VIP Customer');
CREATE TYPE public.availability_status AS ENUM ('Available','On Job','Off Duty');

-- UPDATED AT HELPER
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "roles_select_own_or_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name',''), COALESCE(NEW.email,''), NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'customer'))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- VEHICLES
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL DEFAULT '',
  registration_number TEXT NOT NULL,
  make TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  year INTEGER,
  fuel_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles_select" ON public.vehicles FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR public.is_admin() OR public.has_role(auth.uid(),'driver'));
CREATE POLICY "vehicles_insert" ON public.vehicles FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid() OR public.is_admin());
CREATE POLICY "vehicles_update" ON public.vehicles FOR UPDATE TO authenticated
  USING (customer_id = auth.uid() OR public.is_admin()) WITH CHECK (customer_id = auth.uid() OR public.is_admin());
CREATE POLICY "vehicles_delete" ON public.vehicles FOR DELETE TO authenticated
  USING (customer_id = auth.uid() OR public.is_admin());
CREATE TRIGGER vehicles_updated BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SERVICE CENTERS
CREATE TABLE public.service_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.service_center_type NOT NULL DEFAULT 'Trusted Partner',
  address TEXT,
  contact_person TEXT,
  phone TEXT,
  supported_brands TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_centers TO authenticated;
GRANT ALL ON public.service_centers TO service_role;
ALTER TABLE public.service_centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "centers_select" ON public.service_centers FOR SELECT TO authenticated USING (true);
CREATE POLICY "centers_admin_write" ON public.service_centers FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER centers_updated BEFORE UPDATE ON public.service_centers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DRIVERS
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  license_number TEXT,
  availability_status public.availability_status NOT NULL DEFAULT 'Available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drivers TO authenticated;
GRANT ALL ON public.drivers TO service_role;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drivers_select" ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "drivers_admin_write" ON public.drivers FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "drivers_self_update" ON public.drivers FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER drivers_updated BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BOOKINGS
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL DEFAULT ('AR-' || upper(substr(md5(random()::text),1,6))),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  service_category public.service_category NOT NULL,
  preferred_service_center_type public.service_center_type NOT NULL DEFAULT 'Trusted Partner',
  pickup_address TEXT NOT NULL,
  pickup_map_link TEXT,
  dropoff_address TEXT,
  preferred_datetime TIMESTAMPTZ,
  notes TEXT,
  status public.booking_status NOT NULL DEFAULT 'Booking Requested',
  assigned_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  assigned_service_center_id UUID REFERENCES public.service_centers(id) ON DELETE SET NULL,
  estimated_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  service_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  pickup_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  additional_charges NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_charged NUMERIC(12,2) NOT NULL DEFAULT 0,
  profit NUMERIC(12,2) GENERATED ALWAYS AS (amount_charged - service_cost) STORED,
  payment_status public.payment_status NOT NULL DEFAULT 'Pending',
  payment_method public.payment_method,
  admin_notes TEXT,
  photos TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_my_job(_booking_driver UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = _booking_driver AND d.user_id = auth.uid());
$$;

CREATE POLICY "bookings_select" ON public.bookings FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR public.is_admin() OR public.is_my_job(assigned_driver_id));
CREATE POLICY "bookings_insert" ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid() OR public.is_admin());
CREATE POLICY "bookings_update" ON public.bookings FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.is_my_job(assigned_driver_id) OR customer_id = auth.uid())
  WITH CHECK (public.is_admin() OR public.is_my_job(assigned_driver_id) OR customer_id = auth.uid());
CREATE POLICY "bookings_delete_admin" ON public.bookings FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- STATUS UPDATES
CREATE TABLE public.booking_status_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  status public.booking_status NOT NULL,
  note TEXT,
  updated_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.booking_status_updates TO authenticated;
GRANT ALL ON public.booking_status_updates TO service_role;
ALTER TABLE public.booking_status_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "updates_select" ON public.booking_status_updates FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id
    AND (b.customer_id = auth.uid() OR public.is_admin() OR public.is_my_job(b.assigned_driver_id))));
CREATE POLICY "updates_insert" ON public.booking_status_updates FOR INSERT TO authenticated
  WITH CHECK (updated_by_user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id
    AND (public.is_admin() OR public.is_my_job(b.assigned_driver_id) OR b.customer_id = auth.uid())));

-- FEEDBACK
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_select" ON public.feedback FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR public.is_admin());
CREATE POLICY "feedback_insert" ON public.feedback FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "feedback_update" ON public.feedback FOR UPDATE TO authenticated
  USING (customer_id = auth.uid()) WITH CHECK (customer_id = auth.uid());

-- CRM
CREATE TABLE public.customer_crm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  lifecycle_status public.lifecycle_status NOT NULL DEFAULT 'Lead',
  last_service_date DATE,
  next_follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_crm TO authenticated;
GRANT ALL ON public.customer_crm TO service_role;
ALTER TABLE public.customer_crm ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_select" ON public.customer_crm FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR public.is_admin());
CREATE POLICY "crm_admin_write" ON public.customer_crm FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER crm_updated BEFORE UPDATE ON public.customer_crm FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Log initial status on booking creation
CREATE OR REPLACE FUNCTION public.log_booking_created() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.booking_status_updates (booking_id, status, note, updated_by_user_id)
  VALUES (NEW.id, NEW.status, 'Booking created', NEW.customer_id);
  RETURN NEW;
END; $$;
CREATE TRIGGER bookings_log_created AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.log_booking_created();

CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX idx_bookings_driver ON public.bookings(assigned_driver_id);
CREATE INDEX idx_updates_booking ON public.booking_status_updates(booking_id);
CREATE INDEX idx_vehicles_customer ON public.vehicles(customer_id);