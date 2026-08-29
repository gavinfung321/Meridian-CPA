import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AdminLayout } from "../../components/AdminLayout";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { RoleBadge, StatusBadge } from "../../components/RoleBadge";
import { useProfileAvatarUrl } from "../../hooks/useProfileAvatarUrl";
import {
  formatAddress,
  formatPhone,
  formatProfileJoinedDate,
  getDisplayName,
} from "../../lib/profile";
import { supabase } from "../../lib/supabase";
import type { Profile } from "../../types/database";

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}): JSX.Element {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[#0F2A1D]">{value?.trim() || "—"}</dd>
    </div>
  );
}

export function AdminClientDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const avatarUrl = useProfileAvatarUrl(profile?.avatar_path);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setProfile(null);
      } else if (!data) {
        setError("Profile not found.");
        setProfile(null);
      } else {
        setProfile(data);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!profile) return;
    document.title = `${getDisplayName(profile.first_name, profile.last_name, profile.full_name)} | Clients | Admin | Meridian CPA`;
  }, [profile]);

  const displayName = profile
    ? getDisplayName(profile.first_name, profile.last_name, profile.full_name)
    : "Client";

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <Link
          to="/admin/clients"
          className="text-sm font-medium text-[#0F2A1D]/60 hover:text-[#0F2A1D]"
        >
          ← Back to clients
        </Link>

        {loading ? (
          <p className="mt-8 text-[#0F2A1D]/70">Loading profile…</p>
        ) : error ? (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : profile ? (
          <>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start">
              <ProfileAvatar
                avatarUrl={avatarUrl}
                firstName={profile.first_name}
                lastName={profile.last_name}
                size="lg"
                className="bg-[#C9A84C] text-[#0F2A1D]"
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">{displayName}</h1>
                <p className="mt-1 text-sm text-[#0F2A1D]/60">{profile.email}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <RoleBadge role={profile.role} />
                  <StatusBadge status={profile.status} />
                </div>
                <p className="mt-3 text-sm text-[#0F2A1D]/60">
                  Joined {formatProfileJoinedDate(profile.created_at)}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">Contact details</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <ReadOnlyField label="Phone" value={formatPhone(profile.phone_prefix, profile.phone_number)} />
                <ReadOnlyField label="Address" value={formatAddress(profile)} />
              </dl>
            </div>

            {profile.role === "admin" ? (
              <p className="mt-4 text-sm text-[#0F2A1D]/60">
                Admin accounts are view-only here. Promote admins manually in Supabase.
              </p>
            ) : (
              <p className="mt-4 text-sm text-[#0F2A1D]/60">
                Profile editing and lifecycle actions (ban, promote) coming in a future update.
              </p>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
