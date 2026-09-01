import { ADMIN_BOOKING_SELECT, type AdminBookingRow } from "./booking-admin";
import { getDisplayName } from "./profile";
import { supabase } from "./supabase";
import type { Profile, UserRole, UserStatus } from "../types/database";

export type ProfileStatusFilter = "all" | UserStatus;

export const PROFILE_STATUS_FILTER_OPTIONS: Array<{
  id: ProfileStatusFilter;
  label: string;
}> = [
  { id: "all", label: "All statuses" },
  { id: "active", label: "Active" },
  { id: "banned", label: "Banned" },
];

export function filterProfilesBySearch(profiles: Profile[], query: string): Profile[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return profiles;

  return profiles.filter((profile) => {
    const displayName = getDisplayName(
      profile.first_name,
      profile.last_name,
      profile.full_name,
    ).toLowerCase();
    const email = profile.email.toLowerCase();
    return displayName.includes(normalized) || email.includes(normalized);
  });
}

export function filterProfilesByStatus(
  profiles: Profile[],
  statusFilter: ProfileStatusFilter,
): Profile[] {
  if (statusFilter === "all") return profiles;
  return profiles.filter((profile) => profile.status === statusFilter);
}

export async function updateProfileRole(
  profileId: string,
  role: Extract<UserRole, "user" | "client">,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", profileId);

  return { error: error?.message ?? null };
}

export async function fetchProfileBookingCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("bookings").select("user_id");

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    if (!row.user_id) continue;
    counts[row.user_id] = (counts[row.user_id] ?? 0) + 1;
  }

  return counts;
}

export async function fetchUserAdminBookings(userId: string): Promise<AdminBookingRow[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(ADMIN_BOOKING_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdminBookingRow[];
}

export function getRoleChangeLabel(
  currentRole: UserRole,
  nextRole: Extract<UserRole, "user" | "client">,
): string {
  if (currentRole === "user" && nextRole === "client") {
    return "Promote to client";
  }
  if (currentRole === "client" && nextRole === "user") {
    return "Demote to user";
  }
  return "Change role";
}
