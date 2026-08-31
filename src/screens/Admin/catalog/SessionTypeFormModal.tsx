import { FormEvent, useEffect, useState } from "react";
import { AdminModal } from "../../../components/AdminModal";
import { Button } from "../../../components/ui/button";
import { adminInputClassName } from "../../../lib/session-admin";
import type { Category, SessionType } from "../../../types/database";

type SessionTypeRow = SessionType & {
  category: Pick<Category, "name"> | null;
};

interface SessionTypeFormModalProps {
  open: boolean;
  sessionType: SessionTypeRow | null;
  categories: Category[];
  saving: boolean;
  toggling?: boolean;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    category_id: string;
    description: string | null;
    default_duration_minutes: number;
    default_price: number;
    default_max_slots: number;
  }) => void;
  onToggleActive?: () => void;
}

export function SessionTypeFormModal({
  open,
  sessionType,
  categories,
  saving,
  toggling = false,
  onClose,
  onSave,
  onToggleActive,
}: SessionTypeFormModalProps): JSX.Element {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(0);
  const [capacityInput, setCapacityInput] = useState("");
  const [capacityError, setCapacityError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(sessionType?.name ?? "");
    setCategoryId(sessionType?.category_id ?? categories[0]?.id ?? "");
    setDescription(sessionType?.description ?? "");
    setDuration(sessionType?.default_duration_minutes ?? 60);
    setPrice(Number(sessionType?.default_price ?? 0));
    setCapacityInput(sessionType ? String(sessionType.default_max_slots ?? 1) : "");
    setCapacityError(null);
  }, [open, sessionType, categories]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !categoryId) return;

    const parsedCapacity = Number.parseInt(capacityInput, 10);
    if (!capacityInput.trim() || Number.isNaN(parsedCapacity) || parsedCapacity < 1) {
      setCapacityError("Enter a capacity of at least 1.");
      return;
    }
    setCapacityError(null);

    onSave({
      name: trimmed,
      category_id: categoryId,
      description: description.trim() || null,
      default_duration_minutes: duration,
      default_price: price,
      default_max_slots: parsedCapacity,
    });
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      wide
      title={sessionType ? "Edit session type" : "New session type"}
      footer={
        <>
          <div className="mr-auto flex gap-2">
            {sessionType && onToggleActive ? (
              <Button
                type="button"
                variant="outline"
                disabled={toggling}
                className={
                  sessionType.is_active
                    ? "text-red-700 hover:bg-red-50 hover:text-red-800"
                    : undefined
                }
                onClick={onToggleActive}
              >
                {toggling
                  ? "Updating…"
                  : sessionType.is_active
                    ? "Deactivate session type"
                    : "Activate session type"}
              </Button>
            ) : null}
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            {sessionType ? "Close" : "Cancel"}
          </Button>
          <Button
            type="submit"
            form="session-type-form"
            disabled={saving || !name.trim() || !categoryId || !capacityInput.trim()}
            className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
          >
            {saving ? "Saving…" : sessionType ? "Save changes" : "Create session type"}
          </Button>
        </>
      }
    >
      <form id="session-type-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-[#EDECE6] bg-[#F9F9F6] px-3 py-2 text-xs text-[#0F2A1D]/70">
          Use a product name that differs from the category — e.g. category &quot;Tax Planning&quot; →
          type &quot;Initial Tax Consultation&quot;. Base prices can be overridden per scheduled session.
        </div>

        <div>
          <label htmlFor="type-name" className="block text-sm font-medium text-[#0F2A1D]">
            Name
          </label>
          <input
            id="type-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={`${adminInputClassName} mt-1`}
            placeholder="e.g. Initial Tax Consultation"
            required
          />
        </div>

        <div>
          <label htmlFor="type-category" className="block text-sm font-medium text-[#0F2A1D]">
            Category
          </label>
          <select
            id="type-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className={`${adminInputClassName} mt-1`}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="type-description" className="block text-sm font-medium text-[#0F2A1D]">
            Description <span className="font-normal text-[#0F2A1D]/50">(optional)</span>
          </label>
          <textarea
            id="type-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            className={`${adminInputClassName} mt-1`}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="type-duration"
              className="mb-1 block min-h-10 text-sm font-medium leading-snug text-[#0F2A1D]"
            >
              Duration (mins)
            </label>
            <input
              id="type-duration"
              type="number"
              min={15}
              step={15}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className={`${adminInputClassName} w-full`}
              required
            />
          </div>
          <div>
            <label
              htmlFor="type-capacity"
              className="mb-1 block min-h-10 text-sm font-medium leading-snug text-[#0F2A1D]"
            >
              Capacity
            </label>
            <input
              id="type-capacity"
              type="number"
              min={1}
              value={capacityInput}
              onChange={(event) => {
                setCapacityInput(event.target.value);
                setCapacityError(null);
              }}
              className={`${adminInputClassName} w-full`}
              placeholder="e.g. 1"
              required
            />
            <p className="mt-1 min-h-4 text-xs text-red-600">{capacityError ?? ""}</p>
          </div>
          <div>
            <label
              htmlFor="type-price"
              className="mb-1 block min-h-10 text-sm font-medium leading-snug text-[#0F2A1D]"
            >
              Base price (HKD)
            </label>
            <input
              id="type-price"
              type="number"
              min={0}
              step={50}
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
              className={`${adminInputClassName} w-full`}
              required
            />
            <p className="mt-1 min-h-4" aria-hidden="true" />
          </div>
        </div>
      </form>
    </AdminModal>
  );
}
