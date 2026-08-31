import { useCallback, useEffect, useMemo, useState, type ElementType } from "react";
import { BellRing, CalendarDays, DollarSign, Info, Users, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/AdminLayout";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { useAuth } from "../../contexts/AuthContext";
import { useProfileAvatarUrl } from "../../hooks/useProfileAvatarUrl";
import {
  fetchAdminDashboardMetrics,
  filterRecentActivity,
  type ActivityActorFilter,
  type AdminRecentActivity,
  type AdminUpcomingBookingRow,
  type AdminDashboardMetrics,
} from "../../lib/admin-dashboard";
import { bookingStatusStyles, formatBookingRelativeTime } from "../../lib/booking-admin";
import { formatSessionTimeShort } from "../../lib/session-admin";
import { cn } from "../../lib/utils";
import { getGreeting } from "../../lib/greeting";
import type { BookingStatus } from "../../types/database";

const ACTIVITY_FILTER_OPTIONS: Array<{ id: ActivityActorFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "user", label: "User" },
  { id: "admin", label: "Admin" },
];

function MetricInfoTip({ text }: { text: string }): JSX.Element {
  return (
    <span className="group/info relative inline-flex shrink-0">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        className="rounded-full p-0.5 text-[#0F2A1D]/35 transition-colors hover:text-[#0F2A1D]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
        aria-label={text}
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-52 -translate-x-1/2 rounded-lg border border-[#EDECE6] bg-white px-3 py-2 text-left text-xs leading-relaxed text-[#0F2A1D]/80 shadow-md group-hover/info:block group-focus-within/info:block"
      >
        {text}
      </span>
    </span>
  );
}

function MetricCard({
  label,
  value,
  to,
  hint,
  info,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string;
  to?: string;
  hint?: string;
  info?: string;
  icon: ElementType;
  highlight?: boolean;
}): JSX.Element {
  const body = (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md",
        highlight
          ? "border-l-4 border-[#EDECE6] border-l-[#C9A84C] bg-[#C9A84C]/5"
          : "border-[#EDECE6]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          <p className="text-sm text-[#0F2A1D]/60">{label}</p>
          {info ? <MetricInfoTip text={info} /> : null}
        </div>
        <Icon
          className={cn(
            "h-5 w-5 shrink-0",
            highlight ? "text-[#C9A84C]" : "text-[#0F2A1D]/25",
          )}
          aria-hidden
        />
      </div>
      <p className="mt-2 font-serif text-3xl text-[#0F2A1D]">{value}</p>
      <p className={cn("mt-1 min-h-[1rem] text-xs", hint ? "text-[#0F2A1D]/50" : "invisible")}>
        {hint ?? "\u00A0"}
      </p>
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
      >
        {body}
      </Link>
    );
  }

  return body;
}

function AttentionBanner({ pendingCount }: { pendingCount: number }): JSX.Element | null {
  if (pendingCount <= 0) return null;

  const label = pendingCount === 1 ? "1 booking" : `${pendingCount} bookings`;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <BellRing className="h-5 w-5 shrink-0 text-[#C9A84C]" aria-hidden />
        <p className="text-sm text-[#0F2A1D]">
          <span className="font-medium">{label} awaiting review</span>
          <span className="text-[#0F2A1D]/70"> — confirm or respond to keep clients moving.</span>
        </p>
      </div>
      <Link
        to="/admin/bookings?status=pending"
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#0F2A1D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0F2A1D]/90"
      >
        Review now
      </Link>
    </div>
  );
}

function DashboardClientAvatar({
  avatarPath,
  firstName,
  lastName,
}: {
  avatarPath?: string | null;
  firstName?: string;
  lastName?: string;
}): JSX.Element {
  const avatarUrl = useProfileAvatarUrl(avatarPath);

  return (
    <ProfileAvatar
      avatarUrl={avatarUrl}
      firstName={firstName}
      lastName={lastName}
      className="h-8 w-8 text-[10px]"
    />
  );
}

function UpcomingBookingRow({ item }: { item: AdminUpcomingBookingRow }): JSX.Element {
  return (
    <li>
      <Link
        to={`/admin/bookings?booking=${item.bookingId}`}
        className="group flex gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[#F9F9F6]"
      >
        <DashboardClientAvatar
          avatarPath={item.clientAvatarPath}
          firstName={item.clientFirstName}
          lastName={item.clientLastName}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#0F2A1D]">{item.clientName}</p>
          <p className="truncate text-sm text-[#0F2A1D]/65">
            {item.sessionTypeLabel} · {formatSessionTimeShort(item.startTime)} ·{" "}
            <span className="inline-flex items-center gap-0.5">
              <Users className="inline h-3 w-3 shrink-0 opacity-60" aria-hidden />
              {item.capacityLabel}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start pt-0.5">
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
              bookingStatusStyles[item.status as BookingStatus],
            )}
          >
            {item.status}
          </span>
          <ArrowUpRight
            className="h-4 w-4 text-[#0F2A1D]/25 opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          />
        </div>
      </Link>
    </li>
  );
}

