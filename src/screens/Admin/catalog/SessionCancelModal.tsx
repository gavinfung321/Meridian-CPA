import { useEffect, useState } from "react";
import { AdminModal } from "../../../components/AdminModal";
import { Button } from "../../../components/ui/button";
import { adminInputClassName } from "../../../lib/session-admin";

interface SessionCancelModalProps {
  open: boolean;
  sessionTitle: string;
  cancelling: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function SessionCancelModal({
  open,
  sessionTitle,
  cancelling,
  onClose,
  onConfirm,
}: SessionCancelModalProps): JSX.Element {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(reason);
  };

  return (
    <AdminModal
      open={open}
      onClose={handleClose}
      title="Cancel session"
      description={`This hides “${sessionTitle}” from public booking. Existing bookings are not changed in this step.`}
      footer={
        <>
          <Button type="button" variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={cancelling || !reason.trim()}
            onClick={handleConfirm}
          >
            {cancelling ? "Cancelling…" : "Confirm cancellation"}
          </Button>
        </>
      }
    >
      <label htmlFor="session-cancel-reason" className="block text-sm font-medium text-[#0F2A1D]">
        Reason
      </label>
      <textarea
        id="session-cancel-reason"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={3}
        className={`${adminInputClassName} mt-1`}
        placeholder="e.g. Practitioner unavailable"
      />
    </AdminModal>
  );
}
