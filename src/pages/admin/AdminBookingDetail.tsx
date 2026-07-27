import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Save } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import StatusBadge from "@/components/StatusBadge";
import StatusTimeline from "@/components/StatusTimeline";
import { PhotoGallery } from "@/components/PhotoUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useProfileMap } from "@/hooks/useProfileMap";
import {
  BOOKING_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  formatLKR,
  whatsappLink,
  type BookingStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/autoreach";

const NONE = "none";

export default function AdminBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { profileMap } = useProfileMap();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["admin-booking", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, vehicles(registration_number, make, model, year, notes), booking_status_updates(status, note, created_at)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: drivers } = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("drivers").select("id,name,availability_status").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: centers } = useQuery({
    queryKey: ["admin-centers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_centers").select("id,name,type").order("name");
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    status: "Booking Requested" as BookingStatus,
    assigned_driver_id: NONE,
    assigned_service_center_id: NONE,
    pickup_fee: "0",
    service_cost: "0",
    additional_charges: "0",
    discount: "0",
    payment_status: "Pending" as PaymentStatus,
    payment_method: NONE,
    admin_notes: "",
    statusNote: "",
  });

  useEffect(() => {
    if (!booking) return;
    setForm({
      status: booking.status,
      assigned_driver_id: booking.assigned_driver_id ?? NONE,
      assigned_service_center_id: booking.assigned_service_center_id ?? NONE,
      pickup_fee: String(booking.pickup_fee ?? 0),
      service_cost: String(booking.service_cost ?? 0),
      additional_charges: String(booking.additional_charges ?? 0),
      discount: String(booking.discount ?? 0),
      payment_status: booking.payment_status,
      payment_method: booking.payment_method ?? NONE,
      admin_notes: booking.admin_notes ?? "",
      statusNote: "",
    });
  }, [booking]);

  const total =
    Number(form.pickup_fee || 0) + Number(form.service_cost || 0) + Number(form.additional_charges || 0) - Number(form.discount || 0);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: form.status,
          assigned_driver_id: form.assigned_driver_id === NONE ? null : form.assigned_driver_id,
          assigned_service_center_id: form.assigned_service_center_id === NONE ? null : form.assigned_service_center_id,
          pickup_fee: Number(form.pickup_fee || 0),
          service_cost: Number(form.service_cost || 0),
          additional_charges: Number(form.additional_charges || 0),
          discount: Number(form.discount || 0),
          amount_charged: total,
          payment_status: form.payment_status,
          payment_method: form.payment_method === NONE ? null : (form.payment_method as PaymentMethod),
          admin_notes: form.admin_notes.trim().slice(0, 1000) || null,
        })
        .eq("id", id!);
      if (error) throw error;

      if (form.statusNote.trim()) {
        await supabase.from("booking_status_updates").insert({
          booking_id: id!,
          status: form.status,
          note: form.statusNote.trim().slice(0, 500),
        });
      }
    },
    onSuccess: () => {
      toast.success("Booking updated");
      qc.invalidateQueries({ queryKey: ["admin-booking", id] });
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      setForm((f) => ({ ...f, statusNote: "" }));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <AdminLayout title="Booking">Loading...</AdminLayout>;
  if (!booking) return <AdminLayout title="Not found">That booking no longer exists.</AdminLayout>;

  const customer = profileMap.get(booking.customer_id);
  const updates = [...(booking.booking_status_updates ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const money = (k: keyof typeof form, label: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} inputMode="decimal" value={form[k] as string} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} />
    </div>
  );

  return (
    <AdminLayout title={`Booking ${booking.reference}`} subtitle={booking.service_category}>
      <div className="space-y-5">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/bookings">
            <ArrowLeft className="h-4 w-4" /> All bookings
          </Link>
        </Button>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold text-primary">{customer?.name ?? "Customer"}</p>
                  <p className="text-sm text-muted-foreground">{customer?.phone ?? "No phone"} · {customer?.email}</p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Vehicle</dt>
                  <dd className="font-medium">
                    {booking.vehicles?.registration_number} · {booking.vehicles?.make} {booking.vehicles?.model} {booking.vehicles?.year ?? ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Pickup</dt>
                  <dd className="font-medium">{booking.pickup_address}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Drop-off</dt>
                  <dd className="font-medium">{booking.dropoff_address || booking.pickup_address}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Preferred time</dt>
                  <dd className="font-medium">
                    {booking.preferred_datetime ? new Date(booking.preferred_datetime).toLocaleString("en-GB") : "Flexible"}
                  </dd>
                </div>
                {booking.notes && (
                  <div>
                    <dt className="text-muted-foreground">Customer notes</dt>
                    <dd className="font-medium">{booking.notes}</dd>
                  </div>
                )}
              </dl>
              {booking.pickup_map_link && (
                <a className="mt-3 inline-block text-sm font-semibold text-secondary" href={booking.pickup_map_link} target="_blank" rel="noreferrer">
                  Open pickup location in Maps
                </a>
              )}
              {booking.photos?.length > 0 && (
                <div className="mt-4">
                  <PhotoGallery paths={booking.photos} />
                </div>
              )}
              {customer?.phone && (
                <Button asChild variant="soft" className="mt-4">
                  <a href={whatsappLink(`Hi ${customer.name}, an update on your AutoReach booking ${booking.reference}:`, customer.phone)} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4" /> WhatsApp customer
                  </a>
                </Button>
              )}
            </div>

            <div className="surface-card p-5">
              <h2 className="mb-4 font-display text-lg font-bold">Status history</h2>
              <StatusTimeline status={booking.status} updates={updates} />
            </div>
          </div>

          <div className="surface-card space-y-4 p-5">
            <h2 className="font-display text-lg font-bold">Manage booking</h2>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as BookingStatus }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Assign driver</Label>
              <Select value={form.assigned_driver_id} onValueChange={(v) => setForm((f) => ({ ...f, assigned_driver_id: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Unassigned</SelectItem>
                  {(drivers ?? []).map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} — {d.availability_status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Service centre</Label>
              <Select value={form.assigned_service_center_id} onValueChange={(v) => setForm((f) => ({ ...f, assigned_service_center_id: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Not selected</SelectItem>
                  {(centers ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {money("pickup_fee", "Pickup fee")}
              {money("service_cost", "Service cost")}
              {money("additional_charges", "Additional charges")}
              {money("discount", "Discount")}
            </div>

            <div className="rounded-xl bg-accent p-4">
              <p className="text-sm text-muted-foreground">Total charged</p>
              <p className="font-display text-2xl font-bold text-primary">{formatLKR(total)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Payment status</Label>
                <Select value={form.payment_status} onValueChange={(v) => setForm((f) => ({ ...f, payment_status: v as PaymentStatus }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Payment method</Label>
                <Select value={form.payment_method} onValueChange={(v) => setForm((f) => ({ ...f, payment_method: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Not set</SelectItem>
                    {PAYMENT_METHODS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status-note">Note for this status update</Label>
              <Input
                id="status-note"
                value={form.statusNote}
                onChange={(e) => setForm((f) => ({ ...f, statusNote: e.target.value }))}
                placeholder="e.g. Parts ordered, ready tomorrow"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-notes">Internal admin notes</Label>
              <Textarea id="admin-notes" rows={3} value={form.admin_notes} onChange={(e) => setForm((f) => ({ ...f, admin_notes: e.target.value }))} />
            </div>

            <Button variant="hero" className="w-full" disabled={save.isPending} onClick={() => save.mutate()}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
