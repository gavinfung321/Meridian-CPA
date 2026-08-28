import { FormEvent, useEffect, useState } from "react";
import { ProfileIdentityHeader } from "./ProfileIdentityHeader";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { buildFullName } from "../lib/profile";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/database";

const inputClassName =
  "w-full rounded-md border border-[#EDECE6] bg-[#F9F9F6] px-3 py-2 text-sm outline-none ring-[#C9A84C] focus:ring-2";

interface ProfilePageContentProps {
  idPrefix?: string;
  showPageTitle?: boolean;
  pageDescription?: string;
  wrapInDetailsCard?: boolean;
  showEmailNote?: boolean;
}

export function ProfilePageContent({
  idPrefix = "profile",
  showPageTitle = true,
  pageDescription = "Update your account details.",
  wrapInDetailsCard = false,
  showEmailNote = false,
}: ProfilePageContentProps): JSX.Element {
  const { profile, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [phonePrefix, setPhonePrefix] = useState(profile?.phone_prefix ?? "+852");
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number ?? "");
  const [addressLine1, setAddressLine1] = useState(profile?.address_line1 ?? "");
  const [addressLine2, setAddressLine2] = useState(profile?.address_line2 ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [county, setCounty] = useState(profile?.county ?? "");
  const [postCode, setPostCode] = useState(profile?.post_code ?? "");
  const [country, setCountry] = useState(profile?.country ?? "Hong Kong");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Profile | Meridian CPA";
  }, []);

  useEffect(() => {
    setFirstName(profile?.first_name ?? "");
    setLastName(profile?.last_name ?? "");
    setPhonePrefix(profile?.phone_prefix ?? "+852");
    setPhoneNumber(profile?.phone_number ?? "");
    setAddressLine1(profile?.address_line1 ?? "");
    setAddressLine2(profile?.address_line2 ?? "");
    setCity(profile?.city ?? "");
    setCounty(profile?.county ?? "");
    setPostCode(profile?.post_code ?? "");
    setCountry(profile?.country ?? "Hong Kong");
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

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await refreshProfile();
    setMessage("Profile updated successfully.");
  };

  const form = (
    <ProfileDetailsForm
      idPrefix={idPrefix}
      profile={profile}
      firstName={firstName}
      setFirstName={setFirstName}
      lastName={lastName}
      setLastName={setLastName}
      phonePrefix={phonePrefix}
      setPhonePrefix={setPhonePrefix}
      phoneNumber={phoneNumber}
      setPhoneNumber={setPhoneNumber}
      addressLine1={addressLine1}
      setAddressLine1={setAddressLine1}
      addressLine2={addressLine2}
      setAddressLine2={setAddressLine2}
      city={city}
      setCity={setCity}
      county={county}
      setCounty={setCounty}
      postCode={postCode}
      setPostCode={setPostCode}
      country={country}
      setCountry={setCountry}
      message={message}
      error={error}
      submitting={submitting}
      onSubmit={handleSubmit}
      showEmailNote={showEmailNote}
      bareForm={wrapInDetailsCard}
    />
  );

  return (
    <div className="mx-auto max-w-2xl">
      <ProfileIdentityHeader
        showPageTitle={showPageTitle}
        pageDescription={showPageTitle ? pageDescription : undefined}
        onAvatarMessage={setMessage}
        onAvatarError={setError}
      />

      {wrapInDetailsCard ? (
        <div className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">
              Profile details
            </h2>
            <p className="mt-1 text-sm text-[#0F2A1D]/70">
              Manage your personal information and account settings.
            </p>
          </div>
          {form}
        </div>
      ) : (
        form
      )}
    </div>
  );
}

interface ProfileDetailsFormProps {
  idPrefix: string;
  profile: Profile | null;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  phonePrefix: string;
  setPhonePrefix: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  addressLine1: string;
  setAddressLine1: (value: string) => void;
  addressLine2: string;
  setAddressLine2: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  county: string;
  setCounty: (value: string) => void;
  postCode: string;
  setPostCode: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  message: string | null;
  error: string | null;
  submitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  showEmailNote?: boolean;
  bareForm?: boolean;
}

function ProfileDetailsForm({
  idPrefix,
  profile,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phonePrefix,
  setPhonePrefix,
  phoneNumber,
  setPhoneNumber,
  addressLine1,
  setAddressLine1,
  addressLine2,
  setAddressLine2,
  city,
  setCity,
  county,
  setCounty,
  postCode,
  setPostCode,
  country,
  setCountry,
  message,
  error,
  submitting,
  onSubmit,
  showEmailNote = false,
  bareForm = false,
}: ProfileDetailsFormProps): JSX.Element {
  return (
    <form
      onSubmit={onSubmit}
      className={
        bareForm
          ? "space-y-4"
          : "space-y-4 rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm"
      }
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
        {showEmailNote ? (
          <p className="text-xs text-[#0F2A1D]/50">Email cannot be changed currently.</p>
        ) : null}
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

      <div className="grid grid-cols-[7rem_1fr] gap-3">
        <div className="space-y-2">
          <label htmlFor={`${idPrefix}-phone-prefix`} className="text-sm font-medium">
            Prefix
          </label>
          <input
            id={`${idPrefix}-phone-prefix`}
            type="text"
            autoComplete="tel-country-code"
            value={phonePrefix}
            onChange={(event) => setPhonePrefix(event.target.value)}
            className={inputClassName}
            placeholder="+852"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`${idPrefix}-phone-number`} className="text-sm font-medium">
            Phone number
          </label>
          <input
            id={`${idPrefix}-phone-number`}
            type="tel"
            autoComplete="tel-national"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-address-line1`} className="text-sm font-medium">
          Address line 1
        </label>
        <input
          id={`${idPrefix}-address-line1`}
          type="text"
          autoComplete="address-line1"
          value={addressLine1}
          onChange={(event) => setAddressLine1(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-address-line2`} className="text-sm font-medium">
          Address line 2
        </label>
        <input
          id={`${idPrefix}-address-line2`}
          type="text"
          autoComplete="address-line2"
          value={addressLine2}
          onChange={(event) => setAddressLine2(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor={`${idPrefix}-city`} className="text-sm font-medium">
            City
          </label>
          <input
            id={`${idPrefix}-city`}
            type="text"
            autoComplete="address-level2"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className={inputClassName}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`${idPrefix}-county`} className="text-sm font-medium">
            County
          </label>
          <input
            id={`${idPrefix}-county`}
            type="text"
            autoComplete="address-level1"
            value={county}
            onChange={(event) => setCounty(event.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor={`${idPrefix}-post-code`} className="text-sm font-medium">
            Post code
          </label>
          <input
            id={`${idPrefix}-post-code`}
            type="text"
            autoComplete="postal-code"
            value={postCode}
            onChange={(event) => setPostCode(event.target.value)}
            className={inputClassName}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`${idPrefix}-country`} className="text-sm font-medium">
            Country
          </label>
          <input
            id={`${idPrefix}-country`}
            type="text"
            autoComplete="country-name"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className={inputClassName}
          />
        </div>
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
  );
}
