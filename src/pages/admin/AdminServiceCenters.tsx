import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_CENTER_TYPES, type ServiceCenterType } from "@/lib/autoreach";

const schema = z.object({
  name: z.string().trim().min(2, "Centre name is required").max(120),
  address: z.string().trim().min(4, "Address is required").max(300),
  contact_person: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  supported_brands: z.string().trim().max(300).optional(),
});

type Center = {
  id: string;
  name: string;
  type: ServiceCenterType;
  address: string;
  contact_person: string | null;
  phone: string | null;
  supported_brands: string | null;
};

const empty = {
  name: "",
  type: "Authorized" as ServiceCenterType,
  address: "",
  contact_person: "",
  phone: "",
  supported_brands: "",
};

export default function AdminServiceCenters() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Center | null>(null);
  const [form, setForm] = useState({ ...empty });

  const { data: centers, isLoading } = useQuery({
    queryKey: ["admin-centers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_centers").select("*").order("name");
      if (error) throw error;
      return data as Center[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const payload = {
        name: parsed.data.name,
        type: form.type,
        address: parsed.data.address,
        contact_person: parsed.data.contact_person || null,
        phone: parsed.data.phone || null,
        supported_brands: parsed.data.supported_brands || null,
      };
      const { error } = editing
        ? await supabase.from("service_centers").update(payload).eq("id", editing.id)
        : await supabase.from("service_centers").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(editing ? "Service centre updated" : "Service centre added");
      qc.invalidateQueries({ queryKey: ["admin-centers"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_centers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Service centre removed");
      qc.invalidateQueries({ queryKey: ["admin-centers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty });
    setOpen(true);
  };
  const openEdit = (c: Center) => {
    setEditing(c);
    setForm({
      name: c.name,
      type: c.type,
      address: c.address,
      contact_person: c.contact_person ?? "",
      phone: c.phone ?? "",
      supported_brands: c.supported_brands ?? "",
    });
    setOpen(true);
  };

  return (
    <AdminLayout title="Service centres">
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="mb-4 flex justify-end">
          <DialogTrigger asChild>
            <Button variant="hero" onClick={openNew}>
              <Plus className="h-4 w-4" /> Add centre
            </Button>
          </DialogTrigger>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading centres...</p>
        ) : centers?.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {centers.map((c) => (
              <div key={c.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display font-bold text-primary">{c.name}</p>
                    <span className="mt-1 inline-block rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                      {c.type}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label="Edit centre">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(c.id)} aria-label="Delete centre">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{c.address}</p>
                <p className="mt-1 text-sm">
                  {c.contact_person ?? "—"} {c.phone ? `· ${c.phone}` : ""}
                </p>
                {c.supported_brands && <p className="mt-2 text-xs text-muted-foreground">Brands: {c.supported_brands}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="surface-card p-8 text-center">
            <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-display font-bold">No service centres yet</p>
          </div>
        )}

        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit service centre" : "Add service centre"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as ServiceCenterType }))}>
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
            <div className="space-y-1.5">
              <Label htmlFor="c-address">Address</Label>
              <Textarea id="c-address" rows={2} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="c-person">Contact person</Label>
                <Input id="c-person" value={form.contact_person} onChange={(e) => setForm((f) => ({ ...f, contact_person: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-phone">Phone</Label>
                <Input id="c-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-brands">Supported brands</Label>
              <Input id="c-brands" value={form.supported_brands} onChange={(e) => setForm((f) => ({ ...f, supported_brands: e.target.value }))} placeholder="Toyota, Honda, Nissan" />
            </div>
            <Button variant="hero" className="w-full" disabled={save.isPending} onClick={() => save.mutate()}>
              {editing ? "Save changes" : "Add centre"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
