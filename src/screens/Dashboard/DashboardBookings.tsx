import { useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { MockupBanner } from "../../components/RoleBadge";

const mockBookings = [
  {
    session: "Tax Planning Consultation",
    date: "Sep 12, 2026 · 10:00 AM",
    location: "Central Office",
    status: "pending",
  },
  {
    session: "Audit Readiness Review",
    date: "Aug 28, 2026 · 2:30 PM",
    location: "Zoom",
    status: "confirmed",
  },
];

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
  rejected: "bg-gray-100 text-gray-600",
};

export function DashboardBookings(): JSX.Element {
  useEffect(() => {
    document.title = "Bookings | Meridian CPA";
  }, []);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <MockupBanner label="Mock booking history — not connected to live data yet" />
        <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">My bookings</h1>
        <p className="mt-2 text-[#0F2A1D]/70">Track your session requests and confirmations.</p>

        <div className="mt-8 overflow-hidden rounded-xl border border-[#EDECE6] bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
              <tr>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockBookings.map((booking) => (
                <tr key={booking.session} className="border-b border-[#EDECE6] last:border-0">
                  <td className="px-4 py-4 font-medium">{booking.session}</td>
                  <td className="px-4 py-4">{booking.date}</td>
                  <td className="px-4 py-4">{booking.location}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
