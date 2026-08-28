import { useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { MockupBanner } from "../../components/RoleBadge";

const mockMetrics = [
  { label: "Session occupancy", value: "72%" },
  { label: "Projected revenue", value: "HK$48,500" },
  { label: "Active clients", value: "34" },
  { label: "Pending bookings", value: "6" },
];

export function AdminDashboardOverview(): JSX.Element {
  useEffect(() => {
    document.title = "Admin Dashboard | Meridian CPA";
  }, []);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <MockupBanner />
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">
            Admin overview
          </h1>
          <p className="mt-2 text-[#0F2A1D]/70">
            Firm-wide metrics and booking performance at a glance.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {mockMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-[#0F2A1D]/60">{metric.label}</p>
              <p className="mt-2 font-serif text-3xl text-[#0F2A1D]">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-semibold">Popular categories</h2>
            <div className="mt-6 space-y-4">
              {[
                { name: "Tax Planning", pct: 45 },
                { name: "Audit & Compliance", pct: 30 },
                { name: "Advisory", pct: 25 },
              ].map((item) => (
                <div key={item.name}>
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
          </div>

          <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-semibold">Recent activity</h2>
            <ul className="mt-6 space-y-4 text-sm text-[#0F2A1D]/80">
              <li>New booking request — Tax Planning session</li>
              <li>Session updated — Audit & Compliance (Central Office)</li>
              <li>Client promoted — Marcus S. → client role</li>
              <li>Booking confirmed — Kenji L.</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
