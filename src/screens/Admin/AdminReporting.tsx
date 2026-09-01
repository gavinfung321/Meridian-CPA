import { useEffect, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/AdminLayout";
import { fetchAdminReportingData, type AdminReportingData } from "../../lib/admin-reporting";

const CHART_COLORS = ["#0F2A1D", "#C9A84C", "#5A7A65", "#8B7355", "#2F4F3A", "#D4B86A"];

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}): JSX.Element {
  return (
    <div className="rounded-xl border border-[#EDECE6] bg-white p-5 shadow-sm">
      <p className="text-sm text-[#0F2A1D]/60">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold text-[#0F2A1D]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#0F2A1D]/50">{hint}</p> : null}
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <section className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
      <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">{title}</h2>
      {description ? <p className="mt-1 text-sm text-[#0F2A1D]/60">{description}</p> : null}
      <div className="mt-4 h-72">{children}</div>
    </section>
  );
}

function EmptyChart({ message }: { message: string }): JSX.Element {
  return (
    <div className="flex h-full items-center justify-center text-sm text-[#0F2A1D]/60">
      {message}
    </div>
  );
}

export function AdminReporting(): JSX.Element {
  const [data, setData] = useState<AdminReportingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Reporting | Admin | Meridian CPA";
  }, []);

  useEffect(() => {
    void fetchAdminReportingData()
      .then(setData)
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load reporting data.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">Reporting</h1>
            <p className="mt-2 text-[#0F2A1D]/70">
              Live metrics from bookings, sessions, and client profiles.
            </p>
          </div>
          <Link
            to="/admin/dashboard"
            className="text-sm font-medium text-[#0F2A1D]/60 hover:text-[#0F2A1D]"
          >
            Compare with Overview →
          </Link>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="text-[#0F2A1D]/70">Loading reporting data…</p>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Session occupancy"
                value={`${data.metrics.sessionOccupancyPct}%`}
                hint="Upcoming sessions with active bookings"
              />
              <MetricCard
                label="Confirmed revenue"
                value={data.metrics.confirmedRevenueLabel}
                hint="Sum of confirmed booking session prices"
              />
              <MetricCard
                label="Active clients"
                value={String(data.activeClients)}
                hint={`${data.bannedClients} banned user/client accounts`}
              />
              <MetricCard
                label="Pending bookings"
                value={String(data.metrics.pendingBookings)}
                hint={`${data.metrics.totalBookings} total bookings`}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard
                title="Confirmed bookings by category"
                description="Distribution of confirmed bookings across session categories."
              >
                {data.bookingsByCategory.length === 0 ? (
                  <EmptyChart message="No confirmed bookings yet." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.bookingsByCategory}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        label={({ name, value }) => `${name} (${value})`}
                      >
                        {data.bookingsByCategory.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard
                title="Projected revenue by category"
                description="Confirmed booking revenue grouped by category."
              >
                {data.revenueByCategory.length === 0 ? (
                  <EmptyChart message="No confirmed revenue yet." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.revenueByCategory} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDECE6" />
                      <XAxis type="number" tick={{ fill: "#0F2A1D", fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fill: "#0F2A1D", fontSize: 12 }}
                      />
                      <Tooltip formatter={(value: number) => [`HK$${value.toLocaleString()}`, "Revenue"]} />
                      <Bar dataKey="value" fill="#0F2A1D" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard
                title="Confirmed bookings by session type"
                description="Finer breakdown including category · type labels."
              >
                {data.bookingsByType.length === 0 ? (
                  <EmptyChart message="No confirmed bookings yet." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.bookingsByType.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDECE6" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#0F2A1D", fontSize: 11 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis tick={{ fill: "#0F2A1D", fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard
                title="Upcoming session fill rate"
                description="Occupancy % for the next sessions on the calendar."
              >
                {data.upcomingOccupancy.length === 0 ? (
                  <EmptyChart message="No upcoming sessions." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.upcomingOccupancy}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDECE6" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#0F2A1D", fontSize: 11 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis domain={[0, 100]} tick={{ fill: "#0F2A1D", fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => [`${value}%`, "Fill rate"]} />
                      <Bar dataKey="value" fill="#0F2A1D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
