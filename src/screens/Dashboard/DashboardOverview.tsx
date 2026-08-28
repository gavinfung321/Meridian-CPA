import { useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { MockupBanner, RoleBadge, StatusBadge } from "../../components/RoleBadge";
import { useAuth } from "../../contexts/AuthContext";

export function DashboardOverview(): JSX.Element {
  const { profile } = useAuth();

  useEffect(() => {
    document.title = "Dashboard | Meridian CPA";
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute(
      "content",
      "View your Meridian CPA dashboard, upcoming bookings, and account overview.",
    );
  }, []);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <MockupBanner label="User dashboard mockup — booking data is placeholder for now" />
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-2 text-[#0F2A1D]/70">
              Your client portal. Book sessions and manage your profile here.
            </p>
          </div>
          {profile ? (
            <div className="flex items-center gap-2">
              <RoleBadge role={profile.role} />
              <StatusBadge status={profile.status} />
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#0F2A1D]/60">Upcoming bookings</p>
            <p className="mt-2 font-serif text-2xl text-[#0F2A1D]">0</p>
          </div>
          <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#0F2A1D]/60">Pending approval</p>
            <p className="mt-2 font-serif text-2xl text-[#0F2A1D]">0</p>
          </div>
          <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#0F2A1D]/60">Completed sessions</p>
            <p className="mt-2 font-serif text-2xl text-[#0F2A1D]">0</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-dashed border-[#EDECE6] bg-white p-10 text-center text-[#0F2A1D]/60">
          No upcoming sessions. Booking flow arrives in a later phase.
        </div>
      </div>
    </DashboardLayout>
  );
}
