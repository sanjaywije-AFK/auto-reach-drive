import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageCircle, Search, Star, Users } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { LIFECYCLE_STATUSES, formatLKR, whatsappLink, type LifecycleStatus } from "@/lib/autoreach";
import { cn } from "@/lib/utils";

type Crm = {
  customer_id: string;
  lifecycle_status: LifecycleStatus;
  last_service_date: string | null;
  next_follow_up_date: string | null;
  notes: string | null;
};

export default function AdminCustomers() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState<Crm>({
    customer_id: "",
    lifecycle_status: "Lead",
    last_service_date: "",
    next_follow_up_date: "",
    notes: "",
  });

  const { data: profiles } = useQuery({
    queryKey: ["profile-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id,name,email,phone").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: crm } = useQuery({
    queryKey: ["crm"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customer_crm").select("*");
      if (error) throw error;
      return data as Crm[];
    },
  });

  const { data: bookings } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("customer_id,amount_charged,status,created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: feedback } = useQuery({
    queryKey: ["all-feedback"],
    queryFn: async () => {
      const { data, error } = await supabase.from("feedback").select("customer_id,rating,comment");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("customer_crm").upsert(
        {
          customer_id: form.customer_id,
          lifecycle_status: form.lifecycle_status,
          last_service_date: form.last_service_date || null,
          next_follow_up_date: form.next_follow_up_date || null,
          notes: form.notes?.trim().slice(0, 1000) || null,
        },
        { onConflict: "customer_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("CRM record saved");
      qc.invalidateQueries({ queryKey: ["crm"] });
      setOpenId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (profiles ?? []).filter((p) =>
    `${p.name} ${p.email} ${p.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );

  const openEditor = (customerId: string) => {
    const existing = crm?.find((c) => c.customer_id === customerId);
    setForm({
      customer_id: customerId,
      lifecycle_status: existing?.lifecycle_status ?? "Lead",
      last_service_date: existing?.last_service_date ?? "",
      next_follow_up_date: existing?.next_follow_up_date ?? "",
      notes: existing?.notes ?? "",
    });
    setOpenId(customerId);
  };

  return (
    <AdminLayout title="Customer CRM">
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search customers" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        {rows.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {rows.map((p) => {
              const record = crm?.find((c) => c.customer_id === p.id);
              const mine = (bookings ?? []).filter((b) => b.customer_id === p.id);
              const spend = mine.filter((b) => b.status === "Completed").reduce((s, b) => s + Number(b.amount_charged ?? 0), 0);
              const ratings = (feedback ?? []).filter((f) => f.customer_id === p.id);
              const avg = ratings.length ? ratings.reduce((s, f) => s + f.rating, 0) / ratings.length : null;
              return (
                <div key={p.id} className="surface-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display font-bold text-primary">{p.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{p.email}</p>
                      {p.phone && <p className="text-sm text-muted-foreground">{p.phone}</p>}
                    </div>
                    <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                      {record?.lifecycle_status ?? "Lead"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-muted p-2">
                      <p className="font-display font-bold">{mine.length}</p>
                      <p className="text-[10px] text-muted-foreground">Bookings</p>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <p className="font-display font-bold">{formatLKR(spend)}</p>
                      <p className="text-[10px] text-muted-foreground">Spend</p>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <p className="inline-flex items-center gap-1 font-display font-bold">
                        {avg ? avg.toFixed(1) : "—"}
                        {avg && <Star className={cn("h-3.5 w-3.5 fill-warning text-warning")} />}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Rating</p>
                    </div>
                  </div>

                  {record?.next_follow_up_date && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Next follow-up: {new Date(record.next_follow_up_date).toLocaleDateString("en-GB")}
                    </p>
                  )}
                  {record?.notes && <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">{record.notes}</p>}

                  <div className="mt-4 flex gap-2">
                    <Button variant="soft" size="sm" onClick={() => openEditor(p.id)}>
                      Edit CRM
                    </Button>
                    {p.phone && (
                      <Button asChild variant="ghost" size="sm">
                        <a href={whatsappLink(`Hi ${p.name}, this is AutoReach.`, p.phone)} target="_blank" rel="noreferrer">
                          <MessageCircle className="h-4 w-4" /> WhatsApp
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="surface-card p-8 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-display font-bold">No customers found</p>
          </div>
        )}
      </div>

      <Dialog open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>CRM record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Lifecycle status</Label>
              <Select value={form.lifecycle_status} onValueChange={(v) => setForm((f) => ({ ...f, lifecycle_status: v as LifecycleStatus }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIFECYCLE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="last">Last service date</Label>
                <Input id="last" type="date" value={form.last_service_date ?? ""} onChange={(e) => setForm((f) => ({ ...f, last_service_date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="next">Next follow-up</Label>
                <Input id="next" type="date" value={form.next_follow_up_date ?? ""} onChange={(e) => setForm((f) => ({ ...f, next_follow_up_date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="crm-notes">Notes</Label>
              <Textarea id="crm-notes" rows={3} value={form.notes ?? ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <Button variant="hero" className="w-full" disabled={save.isPending} onClick={() => save.mutate()}>
              Save CRM record
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
