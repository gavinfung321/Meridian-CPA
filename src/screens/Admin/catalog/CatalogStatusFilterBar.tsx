export type CatalogItemStatusFilter = "active" | "inactive" | "all";

export const CATALOG_ITEM_STATUS_FILTERS: Array<{ id: CatalogItemStatusFilter; label: string }> = [
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "all", label: "All" },
];

interface CatalogStatusFilterBarProps {
  value: CatalogItemStatusFilter;
  onChange: (value: CatalogItemStatusFilter) => void;
}

export function CatalogStatusFilterBar({
  value,
  onChange,
}: CatalogStatusFilterBarProps): JSX.Element {
  return (
    <div className="mb-4 inline-flex rounded-lg border border-[#EDECE6] bg-[#F9F9F6] p-1">
      {CATALOG_ITEM_STATUS_FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => onChange(filter.id)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            value === filter.id
              ? "bg-[#0F2A1D] text-white shadow-sm"
              : "text-[#0F2A1D]/70 hover:text-[#0F2A1D]"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export function filterByCatalogItemStatus<T extends { is_active: boolean }>(
  items: T[],
  filter: CatalogItemStatusFilter,
): T[] {
  if (filter === "all") return items;
  if (filter === "inactive") return items.filter((item) => !item.is_active);
  return items.filter((item) => item.is_active);
}
