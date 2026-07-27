import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Car, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import CustomerLayout from "@/components/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { FUEL_TYPES } from "@/lib/autoreach";

const schema = z.object({
  owner_name: z.string().trim().min(2, "Owner name is required").max(100),
  registration_number: z.string().trim().min(3, "Registration number is required").max(20),
  make: z.string().trim().min(1, "Make is required").max(50),
  model: z.string().trim().min(1, "Model is required").max(50),
  year: z.string().trim().max(4).optional(),
  fuel_type: z.string().max(20).optional(),
  notes: z.string().trim().max(500).optional(),
});

type Vehicle = {
  id: string;
  owner_name: string;
  registration_number: string;
  make: string;
  model: string;
  year: number | null;
  fuel_type: string | null;
  notes: string | null;
};

const empty = { owner_name: "", registration_number: "", make: "", model: "", year: "", fuel_type: "Petrol", notes: "" };

export default function Vehicles() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ ...empty });

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*").order("created_at");
      if (error) throw error;
      return data as Vehicle[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const payload = {
        customer_id: user!.id,
        owner_name: parsed.data.owner_name,
        registration_number: parsed.data.registration_number.toUpperCase(),
        make: parsed.data.make,
        model: parsed.data.model,
        year: parsed.data.year ? Number(parsed.data.year) : null,
        fuel_type: parsed.data.fuel_type || null,
        notes: parsed.data.notes || null,
      };
      const { error } = editing
        ? await supabase.from("vehicles").update(payload).eq("id", editing.id)
        : await supabase.from("vehicles").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(editing ? "Vehicle updated" : "Vehicle added");
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vehicle removed");
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty, owner_name: profile?.name ?? "" });
    setOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      owner_name: v.owner_name,
      registration_number: v.registration_number,
      make: v.make,
      model: v.model,
      year: v.year ? String(v.year) : "",
      fuel_type: v.fuel_type ?? "Petrol",
      notes: v.notes ?? "",
    });
    setOpen(true);
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <CustomerLayout title="My vehicles" subtitle="Garage">
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="mb-4 flex justify-end">
          <DialogTrigger asChild>
            <Button variant="hero" onClick={openNew}>
              <Plus className="h-4 w-4" /> Add vehicle
            </Button>
          </DialogTrigger>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading vehicles...</p>
        ) : vehicles?.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {vehicles.map((v) => (
              <div key={v.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold text-primary">{v.registration_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {v.make} {v.model} {v.year ? `· ${v.year}` : ""} {v.fuel_type ? `· ${v.fuel_type}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Owner: {v.owner_name}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(v)} aria-label="Edit vehicle">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(v.id)} aria-label="Delete vehicle">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {v.notes && <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">{v.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="surface-card p-8 text-center">
            <Car className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-display font-bold">No vehicles saved</p>
            <p className="mt-1 text-sm text-muted-foreground">Add a vehicle to speed up future bookings.</p>
          </div>
        )}

        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit vehicle" : "Add vehicle"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="owner">Vehicle owner name</Label>
              <Input id="owner" value={form.owner_name} onChange={set("owner_name")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg">Registration plate</Label>
              <Input id="reg" value={form.registration_number} onChange={set("registration_number")} placeholder="CBA-4521" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="make">Make</Label>
                <Input id="make" value={form.make} onChange={set("make")} placeholder="Toyota" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model">Model</Label>
                <Input id="model" value={form.model} onChange={set("model")} placeholder="Axio" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="year">Year</Label>
                <Input id="year" inputMode="numeric" value={form.year} onChange={set("year")} placeholder="2018" />
              </div>
              <div className="space-y-1.5">
                <Label>Fuel type</Label>
                <Select value={form.fuel_type} onValueChange={(v) => setForm((f) => ({ ...f, fuel_type: v }))}>
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
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes / special instructions</Label>
              <Textarea id="notes" value={form.notes} onChange={set("notes")} rows={3} />
            </div>
            <Button variant="hero" className="w-full" disabled={save.isPending} onClick={() => save.mutate()}>
              {editing ? "Save changes" : "Add vehicle"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
