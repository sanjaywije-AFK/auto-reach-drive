import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
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
  const social = async (provider: "google" | "apple") => {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" });
    if (result.error) toast.error(result.error.message ?? "Sign-in failed. Please try again.");
  };
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
            <h1 className="font-display text-2xl font-bold text-primary">Customer Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">We Pick Up. We Service. We Deliver.</p>

            <div className="mt-6 space-y-3">
              <button type="button" onClick={() => social("google")} className="flex h-11 w-full items-center justify-center gap-[10px] rounded-md border border-[#747775] bg-[#FFFFFF] px-3 text-sm font-medium text-[#1F1F1F] hover:bg-[#F8F8F8]">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.950-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.490-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg> Continue with Google
              </button>
              <button type="button" onClick={() => social("apple")} className="flex h-11 w-full items-center justify-center rounded-md bg-[#000000] px-3 text-[19px] font-medium text-[#FFFFFF] hover:opacity-90" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
                Continue with Apple
              </button>
              <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or use email<span className="h-px flex-1 bg-border" /></div>
            </div>

            <Tabs defaultValue="signin" className="mt-4">
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
                    <PasswordInput id="si-pass" value={form.password} onChange={set("password")} />
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
                    <PasswordInput id="su-pass" value={form.password} onChange={set("password")} />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Staff? <Link to="/driver/login" className="text-primary hover:underline">Driver sign in</Link> ·{" "}
            <Link to="/admin/login" className="text-primary hover:underline">Admin sign in</Link>
          </p>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            By signing up you agree to our <Link to="/terms" className="text-primary hover:underline">Terms</Link>,{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> and{" "}
            <Link to="/refund-policy" className="text-primary hover:underline">Refund Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
