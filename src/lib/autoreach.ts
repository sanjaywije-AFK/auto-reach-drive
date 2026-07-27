import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type ServiceCategory = Database["public"]["Enums"]["service_category"];
export type ServiceCenterType = Database["public"]["Enums"]["service_center_type"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type PaymentMethod = Database["public"]["Enums"]["payment_method"];
export type LifecycleStatus = Database["public"]["Enums"]["lifecycle_status"];
export type AvailabilityStatus = Database["public"]["Enums"]["availability_status"];

export const BOOKING_STATUSES: BookingStatus[] = [
  "Booking Requested",
  "Booking Confirmed",
  "Driver Assigned",
  "On the Way to Pickup",
  "Vehicle Picked Up",
  "At Service Center",
  "Service In Progress",
  "Ready for Delivery",
  "Out for Delivery",
  "Delivered",
  "Completed",
  "Cancelled",
];

/** Ordered timeline shown to customers (excludes Cancelled). */
export const TIMELINE_STATUSES: BookingStatus[] = BOOKING_STATUSES.filter((s) => s !== "Cancelled");

export const DRIVER_STATUSES: BookingStatus[] = [
  "On the Way to Pickup",
  "Vehicle Picked Up",
  "At Service Center",
  "Service In Progress",
  "Ready for Delivery",
  "Out for Delivery",
  "Delivered",
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Pickup & Service",
  "Doorstep Minor Maintenance",
  "Emergency Assistance",
  "Vehicle Inspection",
];

export const SERVICE_CENTER_TYPES: ServiceCenterType[] = ["Authorized", "Trusted Partner", "Customer Preferred"];
export const PAYMENT_STATUSES: PaymentStatus[] = ["Pending", "Paid", "Partially Paid"];
export const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "Bank Transfer", "Online Payment"];
export const LIFECYCLE_STATUSES: LifecycleStatus[] = ["Lead", "First-Time Customer", "Repeat Customer", "VIP Customer"];
export const AVAILABILITY_STATUSES: AvailabilityStatus[] = ["Available", "On Job", "Off Duty"];

export const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];

export const ACTIVE_STATUSES: BookingStatus[] = BOOKING_STATUSES.filter(
  (s) => s !== "Completed" && s !== "Cancelled",
);

export const CATEGORY_PRICING: Record<ServiceCategory, { intro?: number; min: number; max: number; blurb: string }> = {
  "Pickup & Service": {
    intro: 1500,
    min: 2000,
    max: 4000,
    blurb: "Rs. 1,500 introductory offer (standard Rs. 2,000 – 4,000)",
  },
  "Doorstep Minor Maintenance": { min: 1000, max: 2500, blurb: "Rs. 1,000 – 2,500 depending on the work needed" },
  "Emergency Assistance": { min: 1500, max: 2500, blurb: "Battery jump start & roadside help, Rs. 1,500 – 2,500" },
  "Vehicle Inspection": { min: 1500, max: 3000, blurb: "Full inspection visit, Rs. 1,500 – 3,000" },
};

export const SERVICE_MENU = [
  { name: "Pickup & Service", price: "Rs. 1,500 intro / Rs. 2,000 – 4,000" },
  { name: "Doorstep Minor Maintenance", price: "Rs. 1,000 – 2,500" },
  { name: "Battery Jump Start", price: "Rs. 1,500 – 2,500" },
  { name: "Fluid Top-up Visit", price: "Rs. 1,000 – 2,000" },
  { name: "Inspection Visit", price: "Rs. 1,500 – 3,000" },
];

export const WHATSAPP_NUMBER = "94770000000";
export const whatsappLink = (message: string, phone = WHATSAPP_NUMBER) =>
  `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;

export const formatLKR = (value: number | null | undefined) =>
  `Rs. ${Number(value ?? 0).toLocaleString("en-LK", { maximumFractionDigits: 2 })}`;

export const statusTone = (status: BookingStatus): "muted" | "info" | "warn" | "success" | "danger" => {
  if (status === "Cancelled") return "danger";
  if (status === "Completed" || status === "Delivered") return "success";
  if (status === "Booking Requested") return "muted";
  if (status === "Ready for Delivery" || status === "Out for Delivery") return "warn";
  return "info";
};

export const statusIndex = (status: BookingStatus) => TIMELINE_STATUSES.indexOf(status);
