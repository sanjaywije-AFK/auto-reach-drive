import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarPlus, Car, History, MapPinned, Tag } from "lucide-react";
import CustomerLayout from "@/components/CustomerLayout";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ACTIVE_STATUSES, formatLKR } from "@/lib/autoreach";

const actions = [
  { to: "/book", label: "Book a Service", body: "Pickup, doorstep or inspection", icon: CalendarPlus },
  { to: "/track", label: "Track My Vehicle", body: "Live job progress", icon: MapPinned },
  { to: "/history", label: "Service History", body: "Past jobs & invoices", icon: History },
  { to: "/vehicles", label: "My Vehicles", body: "Manage your garage", icon: Car },
];

export default function CustomerDashboard() {
  const { user, profile } = useAuth();

  const { data: bookings } = useQuery({
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

  const active = (bookings ?? []).filter((b) => ACTIVE_STATUSES.includes(b.status));
  const firstName = (profile?.name || "there").split(" ")[0];

  return (
    <CustomerLayout title={`Welcome, ${firstName}`} subtitle="Customer dashboard">
      <div className="space-y-6">
        {active.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-lg font-bold">Active booking{active.length > 1 ? "s" : ""}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {active.map((b) => (
                <Link key={b.id} to={`/booking/${b.id}`} className="surface-card block p-5 transition-shadow hover:shadow-lift">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display font-bold">{b.service_category}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {b.vehicles?.registration_number} · {b.vehicles?.make} {b.vehicles?.model}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ref {b.reference}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-secondary">
                      Track <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 font-display text-lg font-bold">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {actions.map((a) => (
              <Link key={a.to} to={a.to} className="surface-card p-4 transition-shadow hover:shadow-lift">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
                  <a.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-display text-sm font-bold">{a.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-gradient-brand p-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning px-2.5 py-1 text-xs font-bold text-warning-foreground">
            <Tag className="h-3 w-3" /> LAUNCH OFFER
          </span>
          <h2 className="mt-3 font-display text-xl font-bold text-primary-foreground">
            Pickup &amp; drop for {formatLKR(1500)}
          </h2>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Limited time introductory rate on Pickup &amp; Service bookings in Colombo and suburbs.
          </p>
          <Button asChild variant="onBrand" className="mt-4">
            <Link to="/book">Claim the offer</Link>
          </Button>
        </section>

        {bookings && bookings.length === 0 && (
          <div className="surface-card p-8 text-center">
            <Car className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-display font-bold">No bookings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Book your first pickup and we&apos;ll handle the rest.</p>
            <Button asChild variant="hero" className="mt-4">
              <Link to="/book">Book a Service</Link>
            </Button>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
