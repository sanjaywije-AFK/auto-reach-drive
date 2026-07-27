import { cn } from "@/lib/utils";
import { statusTone, type BookingStatus } from "@/lib/autoreach";

const toneClass = {
  muted: "bg-muted text-muted-foreground",
  info: "bg-accent text-accent-foreground",
  warn: "bg-warning/15 text-warning-foreground",
  success: "bg-success/15 text-success",
  danger: "bg-destructive/10 text-destructive",
} as const;

export default function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClass[statusTone(status)],
        className,
      )}
    >
      {status}
    </span>
  );
}
