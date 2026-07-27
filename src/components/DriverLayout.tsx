import { Truck, ClipboardList } from "lucide-react";
import AppLayout, { type NavItem } from "@/components/AppLayout";

const items: NavItem[] = [
  { to: "/driver", label: "My jobs", icon: ClipboardList, end: true },
  { to: "/driver/completed", label: "Completed", icon: Truck },
];

export default function DriverLayout({
  title,
  subtitle = "Driver",
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
