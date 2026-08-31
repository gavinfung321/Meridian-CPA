import { supabase } from "./supabase";
import type { Session } from "../types/database";

export type ClientCalendarSession = Session & {
  session_type: { name: string; category: { name: string } | null } | null;
  bookings: Array<{ status: string }> | null;
};

export async function fetchClientCalendarSessions(): Promise<ClientCalendarSession[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
      session_type:session_types (
        name,
        category:categories ( name )
      ),
      bookings ( status )
    `)
    .eq("is_cancelled", false)
    .gte("start_time", now)
    .order("start_time", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ClientCalendarSession[];
}
