import { countActiveBookings, formatPrice } from "./session-admin";
import { fetchAdminDashboardMetrics } from "./admin-dashboard";
import { supabase } from "./supabase";
import type { AdminDashboardMetrics } from "./admin-dashboard";

export type ReportingChartRow = {
  name: string;
  value: number;
  label: string;
};

export type AdminReportingData = {
  metrics: AdminDashboardMetrics;
  activeClients: number;
  bannedClients: number;
  bookingsByCategory: ReportingChartRow[];
  revenueByCategory: ReportingChartRow[];
  bookingsByType: ReportingChartRow[];
  upcomingOccupancy: ReportingChartRow[];
};

type BookingChartRow = {
  status: string;
  session: {
    price: number;
    session_type: {
      name: string;
      category: { name: string } | null;
    } | null;
  } | null;
};

type SessionOccupancyRow = {
  title: string;
  max_slots: number;
  session_type: {
    name: string;
    category: { name: string } | null;
  } | null;
  bookings: Array<{ status: string }> | null;
};

function categoryLabel(row: BookingChartRow): string {
  return row.session?.session_type?.category?.name ?? "Uncategorised";
}

function typeLabel(row: BookingChartRow): string {
  const type = row.session?.session_type;
  if (type?.category?.name && type.name) return `${type.category.name} · ${type.name}`;
  return type?.name ?? "Other";
}

function aggregateCount(rows: BookingChartRow[], labelFn: (row: BookingChartRow) => string): ReportingChartRow[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const name = labelFn(row);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value, label: `${value}` }))
    .sort((a, b) => b.value - a.value);
}

function aggregateRevenue(rows: BookingChartRow[], labelFn: (row: BookingChartRow) => string): ReportingChartRow[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const name = labelFn(row);
    totals.set(name, (totals.get(name) ?? 0) + Number(row.session?.price ?? 0));
  }
  return [...totals.entries()]
    .map(([name, value]) => ({
      name,
      value,
      label: formatPrice(value),
    }))
    .sort((a, b) => b.value - a.value);
}

export async function fetchAdminReportingData(): Promise<AdminReportingData> {
  const now = new Date().toISOString();

  const [dashboard, bookingsResult, sessionsResult, activeClientsResult, bannedClientsResult] =
    await Promise.all([
      fetchAdminDashboardMetrics(),
      supabase
        .from("bookings")
        .select(`
          status,
          session:sessions!bookings_session_id_fkey (
            price,
            session_type:session_types (
              name,
              category:categories ( name )
            )
          )
        `),
      supabase
        .from("sessions")
        .select(`
          title,
          max_slots,
          session_type:session_types (
            name,
            category:categories ( name )
          ),
          bookings ( status )
        `)
        .eq("is_cancelled", false)
        .gte("start_time", now)
        .order("start_time", { ascending: true })
        .limit(12),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "client")
        .eq("status", "active"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .in("role", ["user", "client"])
        .eq("status", "banned"),
    ]);

  if (bookingsResult.error) throw bookingsResult.error;
  if (sessionsResult.error) throw sessionsResult.error;
  if (activeClientsResult.error) throw activeClientsResult.error;
  if (bannedClientsResult.error) throw bannedClientsResult.error;

  const bookings = (bookingsResult.data ?? []) as BookingChartRow[];
  const confirmed = bookings.filter((row) => row.status === "confirmed");
  const sessions = (sessionsResult.data ?? []) as SessionOccupancyRow[];

  const upcomingOccupancy = sessions.map((session) => {
    const booked = countActiveBookings(session.bookings);
    const pct = session.max_slots > 0 ? Math.round((booked / session.max_slots) * 100) : 0;
    const type = session.session_type;
    const name =
      type?.category?.name && type.name
        ? `${session.title} (${type.category.name})`
        : session.title;
    return { name, value: pct, label: `${pct}%` };
  });

  return {
    metrics: dashboard.metrics,
    activeClients: activeClientsResult.count ?? 0,
    bannedClients: bannedClientsResult.count ?? 0,
    bookingsByCategory: aggregateCount(confirmed, categoryLabel),
    revenueByCategory: aggregateRevenue(confirmed, categoryLabel),
    bookingsByType: aggregateCount(confirmed, typeLabel),
    upcomingOccupancy,
  };
}
