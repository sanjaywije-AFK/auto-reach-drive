import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ShieldCheck, Truck } from "lucide-react";
import Logo from "@/components/Logo";
import Seo from "@/components/Seo";
import PasswordInput from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, homeForRole } from "@/context/AuthContext";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

const COPY = {
  admin: { title: "Admin Console Sign in", sub: "For AutoReach operations staff only.", Icon: ShieldCheck, seo: "Admin Sign in | AutoReach" },
  driver: { title: "Driver Sign in", sub: "See your assigned jobs and update progress.", Icon: Truck, seo: "Driver Sign in | AutoReach" },
};

export default function StaffLogin({ portal }: { portal: "admin" | "driver" }) {
  const navigate = useNavigate();
  const { user, roles, role, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const c = COPY[portal];

  useEffect(() => {
    if (loading || !user || !role) return;
    if (roles.includes(portal)) navigate(`/${portal}`, { replace: true });
    else {
      toast.error(`This account doesn't have ${portal} access. Taking you to your own area.`);
      navigate(homeForRole(role), { replace: true });
    }
  }, [user, role, roles, loading, navigate, portal]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    setBusy(false);
    if (error) toast.error(error.message);
  };

  const other = portal === "admin" ? { to: "/driver/login", label: "Driver sign in" } : { to: "/admin/login", label: "Admin sign in" };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-soft">
      <Seo title={c.seo} description={c.sub} noindex />
      <div className="bg-gradient-brand px-4 py-6">
        <div className="container flex items-center justify-between">
          <Logo onBrand />
          <Button asChild variant="outlineBrand" size="sm">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> Home</Link>
          </Button>
        </div>
      </div>
      <main className="container flex flex-1 items-start justify-center px-4 py-10">
        <div className="w-full max-w-md surface-card p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><c.Icon className="h-5 w-5" /></span>
            <div>
              <h1 className="font-display text-2xl font-bold text-primary">{c.title}</h1>
              <p className="text-sm text-muted-foreground">{c.sub}</p>
            </div>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="st-email">Email</Label>
              <Input id="st-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="st-pass">Password</Label>
              <PasswordInput id="st-pass" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
            </Button>
          </form>
          <div className="mt-6 flex justify-between text-sm">
            <Link to="/auth" className="text-primary hover:underline">Customer sign in</Link>
            <Link to={other.to} className="text-primary hover:underline">{other.label}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
