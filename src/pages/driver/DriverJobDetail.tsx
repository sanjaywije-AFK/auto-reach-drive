import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, MapPin, MessageCircle, Phone } from "lucide-react";
import DriverLayout from "@/components/DriverLayout";
import StatusBadge from "@/components/StatusBadge";
import StatusTimeline from "@/components/StatusTimeline";
import PhotoUploader, { PhotoGallery } from "@/components/PhotoUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useProfileMap } from "@/hooks/useProfileMap";
import { DRIVER_STATUSES, whatsappLink, type BookingStatus } from "@/lib/autoreach";

export default function DriverJobDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { profileMap } = useProfileMap();
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [note, setNote] = useState("");

  const { data: job, isLoading } = useQuery({
    queryKey: ["driver-job", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, vehicles(registration_number, make, model, notes), service_centers(name, address, phone), booking_status_updates(status, note, created_at)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async () => {
      if (!status) throw new Error("Pick a status first");
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id!);
      if (error) throw error;
      if (note.trim()) {
        await supabase.from("booking_status_updates").insert({
          booking_id: id!,
          status,
          note: note.trim().slice(0, 500),
        });
      }
    },
    onSuccess: () => {
      toast.success("Job status updated");
      qc.invalidateQueries({ queryKey: ["driver-job", id] });
      qc.invalidateQueries({ queryKey: ["driver-jobs"] });
      setNote("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addPhotos = useMutation({
    mutationFn: async (paths: string[]) => {
      const { error } = await supabase.from("bookings").update({ photos: paths }).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["driver-job", id] }),
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <DriverLayout title="Job">Loading...</DriverLayout>;
  if (!job) return <DriverLayout title="Job not found">This job is not assigned to you.</DriverLayout>;

  const customer = profileMap.get(job.customer_id);
  const updates = [...(job.booking_status_updates ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  return (
    <DriverLayout title={`Job ${job.reference}`} subtitle={job.service_category}>
      <div className="mx-auto max-w-2xl space-y-5">
        <Button asChild variant="ghost" size="sm">
          <Link to="/driver">
            <ArrowLeft className="h-4 w-4" /> My jobs
          </Link>
        </Button>

        <div className="surface-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg font-bold text-primary">{job.vehicles?.registration_number}</p>
              <p className="text-sm text-muted-foreground">
                {job.vehicles?.make} {job.vehicles?.model}
              </p>
            </div>
            <StatusBadge status={job.status} />
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Customer</dt>
              <dd className="font-medium">{customer?.name ?? "Customer"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Pickup</dt>
              <dd className="font-medium">{job.pickup_address}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Drop-off</dt>
              <dd className="font-medium">{job.dropoff_address || job.pickup_address}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Service centre</dt>
              <dd className="font-medium">{job.service_centers?.name ?? "To be confirmed"}</dd>
            </div>
            {job.notes && (
              <div>
                <dt className="text-muted-foreground">Notes</dt>
                <dd className="font-medium">{job.notes}</dd>
              </div>
            )}
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            {customer?.phone && (
              <>
                <Button asChild variant="soft" size="sm">
                  <a href={`tel:${customer.phone}`}>
                    <Phone className="h-4 w-4" /> Call
                  </a>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <a href={whatsappLink(`Hi ${customer.name}, AutoReach driver here about booking ${job.reference}.`, customer.phone)} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </Button>
              </>
            )}
            {job.pickup_map_link && (
              <Button asChild variant="ghost" size="sm">
                <a href={job.pickup_map_link} target="_blank" rel="noreferrer">
                  <MapPin className="h-4 w-4" /> Navigate
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="surface-card space-y-4 p-5">
          <h2 className="font-display text-lg font-bold">Update progress</h2>
          <div className="space-y-1.5">
            <Label>New status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as BookingStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {DRIVER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-note">Note (optional)</Label>
            <Input id="d-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Vehicle collected, heading to centre" />
          </div>
          <div className="space-y-1.5">
            <Label>Vehicle condition photos</Label>
            <PhotoUploader value={job.photos ?? []} onChange={(paths) => addPhotos.mutate(paths)} folder={job.id} />
            {job.photos?.length > 0 && <PhotoGallery paths={job.photos} />}
          </div>
          <Button variant="hero" className="w-full" disabled={update.isPending} onClick={() => update.mutate()}>
            Save update
          </Button>
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-4 font-display text-lg font-bold">Timeline</h2>
          <StatusTimeline status={job.status} updates={updates} />
        </div>
      </div>
    </DriverLayout>
  );
}
