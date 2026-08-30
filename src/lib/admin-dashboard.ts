import { countActiveBookings, formatPrice } from "./session-admin";
import { getDisplayName } from "./profile";
import { supabase } from "./supabase";
import type { BookingStatus } from "../types/database";

export type AdminDashboardMetrics = {
  sessionOccupancyPct: number;
  projectedRevenue: number;
  projectedRevenueLabel: string;
  activeClients: number;
  pendingBookings: number;
  totalBookings: number;
  upcomingSessions: number;
};

export type CategoryBookingShare = {
  id: string;
  name: string;
  count: number;
  pct: number;
};

export type AdminRecentActivity = {
  id: string;
  message: string;
  timestamp: string;
  status: BookingStatus;
};

type BookingMetricsRow = {
  id: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  user: {
    first_name: string;
    last_name: string;
  } | null;
  session: {
    title: string;
    price: number;
    start_time: string;
    session_type: {
      category: { id: string; name: string } | null;
    } | null;
  } | null;
};

type SessionOccupancyRow = {
  id: string;
  max_slots: number;
  start_time: string;
  bookings: Array<{ status: string }> | null;
};

function activityMessage(row: BookingMetricsRow): string {
  const client = row.user
    ? getDisplayName(row.user.first_name, row.user.last_name, "")
    : "A client";
  const sessionTitle = row.session?.title ?? "a session";

  switch (row.status) {
    case "pending":
      return `New booking request — ${client} · ${sessionTitle}`;
    case "confirmed":
      return `Booking confirmed — ${client} · ${sessionTitle}`;
    case "cancelled":
      return `Booking cancelled — ${client} · ${sessionTitle}`;
    case "rejected":
      return `Booking rejected — ${client} · ${sessionTitle}`;
  }
}

export async function fetchAdminDashboardMetrics(): Promise<{
  metrics: AdminDashboardMetrics;
  categoryShares: CategoryBookingShare[];
  recentActivity: AdminRecentActivity[];
}> {
  const now = new Date().toISOString();

  const [bookingsResult, sessionsResult, clientsResult] = await Promise.all([
    supabase
      .from("bookings")
      .select(`
        id,
        status,
        created_at,
        updated_at,
        user:profiles!bookings_user_id_fkey ( first_name, last_name ),
        session:sessions!bookings_session_id_fkey (
          title,
          price,
          start_time,
          session_type:session_types (
            category:categories ( id, name )
          )
        )
      `)
      .order("updated_at", { ascending: false }),
    supabase
      .from("sessions")
      .select(`
        id,
        max_slots,
        start_time,
        bookings ( status )
      `)
      .eq("is_cancelled", false)
      .gte("start_time", now),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "client")
      .eq("status", "active"),
  ]);

  if (bookingsResult.error) throw bookingsResult.error;
  if (sessionsResult.error) throw sessionsResult.error;
  if (clientsResult.error) throw clientsResult.error;

  const bookings = (bookingsResult.data ?? []) as BookingMetricsRow[];
  const sessions = (sessionsResult.data ?? []) as SessionOccupancyRow[];

  let totalSlots = 0;
  let bookedSlots = 0;
  for (const session of sessions) {
    totalSlots += session.max_slots;
    bookedSlots += countActiveBookings(session.bookings);
  }

  const sessionOccupancyPct =
    totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

  const projectedRevenue = bookings
    .filter((row) => row.status === "confirmed" || row.status === "pending")
    .reduce((sum, row) => sum + Number(row.session?.price ?? 0), 0);

  const pendingBookings = bookings.filter((row) => row.status === "pending").length;

  const categoryCounts = new Map<string, { id: string; name: string; count: number }>();
  for (const row of bookings) {
    if (row.status !== "pending" && row.status !== "confirmed") continue;
    const category = row.session?.session_type?.category;
    if (!category) continue;
    const existing = categoryCounts.get(category.id);
    if (existing) existing.count += 1;
    else categoryCounts.set(category.id, { id: category.id, name: category.name, count: 1 });
  }

  const totalCategoryBookings = [...categoryCounts.values()].reduce(
    (sum, item) => sum + item.count,
    0,
  );

  const categoryShares: CategoryBookingShare[] = [...categoryCounts.values()]
    .map((item) => ({
      ...item,
      pct:
        totalCategoryBookings > 0
          ? Math.round((item.count / totalCategoryBookings) * 100)
          : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentActivity: AdminRecentActivity[] = bookings.slice(0, 8).map((row) => ({
    id: row.id,
    message: activityMessage(row),
    timestamp: row.updated_at ?? row.created_at,
    status: row.status,
  }));

  return {
    metrics: {
      sessionOccupancyPct,
      projectedRevenue,
      projectedRevenueLabel: formatPrice(projectedRevenue),
      activeClients: clientsResult.count ?? 0,
      pendingBookings,
      totalBookings: bookings.length,
      upcomingSessions: sessions.length,
    },
    categoryShares,
    recentActivity,
  };
}

export async function fetchAdminPendingBookingsCount(): Promise<number> {
  const { count, error } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) throw error;
  return count ?? 0;
}
