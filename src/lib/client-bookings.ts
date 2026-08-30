import { countActiveBookings } from "./session-admin";
import { supabase } from "./supabase";
import type { BookingStatus } from "../types/database";

export type ClientBookingRow = {
  id: string;
  status: BookingStatus;
  cancel_reason: string | null;
  created_at: string;
  session: {
    id: string;
    title: string;
    start_time: string;
    location: string;
    price: number;
    is_cancelled: boolean;
    bookings: Array<{ status: string }> | null;
  } | null;
};

export type ClientDashboardStats = {
  upcomingCount: number;
  pendingCount: number;
  completedCount: number;
  nextBooking: ClientBookingRow | null;
};

export async function fetchClientBookings(userId: string): Promise<ClientBookingRow[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      cancel_reason,
      created_at,
      session:sessions!bookings_session_id_fkey (
        id,
        title,
        start_time,
        location,
        price,
        is_cancelled,
        bookings ( status, user_id )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ClientBookingRow[];
}

export function computeClientDashboardStats(
  bookings: ClientBookingRow[],
): ClientDashboardStats {
  const now = Date.now();

  const upcoming = bookings.filter((booking) => {
    if (booking.status !== "pending" && booking.status !== "confirmed") return false;
    const start = booking.session?.start_time;
    return start ? new Date(start).getTime() >= now : false;
  });

  const pendingCount = bookings.filter((booking) => booking.status === "pending").length;

  const completedCount = bookings.filter((booking) => {
    if (booking.status === "confirmed") {
      const start = booking.session?.start_time;
      return start ? new Date(start).getTime() < now : false;
    }
    return booking.status === "cancelled" || booking.status === "rejected";
  }).length;

  const nextBooking =
    [...upcoming].sort(
      (a, b) =>
        new Date(a.session?.start_time ?? 0).getTime() -
        new Date(b.session?.start_time ?? 0).getTime(),
    )[0] ?? null;

  return {
    upcomingCount: upcoming.length,
    pendingCount,
    completedCount,
    nextBooking,
  };
}

async function assertSessionBookable(sessionId: string, userId: string): Promise<void> {
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select(`
      id,
      start_time,
      max_slots,
      is_cancelled,
      bookings ( status, user_id )
    `)
    .eq("id", sessionId)
    .single();

  if (sessionError) throw sessionError;
  if (!session || session.is_cancelled) {
    throw new Error("This session is no longer available.");
  }

  if (new Date(session.start_time).getTime() <= Date.now()) {
    throw new Error("This session has already started.");
  }

  const bookings = session.bookings ?? [];
  const activeCount = countActiveBookings(bookings);
  if (activeCount >= session.max_slots) {
    throw new Error("This session is fully booked.");
  }

  const alreadyBooked = bookings.some(
    (booking) =>
      booking.user_id === userId &&
      (booking.status === "pending" || booking.status === "confirmed"),
  );
  if (alreadyBooked) {
    throw new Error("You already have a booking for this session.");
  }
}

export async function createClientBooking(
  sessionId: string,
  userId: string,
): Promise<void> {
  await assertSessionBookable(sessionId, userId);

  const { error } = await supabase.from("bookings").insert({
    session_id: sessionId,
    user_id: userId,
    status: "pending",
  });

  if (error) throw error;
}

export async function cancelClientBooking(
  bookingId: string,
  userId: string,
  reason: string,
): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancel_reason: reason.trim(),
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("user_id", userId)
    .in("status", ["pending", "confirmed"]);

  if (error) throw error;
}

export async function fetchSessionTitle(sessionId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("title")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) throw error;
  return data?.title ?? null;
}
