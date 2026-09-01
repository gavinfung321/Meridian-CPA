import { Camera, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AdminLayout } from "../../components/AdminLayout";
import { LoginHistoryList } from "../../components/LoginHistoryList";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { RoleBadge, StatusBadge } from "../../components/RoleBadge";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { useProfileAvatarUrl } from "../../hooks/useProfileAvatarUrl";
import { type AdminBookingRow } from "../../lib/booking-admin";
import { fetchUserAdminBookings, updateProfileRole } from "../../lib/profile-admin";
import {
  buildFullName,
  formatProfileJoinedDate,
  getDisplayName,
} from "../../lib/profile";
import {
  removeProfilePicture,
  uploadProfilePicture,
} from "../../lib/profile-avatar";
import { adminInputClassName } from "../../lib/session-admin";
import { supabase } from "../../lib/supabase";
import type { Profile } from "../../types/database";
import { BookingDetailModal } from "./BookingDetailModal";
import { ClientBookingsList } from "./ClientBookingsList";

type DetailTab = "profile" | "bookings" | "login";
type ConfirmAction = "ban" | "reinstate" | "promote" | "demote";

const DETAIL_TABS: Array<{ id: DetailTab; label: string }> = [
  { id: "profile", label: "Profile" },
  { id: "bookings", label: "Bookings" },
  { id: "login", label: "Login history" },
];

function syncFormFromProfile(profile: Profile) {
  return {
    firstName: profile.first_name,
    lastName: profile.last_name,
    phonePrefix: profile.phone_prefix ?? "+852",
    phoneNumber: profile.phone_number ?? "",
    addressLine1: profile.address_line1 ?? "",
    addressLine2: profile.address_line2 ?? "",
    city: profile.city ?? "",
    county: profile.county ?? "",
    postCode: profile.post_code ?? "",
    country: profile.country ?? "Hong Kong",
    avatarPath: profile.avatar_path,
  };
}

