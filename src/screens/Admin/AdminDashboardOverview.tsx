import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/AdminLayout";
import {
  fetchAdminDashboardMetrics,
  type AdminRecentActivity,
  type CategoryBookingShare,
  type AdminDashboardMetrics,
} from "../../lib/admin-dashboard";
import { bookingStatusStyles } from "../../lib/booking-admin";
import { formatSessionSchedule } from "../../lib/session-admin";
import type { BookingStatus } from "../../types/database";

function MetricCard({
  label,
  value,
  to,
  hint,
}: {
  label: string;
  value: string;
  to?: string;
  hint?: string;
}): JSX.Element {
  const body = (
    <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-sm text-[#0F2A1D]/60">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[#0F2A1D]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#0F2A1D]/50">{hint}</p> : null}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]">
        {body}
      </Link>
    );
  }

  return body;
}

export function AdminDashboardOverview(): JSX.Element {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [categoryShares, setCategoryShares] = useState<CategoryBookingShare[]>([]);
  const [recentActivity, setRecentActivity] = useState<AdminRecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setError(null);
    const data = await fetchAdminDashboardMetrics();
    setMetrics(data.metrics);
    setCategoryShares(data.categoryShares);
    setRecentActivity(data.recentActivity);
  }, []);

  useEffect(() => {
    document.title = "Admin Dashboard | Meridian CPA";
  }, []);

  useEffect(() => {
    void loadDashboard()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard.");
      })
      .finally(() => setLoading(false));
  }, [loadDashboard]);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">Admin overview</h1>
          <p className="mt-2 text-[#0F2A1D]/70">
            Firm-wide metrics and booking performance at a glance.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-xl border border-[#EDECE6] bg-white"
              />
            ))}
          </div>
        ) : metrics ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Session occupancy"
              value={`${metrics.sessionOccupancyPct}%`}
              to="/admin/sessions"
              hint={`${metrics.upcomingSessions} upcoming sessions`}
            />
            <MetricCard
              label="Projected revenue"
              value={metrics.projectedRevenueLabel}
              to="/admin/bookings"
              hint="Pending + confirmed bookings"
            />
            <MetricCard
              label="Active clients"
              value={String(metrics.activeClients)}
              to="/admin/clients"
            />
            <MetricCard
              label="Pending bookings"
              value={String(metrics.pendingBookings)}
              to="/admin/bookings"
              hint={`${metrics.totalBookings} total bookings`}
            />
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-semibold">Popular categories</h2>
            <p className="mt-1 text-sm text-[#0F2A1D]/60">
              Share of active bookings by service line
            </p>
            {loading ? (
              <div className="mt-6 space-y-4">
                {[1, 2, 3].map((key) => (
                  <div key={key} className="h-8 animate-pulse rounded bg-[#EDECE6]" />
                ))}
              </div>
            ) : categoryShares.length === 0 ? (
              <p className="mt-6 text-sm text-[#0F2A1D]/60">No booking data yet.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {categoryShares.map((item) => (
                  <div key={item.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#EDECE6]">
                      <div
                        className="h-2 rounded-full bg-[#0F2A1D]"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl font-semibold">Recent activity</h2>
              <Link
                to="/admin/bookings"
                className="text-sm font-medium text-[#0F2A1D] hover:underline"
              >
                View all
              </Link>
            </div>
            {loading ? (
              <div className="mt-6 space-y-4">
                {[1, 2, 3, 4].map((key) => (
                  <div key={key} className="h-5 animate-pulse rounded bg-[#EDECE6]" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="mt-6 text-sm text-[#0F2A1D]/60">No recent booking activity.</p>
            ) : (
              <ul className="mt-6 space-y-4 text-sm">
                {recentActivity.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3">
                    <span className="text-[#0F2A1D]/80">{item.message}</span>
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${bookingStatusStyles[item.status as BookingStatus]}`}
                      >
                        {item.status}
                      </span>
                      <p className="mt-1 text-xs text-[#0F2A1D]/50">
                        {formatSessionSchedule(item.timestamp)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
