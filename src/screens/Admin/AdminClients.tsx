import { Ban, Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { RoleBadge, StatusBadge } from "../../components/RoleBadge";
import { useAuth } from "../../contexts/AuthContext";
import { adminTableRowInteractiveClassName } from "../../lib/table-styles";
import {
  formatProfileJoinedDate,
  getDisplayName,
} from "../../lib/profile";
import { supabase } from "../../lib/supabase";
import type { Profile } from "../../types/database";
import { AdminClientAvatar } from "./AdminClientAvatar";
import {
  CLIENT_ROLE_FILTERS,
  ClientProfileModal,
  type ClientRoleFilter,
} from "./ClientProfileModal";
import { TableSkeleton } from "./catalog/TableSkeleton";

export function AdminClients(): JSX.Element {
  const { profile: currentProfile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<ClientRoleFilter>("all");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [modalMode, setModalMode] = useState<
    "view" | "edit" | "confirm-ban" | "confirm-reinstate"
  >("view");

  const loadProfiles = useCallback(async () => {
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;
    setProfiles(data ?? []);
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
    if (roleFilter === "all") return profiles;
    return profiles.filter((profile) => profile.role === roleFilter);
  }, [profiles, roleFilter]);

  const openView = (profile: Profile) => {
    setSelectedProfile(profile);
    setModalMode("view");
  };

  const openEdit = (profile: Profile, event: MouseEvent) => {
    event.stopPropagation();
    setSelectedProfile(profile);
    setModalMode("edit");
  };

  const openBan = (profile: Profile, event: MouseEvent) => {
    event.stopPropagation();
    setSelectedProfile(profile);
    setModalMode(profile.status === "banned" ? "confirm-reinstate" : "confirm-ban");
  };

  const canManageProfile = (profile: Profile) =>
    profile.role !== "admin" && profile.id !== currentProfile?.id;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">Clients</h1>
          <p className="mt-2 text-[#0F2A1D]/70">
            All registered users, clients, and firm admins.
          </p>
        </div>

        <div className="mb-4 inline-flex rounded-lg border border-[#EDECE6] bg-[#F9F9F6] p-1">
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
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <TableSkeleton columns={6} />
              </tbody>
            </table>
          ) : filteredProfiles.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-[#0F2A1D]/70">
                {roleFilter === "all"
                  ? "No registered users yet."
                  : `No ${roleFilter === "user" ? "users" : `${roleFilter}s`} found.`}
              </p>
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile) => (
                  <tr
                    key={profile.id}
                    className={adminTableRowInteractiveClassName}
                    onClick={() => openView(profile)}
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
                    <td className="px-4 py-4">{formatProfileJoinedDate(profile.created_at)}</td>
                    <td className="px-4 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                      {canManageProfile(profile) ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="Edit"
                            aria-label={`Edit ${profile.full_name}`}
                            onClick={(event) => openEdit(profile, event)}
                            className="rounded-md p-2 text-[#0F2A1D]/70 transition-colors hover:bg-[#EDECE6] hover:text-[#0F2A1D]"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title={profile.status === "banned" ? "Reinstate" : "Ban user"}
                            aria-label={
                              profile.status === "banned"
                                ? `Reinstate ${profile.full_name}`
                                : `Ban ${profile.full_name}`
                            }
                            onClick={(event) => openBan(profile, event)}
                            className="rounded-md p-2 text-red-700/80 transition-colors hover:bg-red-50 hover:text-red-700"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#0F2A1D]/40">View only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ClientProfileModal
        profile={selectedProfile}
        currentUserId={currentProfile?.id}
        open={selectedProfile !== null}
        initialMode={modalMode}
        onClose={() => setSelectedProfile(null)}
        onUpdated={() => void loadProfiles()}
      />
    </AdminLayout>
  );
}
