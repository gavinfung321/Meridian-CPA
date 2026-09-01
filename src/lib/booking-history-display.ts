import { formatBookingRelativeTime } from "./booking-admin";
import { supabase } from "./supabase";
import type { BookingStatus, UserRole } from "../types/database";

export type BookingHistoryTimelineEntry = {
  id: number;
  label: string;
  actorLabel: string;
  createdAt: string;
  notes: string | null;
};

type BookingHistoryQueryRow = {
  id: number;
  action: string;
  old_status: BookingStatus | null;
  new_status: BookingStatus | null;
  notes: string | null;
  created_at: string;
  changer: {
    role: UserRole;
    first_name: string;
    last_name: string;
  } | null;
};

function adminHistoryActorLabel(changer: BookingHistoryQueryRow["changer"]): string {
  if (!changer) return "System";
  if (changer.role === "admin") {
    const name = `${changer.first_name} ${changer.last_name}`.trim();
    return name ? `${name} (Admin)` : "Admin";
  }
  const name = `${changer.first_name} ${changer.last_name}`.trim();
  return name || "Client";
}

function adminActionLabel(
  action: string,
  oldStatus: BookingStatus | null,
  newStatus: BookingStatus | null,
  changer: BookingHistoryQueryRow["changer"],
): string {
  const isAdmin = changer?.role === "admin";
  if (action === "CREATE") {
    return isAdmin ? "Booking created by admin" : "Booking requested by client";
  }
  if (newStatus === "confirmed") {
    return isAdmin ? "Booking approved" : "Booking confirmed";
  }
  if (newStatus === "rejected") {
    return "Booking rejected";
  }
  if (newStatus === "cancelled") {
    return isAdmin ? "Booking cancelled by admin" : "Booking cancelled by client";
  }
  if (oldStatus !== newStatus && newStatus) {
    return `Status changed to ${newStatus}`;
  }
  return "Booking updated";
}

export async function fetchAdminBookingHistory(
  bookingId: string,
): Promise<BookingHistoryTimelineEntry[]> {
  const { data, error } = await supabase
    .from("booking_history")
    .select(`
      id,
      action,
      old_status,
      new_status,
      notes,
      created_at,
      changer:profiles!booking_history_changed_by_fkey (
        role,
        first_name,
        last_name
      )
    `)
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as BookingHistoryQueryRow[]).map((row) => ({
    id: row.id,
    label: adminActionLabel(row.action, row.old_status, row.new_status, row.changer),
    actorLabel: adminHistoryActorLabel(row.changer),
    createdAt: row.created_at,
    notes: row.notes,
  }));
}

export { formatBookingRelativeTime };
