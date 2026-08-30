import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminModal } from "../../../components/AdminModal";
import { Button } from "../../../components/ui/button";
import {
  addMinutes,
  adminInputClassName,
  fetchSessionTypesWithCategories,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
  type SessionTypeWithCategory,
} from "../../../lib/session-admin";
import type { Session } from "../../../types/database";

type SessionRow = Session & {
  session_type: { name: string; category: { name: string } | null } | null;
};

export type SessionFormSavePayload = {
  title: string;
  description: string | null;
  session_type_id: string;
  type: string;
  location: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  max_slots: number;
  price: number;
};

interface SessionFormModalProps {
  open: boolean;
  session: SessionRow | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: SessionFormSavePayload) => void;
}

export function SessionFormModal({
  open,
  session,
  saving,
  onClose,
  onSave,
}: SessionFormModalProps): JSX.Element {
  const [sessionTypes, setSessionTypes] = useState<SessionTypeWithCategory[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sessionTypeId, setSessionTypeId] = useState("");
  const [location, setLocation] = useState("Central Office");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [maxSlots, setMaxSlots] = useState(1);
  const [price, setPrice] = useState(0);

  const selectedSessionType = useMemo(
    () => sessionTypes.find((type) => type.id === sessionTypeId) ?? null,
    [sessionTypeId, sessionTypes],
  );

  useEffect(() => {
    if (!open) return;

    void fetchSessionTypesWithCategories()
      .then((types) => setSessionTypes(types.filter((type) => type.is_active)))
      .catch(() => setSessionTypes([]));
  }, [open]);

  useEffect(() => {
    if (!open || !session) return;

    setTitle(session.title);
    setDescription(session.description ?? "");
    setSessionTypeId(session.session_type_id ?? sessionTypes[0]?.id ?? "");
    setLocation(session.location);
    setStartTime(toDatetimeLocalValue(session.start_time));
    setDurationMinutes(session.duration_minutes);
    setMaxSlots(session.max_slots);
    setPrice(Number(session.price));
  }, [open, session, sessionTypes]);

  useEffect(() => {
    if (!open || !selectedSessionType || session) return;
    setDurationMinutes(selectedSessionType.default_duration_minutes);
    setPrice(Number(selectedSessionType.default_price));
    setMaxSlots(selectedSessionType.default_max_slots ?? 1);
  }, [open, selectedSessionType, session]);

  const applyTypeDefaults = (typeId: string) => {
    setSessionTypeId(typeId);
    const type = sessionTypes.find((item) => item.id === typeId);
    if (!type) return;
    setDurationMinutes(type.default_duration_minutes);
    setPrice(Number(type.default_price));
    setMaxSlots(type.default_max_slots ?? 1);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedLocation = location.trim();
    if (!trimmedTitle || !trimmedLocation || !sessionTypeId || !startTime) return;

    const startIso = fromDatetimeLocalValue(startTime);
    const endIso = addMinutes(startIso, durationMinutes);
    const legacyType = selectedSessionType?.name ?? "General";

    onSave({
      title: trimmedTitle,
      description: description.trim() || null,
      session_type_id: sessionTypeId,
      type: legacyType,
      location: trimmedLocation,
      start_time: startIso,
      end_time: endIso,
      duration_minutes: durationMinutes,
      max_slots: maxSlots,
      price,
    });
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      wide
      title="Edit session"
      description={
        session?.is_cancelled
          ? "This session is cancelled. Saving changes will not reactivate it — use Reactivate from the table."
          : undefined
      }
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="session-form"
            disabled={saving || !title.trim() || !sessionTypeId || !startTime}
            className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </>
      }
    >
      <form id="session-form" onSubmit={handleSubmit} className="space-y-4">
        {session ? (
          <p className="text-xs text-[#0F2A1D]/60">
            Need recurrence or cover image?{" "}
            <Link
              to={`/admin/sessions/edit/${session.id}`}
              className="font-medium text-[#0F2A1D] underline"
              onClick={onClose}
            >
              Open full editor
            </Link>
          </p>
        ) : null}

        <div>
          <label htmlFor="session-title" className="block text-sm font-medium text-[#0F2A1D]">
            Title
          </label>
          <input
            id="session-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={`${adminInputClassName} mt-1`}
            required
          />
        </div>

        <div>
          <label htmlFor="session-type" className="block text-sm font-medium text-[#0F2A1D]">
            Session type
          </label>
          <select
            id="session-type"
            value={sessionTypeId}
            onChange={(event) => applyTypeDefaults(event.target.value)}
            className={`${adminInputClassName} mt-1`}
            required
          >
            {sessionTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.category?.name ? `${type.category.name} · ${type.name}` : type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="session-location" className="block text-sm font-medium text-[#0F2A1D]">
            Location
          </label>
          <input
            id="session-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className={`${adminInputClassName} mt-1`}
            required
          />
        </div>

        <div>
          <label htmlFor="session-start" className="block text-sm font-medium text-[#0F2A1D]">
            Start date & time
          </label>
          <input
            id="session-start"
            type="datetime-local"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            className={`${adminInputClassName} mt-1`}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="session-duration" className="block text-sm font-medium text-[#0F2A1D]">
              Duration (mins)
            </label>
            <input
              id="session-duration"
              type="number"
              min={15}
              step={15}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
              className={`${adminInputClassName} mt-1`}
              required
            />
          </div>
          <div>
            <label htmlFor="session-capacity" className="block text-sm font-medium text-[#0F2A1D]">
              Capacity
            </label>
            <input
              id="session-capacity"
              type="number"
              min={1}
              value={maxSlots}
              onChange={(event) => setMaxSlots(Number(event.target.value))}
              className={`${adminInputClassName} mt-1`}
              required
            />
          </div>
          <div>
            <label htmlFor="session-price" className="block text-sm font-medium text-[#0F2A1D]">
              Price (HKD)
            </label>
            <input
              id="session-price"
              type="number"
              min={0}
              step={50}
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
              className={`${adminInputClassName} mt-1`}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="session-description" className="block text-sm font-medium text-[#0F2A1D]">
            Description <span className="font-normal text-[#0F2A1D]/50">(optional)</span>
          </label>
          <textarea
            id="session-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            className={`${adminInputClassName} mt-1`}
          />
        </div>
      </form>
    </AdminModal>
  );
}
