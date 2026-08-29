import { useCallback, useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { supabase } from "../../../lib/supabase";
import type { Category } from "../../../types/database";
import { CategoryFormModal } from "./CategoryFormModal";
import { TableSkeleton } from "./TableSkeleton";

export function CatalogCategoriesTab(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");

    if (fetchError) throw fetchError;
    setCategories(data ?? []);
  }, []);

  useEffect(() => {
    void loadCategories()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load categories.");
      })
      .finally(() => setLoading(false));
  }, [loadCategories]);

  const nextSortOrder =
    categories.length > 0 ? Math.max(...categories.map((category) => category.sort_order)) + 1 : 1;

  const openCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = async (payload: { name: string; slug: string; sort_order: number }) => {
    setSaving(true);
    setError(null);
    setMessage(null);

    const result = editingCategory
      ? await supabase.from("categories").update(payload).eq("id", editingCategory.id)
      : await supabase.from("categories").insert({ ...payload, is_active: true });

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setMessage(editingCategory ? "Category updated." : "Category created.");
    closeModal();
    await loadCategories();
  };

  const toggleActive = async (category: Category) => {
    setTogglingId(category.id);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id);

    setTogglingId(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadCategories();
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">
          Categories
          {!loading ? (
            <span className="ml-2 text-base font-normal text-[#0F2A1D]/50">
              ({categories.length})
            </span>
          ) : null}
        </h2>
        <Button
          type="button"
          onClick={openCreate}
          className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
        >
          + New Category
        </Button>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-[#EDECE6] bg-white shadow-sm">
        {loading ? (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Sort order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              <TableSkeleton columns={5} />
            </tbody>
          </table>
        ) : categories.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-[#0F2A1D]/70">
              Use <span className="font-medium text-[#0F2A1D]">+ New Category</span> above to group
              your services into service lines.
            </p>
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Sort order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-[#EDECE6] last:border-0">
                  <td className="px-4 py-4 font-medium">{category.name}</td>
                  <td className="px-4 py-4 font-mono text-xs text-[#0F2A1D]/70">{category.slug}</td>
                  <td className="px-4 py-4">{category.sort_order}</td>
                  <td className="px-4 py-4">
                    {category.is_active ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#EDECE6] px-2 py-1 text-xs font-medium text-[#0F2A1D]/60">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(category)}
                        className="font-medium text-[#0F2A1D] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={togglingId === category.id}
                        onClick={() => void toggleActive(category)}
                        className="font-medium text-[#0F2A1D]/60 hover:text-[#0F2A1D] hover:underline disabled:opacity-50"
                      >
                        {togglingId === category.id
                          ? "Updating…"
                          : category.is_active
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CategoryFormModal
        open={modalOpen}
        category={editingCategory}
        nextSortOrder={nextSortOrder}
        saving={saving}
        onClose={closeModal}
        onSave={(payload) => void handleSave(payload)}
      />
    </>
  );
}
