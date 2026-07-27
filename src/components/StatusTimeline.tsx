import { TIMELINE_STATUSES, statusIndex, type BookingStatus } from "@/lib/autoreach";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatusTimeline({
  status,
  updates,
}: {
  status: BookingStatus;
  updates?: { status: string; note: string | null; created_at: string }[];
}) {
  const current = statusIndex(status);
  const cancelled = status === "Cancelled";

  const noteFor = (s: string) => updates?.find((u) => u.status === s);

  return (
    <ol className="relative space-y-0">
      {TIMELINE_STATUSES.map((s, i) => {
        const done = !cancelled && i <= current;
        const isCurrent = !cancelled && i === current;
        const update = noteFor(s);
        return (
          <li key={s} className="relative flex gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                  isCurrent && "ring-4 ring-secondary/25",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              {i < TIMELINE_STATUSES.length - 1 && (
                <span className={cn("w-0.5 flex-1", done ? "bg-primary" : "bg-border")} />
              )}
            </div>
            <div className="-mt-0.5 pb-1">
              <p className={cn("text-sm font-semibold", done ? "text-foreground" : "text-muted-foreground")}>{s}</p>
              {update && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(update.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  {update.note ? ` — ${update.note}` : ""}
                </p>
              )}
            </div>
          </li>
        );
      })}
      {cancelled && (
        <li className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          This booking was cancelled.
        </li>
      )}
    </ol>
  );
}
