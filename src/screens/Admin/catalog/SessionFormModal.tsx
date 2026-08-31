import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RecurrenceRulesEditor } from "../../../components/RecurrenceRulesEditor";
import { AdminModal } from "../../../components/AdminModal";
import { Button } from "../../../components/ui/button";
import { buildAdminSessionBookingsUrl } from "../../../lib/booking-admin";
import {
  buildRecurrenceRules,
  defaultRecurrenceFormState,
  parseRecurrenceFormState,
  type RecurrenceFormState,
} from "../../../lib/recurrence-rules";
import {
  getPublicSessionImageUrl,
  removeSessionImage,
  uploadSessionImage,
} from "../../../lib/session-image";
import {
  addMinutes,
  adminInputClassName,
  fetchSessionTypesWithCategories,
  formatAdminSessionCapacity,
  formatPrice,
  formatSessionDateLong,
  formatSessionTimeRange,
  fromDatetimeLocalValue,
  getSessionBookingCounts,
  toDatetimeLocalValue,
  type SessionBookingCounts,
  type SessionTypeWithCategory,
} from "../../../lib/session-admin";
import { supabase } from "../../../lib/supabase";
import type { Session } from "../../../types/database";
import { cn } from "../../../lib/utils";

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
  recurrence_rules: Record<string, unknown> | null;
  image_path: string | null;
};

interface SessionFormModalProps {
  open: boolean;
  session: SessionRow | null;
  bookingCounts?: SessionBookingCounts;
  saving: boolean;
  reactivating?: boolean;
  onClose: () => void;
  onSave: (payload: SessionFormSavePayload) => void;
  onRequestCancel?: () => void;
  onReactivate?: () => void;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  accent?: boolean;
}): JSX.Element {
  return (
    <div className="rounded-xl border border-[#EDECE6] bg-[#F9F9F6] p-4">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            accent ? "bg-[#C9A84C]/15 text-[#C9A84C]" : "bg-white text-[#0F2A1D]/50",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0F2A1D]/45">
            {label}
          </p>
          <p className="mt-0.5 text-sm font-medium text-[#0F2A1D]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description?: string }): JSX.Element {
  return (
    <div className="border-b border-[#EDECE6] pb-2">
      <h3 className="font-serif text-base font-semibold text-[#0F2A1D]">{title}</h3>
      {description ? <p className="mt-0.5 text-xs text-[#0F2A1D]/55">{description}</p> : null}
    </div>
  );
}

