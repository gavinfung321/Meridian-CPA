import { FormEvent, useState } from "react";
import { AdminModal } from "./AdminModal";
import { Button } from "./ui/button";
import { adminInputClassName } from "../lib/session-admin";
import type { PublicSessionCard } from "../lib/public-sessions";

interface BookSessionModalProps {
  session: PublicSessionCard | null;
  open: boolean;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function BookSessionModal({
  session,
  open,
  submitting,
  error,
  onClose,
  onConfirm,
}: BookSessionModalProps): JSX.Element | null {
  if (!open || !session) return null;

  return (
    <AdminModal
      open
      onClose={onClose}
      title="Request booking"
      description={session.title}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={submitting}
            className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
            onClick={onConfirm}
          >
            {submitting ? "Submitting…" : "Submit request"}
          </Button>
        </>
      }
    >
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
            When
          </dt>
          <dd className="mt-1 text-[#0F2A1D]">
            {session.day} {session.time} · {session.duration} min
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
            Location
          </dt>
          <dd className="mt-1 text-[#0F2A1D]">{session.location}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
            Status after submit
          </dt>
          <dd className="mt-1 text-[#0F2A1D]">Pending firm approval</dd>
        </div>
      </dl>
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
    </AdminModal>
  );
}

interface CancelBookingModalProps {
  open: boolean;
  sessionTitle: string;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function CancelBookingModal({
  open,
  sessionTitle,
  submitting,
  error,
  onClose,
  onConfirm,
}: CancelBookingModalProps): JSX.Element | null {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <AdminModal
      open
      onClose={onClose}
      title="Cancel booking"
      description={`Cancel your booking for “${sessionTitle}”.`}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Keep booking
          </Button>
          <Button
            type="submit"
            form="cancel-booking-form"
            variant="destructive"
            disabled={submitting || !reason.trim()}
          >
            {submitting ? "Cancelling…" : "Confirm cancellation"}
          </Button>
        </>
      }
    >
      <form id="cancel-booking-form" onSubmit={handleSubmit}>
        <label htmlFor="cancel-booking-reason" className="block text-sm font-medium">
          Reason
        </label>
        <textarea
          id="cancel-booking-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          className={`${adminInputClassName} mt-1`}
          placeholder="e.g. Schedule conflict"
          required
        />
      </form>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </AdminModal>
  );
}
