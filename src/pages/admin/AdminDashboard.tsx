import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, TrendingUp, Users, Wallet } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useProfileMap } from "@/hooks/useProfileMap";
import { ACTIVE_STATUSES, formatLKR } from "@/lib/autoreach";

export default function AdminDashboard() {
  const { profileMap } = useProfileMap();

  const { data: bookings } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, vehicles(registration_number)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: drivers } = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("drivers").select("*");
      if (error) throw error;
      return data;
    },
  });

  const all = bookings ?? [];
  const active = all.filter((b) => ACTIVE_STATUSES.includes(b.status));
  const completed = all.filter((b) => b.status === "Completed");
  const revenue = completed.reduce((s, b) => s + Number(b.amount_charged ?? 0), 0);
  const profit = completed.reduce((s, b) => s + Number(b.profit ?? 0), 0);

  const stats = [
    { label: "Active jobs", value: String(active.length), icon: ClipboardList },
    { label: "Completed", value: String(completed.length), icon: TrendingUp },
    { label: "Revenue", value: formatLKR(revenue), icon: Wallet },
    { label: "Drivers available", value: String((drivers ?? []).filter((d) => d.availability_status === "Available").length), icon: Users },
  ];

  return (
    <AdminLayout title="Operations overview">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="surface-card p-4">
              <s.icon className="h-5 w-5 text-secondary" />
              <p className="mt-3 font-display text-xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="surface-card p-4">
          <p className="text-sm text-muted-foreground">Estimated profit from completed jobs</p>
          <p className="font-display text-2xl font-bold text-success">{formatLKR(profit)}</p>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Latest bookings</h2>
            <Link to="/admin/bookings" className="text-sm font-semibold text-secondary">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {all.slice(0, 6).map((b) => (
              <Link key={b.id} to={`/admin/bookings/${b.id}`} className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 transition-shadow hover:shadow-lift">
                <div>
                  <p className="font-semibold">
                    {b.reference} · {profileMap.get(b.customer_id)?.name ?? "Customer"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {b.service_category} · {b.vehicles?.registration_number ?? "No vehicle"}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
