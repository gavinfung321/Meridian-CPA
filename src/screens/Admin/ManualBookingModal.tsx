import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminModal } from "../../components/AdminModal";
import { Button } from "../../components/ui/button";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  createAdminBooking,
  fetchManualBookingClients,
  fetchManualBookingSessions,
  type ManualBookingClient,
  type ManualBookingSession,
} from "../../lib/booking-admin";
import { getDisplayName } from "../../lib/profile";
import { countActiveBookings, formatPrice, formatSessionSchedule, adminInputClassName } from "../../lib/session-admin";

interface ManualBookingModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function ManualBookingModal({
  open,
  onClose,
  onCreated,
}: ManualBookingModalProps): JSX.Element | null {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [clients, setClients] = useState<ManualBookingClient[]>([]);
  const [sessions, setSessions] = useState<ManualBookingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientId, setClientId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState<"pending" | "confirmed">("confirmed");

  useEffect(() => {
    if (!open) return;

    setClientId("");
    setSessionId("");
    setStatus("confirmed");
    setError(null);
    setLoading(true);

    void Promise.all([fetchManualBookingClients(), fetchManualBookingSessions()])
      .then(([clientRows, sessionRows]) => {
        setClients(clientRows);
        setSessions(sessionRows);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load form data.");
      })
      .finally(() => setLoading(false));
  }, [open]);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === sessionId) ?? null,
    [sessions, sessionId],
  );

  const sessionCapacityLabel = selectedSession
    ? `${countActiveBookings(selectedSession.bookings)} / ${selectedSession.max_slots} booked`
    : null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!clientId || !sessionId) return;

    setSubmitting(true);
    setError(null);

    try {
      await createAdminBooking(clientId, sessionId, profile?.id ?? clientId, status);
      showToast(
        status === "confirmed" ? "Booking created and confirmed." : "Booking request created.",
      );
      onCreated();
      onClose();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Failed to create booking.";
      setError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <AdminModal
      open
      onClose={onClose}
      title="Manual booking"
      description="Create a booking on behalf of a client — for walk-ins or phone requests."
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="manual-booking-form"
            disabled={submitting || loading || !clientId || !sessionId}
            className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
          >
            {submitting ? "Creating…" : "Create booking"}
          </Button>
        </>
      }
    >
      {loading ? (
        <p className="text-sm text-[#0F2A1D]/60">Loading clients and sessions…</p>
      ) : (
        <form id="manual-booking-form" className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <label className="block text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
              Client
            </span>
            <select
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              className={`${adminInputClassName} mt-1`}
              required
            >
              <option value="">Select a client…</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {getDisplayName(client.first_name, client.last_name, client.email)} ({client.email})
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
              Session
            </span>
            <select
              value={sessionId}
              onChange={(event) => setSessionId(event.target.value)}
              className={`${adminInputClassName} mt-1`}
              required
            >
              <option value="">Select a session…</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title} · {formatSessionSchedule(session.start_time)} ·{" "}
                  {formatPrice(session.price)}
                </option>
              ))}
            </select>
            {sessionCapacityLabel ? (
              <span className="mt-1 block text-xs text-[#0F2A1D]/50">{sessionCapacityLabel}</span>
            ) : null}
          </label>

          <fieldset className="space-y-2">
            <legend className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
              Initial status
            </legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="manual-booking-status"
                value="confirmed"
                checked={status === "confirmed"}
                onChange={() => setStatus("confirmed")}
              />
              Confirmed *(walk-in / already approved)*
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="manual-booking-status"
                value="pending"
                checked={status === "pending"}
                onChange={() => setStatus("pending")}
              />
              Pending *(needs review)*
            </label>
          </fieldset>

          {clients.length === 0 ? (
            <p className="text-sm text-amber-700">No active clients found. Users must register first.</p>
          ) : null}
          {sessions.length === 0 ? (
            <p className="text-sm text-amber-700">No upcoming sessions available.</p>
          ) : null}
        </form>
      )}

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
    </AdminModal>
  );
}
