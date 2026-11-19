import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Landmark, Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoGallery } from "@/components/PhotoUploader";
import { BANK_DETAILS, formatLKR } from "@/lib/autoreach";

type Props = {
  booking: {
    id: string;
    reference: string;
    amount_charged: number;
    payment_status: string;
    payment_slip_path: string | null;
    payment_reference: string | null;
    payment_slip_uploaded_at: string | null;
  };
};

export default function BankTransferPayment({ booking }: Props) {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [ref, setRef] = useState(booking.payment_reference ?? "");
  const [busy, setBusy] = useState(false);

  if (booking.payment_status === "Paid") {
    return (
      <div className="rounded-2xl border bg-card p-4 text-sm">
        <p className="font-display font-bold text-primary">Payment received — thank you!</p>
      </div>
    );
  }

  const copy = (v: string) => {
    navigator.clipboard.writeText(v);
    toast.success("Copied");
  };

  const submit = async () => {
    if (!file) return toast.error("Please choose your transfer slip");
    if (file.size > 8 * 1024 * 1024) return toast.error("File must be under 8MB");
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${booking.id}/slip-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("booking-photos").upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;
      const { error } = await supabase
        .from("bookings")
        .update({
          payment_slip_path: path,
          payment_reference: ref.trim().slice(0, 100) || null,
          payment_slip_uploaded_at: new Date().toISOString(),
        })
        .eq("id", booking.id);
      if (error) throw error;
      toast.success("Slip sent. We'll confirm your payment shortly.");
      setFile(null);
      qc.invalidateQueries({ queryKey: ["booking", booking.id] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const rows: [string, string][] = [
    ["Bank", BANK_DETAILS.bank],
    ["Branch", BANK_DETAILS.branch],
    ["Account name", BANK_DETAILS.accountName],
    ["Account number", BANK_DETAILS.accountNumber],
    ["Reference", booking.reference],
  ];

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <Landmark className="h-5 w-5 text-primary" />
        <h2 className="font-display font-bold">Pay by bank transfer</h2>
      </div>
      {booking.amount_charged > 0 && (
        <p className="text-sm">
          Amount to pay: <span className="font-display font-bold text-primary">{formatLKR(booking.amount_charged)}</span>
        </p>
      )}
      <dl className="space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="flex items-center gap-1 font-semibold">
              {v}
              <button type="button" aria-label={`Copy ${k}`} onClick={() => copy(v)} className="text-muted-foreground hover:text-primary">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground">Please use your booking reference when transferring, then upload the slip below.</p>

      {booking.payment_slip_path && (
        <div className="space-y-2 rounded-xl bg-muted p-3 text-sm">
          <p className="font-semibold">Slip received — awaiting confirmation</p>
          <PhotoGallery paths={[booking.payment_slip_path]} />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="slip">{booking.payment_slip_path ? "Replace slip" : "Upload transfer slip"}</Label>
        <Input id="slip" type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <Label htmlFor="pref">Transfer reference (optional)</Label>
        <Input id="pref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Bank reference number" />
        <Button className="w-full" onClick={submit} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Send slip
        </Button>
      </div>
    </div>
  );
}
