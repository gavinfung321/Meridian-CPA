import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../components/AdminLayout";
import { RecurrenceRulesEditor } from "../../components/RecurrenceRulesEditor";
import { Button } from "../../components/ui/button";
import {
  buildRecurrenceRules,
  defaultRecurrenceFormState,
  parseRecurrenceFormState,
  type RecurrenceFormState,
} from "../../lib/recurrence-rules";
import {
  addMinutes,
  adminInputClassName,
  fetchSessionTypesWithCategories,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
  type SessionTypeWithCategory,
} from "../../lib/session-admin";
import {
  getPublicSessionImageUrl,
  removeSessionImage,
  uploadSessionImage,
} from "../../lib/session-image";
import { supabase } from "../../lib/supabase";
import type { Session } from "../../types/database";

const defaultStart = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(10, 0, 0, 0);
  return toDatetimeLocalValue(date.toISOString());
};

export function AdminSessionForm(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const draftSessionId = useMemo(() => id ?? crypto.randomUUID(), [id]);

  const [sessionTypes, setSessionTypes] = useState<SessionTypeWithCategory[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sessionTypeId, setSessionTypeId] = useState("");
  const [location, setLocation] = useState("Central Office");
  const [startTime, setStartTime] = useState(defaultStart());
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [maxSlots, setMaxSlots] = useState(1);
  const [price, setPrice] = useState(0);
  const [recurrence, setRecurrence] = useState<RecurrenceFormState>(defaultRecurrenceFormState());
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);

  const selectedSessionType = useMemo(
    () => sessionTypes.find((type) => type.id === sessionTypeId) ?? null,
    [sessionTypeId, sessionTypes],
  );

  useEffect(() => {
    document.title = isEditing
      ? "Edit session | Admin | Meridian CPA"
      : "New session | Admin | Meridian CPA";
  }, [isEditing]);

  useEffect(() => {
    let cancelled = false;

    async function loadFormData() {
      setError(null);

      try {
        const types = await fetchSessionTypesWithCategories();
        if (cancelled) return;
        setSessionTypes(types.filter((type) => type.is_active));

        if (isEditing && id) {
          const { data, error: fetchError } = await supabase
            .from("sessions")
            .select("*")
            .eq("id", id)
            .single();

          if (fetchError) throw fetchError;
          if (!data) throw new Error("Session not found.");

          const session = data as Session;
          setTitle(session.title);
          setDescription(session.description ?? "");
          setSessionTypeId(session.session_type_id ?? types.find((type) => type.is_active)?.id ?? "");
          setLocation(session.location);
          setStartTime(toDatetimeLocalValue(session.start_time));
          setDurationMinutes(session.duration_minutes);
          setMaxSlots(session.max_slots);
          setPrice(Number(session.price));
          setRecurrence(parseRecurrenceFormState(session.recurrence_rules));
          setImagePath(session.image_path ?? null);
          setImagePreviewUrl(getPublicSessionImageUrl(session.image_path));
          setIsCancelled(session.is_cancelled);
        } else if (types.length > 0) {
          const firstType = types.find((type) => type.is_active) ?? types[0];
          setSessionTypeId(firstType.id);
          setDurationMinutes(firstType.default_duration_minutes);
          setPrice(Number(firstType.default_price));
          setMaxSlots(firstType.default_max_slots ?? 1);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load session.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadFormData();
    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  useEffect(() => {
    if (!selectedSessionType || isEditing) return;
    setDurationMinutes(selectedSessionType.default_duration_minutes);
    setPrice(Number(selectedSessionType.default_price));
    setMaxSlots(selectedSessionType.default_max_slots ?? 1);
  }, [selectedSessionType, isEditing]);

  useEffect(() => {
    return () => {
      if (pendingImageFile && imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [pendingImageFile, imagePreviewUrl]);

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
    if (imagePath) {
      const { error: removeError } = await removeSessionImage(imagePath);
      if (removeError) {
        setError(removeError);
        return;
      }
    }

    handleImageChange(null);
    setImagePath(null);

    if (isEditing && id) {
      await supabase.from("sessions").update({ image_path: null }).eq("id", id);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    const trimmedTitle = title.trim();
    const trimmedLocation = location.trim();
    if (!trimmedTitle || !trimmedLocation || !sessionTypeId) {
      setError("Title, session type, and location are required.");
      setSubmitting(false);
      return;
    }

    if (recurrence.frequency === "weekly" && recurrence.days.length === 0) {
      setError("Select at least one day for weekly recurrence.");
      setSubmitting(false);
      return;
    }

    const startIso = fromDatetimeLocalValue(startTime);
    const endIso = addMinutes(startIso, durationMinutes);
    const legacyType = selectedSessionType?.name ?? "General";
    const sessionId = id ?? draftSessionId;

    let nextImagePath = imagePath;

    if (pendingImageFile) {
      const { path, error: uploadError } = await uploadSessionImage(
        sessionId,
        pendingImageFile,
        imagePath,
      );
      if (uploadError) {
        setError(uploadError);
        setSubmitting(false);
        return;
      }
      nextImagePath = path;
    }

    const basePayload = {
      title: trimmedTitle,
      description: description.trim() || null,
      type: legacyType,
      session_type_id: sessionTypeId,
      location: trimmedLocation,
      start_time: startIso,
      end_time: endIso,
      duration_minutes: durationMinutes,
      max_slots: maxSlots,
      price,
      recurrence_rules: buildRecurrenceRules(recurrence),
      image_path: nextImagePath,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEditing && id) {
        const { error: updateError } = await supabase.from("sessions").update(basePayload).eq("id", id);
        if (updateError) throw updateError;
        setImagePath(nextImagePath);
        setPendingImageFile(null);
        setMessage("Session updated.");
      } else {
        const { error: insertError } = await supabase
          .from("sessions")
          .insert({ ...basePayload, id: sessionId });
        if (insertError) throw insertError;
        navigate("/admin/sessions");
        return;
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save session.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSession = async () => {
    if (!id || !cancelReason.trim()) {
      setError("A cancellation reason is required.");
      return;
    }

    setCancelling(true);
    setError(null);

    const { error: cancelError } = await supabase
      .from("sessions")
      .update({
        is_cancelled: true,
        cancel_reason: cancelReason.trim(),
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setCancelling(false);

    if (cancelError) {
      setError(cancelError.message);
      return;
    }

    setIsCancelled(true);
    setShowCancelModal(false);
    setMessage("Session cancelled.");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-3xl py-12 text-center text-[#0F2A1D]/70">Loading…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            to="/admin/sessions"
            className="text-sm font-medium text-[#0F2A1D]/60 hover:text-[#0F2A1D]"
          >
            ← Back to sessions
          </Link>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-[#0F2A1D]">
            {isEditing ? "Edit session" : "New session"}
          </h1>
          <p className="mt-2 text-[#0F2A1D]/70">
            {isEditing
              ? "Update slot details, pricing, recurrence, and cover image."
              : "Create a bookable session slot for clients."}
          </p>
        </div>

        {isCancelled ? (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This session is cancelled and hidden from public booking.
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        ) : null}

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-6 rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="mb-1 block text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={adminInputClassName}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="mb-1 block text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className={adminInputClassName}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="sessionImage" className="mb-1 block text-sm font-medium">
                Cover image (optional)
              </label>
              {imagePreviewUrl ? (
                <div className="mb-3 overflow-hidden rounded-lg border border-[#EDECE6]">
                  <img src={imagePreviewUrl} alt="" className="aspect-[16/9] w-full object-cover" />
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <input
                  id="sessionImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-[#0F2A1D]/70 file:mr-3 file:rounded-md file:border-0 file:bg-[#0F2A1D] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
                />
                {imagePreviewUrl ? (
                  <Button type="button" variant="outline" onClick={() => void handleRemoveImage()}>
                    Remove image
                  </Button>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-[#0F2A1D]/60">JPEG, PNG, or WebP up to 5 MB.</p>
            </div>

            <div>
              <label htmlFor="sessionType" className="mb-1 block text-sm font-medium">
                Session type
              </label>
              <select
                id="sessionType"
                value={sessionTypeId}
                onChange={(event) => setSessionTypeId(event.target.value)}
                className={adminInputClassName}
                required
              >
                <option value="">Select a type</option>
                {sessionTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.category?.name ? `${type.category.name} · ` : ""}
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="mb-1 block text-sm font-medium">
                Location
              </label>
              <input
                id="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className={adminInputClassName}
                required
              />
            </div>

            <div>
              <label htmlFor="startTime" className="mb-1 block text-sm font-medium">
                Start time
              </label>
              <input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className={adminInputClassName}
                required
              />
            </div>

            <div>
              <label htmlFor="duration" className="mb-1 block text-sm font-medium">
                Duration (minutes)
              </label>
              <input
                id="duration"
                type="number"
                min={15}
                step={15}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
                className={adminInputClassName}
                required
              />
            </div>

            <div>
              <label htmlFor="maxSlots" className="mb-1 block text-sm font-medium">
                Max slots
              </label>
              <input
                id="maxSlots"
                type="number"
                min={1}
                value={maxSlots}
                onChange={(event) => setMaxSlots(Number(event.target.value))}
                className={adminInputClassName}
                required
              />
            </div>

            <div>
              <label htmlFor="price" className="mb-1 block text-sm font-medium">
                Price (HKD)
              </label>
              <input
                id="price"
                type="number"
                min={0}
                step={50}
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
                className={adminInputClassName}
                required
              />
            </div>

            <RecurrenceRulesEditor value={recurrence} onChange={setRecurrence} />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-[#EDECE6] pt-6">
            <Button
              type="submit"
              disabled={submitting || isCancelled}
              className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
            >
              {submitting ? "Saving…" : isEditing ? "Save changes" : "Create session"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/sessions">Cancel</Link>
            </Button>
            {isEditing && !isCancelled ? (
              <Button
                type="button"
                variant="destructive"
                className="ml-auto"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel session slot
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      {showCancelModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#EDECE6] bg-white p-6 shadow-lg">
            <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">Cancel session</h2>
            <p className="mt-2 text-sm text-[#0F2A1D]/70">
              This hides the slot from public booking. Existing bookings are not changed in this
              step.
            </p>
            <label htmlFor="cancelReason" className="mt-4 block text-sm font-medium">
              Reason
            </label>
            <textarea
              id="cancelReason"
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              rows={3}
              className={`${adminInputClassName} mt-1`}
            />
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowCancelModal(false)}>
                Close
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={cancelling}
                onClick={() => void handleCancelSession()}
              >
                {cancelling ? "Cancelling…" : "Confirm cancellation"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
