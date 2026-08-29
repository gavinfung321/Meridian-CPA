import { FormEvent, useEffect, useState } from "react";
import { AdminModal } from "../../../components/AdminModal";
import { Button } from "../../../components/ui/button";
import { adminInputClassName, slugify } from "../../../lib/session-admin";
import type { Category } from "../../../types/database";

interface CategoryFormModalProps {
  open: boolean;
  category: Category | null;
  nextSortOrder: number;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: { name: string; slug: string; sort_order: number }) => void;
}

export function CategoryFormModal({
  open,
  category,
  nextSortOrder,
  saving,
  onClose,
  onSave,
}: CategoryFormModalProps): JSX.Element {
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(nextSortOrder);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setSortOrder(category?.sort_order ?? nextSortOrder);
  }, [open, category, nextSortOrder]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      name: trimmed,
      slug: slugify(trimmed),
      sort_order: sortOrder,
    });
  };

  const slugPreview = name.trim() ? slugify(name.trim()) : "—";

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={category ? "Edit category" : "New category"}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="category-form"
            disabled={saving || !name.trim()}
            className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
          >
            {saving ? "Saving…" : category ? "Save changes" : "Create category"}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="category-name" className="block text-sm font-medium text-[#0F2A1D]">
            Name
          </label>
          <input
            id="category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={`${adminInputClassName} mt-1`}
            placeholder="e.g. Tax Planning"
            required
          />
        </div>
        <div>
          <label htmlFor="category-sort" className="block text-sm font-medium text-[#0F2A1D]">
            Sort order
          </label>
          <input
            id="category-sort"
            type="number"
            min={0}
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value))}
            className={`${adminInputClassName} mt-1`}
          />
        </div>
        <p className="text-xs text-[#0F2A1D]/60">
          Slug: <span className="font-mono">{slugPreview}</span>
        </p>
      </form>
    </AdminModal>
  );
}
