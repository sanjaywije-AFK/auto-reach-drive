import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Logo({
  className,
  onBrand = false,
  showTagline = false,
}: {
  className?: string;
  onBrand?: boolean;
  showTagline?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          onBrand ? "bg-primary-foreground/15 text-primary-foreground" : "bg-gradient-brand text-primary-foreground",
        )}
      >
        <Car className="h-5 w-5" />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-lg font-extrabold tracking-tight",
            onBrand ? "text-primary-foreground" : "text-primary",
          )}
        >
          AutoReach
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 block text-[10px] font-semibold uppercase tracking-[0.14em]",
              onBrand ? "text-primary-foreground/70" : "text-muted-foreground",
            )}
          >
            We Pick Up. We Service. We Deliver.
          </span>
        )}
      </span>
    </div>
  );
}
