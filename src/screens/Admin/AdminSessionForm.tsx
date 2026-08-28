import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../components/AdminLayout";
import { Button } from "../../components/ui/button";
import {
  addMinutes,
  adminInputClassName,
  fetchSessionTypesWithCategories,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
  type SessionTypeWithCategory,
} from "../../lib/session-admin";
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
  const [recurrenceRules, setRecurrenceRules] = useState("");
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
          setRecurrenceRules(
            session.recurrence_rules ? JSON.stringify(session.recurrence_rules, null, 2) : "",
          );
          setIsCancelled(session.is_cancelled);
        } else if (types.length > 0) {
          const firstType = types.find((type) => type.is_active) ?? types[0];
          setSessionTypeId(firstType.id);
          setDurationMinutes(firstType.default_duration_minutes);
          setPrice(Number(firstType.default_price));
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
  }, [selectedSessionType, isEditing]);

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

    let parsedRecurrence: Record<string, unknown> | null = null;
    if (recurrenceRules.trim()) {
      try {
        parsedRecurrence = JSON.parse(recurrenceRules) as Record<string, unknown>;
      } catch {
        setError("Recurrence rules must be valid JSON.");
        setSubmitting(false);
        return;
      }
    }

    const startIso = fromDatetimeLocalValue(startTime);
    const endIso = addMinutes(startIso, durationMinutes);
    const legacyType = selectedSessionType?.name ?? "General";

    const payload = {
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
      recurrence_rules: parsedRecurrence,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEditing && id) {
        const { error: updateError } = await supabase.from("sessions").update(payload).eq("id", id);
        if (updateError) throw updateError;
        setMessage("Session updated.");
      } else {
        const { error: insertError } = await supabase.from("sessions").insert(payload);
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
              ? "Update slot details, pricing, and availability rules."
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

            <div className="sm:col-span-2">
              <label htmlFor="recurrenceRules" className="mb-1 block text-sm font-medium">
                Recurrence rules (JSON, optional)
              </label>
              <textarea
                id="recurrenceRules"
                value={recurrenceRules}
                onChange={(event) => setRecurrenceRules(event.target.value)}
                rows={4}
                placeholder='{"frequency":"weekly","days":["monday","wednesday"]}'
                className={`${adminInputClassName} font-mono text-xs`}
              />
            </div>
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
