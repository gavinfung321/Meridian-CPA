import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export const DEFAULT_TABLE_PAGE_SIZE = 10;
export const TABLE_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

interface AdminTablePaginationProps {
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
}

function PaginationButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#EDECE6] bg-white text-[#0F2A1D]/70 transition-colors",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "hover:border-[#C9A84C]/40 hover:bg-[#F9F9F6] hover:text-[#0F2A1D]",
      )}
    >
      {children}
    </button>
  );
}

export function AdminTablePagination({
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS,
}: AdminTablePaginationProps): JSX.Element | null {
  if (totalCount === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const rangeStart = (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-3 border-t border-[#EDECE6] bg-[#F9F9F6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#0F2A1D]/70">
        Showing{" "}
        <span className="font-medium text-[#0F2A1D]">{rangeStart}</span> to{" "}
        <span className="font-medium text-[#0F2A1D]">{rangeEnd}</span> of{" "}
        <span className="font-medium text-[#0F2A1D]">{totalCount}</span> results
      </p>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <label className="flex items-center gap-2 text-sm text-[#0F2A1D]/70">
          Rows per page
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-md border border-[#EDECE6] bg-white px-2 py-1.5 text-sm text-[#0F2A1D] outline-none ring-[#C9A84C] focus:ring-2"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <p className="text-sm text-[#0F2A1D]/70">
          Page{" "}
          <span className="font-medium text-[#0F2A1D]">{safePage}</span> of{" "}
          <span className="font-medium text-[#0F2A1D]">{totalPages}</span>
        </p>

        <div className="flex items-center gap-1">
          <PaginationButton
            label="First page"
            disabled={safePage <= 1}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden />
          </PaginationButton>
          <PaginationButton
            label="Previous page"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </PaginationButton>
          <PaginationButton
            label="Next page"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </PaginationButton>
          <PaginationButton
            label="Last page"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            <ChevronsRight className="h-4 w-4" aria-hidden />
          </PaginationButton>
        </div>
      </div>
    </div>
  );
}
