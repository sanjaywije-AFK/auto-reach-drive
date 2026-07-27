import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Pencil, Plus, Trash2, UserCog } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { AVAILABILITY_STATUSES, type AvailabilityStatus } from "@/lib/autoreach";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Driver name is required").max(100),
  phone: z.string().trim().min(9, "Enter a valid phone number").max(20),
  license_number: z.string().trim().max(50).optional(),
});

type Driver = {
  id: string;
  name: string;
  phone: string;
  license_number: string | null;
  availability_status: AvailabilityStatus;
};

const empty = { name: "", phone: "", license_number: "", availability_status: "Available" as AvailabilityStatus };

const tone: Record<AvailabilityStatus, string> = {
  Available: "bg-success/15 text-success",
  "On Job": "bg-warning/15 text-warning-foreground",
  "Off Duty": "bg-muted text-muted-foreground",
};

export default function AdminDrivers() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState({ ...empty });

  const { data: drivers, isLoading } = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("drivers").select("*").order("name");
      if (error) throw error;
      return data as Driver[];
    },
  });

  const { data: jobCounts } = useQuery({
    queryKey: ["driver-job-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("assigned_driver_id,status");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const b of data) {
        if (b.assigned_driver_id && b.status !== "Completed" && b.status !== "Cancelled") {
          counts[b.assigned_driver_id] = (counts[b.assigned_driver_id] ?? 0) + 1;
        }
      }
      return counts;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const payload = {
        name: parsed.data.name,
        phone: parsed.data.phone,
        license_number: parsed.data.license_number || null,
        availability_status: form.availability_status,
      };
      const { error } = editing
        ? await supabase.from("drivers").update(payload).eq("id", editing.id)
        : await supabase.from("drivers").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(editing ? "Driver updated" : "Driver added");
      qc.invalidateQueries({ queryKey: ["admin-drivers"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("drivers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Driver removed");
      qc.invalidateQueries({ queryKey: ["admin-drivers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty });
    setOpen(true);
  };
  const openEdit = (d: Driver) => {
    setEditing(d);
    setForm({
      name: d.name,
      phone: d.phone,
      license_number: d.license_number ?? "",
      availability_status: d.availability_status,
    });
    setOpen(true);
  };

  return (
    <AdminLayout title="Drivers">
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="mb-4 flex justify-end">
          <DialogTrigger asChild>
            <Button variant="hero" onClick={openNew}>
              <Plus className="h-4 w-4" /> Add driver
            </Button>
          </DialogTrigger>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading drivers...</p>
        ) : drivers?.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {drivers.map((d) => (
              <div key={d.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold text-primary">{d.name}</p>
                    <p className="text-sm text-muted-foreground">{d.phone}</p>
                    {d.license_number && <p className="text-xs text-muted-foreground">Licence {d.license_number}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(d)} aria-label="Edit driver">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(d.id)} aria-label="Delete driver">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", tone[d.availability_status])}>
                    {d.availability_status}
                  </span>
                  <span className="text-xs text-muted-foreground">{jobCounts?.[d.id] ?? 0} active job(s)</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="surface-card p-8 text-center">
            <UserCog className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-display font-bold">No drivers yet</p>
          </div>
        )}

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit driver" : "Add driver"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="d-name">Name</Label>
              <Input id="d-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-phone">Phone</Label>
              <Input id="d-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-lic">Licence number</Label>
              <Input id="d-lic" value={form.license_number} onChange={(e) => setForm((f) => ({ ...f, license_number: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Availability</Label>
              <Select value={form.availability_status} onValueChange={(v) => setForm((f) => ({ ...f, availability_status: v as AvailabilityStatus }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="hero" className="w-full" disabled={save.isPending} onClick={() => save.mutate()}>
              {editing ? "Save changes" : "Add driver"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