export function SessionFormModal({
  open,
  session,
  bookingCounts,
  saving,
  reactivating = false,
  onClose,
  onSave,
  onRequestCancel,
  onReactivate,
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
  const [recurrence, setRecurrence] = useState<RecurrenceFormState>(defaultRecurrenceFormState());
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSessionType = useMemo(
    () => sessionTypes.find((type) => type.id === sessionTypeId) ?? null,
    [sessionTypeId, sessionTypes],
  );

  const previewStartIso = startTime ? fromDatetimeLocalValue(startTime) : session?.start_time ?? "";
  const previewEndIso = previewStartIso
    ? addMinutes(previewStartIso, durationMinutes)
    : session?.end_time ?? "";

  const counts = bookingCounts ?? getSessionBookingCounts(null);
  const capacityDisplay = formatAdminSessionCapacity(counts, maxSlots || 1);
  const fillPct =
    maxSlots > 0 ? Math.min(100, Math.round((counts.reserved / maxSlots) * 100)) : 0;

  const typeLabel = selectedSessionType
    ? selectedSessionType.category?.name
      ? `${selectedSessionType.category.name} · ${selectedSessionType.name}`
      : selectedSessionType.name
    : session?.session_type?.category?.name && session.session_type?.name
      ? `${session.session_type.category.name} · ${session.session_type.name}`
      : "Session";

  useEffect(() => {
    if (!open) return;

    void fetchSessionTypesWithCategories()
      .then((types) => setSessionTypes(types.filter((type) => type.is_active)))
      .catch(() => setSessionTypes([]));
  }, [open]);

  useEffect(() => {
    if (!open || !session) return;

    setError(null);
    setTitle(session.title);
    setDescription(session.description ?? "");
    setSessionTypeId(session.session_type_id ?? sessionTypes[0]?.id ?? "");
    setLocation(session.location);
    setStartTime(toDatetimeLocalValue(session.start_time));
    setDurationMinutes(session.duration_minutes);
    setMaxSlots(session.max_slots);
    setPrice(Number(session.price));
    setRecurrence(parseRecurrenceFormState(session.recurrence_rules));
    setImagePath(session.image_path ?? null);
    setImagePreviewUrl(getPublicSessionImageUrl(session.image_path));
    setPendingImageFile(null);
  }, [open, session, sessionTypes]);

  useEffect(() => {
    if (!open || !selectedSessionType || session) return;
    setDurationMinutes(selectedSessionType.default_duration_minutes);
    setPrice(Number(selectedSessionType.default_price));
    setMaxSlots(selectedSessionType.default_max_slots ?? 1);
    setDescription(selectedSessionType.description ?? "");
  }, [open, selectedSessionType, session]);

  useEffect(() => {
    return () => {
      if (pendingImageFile && imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [pendingImageFile, imagePreviewUrl]);

  const applyTypeDefaults = (typeId: string) => {
    setSessionTypeId(typeId);
    const type = sessionTypes.find((item) => item.id === typeId);
    if (!type) return;
    setDurationMinutes(type.default_duration_minutes);
    setPrice(Number(type.default_price));
    setMaxSlots(type.default_max_slots ?? 1);
    setDescription(type.description ?? "");
  };

  const handleImageChange = (file: File | null) => {
    if (imagePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    if (!file) {
      setPendingImageFile(null);
      setImagePreviewUrl(getPublicSessionImageUrl(imagePath));
      return;
    }

    setPendingImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = async () => {
    if (!session) return;

    setUploadingImage(true);
    setError(null);

    if (imagePath) {
      const { error: removeError } = await removeSessionImage(imagePath);
      if (removeError) {
        setError(removeError);
        setUploadingImage(false);
        return;
      }
    }

    handleImageChange(null);
    setImagePath(null);

    await supabase.from("sessions").update({ image_path: null }).eq("id", session.id);
    setUploadingImage(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!session) return;

    const trimmedTitle = title.trim();
    const trimmedLocation = location.trim();
    if (!trimmedTitle || !trimmedLocation || !sessionTypeId || !startTime) return;

    if (recurrence.frequency === "weekly" && recurrence.days.length === 0) {
      setError("Select at least one day for weekly recurrence.");
      return;
    }

    setError(null);

    let nextImagePath = imagePath;

    if (pendingImageFile) {
      setUploadingImage(true);
      const { path, error: uploadError } = await uploadSessionImage(
        session.id,
        pendingImageFile,
        imagePath,
      );
      setUploadingImage(false);

      if (uploadError) {
        setError(uploadError);
        return;
      }

      nextImagePath = path;
      setImagePath(path);
      setPendingImageFile(null);
    }

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
      recurrence_rules: buildRecurrenceRules(recurrence),
      image_path: nextImagePath,
    });
  };

  const formBusy = saving || uploadingImage;

  return (
    <AdminModal
      open={open}
      size="xl"
      onClose={onClose}
      title={title.trim() || "Edit session"}
      description={typeLabel}
      footer={
        <>
          <div className="mr-auto flex gap-2">
            {session && !session.is_cancelled && onRequestCancel ? (
              <Button
                type="button"
                variant="outline"
                className="text-red-700 hover:bg-red-50 hover:text-red-800"
                onClick={onRequestCancel}
                disabled={formBusy}
              >
                Cancel session
              </Button>
            ) : null}
            {session?.is_cancelled && onReactivate ? (
              <Button
                type="button"
                variant="outline"
                disabled={reactivating || formBusy}
                onClick={onReactivate}
              >
                {reactivating ? "Reactivating…" : "Reactivate session"}
              </Button>
            ) : null}
          </div>
          <Button type="button" variant="outline" onClick={onClose} disabled={formBusy}>
            Close
          </Button>
          <Button
            type="submit"
            form="session-form"
            disabled={formBusy || !title.trim() || !sessionTypeId || !startTime}
            className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
          >
            {saving ? "Saving…" : uploadingImage ? "Uploading…" : "Save changes"}
          </Button>
        </>
      }
    >
      {session ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {session.is_cancelled ? (
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                Cancelled
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                Active
              </span>
            )}
            <span className="rounded-full border border-[#EDECE6] bg-white px-2.5 py-1 text-xs font-medium text-[#0F2A1D]/70">
              {typeLabel}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryCard
              icon={CalendarDays}
              label="Schedule"
              value={previewStartIso ? formatSessionDateLong(previewStartIso) : "—"}
            />
            <SummaryCard
              icon={Clock}
              label="Time range"
              value={
                previewStartIso && previewEndIso
                  ? formatSessionTimeRange(previewStartIso, previewEndIso)
                  : "—"
              }
              accent
            />
          </div>

          {bookingCounts && session ? (
            <Link
              to={buildAdminSessionBookingsUrl(session.id, {
                status: counts.pending > 0 ? "pending" : "all",
              })}
              onClick={onClose}
              title={capacityDisplay.title}
              className="block rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/5 p-4 transition-colors hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C9A84C]/15 text-[#C9A84C]">
                    <Users className="h-4 w-4" aria-hidden />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0F2A1D]/45">
                      Capacity utilization
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-[#0F2A1D]">
                      {capacityDisplay.primary.replace(" / ", " of ")} slots filled
                    </p>
                    {capacityDisplay.subline ? (
                      <p className="mt-0.5 text-xs text-amber-700">{capacityDisplay.subline}</p>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm font-medium text-[#C9A84C]">{fillPct}%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EDECE6]">
                <div
                  className="h-full rounded-full bg-[#C9A84C] transition-all"
                  style={{ width: `${Math.max(fillPct, fillPct > 0 ? 6 : 0)}%` }}
                />
              </div>
            </Link>
          ) : null}

          {session.is_cancelled ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              This session is cancelled. Reactivate below to restore it on the public schedule.
            </p>
          ) : null}
        </div>
      ) : null}

      <form
        id="session-form"
        onSubmit={(event) => void handleSubmit(event)}
        className="mt-6 space-y-6"
      >
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <section className="space-y-4">
          <SectionHeading title="Session details" description="What clients see when booking." />

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
            <div className="relative mt-1">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F2A1D]/35" />
              <input
                id="session-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className={`${adminInputClassName} pl-9`}
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
              rows={3}
              className={`${adminInputClassName} mt-1`}
            />
          </div>

          <div>
            <label htmlFor="session-image" className="block text-sm font-medium text-[#0F2A1D]">
              Cover image <span className="font-normal text-[#0F2A1D]/50">(optional)</span>
            </label>
            {imagePreviewUrl ? (
              <div className="mt-2 overflow-hidden rounded-lg border border-[#EDECE6]">
                <img src={imagePreviewUrl} alt="" className="aspect-[16/9] w-full object-cover" />
              </div>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-3">
              <input
                id="session-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingImage}
                onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
                className="block w-full text-sm text-[#0F2A1D]/70 file:mr-3 file:rounded-md file:border-0 file:bg-[#0F2A1D] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
              />
              {imagePreviewUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingImage}
                  onClick={() => void handleRemoveImage()}
                >
                  Remove image
                </Button>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-[#0F2A1D]/50">JPEG, PNG, or WebP up to 5 MB.</p>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeading title="Schedule & pricing" description="When the session runs and how it is priced." />

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
              <label
                htmlFor="session-duration"
                className="mb-1 block min-h-10 text-sm font-medium leading-snug text-[#0F2A1D]"
              >
                Duration (mins)
              </label>
              <input
                id="session-duration"
                type="number"
                min={15}
                step={15}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
                className={`${adminInputClassName} w-full`}
                required
              />
            </div>
            <div>
              <label
                htmlFor="session-capacity"
                className="mb-1 block min-h-10 text-sm font-medium leading-snug text-[#0F2A1D]"
              >
                Capacity
              </label>
              <input
                id="session-capacity"
                type="number"
                min={1}
                value={maxSlots}
                onChange={(event) => setMaxSlots(Number(event.target.value))}
                className={`${adminInputClassName} w-full`}
                required
              />
            </div>
            <div>
              <label
                htmlFor="session-price"
                className="mb-1 block min-h-10 text-sm font-medium leading-snug text-[#0F2A1D]"
              >
                Price (HKD)
              </label>
              <input
                id="session-price"
                type="number"
                min={0}
                step={50}
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
                className={`${adminInputClassName} w-full`}
                required
              />
            </div>
          </div>

          {previewStartIso && previewEndIso ? (
            <p className="text-xs text-[#0F2A1D]/55">
              Ends at {formatSessionTimeRange(previewStartIso, previewEndIso).split("–")[1]?.trim()} ·{" "}
              {formatPrice(price)} per slot
            </p>
          ) : null}
        </section>

        <section className="space-y-4">
          <SectionHeading
            title="Recurrence"
            description="Optional repeating schedule for this session slot."
          />
          <RecurrenceRulesEditor value={recurrence} onChange={setRecurrence} />
        </section>
      </form>
    </AdminModal>
  );
}
