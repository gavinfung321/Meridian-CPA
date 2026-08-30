import { useEffect, useState } from "react";
import { AdminModal } from "../../components/AdminModal";
import { Button } from "../../components/ui/button";
import { adminInputClassName } from "../../lib/session-admin";

export type BookingReasonAction = "reject" | "cancel";

interface BookingReasonModalProps {
  open: boolean;
  action: BookingReasonAction;
  clientName: string;
  saving: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const COPY: Record<
  BookingReasonAction,
  { title: string; description: (name: string) => string; confirm: string; confirming: string }
> = {
  reject: {
    title: "Reject booking",
    description: (name) => `Decline ${name}'s booking request. A reason is required.`,
    confirm: "Confirm rejection",
    confirming: "Rejecting…",
  },
  cancel: {
    title: "Cancel booking",
    description: (name) => `Cancel ${name}'s confirmed booking. A reason is required.`,
    confirm: "Confirm cancellation",
    confirming: "Cancelling…",
  },
};

export function BookingReasonModal({
  open,
  action,
  clientName,
  saving,
  onClose,
  onConfirm,
}: BookingReasonModalProps): JSX.Element {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  const copy = COPY[action];

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={copy.title}
      description={copy.description(clientName)}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Back
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={saving || !reason.trim()}
            onClick={() => onConfirm(reason.trim())}
          >
            {saving ? copy.confirming : copy.confirm}
          </Button>
        </>
      }
    >
      <label htmlFor="booking-reason" className="block text-sm font-medium text-[#0F2A1D]">
        Reason
      </label>
      <textarea
        id="booking-reason"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={3}
        className={`${adminInputClassName} mt-1`}
        placeholder={
          action === "reject"
            ? "e.g. Session fully booked — please choose another slot"
            : "e.g. Client requested to reschedule"
        }
      />
    </AdminModal>
  );
}
