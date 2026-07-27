import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { LogOut, MessageCircle } from "lucide-react";
import CustomerLayout from "@/components/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { whatsappLink } from "@/lib/autoreach";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  phone: z.string().trim().min(9, "Enter a valid phone number").max(20),
});

export default function Profile() {
  const { user, profile, refresh, signOut } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    setForm({ name: profile?.name ?? "", phone: profile?.phone ?? "" });
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user!.id);
      if (error) throw error;
      await refresh();
    },
    onSuccess: () => toast.success("Profile updated"),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <CustomerLayout title="My profile" subtitle="Account">
      <div className="mx-auto max-w-md space-y-4">
        <div className="surface-card space-y-4 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Mobile number</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile?.email ?? ""} disabled />
          </div>
          <Button variant="hero" className="w-full" disabled={save.isPending} onClick={() => save.mutate()}>
            Save changes
          </Button>
        </div>

        <div className="surface-card space-y-3 p-6">
          <p className="font-display font-bold">Need help?</p>
          <Button asChild variant="soft" className="w-full">
            <a href={whatsappLink("Hi AutoReach, I need some help.")} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> Contact support on WhatsApp
            </a>
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              await signOut();
              navigate("/", { replace: true });
            }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}
