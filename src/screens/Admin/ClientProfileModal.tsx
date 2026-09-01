import { Camera, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { AdminModal } from "../../components/AdminModal";
import { LoginHistoryList } from "../../components/LoginHistoryList";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { RoleBadge, StatusBadge } from "../../components/RoleBadge";
import { Button } from "../../components/ui/button";
import { useProfileAvatarUrl } from "../../hooks/useProfileAvatarUrl";
import {
  buildFullName,
  formatAddress,
  formatPhone,
  formatProfileJoinedDate,
  getDisplayName,
} from "../../lib/profile";
import {
  removeProfilePicture,
  uploadProfilePicture,
} from "../../lib/profile-avatar";
import { adminInputClassName } from "../../lib/session-admin";
import { updateProfileRole } from "../../lib/profile-admin";
import { supabase } from "../../lib/supabase";
import type { Profile, UserRole } from "../../types/database";

export type ClientModalMode =
  | "profile"
  | "confirm-ban"
  | "confirm-reinstate"
  | "confirm-promote"
  | "confirm-demote";

interface ClientProfileModalProps {
  profile: Profile | null;
  currentUserId?: string;
  open: boolean;
  initialMode?: ClientModalMode;
  onClose: () => void;
  onUpdated: () => void;
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}): JSX.Element {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">{label}</dt>
      <dd className="mt-1 text-sm text-[#0F2A1D]">{value?.trim() || "—"}</dd>
    </div>
  );
}

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

