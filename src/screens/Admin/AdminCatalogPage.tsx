import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminLayout } from "../../components/AdminLayout";
import { CatalogCategoriesTab } from "./catalog/CatalogCategoriesTab";
import { CatalogSessionsTab } from "./catalog/CatalogSessionsTab";
import { CatalogSessionTypesTab } from "./catalog/CatalogSessionTypesTab";

export type CatalogTab = "sessions" | "types" | "categories";

const TABS: Array<{ id: CatalogTab; label: string }> = [
  { id: "sessions", label: "Active Sessions" },
  { id: "types", label: "Session Types" },
  { id: "categories", label: "Categories" },
];

function parseTab(value: string | null): CatalogTab {
  if (value === "types" || value === "categories") return value;
  return "sessions";
}

export function AdminCatalogPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));

  useEffect(() => {
    document.title = "Catalog | Admin | Meridian CPA";
  }, []);

  const setTab = (tab: CatalogTab) => {
    if (tab === "sessions") {
      setSearchParams({});
      return;
    }
    setSearchParams({ tab });
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F2A1D]">Catalog Management</h1>
          <p className="mt-2 text-[#0F2A1D]/70">
            Orchestrate your sessions, types, and categories.
          </p>
        </div>

        <div className="mb-6 inline-flex rounded-lg border border-[#EDECE6] bg-[#F9F9F6] p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#0F2A1D] text-white shadow-sm"
                  : "text-[#0F2A1D]/70 hover:text-[#0F2A1D]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "sessions" ? <CatalogSessionsTab /> : null}
        {activeTab === "types" ? <CatalogSessionTypesTab /> : null}
        {activeTab === "categories" ? <CatalogCategoriesTab /> : null}
      </div>
    </AdminLayout>
  );
}
