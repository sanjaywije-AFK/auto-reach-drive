import { Car, CalendarPlus, History, MapPinned, User } from "lucide-react";
import AppLayout, { type NavItem } from "@/components/AppLayout";

const items: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: CalendarPlus, end: true },
  { to: "/vehicles", label: "Vehicles", icon: Car },
  { to: "/track", label: "Track", icon: MapPinned },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
];

export default function CustomerLayout({
  title,
  subtitle = "Customer",
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
