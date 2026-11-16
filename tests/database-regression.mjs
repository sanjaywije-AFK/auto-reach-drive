// Real PostgreSQL engine in-process; auth/storage schemas below emulate Supabase.
// These checks do not establish live project configuration or service health.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const db = new PGlite();
const customer = '11111111-1111-4111-8111-111111111111';
const driver = '22222222-2222-4222-8222-222222222222';
const admin = '33333333-3333-4333-8333-333333333333';
const outsider = '44444444-4444-4444-8444-444444444444';
const booking = '55555555-5555-4555-8555-555555555555';
const vehicle = '66666666-6666-4666-8666-666666666666';
let checks = 0;
async function check(name, fn) { await fn(); checks++; console.log(`PASS ${name}`); }
async function asUser(uid, fn) {
  await db.exec(`SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${uid}',false);`);
  try { return await fn(); } finally { await db.exec('RESET ROLE'); }
}
try {
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth; CREATE SCHEMA storage;
    CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb DEFAULT '{}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text, name text, owner uuid);
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    GRANT USAGE ON SCHEMA public, auth, storage TO authenticated;
    GRANT ALL ON storage.objects TO authenticated;
    CREATE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$
      SELECT (string_to_array($1,'/'))[1:array_length(string_to_array($1,'/'),1)-1] $$;
  `);
  const migrations = fileURLToPath(new URL('../supabase/migrations/', import.meta.url));
  for (const name of readdirSync(migrations).filter(n => n.endsWith('.sql')).sort()) {
    await db.exec(readFileSync(`${migrations}/${name}`, 'utf8'));
  }
  await db.exec(`
    INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES
      ('${customer}','customer@test.invalid','{"role":"admin"}'),
      ('${driver}','driver@test.invalid','{}'),
      ('${admin}','admin@test.invalid','{}'),
      ('${outsider}','outsider@test.invalid','{}');
    INSERT INTO public.user_roles(user_id,role) VALUES ('${driver}','driver'),('${admin}','admin');
    INSERT INTO public.drivers(id,user_id,name) VALUES ('${driver}','${driver}','Test driver');
  `);
  await check('signup ignores client-supplied admin role', async () => {
    const {rows} = await db.query(`SELECT role FROM public.user_roles WHERE user_id='${customer}'`);
    assert.deepEqual(rows.map(r => r.role), ['customer']);
  });
  await check('customer can create a vehicle and booking', () => asUser(customer, async () => {
    await db.exec(`INSERT INTO public.vehicles(id,customer_id,registration_number) VALUES ('${vehicle}','${customer}','TEST-123');
      INSERT INTO public.bookings(id,customer_id,vehicle_id,service_category,pickup_address)
      VALUES ('${booking}','${customer}','${vehicle}','Pickup & Service','Test pickup');`);
    const {rows} = await db.query(`SELECT status FROM public.bookings WHERE id='${booking}'`);
    assert.equal(rows[0].status, 'Booking Requested');
  }));
  await check('admin can assign driver and set price', () => asUser(admin, async () => {
    const {rows} = await db.query(`UPDATE public.bookings SET assigned_driver_id='${driver}',status='Driver Assigned',service_cost=2000,amount_charged=3500 WHERE id='${booking}' RETURNING profit`);
    assert.equal(Number(rows[0].profit),1500);
  }));
  await check('driver can update own availability after license column removal', () => asUser(driver, async () => {
    const {rows} = await db.query(`UPDATE public.drivers SET availability_status='On Job' WHERE id='${driver}' RETURNING availability_status`);
    assert.equal(rows[0].availability_status,'On Job');
  }));
  await check('driver cannot change own identity', () => asUser(driver, () =>
    assert.rejects(db.query(`UPDATE public.drivers SET name='Changed' WHERE id='${driver}'`), /only update their availability/)));
  await check('assigned driver can progress booking with generated profit', () => asUser(driver, async () => {
    const {rows} = await db.query(`UPDATE public.bookings SET status='Vehicle Picked Up' WHERE id='${booking}' RETURNING status,profit`);
    assert.equal(rows[0].status,'Vehicle Picked Up');
    assert.equal(Number(rows[0].profit),1500);
  }));
  await check('driver cannot change booking financial fields', () => asUser(driver, () =>
    assert.rejects(db.query(`UPDATE public.bookings SET amount_charged=1 WHERE id='${booking}'`), /Only administrators/)));
  await check('unrelated customer cannot read or update booking', () => asUser(outsider, async () => {
    assert.equal((await db.query(`SELECT id FROM public.bookings WHERE id='${booking}'`)).rows.length,0);
    assert.equal((await db.query(`UPDATE public.bookings SET status='Completed' WHERE id='${booking}' RETURNING id`)).rows.length,0);
  }));
  await check('timeline records authenticated actor', () => asUser(driver, async () => {
    await db.exec(`INSERT INTO public.booking_status_updates(booking_id,status,note,updated_by_user_id)
      VALUES ('${booking}','Vehicle Picked Up','Collected','${driver}');`);
    const {rows} = await db.query(`SELECT note FROM public.booking_status_updates WHERE booking_id='${booking}' AND updated_by_user_id='${driver}'`);
    assert.equal(rows[0].note,'Collected');
  }));
  await check('timeline rejects missing actor', () => asUser(driver, () =>
    assert.rejects(db.query(`INSERT INTO public.booking_status_updates(booking_id,status) VALUES ('${booking}','Delivered')`), /row-level security/)));
  await check('assigned driver can upload booking photo; outsider cannot read it', async () => {
    await asUser(driver, () => db.exec(`INSERT INTO storage.objects(bucket_id,name,owner) VALUES ('booking-photos','${booking}/test.jpg','${driver}')`));
    await asUser(customer, async () => assert.equal((await db.query('SELECT id FROM storage.objects')).rows.length,1));
    await asUser(outsider, async () => assert.equal((await db.query('SELECT id FROM storage.objects')).rows.length,0));
  });
  await check('admin can complete booking and customer can leave feedback', async () => {
    await asUser(admin, () => db.exec(`UPDATE public.bookings SET status='Completed' WHERE id='${booking}'`));
    await asUser(customer, async () => {
      await db.exec(`INSERT INTO public.feedback(booking_id,customer_id,rating) VALUES ('${booking}','${customer}',5)`);
      assert.equal((await db.query(`SELECT rating FROM public.feedback WHERE booking_id='${booking}'`)).rows[0].rating,5);
    });
  });
  console.log(`${checks} database regression checks passed (local Supabase schema emulation).`);
} finally { await db.close(); }
