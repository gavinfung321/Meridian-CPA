import { Eye } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { Button } from "../../../components/ui/button";
import {
  adminTableRowInteractiveClassName,
  adminTableViewButtonClassName,
} from "../../../lib/table-styles";
import { slugify } from "../../../lib/session-admin";
import { supabase } from "../../../lib/supabase";
import type { Category } from "../../../types/database";
import { CategoryFormModal, type CategoryFormSavePayload } from "./CategoryFormModal";
import {
  CatalogStatusFilterBar,
  filterByCatalogItemStatus,
  type CatalogItemStatusFilter,
} from "./CatalogStatusFilterBar";
import { TableSkeleton } from "./TableSkeleton";
export function CatalogCategoriesTab(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CatalogItemStatusFilter>("active");

  const loadCategories = useCallback(async (): Promise<Category[]> => {
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("categories")
      .select("*")
      .order("is_active", { ascending: true })
      .order("sort_order", { ascending: true });
    if (fetchError) throw fetchError;
    const rows = data ?? [];
    setCategories(rows);
    return rows;
  }, []);

  useEffect(() => {
    void loadCategories()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load categories.");
      })
      .finally(() => setLoading(false));
  }, [loadCategories]);

  const filteredCategories = useMemo(
    () => filterByCatalogItemStatus(categories, statusFilter),
    [categories, statusFilter],
  );

  const nextSortOrder =    categories.length > 0 ? Math.max(...categories.map((category) => category.sort_order)) + 1 : 1;

  const openCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openView = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const openViewFromAction = (category: Category, event: MouseEvent) => {
    event.stopPropagation();
    openView(category);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = async (payload: CategoryFormSavePayload) => {
    setSaving(true);
    setError(null);
    setMessage(null);

    const result = editingCategory
      ? await supabase
          .from("categories")
          .update({
            name: payload.name,
            description: payload.description,
          })
          .eq("id", editingCategory.id)
      : await supabase.from("categories").insert({
          name: payload.name,
          description: payload.description,
          slug: slugify(payload.name),
          sort_order: nextSortOrder,
          is_active: true,
        });

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setMessage(editingCategory ? "Category updated." : "Category created.");
    closeModal();
    await loadCategories();
  };

  const handleToggleActive = async () => {
    if (!editingCategory) return;

    setToggling(true);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase
      .from("categories")
      .update({ is_active: !editingCategory.is_active })
      .eq("id", editingCategory.id);

    setToggling(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage(editingCategory.is_active ? "Category deactivated." : "Category activated.");
    const rows = await loadCategories();
    const updated = rows.find((category) => category.id === editingCategory.id);
    if (updated) setEditingCategory(updated);
  };

  const tableHeader = (
    <tr>
      <th className="px-4 py-3 font-medium">Name</th>
      <th className="px-4 py-3 font-medium">Description</th>
      <th className="px-4 py-3 font-medium">Status</th>
      <th className="px-4 py-3 text-right font-medium">Actions</th>
    </tr>
  );

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">
          Categories
          {!loading ? (
            <span className="ml-2 text-base font-normal text-[#0F2A1D]/50">
              ({filteredCategories.length})
            </span>
          ) : null}
        </h2>        <Button
          type="button"
          onClick={openCreate}
          className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
        >
          + New Category
        </Button>
      </div>

      <CatalogStatusFilterBar value={statusFilter} onChange={setStatusFilter} />

      {error ? (        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
              {tableHeader}
            </thead>
            <tbody>
              <TableSkeleton columns={4} />
            </tbody>
          </table>
        ) : filteredCategories.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-[#0F2A1D]/70">
              {categories.length === 0 ? (
                <>
                  Use <span className="font-medium text-[#0F2A1D]">+ New Category</span> above to group
                  your services into service lines.
                </>
              ) : statusFilter === "active" ? (
                "No active categories."
              ) : statusFilter === "inactive" ? (
                "No inactive categories."
              ) : (
                "No categories match this filter."
              )}
            </p>
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
              {tableHeader}
            </thead>
            <tbody>
              {filteredCategories.map((category) => (                <tr
                  key={category.id}
                  className={adminTableRowInteractiveClassName}
                  onClick={() => openView(category)}
                >
                  <td className="px-4 py-4 font-medium text-[#0F2A1D]">{category.name}</td>
                  <td className="max-w-md px-4 py-4 text-[#0F2A1D]/70">
                    {category.description ?? "—"}
                  </td>
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
                  <td
                    className="px-4 py-4 text-right"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      title="View category"
                      aria-label={`View ${category.name}`}
                      onClick={(event) => openViewFromAction(category, event)}
                      className={adminTableViewButtonClassName}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
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
        saving={saving}
        toggling={toggling}
        onClose={closeModal}
        onSave={(payload) => void handleSave(payload)}
        onToggleActive={editingCategory ? () => void handleToggleActive() : undefined}
      />
    </>
  );
}
