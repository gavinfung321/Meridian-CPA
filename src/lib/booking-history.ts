import { supabase } from "./supabase";
import type { BookingStatus } from "../types/database";

async function logBookingHistory(entry: {
  bookingId: string;
  changedBy: string;
  action: string;
  oldStatus?: BookingStatus | null;
  newStatus?: BookingStatus | null;
  notes?: string | null;
}): Promise<void> {
  const { error } = await supabase.from("booking_history").insert({
    booking_id: entry.bookingId,
    changed_by: entry.changedBy,
    action: entry.action,
    old_status: entry.oldStatus ?? null,
    new_status: entry.newStatus ?? null,
    notes: entry.notes ?? null,
  });

  if (error) {
    console.warn("Failed to log booking history:", error.message);
  }
}

export async function logBookingCreated(
  bookingId: string,
  changedBy: string,
  status: BookingStatus,
): Promise<void> {
  await logBookingHistory({
    bookingId,
    changedBy,
    action: "CREATE",
    oldStatus: null,
    newStatus: status,
  });
}

export async function logBookingStatusChange(
  bookingId: string,
  changedBy: string,
  oldStatus: BookingStatus,
  newStatus: BookingStatus,
  notes?: string | null,
): Promise<void> {
  await logBookingHistory({
    bookingId,
    changedBy,
    action: "STATUS_CHANGE",
    oldStatus,
    newStatus,
    notes: notes ?? null,
  });
}
