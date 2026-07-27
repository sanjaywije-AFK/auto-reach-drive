import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useProfileMap } from "@/hooks/useProfileMap";
import { BOOKING_STATUSES, SERVICE_CATEGORIES, formatLKR } from "@/lib/autoreach";

export default function AdminBookings() {
  const { profileMap } = useProfileMap();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, vehicles(registration_number, make, model), drivers(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const rows = (data ?? []).filter((b) => {
    const customer = profileMap.get(b.customer_id);
    const haystack = `${b.reference} ${customer?.name ?? ""} ${customer?.phone ?? ""} ${b.vehicles?.registration_number ?? ""}`.toLowerCase();
    return (
      haystack.includes(q.toLowerCase()) &&
      (status === "all" || b.status === status) &&
      (category === "all" || b.service_category === category)
    );
  });

  return (
    <AdminLayout title="Bookings">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search ref, customer, plate" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {BOOKING_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Service type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All service types</SelectItem>
              {SERVICE_CATEGORIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading bookings...</p>
        ) : (
          <div className="space-y-2">
            {rows.map((b) => (
              <Link key={b.id} to={`/admin/bookings/${b.id}`} className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 transition-shadow hover:shadow-lift">
                <div className="min-w-0">
                  <p className="font-display font-bold">
                    {b.reference} · {profileMap.get(b.customer_id)?.name ?? "Customer"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {b.service_category} · {b.vehicles?.registration_number ?? "No vehicle"} · Driver: {b.drivers?.name ?? "Unassigned"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatLKR(b.amount_charged)}</span>
                  <StatusBadge status={b.status} />
                </div>
              </Link>
            ))}
            {rows.length === 0 && <p className="surface-card p-8 text-center text-sm text-muted-foreground">No bookings match those filters.</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
