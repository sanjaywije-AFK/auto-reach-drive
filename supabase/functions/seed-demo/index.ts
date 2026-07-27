import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PASSWORD = "autoreach123";

const DEMO_USERS = [
  { email: "admin@autoreach.lk", name: "Dilshan Fernando", phone: "0770000001", role: "admin" },
  { email: "driver@autoreach.lk", name: "Kasun Silva", phone: "0770000002", role: "driver" },
  { email: "customer@autoreach.lk", name: "Nimal Perera", phone: "0770000003", role: "customer" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  try {
    // Idempotency guard: if demo bookings already exist, do nothing.
    const { count } = await admin.from("bookings").select("id", { count: "exact", head: true });
    if ((count ?? 0) > 0) {
      return new Response(JSON.stringify({ seeded: false, reason: "already seeded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ids: Record<string, string> = {};

    const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    for (const u of DEMO_USERS) {
      const found = existing?.users.find((x) => x.email === u.email);
      if (found) {
        ids[u.role] = found.id;
        await admin.auth.admin.updateUserById(found.id, { password: PASSWORD });
      } else {
        const { data, error } = await admin.auth.admin.createUser({
          email: u.email,
          password: PASSWORD,
          email_confirm: true,
          user_metadata: { name: u.name, phone: u.phone, role: u.role },
        });
        if (error) throw error;
        ids[u.role] = data.user!.id;
      }
      await admin.from("profiles").upsert({ id: ids[u.role], name: u.name, email: u.email, phone: u.phone });
      await admin.from("user_roles").upsert(
        { user_id: ids[u.role], role: u.role },
        { onConflict: "user_id,role", ignoreDuplicates: true },
      );
    }

    // Service centres
    const { data: centers } = await admin
      .from("service_centers")
      .insert([
        {
          name: "Toyota Lanka Service Centre — Rajagiriya",
          type: "Authorized",
          address: "No. 45, Nawala Road, Rajagiriya",
          contact_person: "Ruwan Jayasuriya",
          phone: "0112 800 100",
          supported_brands: "Toyota, Lexus",
        },
        {
          name: "AutoCare Partner Garage — Nugegoda",
          type: "Trusted Partner",
          address: "112 High Level Road, Nugegoda",
          contact_person: "Saman Weerasinghe",
          phone: "0112 850 220",
          supported_brands: "Honda, Nissan, Suzuki, Mitsubishi",
        },
        {
          name: "United Motors — Colombo 02",
          type: "Authorized",
          address: "100 Hyde Park Corner, Colombo 02",
          contact_person: "Tharindu De Silva",
          phone: "0112 300 400",
          supported_brands: "Mitsubishi, Fuso, Perodua",
        },
      ])
      .select("id,name");

    // Drivers
    const { data: drivers } = await admin
      .from("drivers")
      .insert([
        { user_id: ids.driver, name: "Kasun Silva", phone: "0770000002", license_number: "B1234567", availability_status: "On Job" },
        { name: "Ajith Bandara", phone: "0770000004", license_number: "B7654321", availability_status: "Available" },
        { name: "Ravi Kumara", phone: "0770000005", license_number: "B1122334", availability_status: "Off Duty" },
      ])
      .select("id,name");

    // Vehicles
    const { data: vehicles } = await admin
      .from("vehicles")
      .insert([
        {
          customer_id: ids.customer,
          owner_name: "Nimal Perera",
          registration_number: "CBA-4521",
          make: "Toyota",
          model: "Axio",
          year: 2018,
          fuel_type: "Hybrid",
          notes: "Slight noise from front left suspension.",
        },
        {
          customer_id: ids.customer,
          owner_name: "Nimal Perera",
          registration_number: "KX-8890",
          make: "Honda",
          model: "Vezel",
          year: 2016,
          fuel_type: "Hybrid",
          notes: "Company vehicle — invoice to office.",
        },
      ])
      .select("id,registration_number");

    const driverId = drivers?.[0]?.id;
    const centerId = centers?.[0]?.id;
    const v1 = vehicles?.[0]?.id;
    const v2 = vehicles?.[1]?.id;
    const day = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

    const { data: bookings } = await admin
      .from("bookings")
      .insert([
        {
          customer_id: ids.customer,
          vehicle_id: v1,
          service_category: "Pickup & Service",
          preferred_service_center_type: "Authorized",
          pickup_address: "24/3 Park Road, Colombo 05",
          dropoff_address: "24/3 Park Road, Colombo 05",
          preferred_datetime: day(0),
          notes: "Full service plus wheel alignment.",
          status: "At Service Center",
          assigned_driver_id: driverId,
          assigned_service_center_id: centerId,
          estimated_price: 1500,
          pickup_fee: 1500,
          service_cost: 18500,
          amount_charged: 21500,
          payment_status: "Pending",
          admin_notes: "Customer requested genuine parts only.",
        },
        {
          customer_id: ids.customer,
          vehicle_id: v2,
          service_category: "Doorstep Minor Maintenance",
          preferred_service_center_type: "Customer Preferred",
          pickup_address: "AutoReach Office, 7 Duplication Road, Colombo 03",
          dropoff_address: "AutoReach Office, 7 Duplication Road, Colombo 03",
          preferred_datetime: day(2),
          notes: "Battery keeps draining overnight.",
          status: "Booking Requested",
          estimated_price: 1750,
        },
        {
          customer_id: ids.customer,
          vehicle_id: v1,
          service_category: "Vehicle Inspection",
          preferred_service_center_type: "Trusted Partner",
          pickup_address: "24/3 Park Road, Colombo 05",
          dropoff_address: "24/3 Park Road, Colombo 05",
          preferred_datetime: day(-14),
          notes: "Pre-purchase inspection.",
          status: "Completed",
          assigned_driver_id: driverId,
          assigned_service_center_id: centers?.[1]?.id,
          estimated_price: 2250,
          pickup_fee: 1500,
          service_cost: 4000,
          amount_charged: 7500,
          payment_status: "Paid",
          payment_method: "Bank Transfer",
        },
      ])
      .select("id,status");

    const completed = bookings?.find((b) => b.status === "Completed");
    if (completed) {
      await admin.from("feedback").insert({
        booking_id: completed.id,
        customer_id: ids.customer,
        rating: 5,
        comment: "Superb service. Car was collected on time and returned spotless.",
      });
    }

    await admin.from("customer_crm").upsert({
      customer_id: ids.customer,
      lifecycle_status: "Repeat Customer",
      last_service_date: new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10),
      next_follow_up_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      notes: "Prefers weekday morning pickups. Two vehicles.",
    }, { onConflict: "customer_id" });

    return new Response(JSON.stringify({ seeded: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seed-demo error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
