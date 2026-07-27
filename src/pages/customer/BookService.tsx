import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import CustomerLayout from "@/components/CustomerLayout";
import PhotoUploader from "@/components/PhotoUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  CATEGORY_PRICING,
  FUEL_TYPES,
  SERVICE_CATEGORIES,
  SERVICE_CENTER_TYPES,
  formatLKR,
  type ServiceCategory,
  type ServiceCenterType,
} from "@/lib/autoreach";
import { cn } from "@/lib/utils";

const steps = ["Service", "Vehicle", "Pickup", "Confirm"];

const newVehicleSchema = z.object({
  registration_number: z.string().trim().min(3, "Registration number is required").max(20),
  make: z.string().trim().min(1, "Make is required").max(50),
  model: z.string().trim().min(1, "Model is required").max(50),
  year: z.string().trim().max(4).optional(),
  fuel_type: z.string().max(20),
});

export default function BookService() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);

  const [category, setCategory] = useState<ServiceCategory>("Pickup & Service");
  const [centerType, setCenterType] = useState<ServiceCenterType>("Authorized");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [newVehicle, setNewVehicle] = useState({
    registration_number: "",
    make: "",
    model: "",
    year: "",
    fuel_type: "Petrol",
  });
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [sameAsPickup, setSameAsPickup] = useState(true);
  const [mapLink, setMapLink] = useState("");
  const [when, setWhen] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const pricing = CATEGORY_PRICING[category];
  const estimate = pricing.intro ?? pricing.min;
  const usingNewVehicle = vehicleId === "new" || !vehicles?.length;

  const canContinue = useMemo(() => {
    if (step === 0) return !!category && !!centerType;
    if (step === 1)
      return usingNewVehicle
        ? newVehicleSchema.safeParse(newVehicle).success
        : !!vehicleId;
    if (step === 2) return pickup.trim().length > 4 && !!when;
    return true;
  }, [step, category, centerType, usingNewVehicle, newVehicle, vehicleId, pickup, when]);

  const submit = useMutation({
    mutationFn: async () => {
      let finalVehicleId = vehicleId;
      if (usingNewVehicle) {
        const parsed = newVehicleSchema.parse(newVehicle);
        const { data, error } = await supabase
          .from("vehicles")
          .insert({
            customer_id: user!.id,
            owner_name: profile?.name ?? "Vehicle owner",
            registration_number: parsed.registration_number.toUpperCase(),
            make: parsed.make,
            model: parsed.model,
            year: parsed.year ? Number(parsed.year) : null,
            fuel_type: parsed.fuel_type,
          })
          .select("id")
          .single();
        if (error) throw error;
        finalVehicleId = data.id;
      }

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          customer_id: user!.id,
          vehicle_id: finalVehicleId,
          service_category: category,
          preferred_service_center_type: centerType,
          pickup_address: pickup.trim(),
          dropoff_address: (sameAsPickup ? pickup : dropoff).trim(),
          pickup_map_link: mapLink.trim() || null,
          preferred_datetime: when ? new Date(when).toISOString() : null,
          notes: notes.trim() || null,
          photos,
          estimated_price: estimate,
        })
        .select("id,reference")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      toast.success(`Booking ${data.reference} submitted!`);
      navigate(`/booking/${data.id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <CustomerLayout title="Book a service" subtitle="New booking">
      <div className="mx-auto max-w-2xl space-y-6">
        <ol className="flex items-center gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  i < step ? "bg-success text-primary-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={cn("hidden text-xs font-semibold sm:inline", i === step ? "text-primary" : "text-muted-foreground")}>{s}</span>
              {i < steps.length - 1 && <span className="h-0.5 flex-1 bg-border" />}
            </li>
          ))}
        </ol>

        <div className="surface-card p-6">
          {step === 0 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Service type</Label>
                <div className="grid gap-2">
                  {SERVICE_CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={cn(
                        "rounded-xl border-2 p-4 text-left transition-colors",
                        category === c ? "border-secondary bg-accent" : "border-border hover:border-secondary/50",
                      )}
                    >
                      <p className="font-display font-bold">{c}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{CATEGORY_PRICING[c].blurb}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Preferred service centre type</Label>
                <Select value={centerType} onValueChange={(v) => setCenterType(v as ServiceCenterType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CENTER_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              {!!vehicles?.length && (
                <div className="space-y-1.5">
                  <Label>Choose a vehicle</Label>
                  <Select value={vehicleId} onValueChange={setVehicleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.registration_number} — {v.make} {v.model}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ Add a new vehicle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {usingNewVehicle && (
                <div className="space-y-4 rounded-xl bg-muted/60 p-4">
                  <p className="font-display text-sm font-bold">New vehicle details</p>
                  <div className="space-y-1.5">
                    <Label htmlFor="nv-reg">Registration plate</Label>
                    <Input
                      id="nv-reg"
                      value={newVehicle.registration_number}
                      onChange={(e) => setNewVehicle((v) => ({ ...v, registration_number: e.target.value }))}
                      placeholder="CBA-4521"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="nv-make">Make</Label>
                      <Input id="nv-make" value={newVehicle.make} onChange={(e) => setNewVehicle((v) => ({ ...v, make: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="nv-model">Model</Label>
                      <Input id="nv-model" value={newVehicle.model} onChange={(e) => setNewVehicle((v) => ({ ...v, model: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="nv-year">Year</Label>
                      <Input id="nv-year" inputMode="numeric" value={newVehicle.year} onChange={(e) => setNewVehicle((v) => ({ ...v, year: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Fuel type</Label>
                      <Select value={newVehicle.fuel_type} onValueChange={(f) => setNewVehicle((v) => ({ ...v, fuel_type: f }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FUEL_TYPES.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="pickup">Pickup address</Label>
                <Textarea id="pickup" rows={2} value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="24/3 Park Road, Colombo 05" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={sameAsPickup} onChange={(e) => setSameAsPickup(e.target.checked)} className="h-4 w-4 rounded border-input" />
                Deliver back to the same address
              </label>
              {!sameAsPickup && (
                <div className="space-y-1.5">
                  <Label htmlFor="dropoff">Drop-off address</Label>
                  <Textarea id="dropoff" rows={2} value={dropoff} onChange={(e) => setDropoff(e.target.value)} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="map">Google Maps link (optional)</Label>
                <Input id="map" value={mapLink} onChange={(e) => setMapLink(e.target.value)} placeholder="https://maps.app.goo.gl/..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="when">Preferred date &amp; time</Label>
                <Input id="when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Issue description / notes</Label>
                <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe the problem or the service you need" />
              </div>
              <div className="space-y-1.5">
                <Label>Vehicle condition photos (optional)</Label>
                <PhotoUploader value={photos} onChange={setPhotos} folder={user!.id} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold">Confirm your booking</h2>
              <dl className="divide-y text-sm">
                {[
                  ["Service", category],
                  ["Service centre", centerType],
                  [
                    "Vehicle",
                    usingNewVehicle
                      ? `${newVehicle.registration_number.toUpperCase()} — ${newVehicle.make} ${newVehicle.model}`
                      : vehicles?.find((v) => v.id === vehicleId)?.registration_number ?? "-",
                  ],
                  ["Pickup", pickup],
                  ["Drop-off", sameAsPickup ? pickup : dropoff],
                  ["Preferred time", when ? new Date(when).toLocaleString("en-GB") : "-"],
                  ["Photos", photos.length ? `${photos.length} attached` : "None"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 py-2.5">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="rounded-xl bg-accent p-4">
                <p className="text-sm text-muted-foreground">Estimated pickup &amp; handling fee</p>
                <p className="font-display text-2xl font-bold text-primary">{formatLKR(estimate)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Service parts and labour are quoted separately after inspection and confirmed with you before any work begins.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {step < 3 ? (
              <Button variant="hero" className="flex-1" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="cta" className="flex-1" disabled={submit.isPending} onClick={() => submit.mutate()}>
                {submit.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Confirm booking
              </Button>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
