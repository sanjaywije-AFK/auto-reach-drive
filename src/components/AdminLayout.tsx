import { LayoutDashboard, ClipboardList, Users, Building2, UserCog } from "lucide-react";
import AppLayout, { type NavItem } from "@/components/AppLayout";

const items: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/admin/drivers", label: "Drivers", icon: UserCog },
  { to: "/admin/centers", label: "Centres", icon: Building2 },
  { to: "/admin/customers", label: "CRM", icon: Users },
];

export default function AdminLayout({
  title,
  subtitle = "Operations console",
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <AppLayout items={items} title={title} subtitle={subtitle}>
      {children}
    </AppLayout>
  );
}
