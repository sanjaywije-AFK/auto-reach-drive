import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import Seo from "@/components/Seo";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

export default function AppLayout({
  items,
  title,
  subtitle,
  children,
}: {
  items: NavItem[];
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Seo
        title={`${title} | AutoReach`}
        description={`${title} — manage your AutoReach ${subtitle ? subtitle.toLowerCase() : "account"}: vehicle pickup, servicing and delivery in Colombo.`}
        noindex
      />
      <header className="bg-gradient-brand">
        <div className="container flex items-center justify-between px-4 py-4">
          <Logo onBrand />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-primary-foreground/80 sm:inline">{profile?.name}</span>
            <Button variant="outlineBrand" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
        <div className="container px-4 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/60">{subtitle}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-primary-foreground sm:text-3xl">{title}</h1>
        </div>

        {/* Desktop nav */}
        <nav className="container hidden gap-1 px-4 md:flex">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-background text-primary"
                    : "text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="container px-4 pb-28 pt-6 md:pb-16">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {items.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
