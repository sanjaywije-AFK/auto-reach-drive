import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Star } from "lucide-react";
import CustomerLayout from "@/components/CustomerLayout";
import StatusBadge from "@/components/StatusBadge";
import StatusTimeline from "@/components/StatusTimeline";
import { PhotoGallery } from "@/components/PhotoUploader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { formatLKR, whatsappLink } from "@/lib/autoreach";
import { cn } from "@/lib/utils";

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["booking", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "*, vehicles(registration_number, make, model, year), drivers(name, phone), service_centers(name, phone, address), booking_status_updates(status, note, created_at), feedback(id, rating, comment)",
        )
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const submitFeedback = useMutation({
    mutationFn: async () => {
      if (!rating) throw new Error("Please choose a star rating");
      const { error } = await supabase.from("feedback").insert({
        booking_id: id!,
        customer_id: user!.id,
        rating,
        comment: comment.trim().slice(0, 1000) || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thanks for your feedback!");
      qc.invalidateQueries({ queryKey: ["booking", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <CustomerLayout title="Booking">Loading...</CustomerLayout>;
  if (!data) return <CustomerLayout title="Booking not found">We couldn&apos;t find that booking.</CustomerLayout>;

  const updates = [...(data.booking_status_updates ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const existingFeedback = data.feedback?.[0];

  return (
    <CustomerLayout title={`Booking ${data.reference}`} subtitle={data.service_category}>
      <div className="mx-auto max-w-3xl space-y-5">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>

        <div className="surface-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-xl font-bold text-primary">
                {data.vehicles?.registration_number} · {data.vehicles?.make} {data.vehicles?.model}
              </p>
              <p className="text-sm text-muted-foreground">
                Requested for {data.preferred_datetime ? new Date(data.preferred_datetime).toLocaleString("en-GB") : "flexible time"}
              </p>
            </div>
            <StatusBadge status={data.status} />
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Pickup</dt>
              <dd className="font-medium">{data.pickup_address}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Drop-off</dt>
              <dd className="font-medium">{data.dropoff_address || data.pickup_address}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Driver</dt>
              <dd className="font-medium">{data.drivers?.name ?? "Awaiting assignment"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Service centre</dt>
              <dd className="font-medium">{data.service_centers?.name ?? "To be confirmed"}</dd>
            </div>
          </dl>

          {data.notes && <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{data.notes}</p>}

          {data.photos?.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold">Condition photos</p>
              <PhotoGallery paths={data.photos} />
            </div>
          )}

          <Button asChild variant="soft" className="mt-4 w-full sm:w-auto">
            <a href={whatsappLink(`Hi AutoReach, I have a question about booking ${data.reference}.`)} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </Button>
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-4 font-display text-lg font-bold">Progress</h2>
          <StatusTimeline status={data.status} updates={updates} />
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-3 font-display text-lg font-bold">Invoice summary</h2>
          <dl className="divide-y text-sm">
            {[
              ["Pickup & handling fee", data.pickup_fee],
              ["Service cost", data.service_cost],
              ["Additional charges", data.additional_charges],
              ["Discount", -data.discount],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between py-2">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{formatLKR(value as number)}</dd>
              </div>
            ))}
            <div className="flex justify-between py-3">
              <dt className="font-display font-bold">Total</dt>
              <dd className="font-display text-lg font-bold text-primary">{formatLKR(data.amount_charged)}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground">
            Payment status: <span className="font-semibold">{data.payment_status}</span>
            {data.payment_method ? ` · ${data.payment_method}` : ""}
          </p>
        </div>

        {data.status === "Completed" && (
          <div className="surface-card p-5">
            <h2 className="font-display text-lg font-bold">Rate your experience</h2>
            {existingFeedback ? (
              <div className="mt-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={cn("h-5 w-5", n <= existingFeedback.rating ? "fill-warning text-warning" : "text-muted-foreground")} />
                  ))}
                </div>
                {existingFeedback.comment && <p className="mt-2 text-sm text-muted-foreground">{existingFeedback.comment}</p>}
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star`}>
                      <Star className={cn("h-7 w-7 transition-colors", n <= rating ? "fill-warning text-warning" : "text-muted-foreground")} />
                    </button>
                  ))}
                </div>
                <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us how we did (optional)" />
                <Button variant="hero" disabled={submitFeedback.isPending} onClick={() => submitFeedback.mutate()}>
                  Submit feedback
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
