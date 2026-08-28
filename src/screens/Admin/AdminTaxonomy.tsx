import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/AdminLayout";
import { Button } from "../../components/ui/button";
import { adminInputClassName, slugify } from "../../lib/session-admin";
import { supabase } from "../../lib/supabase";
import type { Category, SessionType } from "../../types/database";

type CategoryRow = Category;
type SessionTypeRow = SessionType & {
  category: Pick<Category, "name"> | null;
};

export function AdminTaxonomy(): JSX.Element {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [categorySortOrder, setCategorySortOrder] = useState(0);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [typeName, setTypeName] = useState("");
  const [typeCategoryId, setTypeCategoryId] = useState("");
  const [typeDuration, setTypeDuration] = useState(60);
  const [typePrice, setTypePrice] = useState(0);
  const [typeDescription, setTypeDescription] = useState("");
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);

  const loadTaxonomy = useCallback(async () => {
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
    if (!typeCategoryId && categories.length > 0) {
      setTypeCategoryId(categories[0].id);
    }
  }, [categories, typeCategoryId]);

  useEffect(() => {
    document.title = "Taxonomy | Admin | Meridian CPA";
  }, []);

  useEffect(() => {
    void loadTaxonomy()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load taxonomy.");
      })
      .finally(() => setLoading(false));
  }, [loadTaxonomy]);

  const resetCategoryForm = () => {
    setCategoryName("");
    setCategorySortOrder(categories.length + 1);
    setEditingCategoryId(null);
  };

  const resetTypeForm = () => {
    setTypeName("");
    setTypeDescription("");
    setTypeDuration(60);
    setTypePrice(0);
    setTypeCategoryId(categories[0]?.id ?? "");
    setEditingTypeId(null);
  };

  const handleCategorySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const name = categoryName.trim();
    if (!name) {
      setError("Category name is required.");
      return;
    }

    const payload = {
      name,
      slug: slugify(name),
      sort_order: categorySortOrder,
      is_active: true,
    };

    const result = editingCategoryId
      ? await supabase.from("categories").update(payload).eq("id", editingCategoryId)
      : await supabase.from("categories").insert(payload);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setMessage(editingCategoryId ? "Category updated." : "Category created.");
    resetCategoryForm();
    await loadTaxonomy();
  };

  const handleTypeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const name = typeName.trim();
    if (!name || !typeCategoryId) {
      setError("Session type name and category are required.");
      return;
    }

    const payload = {
      name,
      category_id: typeCategoryId,
      description: typeDescription.trim() || null,
      default_duration_minutes: typeDuration,
      default_price: typePrice,
      is_active: true,
    };

    const result = editingTypeId
      ? await supabase.from("session_types").update(payload).eq("id", editingTypeId)
      : await supabase.from("session_types").insert(payload);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setMessage(editingTypeId ? "Session type updated." : "Session type created.");
    resetTypeForm();
    await loadTaxonomy();
  };

  const toggleCategoryActive = async (category: CategoryRow) => {
    const { error: updateError } = await supabase
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadTaxonomy();
  };

  const toggleTypeActive = async (sessionType: SessionTypeRow) => {
    const { error: updateError } = await supabase
      .from("session_types")
      .update({ is_active: !sessionType.is_active })
      .eq("id", sessionType.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadTaxonomy();
  };

  const startEditCategory = (category: CategoryRow) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategorySortOrder(category.sort_order);
  };

  const startEditType = (sessionType: SessionTypeRow) => {
    setEditingTypeId(sessionType.id);
    setTypeName(sessionType.name);
    setTypeCategoryId(sessionType.category_id);
    setTypeDescription(sessionType.description ?? "");
    setTypeDuration(sessionType.default_duration_minutes);
    setTypePrice(Number(sessionType.default_price));
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link
            to="/admin/sessions"
            className="text-sm font-medium text-[#0F2A1D]/60 hover:text-[#0F2A1D]"
          >
            ← Back to sessions
          </Link>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-[#0F2A1D]">
            Categories & session types
          </h1>
          <p className="mt-2 text-[#0F2A1D]/70">
            Manage the taxonomy used when creating sessions.
          </p>
        </div>

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

        {loading ? (
          <p className="text-[#0F2A1D]/70">Loading…</p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <section className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">Categories</h2>
              <form
                onSubmit={(event) => void handleCategorySubmit(event)}
                className="mt-4 space-y-3 border-b border-[#EDECE6] pb-4"
              >
                <input
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  placeholder="Category name"
                  className={adminInputClassName}
                />
                <input
                  type="number"
                  value={categorySortOrder}
                  onChange={(event) => setCategorySortOrder(Number(event.target.value))}
                  placeholder="Sort order"
                  className={adminInputClassName}
                />
                <div className="flex gap-2">
                  <Button type="submit" className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90">
                    {editingCategoryId ? "Update category" : "Add category"}
                  </Button>
                  {editingCategoryId ? (
                    <Button type="button" variant="outline" onClick={resetCategoryForm}>
                      Cancel edit
                    </Button>
                  ) : null}
                </div>
              </form>

              <ul className="mt-4 divide-y divide-[#EDECE6]">
                {categories.map((category) => (
                  <li key={category.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-[#0F2A1D]/60">
                        {category.slug} · order {category.sort_order}
                        {!category.is_active ? " · inactive" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => startEditCategory(category)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void toggleCategoryActive(category)}
                      >
                        {category.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-[#EDECE6] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-[#0F2A1D]">Session types</h2>
              <form
                onSubmit={(event) => void handleTypeSubmit(event)}
                className="mt-4 space-y-3 border-b border-[#EDECE6] pb-4"
              >
                <input
                  value={typeName}
                  onChange={(event) => setTypeName(event.target.value)}
                  placeholder="Type name"
                  className={adminInputClassName}
                />
                <select
                  value={typeCategoryId}
                  onChange={(event) => setTypeCategoryId(event.target.value)}
                  className={adminInputClassName}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <textarea
                  value={typeDescription}
                  onChange={(event) => setTypeDescription(event.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className={adminInputClassName}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={typeDuration}
                    onChange={(event) => setTypeDuration(Number(event.target.value))}
                    placeholder="Duration (mins)"
                    className={adminInputClassName}
                  />
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={typePrice}
                    onChange={(event) => setTypePrice(Number(event.target.value))}
                    placeholder="Default price"
                    className={adminInputClassName}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-[#0F2A1D] text-white hover:bg-[#0F2A1D]/90">
                    {editingTypeId ? "Update type" : "Add session type"}
                  </Button>
                  {editingTypeId ? (
                    <Button type="button" variant="outline" onClick={resetTypeForm}>
                      Cancel edit
                    </Button>
                  ) : null}
                </div>
              </form>

              <ul className="mt-4 divide-y divide-[#EDECE6]">
                {sessionTypes.map((sessionType) => (
                  <li key={sessionType.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{sessionType.name}</p>
                      <p className="text-[#0F2A1D]/60">
                        {sessionType.category?.name ?? "Uncategorized"} · {sessionType.default_duration_minutes} min · HK$
                        {Number(sessionType.default_price).toLocaleString()}
                        {!sessionType.is_active ? " · inactive" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => startEditType(sessionType)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void toggleTypeActive(sessionType)}
                      >
                        {sessionType.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
