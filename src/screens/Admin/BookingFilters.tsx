import { Calendar, CalendarDays, CalendarRange, Clock, Search as SearchIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  BOOKING_DATE_RANGE_OPTIONS,
  BOOKING_STATUS_FILTER_OPTIONS,
  type BookingDateRangeFilter,
  type BookingStatusFilter,
} from "../../lib/booking-admin";
import { adminInputClassName } from "../../lib/session-admin";

const DATE_RANGE_ICONS: Record<BookingDateRangeFilter, LucideIcon> = {
  all: CalendarRange,
  today: CalendarDays,
  week: Clock,
  month: Calendar,
  custom: SearchIcon,
};

interface SessionTypeOption {
  id: string;
  name: string;
}

interface BookingFiltersProps {
  statusFilter: BookingStatusFilter;
  sessionTypeFilter: string;
  dateRange: BookingDateRangeFilter;
  customFrom: string;
  customTo: string;
  sessionTypes: SessionTypeOption[];
  resultCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: BookingStatusFilter) => void;
  onSessionTypeChange: (value: string) => void;
  onDateRangeChange: (value: BookingDateRangeFilter) => void;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
}

export function BookingFilters({
  statusFilter,
  sessionTypeFilter,
  dateRange,
  customFrom,
  customTo,
  sessionTypes,
  resultCount,
  searchQuery,
  onSearchChange,
  onStatusChange,
  onSessionTypeChange,
  onDateRangeChange,
  onCustomFromChange,
  onCustomToChange,
}: BookingFiltersProps): JSX.Element {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => onStatusChange(event.target.value as BookingStatusFilter)}
              className={`${adminInputClassName} min-w-[10rem]`}
            >
              {BOOKING_STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
              Session type
            </span>
            <select
              value={sessionTypeFilter}
              onChange={(event) => onSessionTypeChange(event.target.value)}
              className={`${adminInputClassName} min-w-[12rem]`}
            >
              <option value="all">All types</option>
              {sessionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end lg:justify-end">
          <div className="inline-flex flex-wrap rounded-lg border border-[#EDECE6] bg-[#F9F9F6] p-1">
            {BOOKING_DATE_RANGE_OPTIONS.map((option) => {
              const Icon = DATE_RANGE_ICONS[option.id];
              const active = dateRange === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  title={option.label}
                  onClick={() => onDateRangeChange(option.id)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#0F2A1D] text-white shadow-sm"
                      : "text-[#0F2A1D]/70 hover:text-[#0F2A1D]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              );
            })}
          </div>

          <label className="relative block w-full sm:w-64">
            <span className="sr-only">Search bookings</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F2A1D]/40" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search bookings…"
              className={`${adminInputClassName} pl-9`}
            />
          </label>
        </div>
      </div>

      {dateRange === "custom" ? (
        <div className="flex flex-col gap-3 rounded-lg border border-[#EDECE6] bg-white px-4 py-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
              From
            </span>
            <input
              type="date"
              value={customFrom}
              onChange={(event) => onCustomFromChange(event.target.value)}
              className={adminInputClassName}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-[#0F2A1D]/50">
              To
            </span>
            <input
              type="date"
              value={customTo}
              onChange={(event) => onCustomToChange(event.target.value)}
              className={adminInputClassName}
            />
          </label>
        </div>
      ) : null}

      <p className="text-sm text-[#0F2A1D]/60">
        {resultCount} booking{resultCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}
