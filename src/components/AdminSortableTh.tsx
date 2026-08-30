import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/utils";

export type SortDirection = "asc" | "desc";

interface AdminSortableThProps {
  label: string;
  active: boolean;
  direction: SortDirection;
  onSort: () => void;
  align?: "left" | "right";
  className?: string;
}

export function AdminSortableTh({
  label,
  active,
  direction,
  onSort,
  align = "left",
  className,
}: AdminSortableThProps): JSX.Element {
  const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;

  return (
    <th className={cn("px-4 py-3 font-medium", align === "right" && "text-right", className)}>
      <button
        type="button"
        onClick={onSort}
        className={cn(
          "inline-flex items-center gap-1.5 transition-colors hover:text-[#0F2A1D]",
          align === "right" && "ml-auto",
          active ? "text-[#0F2A1D]" : "text-[#0F2A1D]/60",
        )}
      >
        {label}
        <Icon className={cn("h-3.5 w-3.5 shrink-0", !active && "opacity-40")} aria-hidden="true" />
        <span className="sr-only">
          {active ? `Sorted ${direction === "asc" ? "ascending" : "descending"}` : "Sort column"}
        </span>
      </button>
    </th>
  );
}

export function toggleSortDirection(
  currentColumn: string,
  nextColumn: string,
  direction: SortDirection,
): SortDirection {
  if (currentColumn === nextColumn) {
    return direction === "asc" ? "desc" : "asc";
  }
  return "asc";
}
