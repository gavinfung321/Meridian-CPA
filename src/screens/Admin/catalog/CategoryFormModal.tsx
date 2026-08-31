import { FormEvent, useEffect, useState } from "react";
import { AdminModal } from "../../../components/AdminModal";
import { Button } from "../../../components/ui/button";
import { adminInputClassName } from "../../../lib/session-admin";
import type { Category } from "../../../types/database";

export type CategoryFormSavePayload = {
  name: string;
  description: string | null;
};

interface CategoryFormModalProps {
  open: boolean;
  category: Category | null;
  saving: boolean;
  toggling?: boolean;
  onClose: () => void;
  onSave: (payload: CategoryFormSavePayload) => void;
  onToggleActive?: () => void;
}

export function CategoryFormModal({
  open,
  category,
  saving,
  toggling = false,
  onClose,
  onSave,
  onToggleActive,
}: CategoryFormModalProps): JSX.Element {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
  }, [open, category]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      name: trimmed,
      description: description.trim() || null,
    });
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={category ? "Edit category" : "New category"}
      footer={
        <>
          <div className="mr-auto flex gap-2">
            {category && onToggleActive ? (
              <Button
                type="button"
                variant="outline"
                disabled={toggling}
                className={
                  category.is_active
                    ? "text-red-700 hover:bg-red-50 hover:text-red-800"
                    : undefined
                }
                onClick={onToggleActive}
              >
                {toggling
                  ? "Updating…"
                  : category.is_active
                    ? "Deactivate category"
                    : "Activate category"}
              </Button>
            ) : null}
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            {category ? "Close" : "Cancel"}
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
          <label htmlFor="category-description" className="block text-sm font-medium text-[#0F2A1D]">
            Description
          </label>
          <textarea
            id="category-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className={`${adminInputClassName} mt-1`}
            placeholder="Brief summary of this service line for admins and public filters."
          />
        </div>
      </form>
    </AdminModal>
  );
}
