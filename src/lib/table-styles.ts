/** Shared admin table row hover — sessions, bookings, clients */
export const adminTableRowClassName =
  "border-b border-[#EDECE6] last:border-0 transition-colors hover:bg-[#F9F9F6]";

export const adminTableRowInteractiveClassName = `${adminTableRowClassName} cursor-pointer`;

export const adminTableIconButtonClassName =
  "rounded-md p-2 text-[#0F2A1D]/70 transition-colors hover:bg-[#EDECE6] hover:text-[#0F2A1D]";

/** View-only action — matches AdminBookings Eye button */
export const adminTableLinkPillClassName =
  "inline-flex items-center gap-1.5 rounded-full border border-[#EDECE6] bg-[#F9F9F6] px-2.5 py-1 text-sm font-medium text-[#0F2A1D] transition-colors hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C]";

export const adminTableViewButtonClassName = adminTableIconButtonClassName;

export const adminTableDangerIconButtonClassName =
  "rounded-md p-2 text-red-700/80 transition-colors hover:bg-red-50 hover:text-red-700";

export const adminTableGoldIconButtonClassName =
  "rounded-md p-2 text-[#C9A84C] transition-colors hover:bg-[#C9A84C]/10 hover:text-[#0F2A1D]";
