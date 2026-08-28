import { useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { MockupBanner } from "../../components/RoleBadge";

export function AdminSettings(): JSX.Element {
  useEffect(() => {
    document.title = "Settings | Admin | Meridian CPA";
  }, []);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <MockupBanner />
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">Settings</h1>
          <p className="mt-2 text-[#0F2A1D]/70">
            Firm booking preferences and notification settings.
          </p>
        </div>

        <div className="space-y-6 rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
          <div>
            <label className="text-sm font-medium">Business hours</label>
            <p className="mt-1 text-sm text-[#0F2A1D]/60">Mon–Fri, 9:00 AM – 6:00 PM HKT</p>
          </div>
          <div>
            <label className="text-sm font-medium">Default session duration</label>
            <p className="mt-1 text-sm text-[#0F2A1D]/60">60 minutes</p>
          </div>
          <div>
            <label className="text-sm font-medium">Email notifications</label>
            <p className="mt-1 text-sm text-[#0F2A1D]/60">Enabled (Resend — coming in Phase 2)</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
