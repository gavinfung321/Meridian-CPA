import { Eye } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { Button } from "../../../components/ui/button";
import { formatPrice } from "../../../lib/session-admin";
import {
  adminTableRowInteractiveClassName,
  adminTableViewButtonClassName,
} from "../../../lib/table-styles";
import { supabase } from "../../../lib/supabase";
import type { Category, SessionType } from "../../../types/database";
import {
  CatalogStatusFilterBar,
  filterByCatalogItemStatus,
  type CatalogItemStatusFilter,
} from "./CatalogStatusFilterBar";
import { SessionTypeFormModal } from "./SessionTypeFormModal";
import { TableSkeleton } from "./TableSkeleton";
type SessionTypeRow = SessionType & {
  category: Pick<Category, "name"> | null;
};

function formatDescription(text: string | null): string {
  return text?.trim() ? text.trim() : "—";
}

export function CatalogSessionTypesTab(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<SessionTypeRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CatalogItemStatusFilter>("active");

  const loadData = useCallback(async (): Promise<SessionTypeRow[]> => {
    setError(null);

    const [categoriesResult, typesResult] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase
        .from("session_types")
        .select("*, category:categories(name)")
        .order("is_active", { ascending: true })
        .order("name", { ascending: true }),
    ]);
    if (categoriesResult.error) throw categoriesResult.error;
    if (typesResult.error) throw typesResult.error;

    setCategories(categoriesResult.data ?? []);
    const types = (typesResult.data ?? []) as SessionTypeRow[];
    setSessionTypes(types);
    return types;
  }, []);

  useEffect(() => {
    void loadData()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load session types.");
      })
      .finally(() => setLoading(false));
  }, [loadData]);

  const filteredSessionTypes = useMemo(
    () => filterByCatalogItemStatus(sessionTypes, statusFilter),
    [sessionTypes, statusFilter],
  );

  const openCreate = () => {    setEditingType(null);
    setModalOpen(true);
  };

  const openView = (sessionType: SessionTypeRow) => {
    setEditingType(sessionType);
    setModalOpen(true);
  };

  const openViewFromAction = (sessionType: SessionTypeRow, event: MouseEvent) => {
    event.stopPropagation();
    openView(sessionType);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingType(null);
  };

  const handleSave = async (payload: {
    name: string;
    category_id: string;
    description: string | null;
    default_duration_minutes: number;
    default_price: number;
    default_max_slots: number;
  }) => {
    setSaving(true);
    setError(null);
    setMessage(null);

    const result = editingType
      ? await supabase.from("session_types").update(payload).eq("id", editingType.id)
      : await supabase.from("session_types").insert({ ...payload, is_active: true });

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setMessage(editingType ? "Session type updated." : "Session type created.");
    closeModal();
    await loadData();
  };

  const handleToggleActive = async () => {
    if (!editingType) return;

    setToggling(true);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase
      .from("session_types")
      .update({ is_active: !editingType.is_active })
      .eq("id", editingType.id);

    setToggling(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage(editingType.is_active ? "Session type deactivated." : "Session type activated.");
    const types = await loadData();
    const updated = types.find((type) => type.id === editingType.id);
    if (updated) setEditingType(updated);
  };

  const tableHeader = (
    <tr>
      <th className="px-4 py-3 font-medium">Name</th>
      <th className="px-4 py-3 font-medium">Description</th>
      <th className="px-4 py-3 font-medium">Category</th>
      <th className="px-4 py-3 font-medium">Duration</th>
      <th className="px-4 py-3 font-medium">Capacity</th>
      <th className="px-4 py-3 font-medium">Base price</th>
      <th className="px-4 py-3 font-medium">Status</th>
      <th className="px-4 py-3 text-right font-medium">Actions</th>
    </tr>
  );

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">
          Session Types
          {!loading ? (
            <span className="ml-2 text-base font-normal text-[#0F2A1D]/50">
              ({filteredSessionTypes.length})
            </span>
          ) : null}
        </h2>        <Button
          type="button"
          onClick={openCreate}
          disabled={loading || categories.length === 0}
          className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
        >
          + New Session Type
        </Button>
      </div>

      <CatalogStatusFilterBar value={statusFilter} onChange={setStatusFilter} />

      {categories.length === 0 && !loading ? (        <div className="mb-4 rounded-lg border border-[#EDECE6] bg-[#F9F9F6] px-4 py-3 text-sm text-[#0F2A1D]/70">
          Create a category first before adding session types.
        </div>
      ) : null}

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
              {tableHeader}
            </thead>
            <tbody>
              <TableSkeleton columns={8} />
            </tbody>
          </table>
        ) : filteredSessionTypes.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-[#0F2A1D]/70">
              {sessionTypes.length === 0 ? (
                <>
                  Use <span className="font-medium text-[#0F2A1D]">+ New Session Type</span> above to
                  define your first consultation product.
                </>
              ) : statusFilter === "active" ? (
                "No active session types."
              ) : statusFilter === "inactive" ? (
                "No inactive session types."
              ) : (
                "No session types match this filter."
              )}
            </p>
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
              {tableHeader}
            </thead>
            <tbody>
              {filteredSessionTypes.map((sessionType) => (                <tr
                  key={sessionType.id}
                  className={adminTableRowInteractiveClassName}
                  onClick={() => openView(sessionType)}
                >
                  <td className="px-4 py-4 font-medium text-[#0F2A1D]">{sessionType.name}</td>
                  <td className="max-w-xs px-4 py-4 text-[#0F2A1D]/80">
                    {formatDescription(sessionType.description)}
                  </td>
                  <td className="px-4 py-4">{sessionType.category?.name ?? "—"}</td>
                  <td className="px-4 py-4">{sessionType.default_duration_minutes} min</td>
                  <td className="px-4 py-4">{sessionType.default_max_slots ?? 1}</td>
                  <td className="px-4 py-4">{formatPrice(Number(sessionType.default_price))}</td>
                  <td className="px-4 py-4">
                    {sessionType.is_active ? (
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
                      title="View session type"
                      aria-label={`View ${sessionType.name}`}
                      onClick={(event) => openViewFromAction(sessionType, event)}
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

      <SessionTypeFormModal
        open={modalOpen}
        sessionType={editingType}
        categories={categories.filter(
          (category) => category.is_active || category.id === editingType?.category_id,
        )}
        saving={saving}
        toggling={toggling}
        onClose={closeModal}
        onSave={(payload) => void handleSave(payload)}
        onToggleActive={editingType ? () => void handleToggleActive() : undefined}
      />
    </>
  );
}
