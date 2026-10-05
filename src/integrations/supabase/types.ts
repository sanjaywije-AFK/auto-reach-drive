export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      booking_status_updates: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          note: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_by_user_id: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          note?: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_by_user_id?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          note?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_updates_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          additional_charges: number
          admin_notes: string | null
          amount_charged: number
          assigned_driver_id: string | null
          assigned_service_center_id: string | null
          created_at: string
          customer_id: string
          discount: number
          dropoff_address: string | null
          estimated_price: number
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          photos: string[]
          pickup_address: string
          pickup_fee: number
          pickup_map_link: string | null
          preferred_datetime: string | null
          preferred_service_center_type: Database["public"]["Enums"]["service_center_type"]
          profit: number | null
          reference: string
          service_category: Database["public"]["Enums"]["service_category"]
          service_cost: number
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          additional_charges?: number
          admin_notes?: string | null
          amount_charged?: number
          assigned_driver_id?: string | null
          assigned_service_center_id?: string | null
          created_at?: string
          customer_id: string
          discount?: number
          dropoff_address?: string | null
          estimated_price?: number
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          photos?: string[]
          pickup_address: string
          pickup_fee?: number
          pickup_map_link?: string | null
          preferred_datetime?: string | null
          preferred_service_center_type?: Database["public"]["Enums"]["service_center_type"]
          profit?: number | null
          reference?: string
          service_category: Database["public"]["Enums"]["service_category"]
          service_cost?: number
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          additional_charges?: number
          admin_notes?: string | null
          amount_charged?: number
          assigned_driver_id?: string | null
          assigned_service_center_id?: string | null
          created_at?: string
          customer_id?: string
          discount?: number
          dropoff_address?: string | null
          estimated_price?: number
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          photos?: string[]
          pickup_address?: string
          pickup_fee?: number
          pickup_map_link?: string | null
          preferred_datetime?: string | null
          preferred_service_center_type?: Database["public"]["Enums"]["service_center_type"]
          profit?: number | null
          reference?: string
          service_category?: Database["public"]["Enums"]["service_category"]
          service_cost?: number
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_assigned_service_center_id_fkey"
            columns: ["assigned_service_center_id"]
            isOneToOne: false
            referencedRelation: "service_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_crm: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          last_service_date: string | null
          lifecycle_status: Database["public"]["Enums"]["lifecycle_status"]
          next_follow_up_date: string | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          last_service_date?: string | null
          lifecycle_status?: Database["public"]["Enums"]["lifecycle_status"]
          next_follow_up_date?: string | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          last_service_date?: string | null
          lifecycle_status?: Database["public"]["Enums"]["lifecycle_status"]
          next_follow_up_date?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      driver_private: {
        Row: {
          created_at: string
          driver_id: string
          license_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          driver_id: string
          license_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          driver_id?: string
          license_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_private_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          availability_status: Database["public"]["Enums"]["availability_status"]
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          availability_status?: Database["public"]["Enums"]["availability_status"]
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          availability_status?: Database["public"]["Enums"]["availability_status"]
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          rating: number
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          rating: number
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "feedback_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          id: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_centers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          supported_brands: string | null
          type: Database["public"]["Enums"]["service_center_type"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          supported_brands?: string | null
          type?: Database["public"]["Enums"]["service_center_type"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          supported_brands?: string | null
          type?: Database["public"]["Enums"]["service_center_type"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string
          customer_id: string
          fuel_type: string | null
          id: string
          make: string
          model: string
          notes: string | null
          owner_name: string
          registration_number: string
          updated_at: string
          year: number | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          fuel_type?: string | null
          id?: string
          make?: string
          model?: string
          notes?: string | null
          owner_name?: string
          registration_number: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          fuel_type?: string | null
          id?: string
          make?: string
          model?: string
          notes?: string | null
          owner_name?: string
          registration_number?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_booking_photo: { Args: { _folder: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_my_job: { Args: { _booking_driver: string }; Returns: boolean }
    }
    Enums: {
      app_role: "customer" | "admin" | "driver"
      availability_status: "Available" | "On Job" | "Off Duty"
      booking_status:
        | "Booking Requested"
        | "Booking Confirmed"
        | "Driver Assigned"
        | "On the Way to Pickup"
        | "Vehicle Picked Up"
        | "At Service Center"
        | "Service In Progress"
        | "Ready for Delivery"
        | "Out for Delivery"
        | "Delivered"
        | "Completed"
        | "Cancelled"
      lifecycle_status:
        | "Lead"
        | "First-Time Customer"
        | "Repeat Customer"
        | "VIP Customer"
      payment_method: "Cash" | "Bank Transfer" | "Online Payment"
      payment_status: "Pending" | "Paid" | "Partially Paid"
      service_category:
        | "Pickup & Service"
        | "Doorstep Minor Maintenance"
        | "Emergency Assistance"
        | "Vehicle Inspection"
      service_center_type:
        | "Authorized"
        | "Trusted Partner"
        | "Customer Preferred"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "admin", "driver"],
      availability_status: ["Available", "On Job", "Off Duty"],
      booking_status: [
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
      ],
      lifecycle_status: [
        "Lead",
        "First-Time Customer",
        "Repeat Customer",
        "VIP Customer",
      ],
      payment_method: ["Cash", "Bank Transfer", "Online Payment"],
      payment_status: ["Pending", "Paid", "Partially Paid"],
      service_category: [
        "Pickup & Service",
        "Doorstep Minor Maintenance",
        "Emergency Assistance",
        "Vehicle Inspection",
      ],
      service_center_type: [
        "Authorized",
        "Trusted Partner",
        "Customer Preferred",
      ],
    },
  },
} as const
