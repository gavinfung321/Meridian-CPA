import { useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { MockupBanner, RoleBadge, StatusBadge } from "../../components/RoleBadge";
import type { UserRole, UserStatus } from "../../types/database";

const mockClients: Array<{
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joined: string;
}> = [
  { name: "Marcus S.", email: "marcus@example.com", role: "client", status: "active", joined: "Aug 10, 2026" },
  { name: "Kenji L.", email: "kenji@example.com", role: "client", status: "active", joined: "Aug 15, 2026" },
  { name: "Jane Doe", email: "jane@example.com", role: "user", status: "active", joined: "Aug 22, 2026" },
  { name: "Test User", email: "banned@example.com", role: "user", status: "banned", joined: "Aug 25, 2026" },
];

export function AdminClients(): JSX.Element {
  useEffect(() => {
    document.title = "Clients | Admin | Meridian CPA";
  }, []);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <MockupBanner />
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">Clients</h1>
          <p className="mt-2 text-[#0F2A1D]/70">
            View registered users, roles, and account status. Promote admins manually in Supabase for now.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#EDECE6] bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockClients.map((client) => (
                <tr key={client.email} className="border-b border-[#EDECE6] last:border-0">
                  <td className="px-4 py-4 font-medium">{client.name}</td>
                  <td className="px-4 py-4">{client.email}</td>
                  <td className="px-4 py-4">
                    <RoleBadge role={client.role} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="px-4 py-4">{client.joined}</td>
                  <td className="px-4 py-4 text-[#0F2A1D]/40">Ban · Promote · View logs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
