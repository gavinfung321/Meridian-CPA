import { FormEvent, useEffect, useState } from "react";
import { AdminModal } from "../../components/AdminModal";
import { ProfileAvatar } from "../../components/ProfileAvatar";
import { RoleBadge, StatusBadge } from "../../components/RoleBadge";
import { Button } from "../../components/ui/button";
import { useProfileAvatarUrl } from "../../hooks/useProfileAvatarUrl";
import { adminInputClassName } from "../../lib/session-admin";
import {
  buildFullName,
  formatAddress,
  formatPhone,
  formatProfileJoinedDate,
  getDisplayName,
} from "../../lib/profile";
import { supabase } from "../../lib/supabase";
import type { Profile, UserRole } from "../../types/database";

export type ClientModalMode = "view" | "edit" | "confirm-ban" | "confirm-reinstate";

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

export function ClientProfileModal({
  profile,
  currentUserId,
  open,
  initialMode = "view",
  onClose,
  onUpdated,
}: ClientProfileModalProps): JSX.Element | null {
  const [mode, setMode] = useState<ClientModalMode>("view");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const avatarUrl = useProfileAvatarUrl(profile?.avatar_path);

  useEffect(() => {
    if (!open || !profile) return;
    setMode(initialMode);
    setError(null);
    setFirstName(profile.first_name);
    setLastName(profile.last_name);
    setPhonePrefix(profile.phone_prefix ?? "+852");
    setPhoneNumber(profile.phone_number ?? "");
    setAddressLine1(profile.address_line1 ?? "");
    setAddressLine2(profile.address_line2 ?? "");
    setCity(profile.city ?? "");
    setCounty(profile.county ?? "");
    setPostCode(profile.post_code ?? "");
    setCountry(profile.country ?? "Hong Kong");
  }, [open, profile, initialMode]);

  if (!open || !profile) return null;

  const displayName = getDisplayName(profile.first_name, profile.last_name, profile.full_name);
  const isAdmin = profile.role === "admin";
  const isSelf = profile.id === currentUserId;
  const canManage = !isAdmin && !isSelf;
  const openedToConfirm =
    initialMode === "confirm-ban" || initialMode === "confirm-reinstate";

  const dismissConfirm = () => {
    if (openedToConfirm) onClose();
    else setMode("view");
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

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

  if (mode === "edit" && canManage) {
    return (
      <AdminModal
        open
        onClose={onClose}
        title="Edit profile"
        description={displayName}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setMode("view")}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="client-edit-form"
              disabled={saving}
              className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
      >
        <form id="client-edit-form" onSubmit={(event) => void handleSave(event)} className="space-y-3">
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-first-name" className="block text-sm font-medium">
                First name
              </label>
              <input
                id="edit-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className={`${adminInputClassName} mt-1`}
                required
              />
            </div>
            <div>
              <label htmlFor="edit-last-name" className="block text-sm font-medium">
                Last name
              </label>
              <input
                id="edit-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className={`${adminInputClassName} mt-1`}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="edit-phone-prefix" className="block text-sm font-medium">
                Phone prefix
              </label>
              <input
                id="edit-phone-prefix"
                value={phonePrefix}
                onChange={(event) => setPhonePrefix(event.target.value)}
                className={`${adminInputClassName} mt-1`}
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="edit-phone-number" className="block text-sm font-medium">
                Phone number
              </label>
              <input
                id="edit-phone-number"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className={`${adminInputClassName} mt-1`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="edit-address1" className="block text-sm font-medium">
              Address line 1
            </label>
            <input
              id="edit-address1"
              value={addressLine1}
              onChange={(event) => setAddressLine1(event.target.value)}
              className={`${adminInputClassName} mt-1`}
            />
          </div>
          <div>
            <label htmlFor="edit-city" className="block text-sm font-medium">
              City
            </label>
            <input
              id="edit-city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className={`${adminInputClassName} mt-1`}
            />
          </div>
        </form>
      </AdminModal>
    );
  }

  return (
    <AdminModal
      open
      onClose={onClose}
      title={displayName}
      description={profile.email}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {canManage ? (
            <>
              <Button type="button" variant="outline" onClick={() => setMode("edit")}>
                Edit
              </Button>
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
      <div className="flex items-start gap-4">
        <ProfileAvatar
          avatarUrl={avatarUrl}
          firstName={profile.first_name}
          lastName={profile.last_name}
          size="lg"
          className="bg-[#C9A84C] text-[#0F2A1D]"
        />
        <div>
          <div className="flex flex-wrap gap-2">
            <RoleBadge role={profile.role} />
            <StatusBadge status={profile.status} />
          </div>
          <p className="mt-2 text-sm text-[#0F2A1D]/60">
            Joined {formatProfileJoinedDate(profile.created_at)}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <ReadOnlyField label="Phone" value={formatPhone(profile.phone_prefix, profile.phone_number)} />
        <ReadOnlyField label="Address" value={formatAddress(profile)} />
      </dl>

      {isAdmin ? (
        <p className="mt-3 text-xs text-[#0F2A1D]/60">
          Admin accounts are view-only. Promote admins manually in Supabase.
        </p>
      ) : null}
      {isSelf ? (
        <p className="mt-3 text-xs text-[#0F2A1D]/60">You cannot ban or edit your own account here.</p>
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
