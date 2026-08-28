import { useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { MockupBanner } from "../../components/RoleBadge";

const mockBookings = [
  {
    client: "Marcus S.",
    session: "Tax Planning Consultation",
    status: "pending",
    date: "Sep 12, 2026",
  },
  {
    client: "Kenji L.",
    session: "Audit Readiness Review",
    status: "confirmed",
    date: "Sep 14, 2026",
  },
  {
    client: "Mrs. Wong",
    session: "Quarterly Advisory Check-in",
    status: "cancelled",
    date: "Sep 18, 2026",
  },
];

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
  rejected: "bg-gray-100 text-gray-600",
};

export function AdminBookings(): JSX.Element {
  useEffect(() => {
    document.title = "Bookings | Admin | Meridian CPA";
  }, []);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <MockupBanner />
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">Bookings</h1>
          <p className="mt-2 text-[#0F2A1D]/70">
            Review and manage all client booking requests.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#EDECE6] bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
              <tr>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockBookings.map((booking) => (
                <tr
                  key={`${booking.client}-${booking.session}`}
                  className="border-b border-[#EDECE6] last:border-0"
                >
                  <td className="px-4 py-4 font-medium">{booking.client}</td>
                  <td className="px-4 py-4">{booking.session}</td>
                  <td className="px-4 py-4">{booking.date}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#0F2A1D]/40">Approve · Reject · Cancel</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
