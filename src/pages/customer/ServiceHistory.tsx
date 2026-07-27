import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { History as HistoryIcon } from "lucide-react";
import CustomerLayout from "@/components/CustomerLayout";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { formatLKR } from "@/lib/autoreach";

export default function ServiceHistory() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, vehicles(registration_number, make, model)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const past = (data ?? []).filter((b) => b.status === "Completed" || b.status === "Cancelled");

  return (
    <CustomerLayout title="Service history" subtitle="Past jobs">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : past.length ? (
        <div className="space-y-3">
          {past.map((b) => (
            <Link key={b.id} to={`/booking/${b.id}`} className="surface-card flex flex-wrap items-center justify-between gap-3 p-5 transition-shadow hover:shadow-lift">
              <div>
                <p className="font-display font-bold">{b.service_category}</p>
                <p className="text-sm text-muted-foreground">
                  {b.vehicles?.registration_number} · {new Date(b.created_at).toLocaleDateString("en-GB")} · Ref {b.reference}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-primary">{formatLKR(b.amount_charged)}</span>
                <StatusBadge status={b.status} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="surface-card p-8 text-center">
          <HistoryIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-display font-bold">No completed services yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Once a job wraps up it will show here with the invoice.</p>
        </div>
      )}
    </CustomerLayout>
  );
}