export function AdminClientDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile: currentProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const activeTab = (searchParams.get("tab") as DetailTab | null) ?? "profile";
  const setActiveTab = (tab: DetailTab) => {
    setSearchParams(tab === "profile" ? {} : { tab }, { replace: true });
  };

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+852");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [postCode, setPostCode] = useState("");
  const [country, setCountry] = useState("Hong Kong");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);

  const avatarUrl = useProfileAvatarUrl(avatarPath);

  const reloadProfile = async (profileId: string) => {
    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!data) {
      setError("Profile not found.");
      setProfile(null);
      return;
    }

    setProfile(data);
    const form = syncFormFromProfile(data);
    setFirstName(form.firstName);
    setLastName(form.lastName);
    setPhonePrefix(form.phonePrefix);
    setPhoneNumber(form.phoneNumber);
    setAddressLine1(form.addressLine1);
    setAddressLine2(form.addressLine2);
    setCity(form.city);
    setCounty(form.county);
    setPostCode(form.postCode);
    setCountry(form.country);
    setAvatarPath(form.avatarPath);
  };

  const reloadBookings = async (userId: string) => {
    setBookingsLoading(true);
    try {
      const rows = await fetchUserAdminBookings(userId);
      setBookings(rows);
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);

      try {
        await reloadProfile(id);
        if (!cancelled) {
          await reloadBookings(id);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load profile.");
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!profile) return;
    document.title = `${getDisplayName(profile.first_name, profile.last_name, profile.full_name)} | Clients | Admin | Meridian CPA`;
  }, [profile]);

  useEffect(() => {
    if (activeTab === "bookings" && id && bookings.length === 0 && !bookingsLoading) {
      void reloadBookings(id);
    }
  }, [activeTab, id]);

  if (!id) {
    return (
      <AdminLayout>
        <p className="text-[#0F2A1D]/70">Missing profile ID.</p>
      </AdminLayout>
    );
  }

  const displayName = profile
    ? getDisplayName(profile.first_name, profile.last_name, profile.full_name)
    : "Client";
  const isAdmin = profile?.role === "admin";
  const isSelf = profile?.id === currentProfile?.id;
  const canManage = Boolean(profile && !isAdmin && !isSelf);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile || !canManage) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: buildFullName(firstName, lastName),
        phone_prefix: phonePrefix.trim() || null,
        phone_number: phoneNumber.trim() || null,
        address_line1: addressLine1.trim() || null,
        address_line2: addressLine2.trim() || null,
        city: city.trim() || null,
        county: county.trim() || null,
        post_code: postCode.trim() || null,
        country: country.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await reloadProfile(profile.id);
    setMessage("Profile updated.");
  };

  const handleAvatarSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !profile || !canManage) return;

    setAvatarUploading(true);
    setError(null);
    setMessage(null);

    const result = await uploadProfilePicture(profile.id, file, avatarPath);
    setAvatarUploading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setAvatarPath(result.path);
    await reloadProfile(profile.id);
    setMessage("Profile picture updated.");
  };

  const handleAvatarRemove = async () => {
    if (!avatarPath || !profile || !canManage) return;

    setAvatarUploading(true);
    setError(null);
    setMessage(null);

    const result = await removeProfilePicture(profile.id, avatarPath);
    setAvatarUploading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setAvatarPath(null);
    await reloadProfile(profile.id);
    setMessage("Profile picture removed.");
  };

  const handleStatusChange = async (status: "active" | "banned") => {
    if (!profile || !canManage) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    setSaving(false);
    setConfirmAction(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await reloadProfile(profile.id);
    setMessage(status === "banned" ? "User banned." : "User reinstated.");
  };

  const handleRoleChange = async (nextRole: "user" | "client") => {
    if (!profile || !canManage) return;

    setSaving(true);
    setError(null);

    const result = await updateProfileRole(profile.id, nextRole);
    setSaving(false);
    setConfirmAction(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    await reloadProfile(profile.id);
    setMessage(nextRole === "client" ? "Promoted to client." : "Demoted to user.");
  };

  const handleBookingUpdated = async (bookingId: string) => {
    if (!id) return;
    await reloadBookings(id);
    const refreshed = await fetchUserAdminBookings(id);
    const match = refreshed.find((booking) => booking.id === bookingId);
    if (match) setSelectedBooking(match);
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl">
        <Link
          to="/admin/clients"
          className="text-sm font-medium text-[#0F2A1D]/60 hover:text-[#0F2A1D]"
        >
          ← Back to clients
        </Link>

        {loading ? (
          <p className="mt-8 text-[#0F2A1D]/70">Loading profile…</p>
        ) : error && !profile ? (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : profile ? (
          <>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <ProfileAvatar
                    avatarUrl={avatarUrl}
                    firstName={firstName || profile.first_name}
                    lastName={lastName || profile.last_name}
                    size="lg"
                    className="bg-[#C9A84C] text-[#0F2A1D]"
                  />
                  {canManage ? (
                    <>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={avatarUploading || saving}
                        className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-[#EDECE6] bg-white text-[#0F2A1D] shadow-sm hover:bg-[#F9F9F6] disabled:opacity-50"
                        aria-label="Change profile picture"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(event) => void handleAvatarSelect(event)}
                      />
                    </>
                  ) : null}
                </div>
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
                  {canManage && avatarPath ? (
                    <button
                      type="button"
                      disabled={avatarUploading || saving}
                      onClick={() => void handleAvatarRemove()}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Remove photo
                    </button>
                  ) : null}
                </div>
              </div>

              {canManage ? (
                <div className="flex flex-wrap gap-2">
                  {profile.role === "user" ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving || avatarUploading}
                      onClick={() => setConfirmAction("promote")}
                    >
                      Promote to client
                    </Button>
                  ) : null}
                  {profile.role === "client" ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving || avatarUploading}
                      onClick={() => setConfirmAction("demote")}
                    >
                      Demote to user
                    </Button>
                  ) : null}
                  {profile.status === "banned" ? (
                    <Button
                      type="button"
                      disabled={saving || avatarUploading}
                      className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
                      onClick={() => setConfirmAction("reinstate")}
                    >
                      Reinstate
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={saving || avatarUploading}
                      onClick={() => setConfirmAction("ban")}
                    >
                      Ban user
                    </Button>
                  )}
                </div>
              ) : null}
            </div>

            {isSelf ? (
              <div className="mt-6 rounded-lg border border-[#EDECE6] bg-[#F9F9F6] px-4 py-3 text-sm text-[#0F2A1D]/70">
                This is your account. Update your profile on the{" "}
                <Link to="/admin/profile" className="font-medium text-[#0F2A1D] underline-offset-2 hover:underline">
                  Profile page
                </Link>
                .
              </div>
            ) : isAdmin ? (
              <div className="mt-6 rounded-lg border border-[#EDECE6] bg-[#F9F9F6] px-4 py-3 text-sm text-[#0F2A1D]/70">
                Admin accounts are view-only here. Promote admins manually in Supabase.
              </div>
            ) : null}

            <div className="mt-8 border-b border-[#EDECE6]">
              <nav className="-mb-px flex gap-6">
                {DETAIL_TABS.map((tab) => {
                  if (tab.id === "login" && isAdmin) return null;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "border-[#0F2A1D] text-[#0F2A1D]"
                          : "border-transparent text-[#0F2A1D]/60 hover:text-[#0F2A1D]"
                      }`}
                    >
                      {tab.label}
                      {tab.id === "bookings" ? ` (${bookings.length})` : ""}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === "profile" ? (
                canManage ? (
                  <form
                    onSubmit={(event) => void handleSave(event)}
                    className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="detail-email" className="text-sm font-medium">
                          Email
                        </label>
                        <input
                          id="detail-email"
                          type="email"
                          disabled
                          value={profile.email}
                          className="w-full rounded-md border border-[#EDECE6] bg-[#F9F9F6] px-3 py-2 text-sm text-[#0F2A1D]/60"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label htmlFor="detail-first-name" className="text-sm font-medium">
                            First name
                          </label>
                          <input
                            id="detail-first-name"
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            className={adminInputClassName}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="detail-last-name" className="text-sm font-medium">
                            Last name
                          </label>
                          <input
                            id="detail-last-name"
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            className={adminInputClassName}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-[7rem_1fr] gap-3">
                        <div className="space-y-2">
                          <label htmlFor="detail-phone-prefix" className="text-sm font-medium">
                            Prefix
                          </label>
                          <input
                            id="detail-phone-prefix"
                            value={phonePrefix}
                            onChange={(event) => setPhonePrefix(event.target.value)}
                            className={adminInputClassName}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="detail-phone-number" className="text-sm font-medium">
                            Phone number
                          </label>
                          <input
                            id="detail-phone-number"
                            value={phoneNumber}
                            onChange={(event) => setPhoneNumber(event.target.value)}
                            className={adminInputClassName}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="detail-address1" className="text-sm font-medium">
                          Address line 1
                        </label>
                        <input
                          id="detail-address1"
                          value={addressLine1}
                          onChange={(event) => setAddressLine1(event.target.value)}
                          className={adminInputClassName}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="detail-address2" className="text-sm font-medium">
                          Address line 2
                        </label>
                        <input
                          id="detail-address2"
                          value={addressLine2}
                          onChange={(event) => setAddressLine2(event.target.value)}
                          className={adminInputClassName}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label htmlFor="detail-city" className="text-sm font-medium">
                            City
                          </label>
                          <input
                            id="detail-city"
                            value={city}
                            onChange={(event) => setCity(event.target.value)}
                            className={adminInputClassName}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="detail-county" className="text-sm font-medium">
                            County
                          </label>
                          <input
                            id="detail-county"
                            value={county}
                            onChange={(event) => setCounty(event.target.value)}
                            className={adminInputClassName}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label htmlFor="detail-post-code" className="text-sm font-medium">
                            Post code
                          </label>
                          <input
                            id="detail-post-code"
                            value={postCode}
                            onChange={(event) => setPostCode(event.target.value)}
                            className={adminInputClassName}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="detail-country" className="text-sm font-medium">
                            Country
                          </label>
                          <input
                            id="detail-country"
                            value={country}
                            onChange={(event) => setCountry(event.target.value)}
                            className={adminInputClassName}
                          />
                        </div>
                      </div>
                    </div>

                    {message ? (
                      <p className="mt-4 rounded-md border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-3 py-2 text-sm text-[#0F2A1D]">
                        {message}
                      </p>
                    ) : null}

                    {error ? (
                      <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                      </p>
                    ) : null}

                    <div className="mt-6 flex justify-end">
                      <Button
                        type="submit"
                        disabled={saving || avatarUploading}
                        className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
                      >
                        {saving ? "Saving…" : "Save changes"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm text-sm text-[#0F2A1D]/70">
                    Profile editing is not available for this account.
                  </div>
                )
              ) : null}

              {activeTab === "bookings" ? (
                <ClientBookingsList
                  bookings={bookings}
                  loading={bookingsLoading}
                  onSelectBooking={setSelectedBooking}
                />
              ) : null}

              {activeTab === "login" && !isAdmin ? (
                <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
                  <LoginHistoryList userId={profile.id} />
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      {confirmAction === "ban" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">Ban user</h2>
            <p className="mt-2 text-sm text-[#0F2A1D]/70">
              This will suspend {displayName}&apos;s account. They will not be able to sign in until
              reinstated.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={saving}
                onClick={() => void handleStatusChange("banned")}
              >
                {saving ? "Banning…" : "Confirm ban"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmAction === "reinstate" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">Reinstate user</h2>
            <p className="mt-2 text-sm text-[#0F2A1D]/70">
              Restore {displayName}&apos;s account to active status?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={saving}
                className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
                onClick={() => void handleStatusChange("active")}
              >
                {saving ? "Reinstating…" : "Reinstate"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmAction === "promote" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">Promote to client</h2>
            <p className="mt-2 text-sm text-[#0F2A1D]/70">
              Grant {displayName} the client role? They will appear in client-facing workflows.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={saving}
                className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
                onClick={() => void handleRoleChange("client")}
              >
                {saving ? "Promoting…" : "Promote"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmAction === "demote" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">Demote to user</h2>
            <p className="mt-2 text-sm text-[#0F2A1D]/70">
              Change {displayName} from client back to registered user?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={saving}
                onClick={() => void handleRoleChange("user")}
              >
                {saving ? "Demoting…" : "Demote"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <BookingDetailModal
        booking={selectedBooking}
        open={selectedBooking !== null}
        onClose={() => setSelectedBooking(null)}
        onViewClient={() => {
          if (selectedBooking?.user?.id) {
            navigate(`/admin/clients/${selectedBooking.user.id}`);
          }
        }}
        onUpdated={(bookingId) => void handleBookingUpdated(bookingId)}
      />
    </AdminLayout>
  );
}