function ActivityTimelineRow({ item }: { item: AdminRecentActivity }): JSX.Element {
  return (
    <li>
      <Link
        to={`/admin/bookings?booking=${item.bookingId}`}
        className="group flex gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[#F9F9F6]"
      >
        <DashboardClientAvatar
          avatarPath={item.clientAvatarPath}
          firstName={item.clientFirstName}
          lastName={item.clientLastName}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#0F2A1D] group-hover:text-[#0F2A1D]">
            {item.actionLabel}
          </p>
          <p className="truncate text-sm text-[#0F2A1D]/65">
            {item.clientName} · {item.sessionTitle}
          </p>
          <p className="mt-0.5 text-xs text-[#0F2A1D]/45">
            {item.actor === "admin" ? "Admin" : "Client"} · {formatBookingRelativeTime(item.timestamp)}
          </p>
        </div>
        <div className="shrink-0 self-start pt-0.5">
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
              bookingStatusStyles[item.status as BookingStatus],
            )}
          >
            {item.status}
          </span>
        </div>
      </Link>
    </li>
  );
}

export function AdminDashboardOverview(): JSX.Element {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<AdminUpcomingBookingRow[]>([]);
  const [recentActivity, setRecentActivity] = useState<AdminRecentActivity[]>([]);
  const [activityFilter, setActivityFilter] = useState<ActivityActorFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setError(null);
    const data = await fetchAdminDashboardMetrics();
    setMetrics(data.metrics);
    setUpcomingBookings(data.upcomingBookings);
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

  const filteredActivity = useMemo(
    () => filterRecentActivity(recentActivity, activityFilter),
    [recentActivity, activityFilter],
  );

  const activityCounts = useMemo(
    () => ({
      all: recentActivity.length,
      user: recentActivity.filter((event) => event.actor === "user").length,
      admin: recentActivity.filter((event) => event.actor === "admin").length,
    }),
    [recentActivity],
  );

  const firstName = profile?.first_name ?? "Admin";
  const greeting = getGreeting();

  const summaryLine = metrics
    ? [
        metrics.pendingBookings > 0 ? `${metrics.pendingBookings} pending` : null,
        `${metrics.upcomingSessions} upcoming session${metrics.upcomingSessions === 1 ? "" : "s"}`,
        `${metrics.confirmedRevenueLabel} revenue`,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">
            {greeting}, {firstName}
          </h1>
          <p className="mt-2 text-[#0F2A1D]/70">
            {loading ? "Loading your firm overview…" : summaryLine ?? "Firm-wide metrics at a glance."}
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!loading && metrics ? <AttentionBanner pendingCount={metrics.pendingBookings} /> : null}

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
              info="Share of available slots filled across upcoming sessions. Includes pending and confirmed bookings."
              icon={CalendarDays}
            />
            <MetricCard
              label="Revenue"
              value={metrics.confirmedRevenueLabel}
              to="/admin/bookings"
              hint="Confirmed bookings only"
              info="Total session value of all confirmed bookings. Not filtered by date."
              icon={DollarSign}
            />
            <MetricCard
              label="Active clients"
              value={String(metrics.activeClients)}
              to="/admin/clients"
              hint="Registered client accounts"
              icon={Users}
            />
            <MetricCard
              label="Pending bookings"
              value={String(metrics.pendingBookings)}
              to="/admin/bookings?status=pending"
              hint={`${metrics.totalBookings} total bookings`}
              info="Bookings submitted by clients awaiting confirm or reject."
              icon={BellRing}
              highlight={metrics.pendingBookings > 0}
            />
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm lg:col-span-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-serif text-xl font-semibold">Upcoming sessions</h2>
                <p className="mt-1 text-sm text-[#0F2A1D]/60">
                  Next client appointments on the schedule
                </p>
              </div>
              <Link
                to="/admin/sessions"
                className="shrink-0 text-sm font-medium text-[#0F2A1D] hover:underline"
              >
                View all
              </Link>
            </div>
            {loading ? (
              <div className="mt-6 space-y-4">
                {[1, 2, 3, 4].map((key) => (
                  <div key={key} className="h-12 animate-pulse rounded bg-[#EDECE6]" />
                ))}
              </div>
            ) : upcomingBookings.length === 0 ? (
              <p className="mt-6 text-sm text-[#0F2A1D]/60">
                {metrics?.upcomingSessions === 0
                  ? "No upcoming sessions scheduled."
                  : "No bookings on upcoming sessions yet."}
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-[#EDECE6]">
                {upcomingBookings.map((item) => (
                  <UpcomingBookingRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm lg:col-span-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-serif text-xl font-semibold">Recent activity</h2>
                <p className="mt-1 text-sm text-[#0F2A1D]/60">
                  Client requests and admin booking actions
                </p>
              </div>
              <Link
                to="/admin/bookings"
                className="shrink-0 text-sm font-medium text-[#0F2A1D] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 inline-flex rounded-lg border border-[#EDECE6] bg-[#F9F9F6] p-1">
              {ACTIVITY_FILTER_OPTIONS.map((option) => {
                const active = activityFilter === option.id;
                const count = activityCounts[option.id];
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setActivityFilter(option.id)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-[#0F2A1D] text-white shadow-sm"
                        : "text-[#0F2A1D]/70 hover:text-[#0F2A1D]",
                    )}
                  >
                    {option.label}
                    <span className={cn("ml-1.5 tabular-nums", active ? "text-white/70" : "text-[#0F2A1D]/40")}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="mt-6 space-y-4">
                {[1, 2, 3, 4].map((key) => (
                  <div key={key} className="h-12 animate-pulse rounded bg-[#EDECE6]" />
                ))}
              </div>
            ) : filteredActivity.length === 0 ? (
              <p className="mt-6 text-sm text-[#0F2A1D]/60">
                {activityFilter === "all"
                  ? "No recent booking activity."
                  : `No ${activityFilter} activity yet.`}
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-[#EDECE6]">
                {filteredActivity.map((item) => (
                  <ActivityTimelineRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
