import { useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { MockupBanner } from "../../components/RoleBadge";

const mockSessions = [
  {
    title: "Tax Planning Consultation",
    type: "Tax Planning",
    location: "Central Office",
    date: "Sep 12, 2026 · 10:00 AM",
    slots: "2 / 4",
    price: "HK$1,200",
  },
  {
    title: "Audit Readiness Review",
    type: "Audit & Compliance",
    location: "Zoom",
    date: "Sep 14, 2026 · 2:30 PM",
    slots: "1 / 2",
    price: "HK$2,400",
  },
  {
    title: "Quarterly Advisory Check-in",
    type: "Advisory",
    location: "Central Office",
    date: "Sep 18, 2026 · 11:00 AM",
    slots: "0 / 3",
    price: "HK$900",
  },
];

export function AdminSessions(): JSX.Element {
  useEffect(() => {
    document.title = "Sessions | Admin | Meridian CPA";
  }, []);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <MockupBanner />
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">Sessions</h1>
            <p className="mt-2 text-[#0F2A1D]/70">Manage available booking slots.</p>
          </div>
          <button
            type="button"
            disabled
            className="rounded-md bg-[#0F2A1D] px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            + New session (coming soon)
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#EDECE6] bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
              <tr>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Schedule</th>
                <th className="px-4 py-3 font-medium">Slots</th>
                <th className="px-4 py-3 font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {mockSessions.map((session) => (
                <tr key={session.title} className="border-b border-[#EDECE6] last:border-0">
                  <td className="px-4 py-4 font-medium">{session.title}</td>
                  <td className="px-4 py-4">{session.type}</td>
                  <td className="px-4 py-4">{session.location}</td>
                  <td className="px-4 py-4">{session.date}</td>
                  <td className="px-4 py-4">{session.slots}</td>
                  <td className="px-4 py-4">{session.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
