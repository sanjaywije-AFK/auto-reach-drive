import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, homeForRole } from "@/context/AuthContext";

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

const signUpSchema = signInSchema.extend({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z.string().trim().min(9, "Enter a valid phone number").max(20),
});

export default function Auth() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  useEffect(() => {
    if (!loading && user) navigate(homeForRole(role), { replace: true });
  }, [user, role, loading, navigate]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const signIn = async (email: string, password: string) => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back to AutoReach");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signInSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    await signIn(parsed.data.email, parsed.data.password);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name: parsed.data.name, phone: parsed.data.phone, role: "customer" },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — welcome to AutoReach!");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-soft">
      <Seo
        title="Sign in or Create an Account | AutoReach"
        description="Sign in to AutoReach to book vehicle pickup and servicing, track your car live and view your service history in Colombo."
      />
      <div className="bg-gradient-brand px-4 py-6">
        <div className="container flex items-center justify-between">
          <Logo onBrand />
          <Button asChild variant="outlineBrand" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          </Button>
        </div>
      </div>

      <main className="container flex flex-1 items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="surface-card p-6">
            <h1 className="font-display text-2xl font-bold text-primary">Welcome to AutoReach</h1>
            <p className="mt-1 text-sm text-muted-foreground">We Pick Up. We Service. We Deliver.</p>

            <Tabs defaultValue="signin" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="si-email">Email</Label>
                    <Input id="si-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="si-pass">Password</Label>
                    <Input id="si-pass" type="password" value={form.password} onChange={set("password")} />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="su-name">Full name</Label>
                    <Input id="su-name" value={form.name} onChange={set("name")} placeholder="Nimal Perera" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" type="email" value={form.email} onChange={set("email")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-phone">Mobile number</Label>
                    <Input id="su-phone" value={form.phone} onChange={set("phone")} placeholder="077 123 4567" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-pass">Password</Label>
                    <Input id="su-pass" type="password" value={form.password} onChange={set("password")} />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </main>
    </div>
  );
}
