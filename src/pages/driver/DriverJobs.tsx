import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ClipboardList } from "lucide-react";
import DriverLayout from "@/components/DriverLayout";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useProfileMap } from "@/hooks/useProfileMap";
import { ACTIVE_STATUSES } from "@/lib/autoreach";

export function useDriverJobs() {
  return useQuery({
    queryKey: ["driver-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, vehicles(registration_number, make, model), service_centers(name, address)")
        .order("preferred_datetime", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export default function DriverJobs({ completed = false }: { completed?: boolean }) {
  const { data, isLoading } = useDriverJobs();
  const { profileMap } = useProfileMap();

  const jobs = (data ?? []).filter((b) =>
    completed ? b.status === "Completed" || b.status === "Delivered" : ACTIVE_STATUSES.includes(b.status),
  );

  return (
    <DriverLayout title={completed ? "Completed jobs" : "My jobs"}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading jobs...</p>
      ) : jobs.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {jobs.map((b) => (
            <Link key={b.id} to={`/driver/job/${b.id}`} className="surface-card block p-5 transition-shadow hover:shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display font-bold text-primary">{b.vehicles?.registration_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.vehicles?.make} {b.vehicles?.model} · {profileMap.get(b.customer_id)?.name ?? "Customer"}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <p className="mt-3 text-sm">{b.pickup_address}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {b.preferred_datetime ? new Date(b.preferred_datetime).toLocaleString("en-GB") : "Flexible time"}
              </p>
              <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-secondary">
                Open job <ArrowRight className="h-3.5 w-3.5" />
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="surface-card p-8 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-display font-bold">No jobs here</p>
          <p className="mt-1 text-sm text-muted-foreground">Assigned jobs from the operations team will appear here.</p>
        </div>
      )}
    </DriverLayout>
  );
}
