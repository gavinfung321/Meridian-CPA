import { FormEvent, useEffect, useState } from "react";
import { ProfileIdentityHeader } from "./ProfileIdentityHeader";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { buildFullName } from "../lib/profile";
import { supabase } from "../lib/supabase";

const inputClassName =
  "w-full rounded-md border border-[#EDECE6] bg-[#F9F9F6] px-3 py-2 text-sm outline-none ring-[#C9A84C] focus:ring-2";

interface ProfilePageContentProps {
  idPrefix?: string;
}

export function ProfilePageContent({
  idPrefix = "profile",
}: ProfilePageContentProps): JSX.Element {
  const { profile, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Profile | Meridian CPA";
  }, []);

  useEffect(() => {
    setFirstName(profile?.first_name ?? "");
    setLastName(profile?.last_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;

    setSubmitting(true);
    setMessage(null);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: buildFullName(firstName, lastName),
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await refreshProfile();
    setMessage("Profile updated successfully.");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <ProfileIdentityHeader
        showPageTitle
        pageDescription="Update your account details."
        onAvatarMessage={setMessage}
        onAvatarError={setError}
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <label htmlFor={`${idPrefix}-email`} className="text-sm font-medium">
            Email
          </label>
          <input
            id={`${idPrefix}-email`}
            type="email"
            disabled
            value={profile?.email ?? ""}
            className="w-full rounded-md border border-[#EDECE6] bg-[#F9F9F6] px-3 py-2 text-sm text-[#0F2A1D]/60"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label htmlFor={`${idPrefix}-first-name`} className="text-sm font-medium">
              First name
            </label>
            <input
              id={`${idPrefix}-first-name`}
              type="text"
              required
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={`${idPrefix}-last-name`} className="text-sm font-medium">
              Last name
            </label>
            <input
              id={`${idPrefix}-last-name`}
              type="text"
              required
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor={`${idPrefix}-phone`} className="text-sm font-medium">
            Phone
          </label>
          <input
            id={`${idPrefix}-phone`}
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClassName}
          />
        </div>

        {message ? (
          <p className="rounded-md border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-3 py-2 text-sm">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={submitting}
          className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
        >
          {submitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
