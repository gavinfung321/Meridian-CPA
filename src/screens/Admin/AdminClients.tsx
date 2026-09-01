import { Eye, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/AdminLayout";
import { RoleBadge, StatusBadge } from "../../components/RoleBadge";
import { useAuth } from "../../contexts/AuthContext";
import {
  buildAdminClientBookingsUrl,
} from "../../lib/booking-admin";
import {
  filterProfilesBySearch,
  filterProfilesByStatus,
  fetchProfileBookingCounts,
  PROFILE_STATUS_FILTER_OPTIONS,
  type ProfileStatusFilter,
} from "../../lib/profile-admin";
import {
  formatProfileJoinedDate,
  getDisplayName,
} from "../../lib/profile";
import { adminInputClassName } from "../../lib/session-admin";
import {
  adminTableRowInteractiveClassName,
  adminTableViewButtonClassName,
} from "../../lib/table-styles";
import { supabase } from "../../lib/supabase";
import type { Profile } from "../../types/database";
import { AdminClientAvatar } from "./AdminClientAvatar";
import {
  CLIENT_ROLE_FILTERS,
  type ClientRoleFilter,
} from "./ClientProfileModal";
import { TableSkeleton } from "./catalog/TableSkeleton";

export function AdminClients(): JSX.Element {
  const { profile: currentProfile } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<ClientRoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<ProfileStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadProfiles = useCallback(async () => {
    setError(null);

    const [profilesResult, countsResult] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      fetchProfileBookingCounts(),
    ]);

    if (profilesResult.error) throw profilesResult.error;
    setProfiles(profilesResult.data ?? []);
    setBookingCounts(countsResult);
  }, []);

  useEffect(() => {
    document.title = "Clients | Admin | Meridian CPA";
  }, []);

  useEffect(() => {
    void loadProfiles()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load profiles.");
      })
      .finally(() => setLoading(false));
  }, [loadProfiles]);

  const filteredProfiles = useMemo(() => {
    let result = profiles;

    if (roleFilter !== "all") {
      result = result.filter((profile) => profile.role === roleFilter);
    }

    result = filterProfilesByStatus(result, statusFilter);
    result = filterProfilesBySearch(result, searchQuery);

    return result;
  }, [profiles, roleFilter, statusFilter, searchQuery]);

  const openProfile = (profile: Profile) => {
    if (profile.id === currentProfile?.id) {
      navigate("/admin/profile");
      return;
    }
    navigate(`/admin/clients/${profile.id}`);
  };

  const openProfileFromAction = (profile: Profile, event: MouseEvent) => {
    event.stopPropagation();
    openProfile(profile);
  };

  const openClientBookings = (profile: Profile, event: MouseEvent) => {
    event.stopPropagation();
    navigate(buildAdminClientBookingsUrl(profile.id));
  };

  const emptyMessage =
    searchQuery.trim() || statusFilter !== "all" || roleFilter !== "all"
      ? "No people match your filters."
      : "No registered users yet.";

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">Clients</h1>
          <p className="mt-2 text-[#0F2A1D]/70">
            All registered users, clients, and firm admins.
          </p>
        </div>

        <div className="mb-4 space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex rounded-lg border border-[#EDECE6] bg-[#F9F9F6] p-1">
              {CLIENT_ROLE_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setRoleFilter(filter.id)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    roleFilter === filter.id
                      ? "bg-[#0F2A1D] text-white shadow-sm"
                      : "text-[#0F2A1D]/70 hover:text-[#0F2A1D]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <p className="text-sm text-[#0F2A1D]/60">
              {filteredProfiles.length} {filteredProfiles.length === 1 ? "person" : "people"}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="relative flex-1">
              <span className="sr-only">Search clients</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F2A1D]/40" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name or email…"
                className={`${adminInputClassName} pl-9`}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm sm:min-w-[10rem]">
              <span className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as ProfileStatusFilter)
                }
                className={adminInputClassName}
              >
                {PROFILE_STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-[#EDECE6] bg-white shadow-sm">
          {loading ? (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Bookings</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <TableSkeleton columns={7} />
              </tbody>
            </table>
          ) : filteredProfiles.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-[#0F2A1D]/70">{emptyMessage}</p>
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Bookings</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile) => (
                  <tr
                    key={profile.id}
                    className={adminTableRowInteractiveClassName}
                    onClick={() => openProfile(profile)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <AdminClientAvatar profile={profile} />
                        <span className="font-medium text-[#0F2A1D]">
                          {getDisplayName(
                            profile.first_name,
                            profile.last_name,
                            profile.full_name,
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">{profile.email}</td>
                    <td className="px-4 py-4">
                      <RoleBadge role={profile.role} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={profile.status} />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        title={`View ${getDisplayName(profile.first_name, profile.last_name, profile.full_name)}'s bookings`}
                        onClick={(event) => openClientBookings(profile, event)}
                        className="font-medium text-[#0F2A1D] underline-offset-2 hover:text-[#C9A84C] hover:underline"
                      >
                        {bookingCounts[profile.id] ?? 0}
                      </button>
                    </td>
                    <td className="px-4 py-4">{formatProfileJoinedDate(profile.created_at)}</td>
                    <td className="px-4 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        title={profile.id === currentProfile?.id ? "Edit your profile" : "View profile"}
                        aria-label={
                          profile.id === currentProfile?.id
                            ? "Edit your profile"
                            : `View ${profile.full_name ?? profile.email}`
                        }
                        onClick={(event) => openProfileFromAction(profile, event)}
                        className={adminTableViewButtonClassName}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
