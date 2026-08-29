import { useCallback, useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { formatPrice } from "../../../lib/session-admin";
import { supabase } from "../../../lib/supabase";
import type { Category, SessionType } from "../../../types/database";
import { SessionTypeFormModal } from "./SessionTypeFormModal";
import { TableSkeleton } from "./TableSkeleton";

type SessionTypeRow = SessionType & {
  category: Pick<Category, "name"> | null;
};

export function CatalogSessionTypesTab(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<SessionTypeRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);

    const [categoriesResult, typesResult] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase
        .from("session_types")
        .select("*, category:categories(name)")
        .order("name"),
    ]);

    if (categoriesResult.error) throw categoriesResult.error;
    if (typesResult.error) throw typesResult.error;

    setCategories(categoriesResult.data ?? []);
    setSessionTypes((typesResult.data ?? []) as SessionTypeRow[]);
  }, []);

  useEffect(() => {
    void loadData()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load session types.");
      })
      .finally(() => setLoading(false));
  }, [loadData]);

  const openCreate = () => {
    setEditingType(null);
    setModalOpen(true);
  };

  const openEdit = (sessionType: SessionTypeRow) => {
    setEditingType(sessionType);
    setModalOpen(true);
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

  const toggleActive = async (sessionType: SessionTypeRow) => {
    setTogglingId(sessionType.id);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase
      .from("session_types")
      .update({ is_active: !sessionType.is_active })
      .eq("id", sessionType.id);

    setTogglingId(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadData();
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">
          Session Types
          {!loading ? (
            <span className="ml-2 text-base font-normal text-[#0F2A1D]/50">
              ({sessionTypes.length})
            </span>
          ) : null}
        </h2>
        <Button
          type="button"
          onClick={openCreate}
          disabled={loading || categories.length === 0}
          className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
        >
          + New Session Type
        </Button>
      </div>

      {categories.length === 0 && !loading ? (
        <div className="mb-4 rounded-lg border border-[#EDECE6] bg-[#F9F9F6] px-4 py-3 text-sm text-[#0F2A1D]/70">
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
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Base price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              <TableSkeleton columns={6} />
            </tbody>
          </table>
        ) : sessionTypes.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-[#0F2A1D]/70">No session types yet. Define your consultation products.</p>
            {categories.length > 0 ? (
              <Button
                type="button"
                onClick={openCreate}
                className="mt-4 bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90"
              >
                + New Session Type
              </Button>
            ) : null}
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#EDECE6] bg-[#F9F9F6] text-[#0F2A1D]/60">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Base price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {sessionTypes.map((sessionType) => (
                <tr key={sessionType.id} className="border-b border-[#EDECE6] last:border-0">
                  <td className="px-4 py-4 font-medium">{sessionType.name}</td>
                  <td className="px-4 py-4">{sessionType.category?.name ?? "—"}</td>
                  <td className="px-4 py-4">{sessionType.default_duration_minutes} min</td>
                  <td className="px-4 py-4">
                    {formatPrice(Number(sessionType.default_price))}
                  </td>
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
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(sessionType)}
                        className="font-medium text-[#0F2A1D] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={togglingId === sessionType.id}
                        onClick={() => void toggleActive(sessionType)}
                        className="font-medium text-[#0F2A1D]/60 hover:text-[#0F2A1D] hover:underline disabled:opacity-50"
                      >
                        {togglingId === sessionType.id
                          ? "Updating…"
                          : sessionType.is_active
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

      <SessionTypeFormModal
        open={modalOpen}
        sessionType={editingType}
        categories={categories.filter(
          (category) => category.is_active || category.id === editingType?.category_id,
        )}
        saving={saving}
        onClose={closeModal}
        onSave={(payload) => void handleSave(payload)}
      />
    </>
  );
}