export function ClientProfileModal({
  profile,
  currentUserId,
  open,
  initialMode = "profile",
  onClose,
  onUpdated,
}: ClientProfileModalProps): JSX.Element | null {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<ClientModalMode>("profile");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  useEffect(() => {
    if (!open || !profile) return;
    setMode(initialMode);
    setError(null);
    setMessage(null);
    const form = syncFormFromProfile(profile);
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
  }, [open, profile, initialMode]);

  if (!open || !profile) return null;

  const displayName = getDisplayName(profile.first_name, profile.last_name, profile.full_name);
  const isAdmin = profile.role === "admin";
  const isSelf = profile.id === currentUserId;
  const canManage = !isAdmin && !isSelf;
  const openedToConfirm =
    initialMode === "confirm-ban" ||
    initialMode === "confirm-reinstate" ||
    initialMode === "confirm-promote" ||
    initialMode === "confirm-demote";

  const dismissConfirm = () => {
    if (openedToConfirm) onClose();
    else setMode("profile");
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
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

    onUpdated();
    setMessage("Profile updated.");
  };

  const handleAvatarSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !canManage) return;

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
    onUpdated();
    setMessage("Profile picture updated.");
  };

  const handleAvatarRemove = async () => {
    if (!avatarPath || !canManage) return;

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
    onUpdated();
    setMessage("Profile picture removed.");
  };

  const handleRoleChange = async (nextRole: "user" | "client") => {
    setSaving(true);
    setError(null);

    const result = await updateProfileRole(profile.id, nextRole);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onUpdated();
    onClose();
  };

  const handleStatusChange = async (status: "active" | "banned") => {
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    onUpdated();
    onClose();
  };

  if (mode === "confirm-ban") {
    return (
      <AdminModal
        open
        onClose={dismissConfirm}
        title="Ban user"
        description={`This will suspend ${displayName}'s account. They will not be able to sign in until reinstated.`}
        footer={
          <>
            <Button type="button" variant="outline" onClick={dismissConfirm}>
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
          </>
        }
      >
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </AdminModal>
    );
  }

  if (mode === "confirm-reinstate") {
    return (
      <AdminModal
        open
        onClose={dismissConfirm}
        title="Reinstate user"
        description={`Restore ${displayName}'s account to active status?`}
        footer={
          <>
            <Button type="button" variant="outline" onClick={dismissConfirm}>
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
          </>
        }
      >
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </AdminModal>
    );
  }

  if (mode === "confirm-promote") {
    return (
      <AdminModal
        open
        onClose={dismissConfirm}
        title="Promote to client"
        description={`Grant ${displayName} the client role? They will appear in client-facing workflows.`}
        footer={
          <>
            <Button type="button" variant="outline" onClick={dismissConfirm}>
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
          </>
        }
      >
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </AdminModal>
    );
  }

  if (mode === "confirm-demote") {
    return (
      <AdminModal
        open
        onClose={dismissConfirm}
        title="Demote to user"
        description={`Change ${displayName} from client back to registered user?`}
        footer={
          <>
            <Button type="button" variant="outline" onClick={dismissConfirm}>
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
          </>
        }
      >
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </AdminModal>
    );
  }

  const profileHeader = (
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
        <div className="flex flex-wrap gap-2">
          <RoleBadge role={profile.role} />
          <StatusBadge status={profile.status} />
        </div>
        <p className="mt-2 text-sm text-[#0F2A1D]/60">
          Joined {formatProfileJoinedDate(profile.created_at)}
        </p>
        {canManage ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {avatarPath ? (
              <button
                type="button"
                disabled={avatarUploading || saving}
                onClick={() => void handleAvatarRemove()}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Remove photo
              </button>
            ) : null}
            <p className="text-xs text-[#0F2A1D]/50">JPEG, PNG, WebP, or GIF. Max 2 MB.</p>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <AdminModal
      open
      size="xl"
      onClose={onClose}
      title={canManage ? "Edit client profile" : displayName}
      description={profile.email}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {isSelf ? (
            <Button
              asChild
              className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
            >
              <Link to="/admin/profile" onClick={onClose}>
                Edit in Profile
              </Link>
            </Button>
          ) : null}
          {canManage ? (
            <>
              <Button type="button" variant="outline" asChild>
                <Link to={`/admin/clients/${profile.id}`} onClick={onClose}>
                  Full page
                </Link>
              </Button>
              <Button
                type="submit"
                form="client-profile-form"
                disabled={saving || avatarUploading}
                className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
              {profile.role === "user" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode("confirm-promote")}
                >
                  Promote
                </Button>
              ) : null}
              {profile.role === "client" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode("confirm-demote")}
                >
                  Demote
                </Button>
              ) : null}
              {profile.status === "banned" ? (
                <Button
                  type="button"
                  className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
                  onClick={() => setMode("confirm-reinstate")}
                >
                  Reinstate
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setMode("confirm-ban")}
                >
                  Ban user
                </Button>
              )}
            </>
          ) : null}
        </>
      }
    >
      {profileHeader}

      {canManage ? (
        <form
          id="client-profile-form"
          onSubmit={(event) => void handleSave(event)}
          className="mt-6 space-y-4"
        >
          <div className="space-y-2">
            <label htmlFor="client-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="client-email"
              type="email"
              disabled
              value={profile.email}
              className="w-full rounded-md border border-[#EDECE6] bg-[#F9F9F6] px-3 py-2 text-sm text-[#0F2A1D]/60"
            />
            <p className="text-xs text-[#0F2A1D]/50">Managed by authentication — cannot be changed here.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="client-first-name" className="text-sm font-medium">
                First name
              </label>
              <input
                id="client-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className={adminInputClassName}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="client-last-name" className="text-sm font-medium">
                Last name
              </label>
              <input
                id="client-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className={adminInputClassName}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-[7rem_1fr] gap-3">
            <div className="space-y-2">
              <label htmlFor="client-phone-prefix" className="text-sm font-medium">
                Prefix
              </label>
              <input
                id="client-phone-prefix"
                value={phonePrefix}
                onChange={(event) => setPhonePrefix(event.target.value)}
                className={adminInputClassName}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="client-phone-number" className="text-sm font-medium">
                Phone number
              </label>
              <input
                id="client-phone-number"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className={adminInputClassName}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="client-address1" className="text-sm font-medium">
              Address line 1
            </label>
            <input
              id="client-address1"
              value={addressLine1}
              onChange={(event) => setAddressLine1(event.target.value)}
              className={adminInputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="client-address2" className="text-sm font-medium">
              Address line 2
            </label>
            <input
              id="client-address2"
              value={addressLine2}
              onChange={(event) => setAddressLine2(event.target.value)}
              className={adminInputClassName}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="client-city" className="text-sm font-medium">
                City
              </label>
              <input
                id="client-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className={adminInputClassName}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="client-county" className="text-sm font-medium">
                County
              </label>
              <input
                id="client-county"
                value={county}
                onChange={(event) => setCounty(event.target.value)}
                className={adminInputClassName}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="client-post-code" className="text-sm font-medium">
                Post code
              </label>
              <input
                id="client-post-code"
                value={postCode}
                onChange={(event) => setPostCode(event.target.value)}
                className={adminInputClassName}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="client-country" className="text-sm font-medium">
                Country
              </label>
              <input
                id="client-country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className={adminInputClassName}
              />
            </div>
          </div>

          {message ? (
            <p className="rounded-md border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-3 py-2 text-sm text-[#0F2A1D]">
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </form>
      ) : (
        <>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <ReadOnlyField label="Email" value={profile.email} />
            <ReadOnlyField
              label="Phone"
              value={formatPhone(profile.phone_prefix, profile.phone_number)}
            />
            <ReadOnlyField label="Address line 1" value={profile.address_line1} />
            <ReadOnlyField label="Address line 2" value={profile.address_line2} />
            <ReadOnlyField label="City" value={profile.city} />
            <ReadOnlyField label="County" value={profile.county} />
            <ReadOnlyField label="Post code" value={profile.post_code} />
            <ReadOnlyField label="Country" value={profile.country} />
            <div className="sm:col-span-2">
              <ReadOnlyField
                label="Full address"
                value={formatAddress(profile)}
              />
            </div>
          </dl>
          {!canManage ? (
            <div className="mt-4 rounded-lg border border-[#EDECE6] bg-[#F9F9F6] px-4 py-3 text-sm text-[#0F2A1D]/70">
              {isSelf ? (
                <>
                  <p className="font-medium text-[#0F2A1D]">This is your account</p>
                  <p className="mt-1">
                    The Clients screen is for managing other users. Update your name, contact
                    details, and profile photo on the{" "}
                    <Link
                      to="/admin/profile"
                      onClick={onClose}
                      className="font-medium text-[#0F2A1D] underline-offset-2 hover:underline"
                    >
                      Profile page
                    </Link>
                    .
                  </p>
                </>
              ) : isAdmin ? (
                <>
                  <p className="font-medium text-[#0F2A1D]">Admin account</p>
                  <p className="mt-1">
                    Admin profiles are view-only here. Promote or demote admins manually in
                    Supabase.
                  </p>
                </>
              ) : null}
            </div>
          ) : null}
        </>
      )}

      {!isAdmin && mode === "profile" ? (
        <div className="mt-6">
          <LoginHistoryList userId={profile.id} />
        </div>
      ) : null}
    </AdminModal>
  );
}

export type ClientRoleFilter = "all" | UserRole;

export const CLIENT_ROLE_FILTERS: Array<{ id: ClientRoleFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "user", label: "Users" },
  { id: "client", label: "Clients" },
  { id: "admin", label: "Admins" },
];
