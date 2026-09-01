import { FormEvent, useEffect, useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchBookingAppSettings,
  MAX_MAX_BOOKING_DAYS_ADVANCE,
  MIN_MAX_BOOKING_DAYS_ADVANCE,
  updateBookingAppSettings,
} from "../../lib/app-settings";
import { adminInputClassName } from "../../lib/session-admin";

export function AdminSettings(): JSX.Element {
  const { profile } = useAuth();
  const [maxBookingDays, setMaxBookingDays] = useState("90");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Settings | Admin | Meridian CPA";
  }, []);

  useEffect(() => {
    void fetchBookingAppSettings()
      .then((settings) => {
        setMaxBookingDays(String(settings.max_booking_days_advance));
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load settings.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    const parsed = Number(maxBookingDays);
    if (!Number.isFinite(parsed)) {
      setSaving(false);
      setError("Enter a valid number of days.");
      return;
    }

    const result = await updateBookingAppSettings(parsed, profile.id);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    const refreshed = await fetchBookingAppSettings();
    setMaxBookingDays(String(refreshed.max_booking_days_advance));
    setMessage("Booking settings saved.");
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">Settings</h1>
          <p className="mt-2 text-[#0F2A1D]/70">
            Firm booking preferences and notification settings.
          </p>
        </div>

        {loading ? (
          <p className="text-[#0F2A1D]/70">Loading settings…</p>
        ) : (
          <form onSubmit={(event) => void handleSave(event)} className="space-y-6">
            <section className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">Booking rules</h2>
              <p className="mt-1 text-sm text-[#0F2A1D]/60">
                Controls how far ahead clients can book sessions on the landing page and client portal.
              </p>

              <div className="mt-4 space-y-2">
                <label htmlFor="max-booking-days" className="text-sm font-medium">
                  Maximum booking window (days)
                </label>
                <input
                  id="max-booking-days"
                  type="number"
                  min={MIN_MAX_BOOKING_DAYS_ADVANCE}
                  max={MAX_MAX_BOOKING_DAYS_ADVANCE}
                  value={maxBookingDays}
                  onChange={(event) => setMaxBookingDays(event.target.value)}
                  className={`${adminInputClassName} max-w-[10rem]`}
                  required
                />
                <p className="text-xs text-[#0F2A1D]/50">
                  Sessions starting beyond this window are hidden from booking and rejected at checkout.
                  Allowed range: {MIN_MAX_BOOKING_DAYS_ADVANCE}–{MAX_MAX_BOOKING_DAYS_ADVANCE} days.
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-dashed border-[#EDECE6] bg-[#F9F9F6] p-6">
              <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">Coming soon</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="font-medium text-[#0F2A1D]">Business hours</dt>
                  <dd className="mt-1 text-[#0F2A1D]/60">Mon–Fri, 9:00 AM – 6:00 PM HKT (placeholder)</dd>
                </div>
                <div>
                  <dt className="font-medium text-[#0F2A1D]">Email notifications</dt>
                  <dd className="mt-1 text-[#0F2A1D]/60">
                    Automated booking emails — Wave 4 (Resend / SendGrid)
                  </dd>
                </div>
              </dl>
            </section>

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

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
              >
                {saving ? "Saving…" : "Save settings"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
