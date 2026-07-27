import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CustomerProfile = { id: string; name: string; email: string; phone: string | null };

/**
 * `bookings.customer_id` references auth.users, so PostgREST cannot embed profiles.
 * Admins fetch all profiles once and join client-side.
 */
export function useProfileMap() {
  const query = useQuery({
    queryKey: ["profile-map"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id,name,email,phone");
      if (error) throw error;
      const map = new Map<string, CustomerProfile>();
      for (const p of data as CustomerProfile[]) map.set(p.id, p);
      return map;
    },
  });
  return {
    ...query,
    profileMap: query.data ?? new Map<string, CustomerProfile>(),
  };
}
