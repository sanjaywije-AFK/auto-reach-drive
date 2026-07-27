import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPinned } from "lucide-react";
import CustomerLayout from "@/components/CustomerLayout";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ACTIVE_STATUSES } from "@/lib/autoreach";

export default function TrackVehicle() {
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

  const active = (data ?? []).filter((b) => ACTIVE_STATUSES.includes(b.status));

  return (
    <CustomerLayout title="Track my vehicle" subtitle="Live status">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : active.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {active.map((b) => (
            <Link key={b.id} to={`/booking/${b.id}`} className="surface-card block p-5 transition-shadow hover:shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display font-bold">{b.vehicles?.registration_number}</p>
                  <p className="text-sm text-muted-foreground">{b.service_category}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-secondary">
                View timeline <ArrowRight className="h-3.5 w-3.5" />
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="surface-card p-8 text-center">
          <MapPinned className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-display font-bold">Nothing in progress</p>
          <p className="mt-1 text-sm text-muted-foreground">Your active jobs will appear here once booked.</p>
          <Button asChild variant="hero" className="mt-4">
            <Link to="/book">Book a Service</Link>
          </Button>
        </div>
      )}
    </CustomerLayout>
  );
}
