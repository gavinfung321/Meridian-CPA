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
  onClose: () => void;
  onSave: (payload: {
    name: string;
    category_id: string;
    description: string | null;
    default_duration_minutes: number;
    default_price: number;
  }) => void;
}

export function SessionTypeFormModal({
  open,
  sessionType,
  categories,
  saving,
  onClose,
  onSave,
}: SessionTypeFormModalProps): JSX.Element {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (!open) return;
    setName(sessionType?.name ?? "");
    setCategoryId(sessionType?.category_id ?? categories[0]?.id ?? "");
    setDescription(sessionType?.description ?? "");
    setDuration(sessionType?.default_duration_minutes ?? 60);
    setPrice(Number(sessionType?.default_price ?? 0));
  }, [open, sessionType, categories]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !categoryId) return;
    onSave({
      name: trimmed,
      category_id: categoryId,
      description: description.trim() || null,
      default_duration_minutes: duration,
      default_price: price,
    });
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={sessionType ? "Edit session type" : "New session type"}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="session-type-form"
            disabled={saving || !name.trim() || !categoryId}
            className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
          >
            {saving ? "Saving…" : sessionType ? "Save changes" : "Create session type"}
          </Button>
        </>
      }
    >
      <form id="session-type-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-[#EDECE6] bg-[#F9F9F6] px-3 py-2 text-xs text-[#0F2A1D]/70">
          Base prices can be overridden for specific scheduled sessions.
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
            placeholder="e.g. Tax Planning Consultation"
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="type-duration" className="block text-sm font-medium text-[#0F2A1D]">
              Default duration (mins)
            </label>
            <input
              id="type-duration"
              type="number"
              min={15}
              step={15}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className={`${adminInputClassName} mt-1`}
              required
            />
          </div>
          <div>
            <label htmlFor="type-price" className="block text-sm font-medium text-[#0F2A1D]">
              Base price (HKD)
            </label>
            <input
              id="type-price"
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
      </form>
    </AdminModal>
  );
}
